// src/pages/rooms/allocate-rooms.tsx
"use client";
import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { format, differenceInDays } from "date-fns";
import { toast } from "sonner";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type PaginationState,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

// --- UI Components ---
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { CreateAllocationForm } from "./components/create-allocation-dialog";
import { EditAllocationForm } from "./components/edit-allocation-dialog";
import ErrorPage from "@/components/custom/error-page";

// --- Icons ---
import {
  Loader2,
  MoreHorizontal,
  Edit,
  Trash2,
  Search,
  Columns3Icon,
  XIcon,
  RefreshCw,
  ChevronFirstIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronLastIcon,
} from "lucide-react";

// --- API & Types ---
import hotelClient from "@/api/hotel-client";
import {
  type Allocation,
  type PaginatedAllocationsResponse,
} from "@/types/allocation-types";
import { cn } from "@/lib/utils";
import { useHotel } from "@/providers/hotel-provider";

// --- Helper Hook & Functions ---
const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};

const getStatusColor = (status?: string) => {
  switch (status?.toLowerCase()) {
    case "confirmed":
      return "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/50 dark:text-emerald-400 dark:border-emerald-700/60";
    case "pending":
      return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/50 dark:text-blue-400 dark:border-blue-700/60";
    case "expired":
      return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700";
    case "draft":
      return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-400 dark:border-yellow-700/60";
    case "cancelled":
      return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/50 dark:text-red-400 dark:border-red-700/60";
    default:
      return "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/50 dark:text-amber-400 dark:border-amber-700/60";
  }
};

interface RoomType {
  id: string;
  name: string;
}

// --- Main Component ---
export default function AllocateRooms() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { hotel } = useHotel();

  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false);
  const [editingAllocation, setEditingAllocation] = useState<Allocation | null>(
    null
  );
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const debouncedGlobalFilter = useDebounce(globalFilter, 500);
  const [isFormDirty, setIsFormDirty] = useState(false);
  const [showUnsavedChangesDialog, setShowUnsavedChangesDialog] =
    useState(false);

  // --- Data Fetching ---
  const {
    data: paginatedResponse,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useQuery<PaginatedAllocationsResponse>({
    queryKey: [
      "allocations",
      hotel?.id,
      pagination.pageIndex,
      pagination.pageSize,
      debouncedGlobalFilter,
      sorting,
      columnFilters,
    ],
    queryFn: async () => {
      const params = new URLSearchParams({ hotel: hotel!.id });
      params.append("page", String(pagination.pageIndex + 1));
      params.append("page_size", String(pagination.pageSize));

      if (debouncedGlobalFilter) {
        params.append("name", debouncedGlobalFilter);
      }
      if (sorting.length > 0) {
        params.append(
          "ordering",
          `${sorting[0].desc ? "-" : ""}${sorting[0].id}`
        );
      }
      columnFilters.forEach((filter) => {
        if (filter.value) {
          params.append(filter.id, String(filter.value));
        }
      });

      const response = await hotelClient.get("/allocations/", { params });
      return response.data;
    },
    keepPreviousData: true,
    enabled: !!hotel?.id,
  });

  const { data: roomTypesData } = useQuery<RoomType[]>({
    queryKey: ["allRoomTypes", hotel?.id],
    queryFn: async () =>
      (await hotelClient.get("/room-types/", { params: { hotel: hotel!.id } }))
        .data.results,
    staleTime: Infinity,
    enabled: !!hotel?.id,
  });

  const roomTypesMap = useMemo(() => {
    if (!roomTypesData) return new Map<string, string>();
    return new Map(roomTypesData.map((rt) => [rt.id, rt.name]));
  }, [roomTypesData]);

  const allocations = useMemo(() => {
    return (paginatedResponse?.results ?? []).map((alloc) => ({
      ...alloc,
      room_type_name: roomTypesMap.get(alloc.room_type) || "Unknown",
    }));
  }, [paginatedResponse, roomTypesMap]);

  // --- Mutations ---
  const deleteAllocationMutation = useMutation({
    mutationFn: (id: string) => hotelClient.delete(`/allocations/${id}/`),
    onSuccess: () => {
      toast.success("Allocation deleted successfully.");
      queryClient.invalidateQueries({ queryKey: ["allocations"] });
    },
    onError: (err: any) => {
      toast.error(
        `Deletion failed: ${err.response?.data?.detail || err.message}`
      );
    },
  });

  // --- Handlers ---
  const handleSheetOpenChange = (
    open: boolean,
    sheetType: "create" | "edit"
  ) => {
    if (!open && isFormDirty) {
      setShowUnsavedChangesDialog(true);
      return;
    }
    if (!open) {
      setIsFormDirty(false);
      if (sheetType === "create") setIsCreateSheetOpen(false);
      if (sheetType === "edit") setEditingAllocation(null);
    } else {
      if (sheetType === "create") setIsCreateSheetOpen(true);
    }
  };

  const handleDiscardChanges = () => {
    setIsFormDirty(false);
    setIsCreateSheetOpen(false);
    setEditingAllocation(null);
    setShowUnsavedChangesDialog(false);
  };

  // --- Table Columns Definition ---
  const columns = useMemo<ColumnDef<Allocation & { room_type_name: string }>[]>(
    () => [
      {
        header: "S/N",
        cell: ({ row }) =>
          pagination.pageIndex * pagination.pageSize + row.index + 1,
        size: 50,
      },
      {
        accessorKey: "name",
        header: "Allocation Name",
        cell: ({ row }) => (
          <span className="font-medium text-blue-700 text-[0.9375rem] dark:text-[#D0D5DD]">
            {row.original.name}
          </span>
        ),
      },
      {
        accessorKey: "room_type_name",
        id: "room_type",
        header: "Room Type",
      },
      {
        accessorKey: "total_rooms",
        header: "Allocated Rooms",
      },
      {
        header: "Allocation Period",
        cell: ({ row }) => (
          <div>
            <span className="font-medium text-gray-700 text-[0.875rem] dark:text-[#D0D5DD]">
              From: {format(new Date(row.original.start_date), "MMM dd, yyyy")}
            </span>
            <br />
            <span className="font-medium text-gray-700 text-[0.875rem] dark:text-[#D0D5DD]">
              To: {format(new Date(row.original.end_date), "MMM dd, yyyy")}
            </span>
          </div>
        ),
      },
      {
        header: "Duration",
        cell: ({ row }) => {
          const startDate = new Date(row.original.start_date);
          const endDate = new Date(row.original.end_date);
          const duration = differenceInDays(endDate, startDate) + 1;
          return (
            <span className="font-medium text-gray-700 text-[0.875rem] dark:text-[#D0D5DD]">
              {duration} {duration > 1 ? "Days" : "Day"}
            </span>
          );
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <Badge
            className={cn(
              "rounded-full px-3 py-1 font-medium capitalize",
              getStatusColor(row.original.status)
            )}
          >
            {row.original.status}
          </Badge>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const allocation = row.original;
          return (
            // Stop propagation to prevent row click from firing
            <div
              className="flex items-center justify-end"
              onClick={(e) => e.stopPropagation()}
            >
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem
                    onClick={() => setEditingAllocation(allocation)}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    <span>Edit</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem
                        onSelect={(e) => e.preventDefault()}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>Delete</span>
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete the "
                          <strong>{allocation.name}</strong>" allocation. This
                          action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-red-600 hover:bg-red-700"
                          onClick={() =>
                            deleteAllocationMutation.mutate(allocation.id)
                          }
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      },
    ],
    [deleteAllocationMutation, navigate, pagination]
  );

  const table = useReactTable({
    data: allocations,
    columns,
    pageCount: paginatedResponse
      ? Math.ceil(paginatedResponse.count / pagination.pageSize)
      : -1,
    state: { sorting, columnFilters, pagination },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
  });

  if (isError) return <ErrorPage error={error as Error} onRetry={refetch} />;

  return (
    <>
      <div className="min-h-screen dark:bg-[#101828]">
        <div className="bg-white/80 dark:bg-[#101828]/80 backdrop-blur-sm border-b border-gray-200 dark:border-[#1D2939] sticky top-0 z-30">
          <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between gap-4 py-5">
              <div className="space-y-1">
                <h1 className="text-3xl font-bold text-[#1D2939] dark:text-[#D0D5DD]">
                  {hotel?.name} Room Allocations
                </h1>
                <p className="text-[0.9375rem] mt-1 text-gray-600 dark:text-[#98A2B3]">
                  Manage dedicated room blocks for SafariPro online bookings.
                </p>
              </div>
              <Sheet
                open={isCreateSheetOpen}
                onOpenChange={(open) => handleSheetOpenChange(open, "create")}
              >
                <SheetTrigger asChild>
                  <Button className="shadow-xs" variant={"main"}>
                    Create Allocation
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-full sm:max-w-2xl p-0">
                  <CreateAllocationForm
                    onSuccess={() => handleSheetOpenChange(false, "create")}
                    onDirtyChange={setIsFormDirty}
                  />
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>

        <main className="max-w-8xl bg-[#F9FAFB] min-h-screen mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-4">
            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative w-full md:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search by allocation name..."
                  value={globalFilter}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  className="pl-10 bg-[#FFF] border-[#E4E7EC]"
                />
                {globalFilter && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                    onClick={() => setGlobalFilter("")}
                  >
                    <XIcon className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <Select
                value={
                  (table.getColumn("status")?.getFilterValue() as string) ||
                  "all"
                }
                onValueChange={(value) => {
                  const filterValue = value === "all" ? "" : value;
                  table.getColumn("status")?.setFilterValue(filterValue);
                }}
              >
                <SelectTrigger className="w-fit bg-[#FFF] border-[#E4E7EC]">
                  <SelectValue placeholder="Filter by Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Confirmed">Confirmed</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                  <SelectItem value="Expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Button
                className="bg-[#FFF] border-[#E4E7EC]"
                variant="outline"
                onClick={() => refetch()}
                disabled={isRefetching}
              >
                <RefreshCw
                  className={cn("mr-2 h-4 w-4", isRefetching && "animate-spin")}
                />
                Refresh
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="bg-[#FFF] border-[#E4E7EC]"
                  >
                    <Columns3Icon className="mr-2 h-4 w-4" />
                    View
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {table
                    .getAllColumns()
                    .filter((column) => column.getCanHide())
                    .map((column) => (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                        className="capitalize"
                      >
                        {column.id.replace(/_/g, " ")}
                      </DropdownMenuCheckboxItem>
                    ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 dark:border-[#1D2939] shadow-xs bg-white dark:bg-[#171F2F] overflow-hidden">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow
                    key={headerGroup.id}
                    className="hover:bg-transparent border-b-2 border-gray-200 dark:border-b-[#1D2939]"
                  >
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        className="h-14 px-6 text-left align-middle font-semibold text-[13px] uppercase tracking-wide text-[#667085] dark:text-[#98A2B3] bg-gray-50 dark:bg-[#101828]/90 border-r border-gray-200 dark:border-gray-700 last:border-r-0"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" />
                    </TableCell>
                  </TableRow>
                ) : table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      onClick={() =>
                        navigate(`/rooms/allocations/${row.original.id}`)
                      }
                      className="cursor-pointer border-b border-gray-200 dark:border-b-[#1D2939] hover:bg-indigo-50/40 dark:hover:bg-[#1C2433] transition-colors"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          className="px-6 py-4 font-medium text-gray-700 text-[0.875rem] dark:text-[#D0D5DD] align-middle border-r border-gray-200 dark:border-gray-700 last:border-r-0"
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center text-gray-500 dark:text-[#98A2B3]"
                    >
                      No allocations found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between gap-4 mt-6">
            <div className="flex-1 text-sm text-gray-600 dark:text-[#98A2B3]">
              Page {pagination.pageIndex + 1} of {table.getPageCount() || 1}
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center justify-center text-sm font-medium text-gray-700 dark:text-[#98A2B3]">
                Showing {table.getRowModel().rows.length} of{" "}
                {paginatedResponse?.count ?? 0} Allocations
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  className="h-9 w-9 p-0"
                  onClick={() => table.firstPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  <ChevronFirstIcon className="h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  className="h-9 w-9 p-0"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  <ChevronLeftIcon className="h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  className="h-9 w-9 p-0"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  <ChevronRightIcon className="h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  className="h-9 w-9 p-0"
                  onClick={() => table.lastPage()}
                  disabled={!table.getCanNextPage()}
                >
                  <ChevronLastIcon className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>

      <Sheet
        open={!!editingAllocation}
        onOpenChange={(open) => handleSheetOpenChange(open, "edit")}
      >
        <SheetContent className="w-full sm:max-w-2xl p-0">
          {editingAllocation && (
            <EditAllocationForm
              allocation={editingAllocation}
              onSuccess={() => handleSheetOpenChange(false, "edit")}
              onDirtyChange={setIsFormDirty}
            />
          )}
        </SheetContent>
      </Sheet>

      <AlertDialog
        open={showUnsavedChangesDialog}
        onOpenChange={setShowUnsavedChangesDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>You have unsaved changes!</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to close? Your changes will be discarded.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, keep editing</AlertDialogCancel>
            <AlertDialogAction
              className="bg-blue-600 hover:bg-blue-700"
              onClick={handleDiscardChanges}
            >
              Yes, discard changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
