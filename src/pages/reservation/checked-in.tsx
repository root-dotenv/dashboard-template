"use client";
import {
  useState,
  useMemo,
  useEffect,
  useCallback,
  useRef,
  type FC,
} from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import Papa from "papaparse";
import {
  type ColumnDef,
  type Column,
  type ColumnFiltersState,
  type SortingState,
  type PaginationState,
  type Row,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  Eye,
  Trash2,
  Loader2,
  Search,
  LogOut,
  Loader,
  ChevronUpIcon,
  ChevronDownIcon,
  EllipsisIcon,
  Columns3Icon,
  ChevronFirstIcon,
  ChevronLastIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Users,
  XIcon,
  MoreVertical,
} from "lucide-react";
import { TbFileTypeCsv } from "react-icons/tb";
import { MdAdd } from "react-icons/md";
import { IoRefreshOutline } from "react-icons/io5";

import bookingClient from "@/api/booking-client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import ErrorPage from "@/components/custom/error-page";

// --- Type Definitions ---
interface Booking {
  id: string;
  payment_status: "Paid" | "Pending" | "Failed";
  full_name: string;
  code: string;
  phone_number: string | number;
  email: string;
  start_date: string;
  end_date: string;
  booking_status:
    | "Confirmed"
    | "Processing"
    | "Checked In"
    | "Checked Out"
    | "Cancelled";
  booking_type: "Physical" | "Online";
  amount_paid: string;
  payment_reference: string;
}

interface PaginatedBookingsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Booking[];
}

// --- Debounce Hook ---
const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};

// --- Helper Functions ---
const getBookingTypeBadgeClasses = (type: "Physical" | "Online"): string => {
  switch (type) {
    case "Physical":
      return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/50 dark:text-blue-400 dark:border-blue-700/60";
    case "Online":
      return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-400 dark:border-yellow-700/60";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700";
  }
};

// --- Main Component ---
export default function CheckedInGuests() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const hotelId = "a3d5501e-c910-4e2e-a0b2-ad616c5910db";
  const inputRef = useRef<HTMLInputElement>(null);

  // --- State ---
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const debouncedGlobalFilter = useDebounce(globalFilter, 500);
  const [checkingOutId, setCheckingOutId] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // --- Data Query ---
  const {
    data: paginatedResponse,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useQuery<PaginatedBookingsResponse>({
    queryKey: [
      "checkedInGuests",
      hotelId,
      pagination,
      debouncedGlobalFilter,
      sorting,
      columnFilters,
    ],
    queryFn: async () => {
      const params = new URLSearchParams({
        microservice_item_id: hotelId!,
        limit: String(pagination.pageSize),
        offset: String(pagination.pageIndex * pagination.pageSize),
        booking_status: "Checked In",
      });
      if (debouncedGlobalFilter)
        params.append("full_name", debouncedGlobalFilter);
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
      const response = await bookingClient.get(`/bookings`, { params });
      return response.data;
    },
    keepPreviousData: true,
    enabled: !!hotelId,
  });

  // --- Mutations ---
  const checkOutMutation = useMutation({
    mutationFn: (bookingId: string) => {
      setCheckingOutId(bookingId);
      return bookingClient.post(`/bookings/${bookingId}/check_out`);
    },
    onSuccess: () => {
      toast.success("Guest checked out successfully!");
      queryClient.invalidateQueries({ queryKey: ["checkedInGuests"] });
      queryClient.invalidateQueries({ queryKey: ["activeCheckIns"] });
    },
    onError: (error: any) =>
      toast.error(
        `Check-out failed: ${error.response?.data?.detail || error.message}`
      ),
    onSettled: () => setCheckingOutId(null),
  });

  const deleteBookingMutation = useMutation({
    mutationFn: (bookingId: string) =>
      bookingClient.delete(`/bookings/${bookingId}`),
    onSuccess: () => {
      toast.success("Booking deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["checkedInGuests"] });
    },
    onError: (error: any) =>
      toast.error(
        `Failed to delete booking: ${
          error.response?.data?.detail || error.message
        }`
      ),
  });

  const guests = paginatedResponse?.results ?? [];
  const totalCount = paginatedResponse?.count ?? 0;
  const totalPages = Math.ceil(totalCount / pagination.pageSize);
  const hasNextPage = paginatedResponse?.next !== null;
  const hasPreviousPage = paginatedResponse?.previous !== null;

  // --- Handlers ---
  const handleExport = useCallback(async () => {
    setIsExporting(true);
    toast.info("Preparing CSV export...");
    try {
      const { data } = await bookingClient.get(`/bookings`, {
        params: {
          microservice_item_id: hotelId,
          booking_status: "Checked In",
          limit: totalCount || 10,
        },
      });
      if (!data.results || data.results.length === 0) {
        toast.warning("No guests to export.");
        return;
      }
      const csv = Papa.unparse(
        data.results.map((b: Booking) => ({
          "Booking Code": b.code,
          "Guest Name": b.full_name,
          Phone: b.phone_number,
          "Check-in Date": format(new Date(b.start_date), "PP"),
          "Expected Check-out": format(new Date(b.end_date), "PP"),
          "Amount Paid": b.amount_paid,
        }))
      );
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `checked-in-guests-${format(
        new Date(),
        "yyyy-MM-dd"
      )}.csv`;
      link.click();
      URL.revokeObjectURL(link.href);
      toast.success("Export successful!");
    } catch (err) {
      toast.error("Failed to export data.");
    } finally {
      setIsExporting(false);
    }
  }, [hotelId, totalCount]);

  const columns = useMemo<ColumnDef<Booking>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <div className="flex items-center justify-center">
            <Checkbox
              checked={
                table.getIsAllPageRowsSelected() ||
                (table.getIsSomePageRowsSelected() && "indeterminate")
              }
              onCheckedChange={(value) =>
                table.toggleAllPageRowsSelected(!!value)
              }
              aria-label="Select all"
              className="border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-800"
            />
          </div>
        ),
        cell: ({ row }) => (
          <div className="w-full flex items-center justify-center">
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(value) => row.toggleSelected(!!value)}
              aria-label="Select row"
              className="border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800"
            />
          </div>
        ),
        size: 50,
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "full_name",
        header: ({ column }) => (
          <SortableHeader column={column}>Guest</SortableHeader>
        ),
        cell: ({ row }) => (
          <div className="font-medium text-gray-700 dark:text-[#D0D5DD]">
            {row.original.full_name}
          </div>
        ),
        size: 220,
      },
      {
        id: "stay_dates",
        header: "Stay Dates",
        cell: ({ row }) => (
          <div className="text-gray-600 dark:text-[#98A2B3]">
            {format(new Date(row.original.start_date), "PP")} -{" "}
            {format(new Date(row.original.end_date), "PP")}
          </div>
        ),
        size: 280,
      },
      {
        accessorKey: "booking_type",
        header: "Booking Type",
        cell: ({ row }) => (
          <Badge
            className={cn(
              "rounded-full px-3 py-1 font-medium",
              getBookingTypeBadgeClasses(row.original.booking_type)
            )}
          >
            {row.original.booking_type}
          </Badge>
        ),
        size: 160,
      },
      {
        accessorKey: "amount_paid",
        header: ({ column }) => (
          <div className="flex justify-end">
            <SortableHeader column={column}>Amount Paid</SortableHeader>
          </div>
        ),
        cell: ({ row }) => {
          const formatted = new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "TZS",
          }).format(parseFloat(row.original.amount_paid));
          return (
            <div className="text-right font-semibold text-gray-700 dark:text-[#D0D5DD]">
              {formatted}
            </div>
          );
        },
        size: 180,
      },
      {
        id: "actions",
        header: () => <div className="text-center">Actions</div>,
        cell: ({ row }) => (
          <div className="text-center">
            <RowActions
              row={row}
              checkOutMutation={checkOutMutation}
              deleteBookingMutation={deleteBookingMutation}
              checkingOutId={checkingOutId}
            />
          </div>
        ),
        size: 80,
        enableHiding: false,
      },
    ],
    [checkOutMutation, deleteBookingMutation, checkingOutId]
  );

  const table = useReactTable({
    data: guests,
    columns,
    state: { sorting, columnFilters, pagination },
    pageCount: totalPages,
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
  });

  const handleDeleteRows = () => {
    table
      .getSelectedRowModel()
      .rows.forEach((row) => deleteBookingMutation.mutate(row.original.id));
    table.resetRowSelection();
  };

  if (isError) return <ErrorPage error={error as Error} onRetry={refetch} />;

  return (
    <div className="flex-1 space-y-6 bg-gray-50 dark:bg-[#101828]">
      <Card className="border-none p-0 bg-white dark:bg-[#171F2F] rounded-none shadow-none">
        <CardHeader className="bg-white/80 dark:bg-[#101828]/80 backdrop-blur-sm border-b border-gray-200 dark:border-[#1D2939] sticky top-0 z-30 pt-4">
          <h2 className="text-[1.5rem] font-bold tracking-wide">
            Checked-In Guests
          </h2>
          <CardDescription className="text-[0.9375rem] text-gray-600 dark:text-[#98A2B3] mt-1">
            View and manage all guests currently staying at the hotel.
          </CardDescription>
        </CardHeader>

        <CardContent className="px-6 py-4">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
            <Card className="dark:bg-[#101828] dark:border-[#1D2939]">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium dark:text-[#D0D5DD]">
                  Currently Checked In
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold dark:text-white">
                  {isLoading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    totalCount
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total active guests in the hotel
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-[#5D636E]" />
                <Input
                  ref={inputRef}
                  placeholder="Search by guest name..."
                  value={globalFilter}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  className="pl-10 pr-10 w-full sm:w-60 bg-white dark:bg-[#101828] border-gray-200 dark:border-[#1D2939] text-gray-800 dark:text-[#D0D5DD] rounded-md shadow focus:ring-2 focus:ring-blue-500 dark:placeholder:text-[#5D636E]"
                />
                {globalFilter && (
                  <button
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600 dark:text-[#98A2B3]"
                    onClick={() => {
                      setGlobalFilter("");
                      inputRef.current?.focus();
                    }}
                  >
                    <XIcon size={18} />
                  </button>
                )}
              </div>
              <Select
                value={
                  (table
                    .getColumn("booking_type")
                    ?.getFilterValue() as string) ?? ""
                }
                onValueChange={(value) =>
                  table
                    .getColumn("booking_type")
                    ?.setFilterValue(value === "all" ? "" : value)
                }
              >
                <SelectTrigger className="w-40 bg-white dark:bg-[#101828] border-gray-200 dark:border-[#1D2939] text-gray-800 dark:text-[#D0D5DD] rounded-md shadow focus:ring-2 focus:ring-blue-500">
                  <SelectValue placeholder="Booking Type" />
                </SelectTrigger>
                <SelectContent className="dark:bg-[#101828] dark:border-[#1D2939]">
                  <SelectItem
                    value="all"
                    className="dark:text-[#D0D5DD] dark:hover:bg-[#1C2433]"
                  >
                    All Types
                  </SelectItem>
                  <SelectItem
                    value="Physical"
                    className="dark:text-[#D0D5DD] dark:hover:bg-[#1C2433]"
                  >
                    Physical
                  </SelectItem>
                  <SelectItem
                    value="Online"
                    className="dark:text-[#D0D5DD] dark:hover:bg-[#1C2433]"
                  >
                    Online
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-3">
              {table.getSelectedRowModel().rows.length > 0 && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="gap-2 bg-white dark:bg-transparent border-gray-200 dark:border-[#1D2939] rounded-lg shadow-sm hover:bg-rose-50 dark:hover:bg-rose-900/40 hover:border-rose-300 dark:hover:border-rose-600 text-rose-600 dark:text-rose-400"
                    >
                      <Trash2 size={16} /> Delete (
                      {table.getSelectedRowModel().rows.length})
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-white dark:bg-[#101828] dark:border-[#1D2939]">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="dark:text-[#D0D5DD]">
                        Confirm Deletion
                      </AlertDialogTitle>
                      <AlertDialogDescription className="dark:text-[#98A2B3]">
                        This will permanently delete{" "}
                        {table.getSelectedRowModel().rows.length} selected
                        booking(s). This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="dark:bg-[#171F2F] dark:text-[#D0D5DD] dark:hover:bg-[#1C2433] border-none">
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-rose-600 hover:bg-rose-700"
                        onClick={handleDeleteRows}
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="gap-2 bg-white dark:bg-[#101828] dark:text-[#D0D5DD] border-gray-200 dark:border-[#1D2939] rounded-md shadow"
                  >
                    <Columns3Icon size={16} /> View
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="dark:bg-[#101828] dark:border-[#1D2939]"
                >
                  <DropdownMenuLabel className="dark:text-[#D0D5DD]">
                    Toggle columns
                  </DropdownMenuLabel>
                  {table
                    .getAllColumns()
                    .filter((c) => c.getCanHide())
                    .map((c) => (
                      <DropdownMenuCheckboxItem
                        key={c.id}
                        checked={c.getIsVisible()}
                        onCheckedChange={c.toggleVisibility}
                        className="capitalize dark:text-[#D0D5DD] dark:hover:bg-[#1C2433]"
                      >
                        {c.id.replace(/_/g, " ")}
                      </DropdownMenuCheckboxItem>
                    ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                variant="outline"
                onClick={() => refetch()}
                disabled={isRefetching || isLoading}
                className="gap-2 bg-white dark:bg-[#101828] dark:text-[#D0D5DD] border-gray-200 dark:border-[#1D2939] rounded-md shadow"
              >
                <IoRefreshOutline
                  className={cn("h-5 w-5", isRefetching && "animate-spin")}
                />
                Refresh
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 bg-white dark:bg-[#101828] border-gray-200 dark:border-[#1D2939] rounded-full shadow"
                  >
                    <MoreVertical className="h-5 w-5 text-gray-600 dark:text-[#98A2B3]" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="dark:bg-[#101828] dark:border-[#1D2939]"
                >
                  <DropdownMenuItem
                    onClick={handleExport}
                    disabled={isExporting}
                    className="dark:text-[#D0D5DD] dark:hover:bg-[#1C2433]"
                  >
                    {isExporting ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <TbFileTypeCsv className="mr-2 h-4 w-4" />
                    )}
                    <span>
                      {isExporting ? "Exporting..." : "Export to CSV"}
                    </span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => navigate("/bookings/new-booking")}
                    className="dark:text-[#D0D5DD] dark:hover:bg-[#1C2433]"
                  >
                    <MdAdd className="mr-2 h-4 w-4" />
                    <span>New Booking</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 dark:border-[#1D2939] shadow-sm bg-white dark:bg-[#171F2F] overflow-hidden">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow
                    key={headerGroup.id}
                    className="hover:bg-transparent border-b-2 border-gray-300 dark:border-b-[#1D2939]"
                  >
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        style={{ width: `${header.getSize()}px` }}
                        className="h-14 px-4 text-left align-middle font-semibold text-[13px] uppercase tracking-wide text-[#667085] dark:text-[#98A2B3] border-r border-gray-300 dark:border-r-[#1D2939] last:border-r-0 bg-gradient-to-b from-slate-50 to-slate-100 dark:from-[#101828] dark:to-[#101828]/90 shadow-sm first:px-6"
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
                      <div className="w-full flex items-center justify-center">
                        <Loader className="animate-spin h-8 w-8 text-blue-600" />
                      </div>
                    </TableCell>
                  </TableRow>
                ) : table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      className="border-b border-gray-200 dark:border-b-[#1D2939] hover:bg-indigo-50/30 dark:hover:bg-[#1C2433] transition-colors"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          className="px-4 py-4 align-middle border-r border-gray-200 dark:border-r-[#1D2939] last:border-r-0 text-gray-700 dark:text-[#D0D5DD] first:px-6"
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
                      No guests are currently checked in.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between gap-4 mt-6">
            <div className="flex-1 text-sm text-gray-600 dark:text-[#98A2B3]">
              {table.getSelectedRowModel().rows.length} of{" "}
              {table.getRowModel().rows.length} row(s) selected.
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center justify-center text-sm font-medium text-gray-700 dark:text-[#98A2B3]">
                Page {table.getState().pagination.pageIndex + 1} of{" "}
                {table.getPageCount()}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  className="h-9 w-9 p-0 dark:bg-[#101828] dark:border-[#1D2939] dark:hover:bg-[#1C2433]"
                  onClick={() => table.firstPage()}
                  disabled={!hasPreviousPage}
                >
                  <ChevronFirstIcon className="h-5 w-5 dark:text-[#98A2B3]" />
                </Button>
                <Button
                  variant="outline"
                  className="h-9 w-9 p-0 dark:bg-[#101828] dark:border-[#1D2939] dark:hover:bg-[#1C2433]"
                  onClick={() => table.previousPage()}
                  disabled={!hasPreviousPage}
                >
                  <ChevronLeftIcon className="h-5 w-5 dark:text-[#98A2B3]" />
                </Button>
                <Button
                  variant="outline"
                  className="h-9 w-9 p-0 dark:bg-[#101828] dark:border-[#1D2939] dark:hover:bg-[#1C2433]"
                  onClick={() => table.nextPage()}
                  disabled={!hasNextPage}
                >
                  <ChevronRightIcon className="h-5 w-5 dark:text-[#98A2B3]" />
                </Button>
                <Button
                  variant="outline"
                  className="h-9 w-9 p-0 dark:bg-[#101828] dark:border-[#1D2939] dark:hover:bg-[#1C2433]"
                  onClick={() => table.lastPage()}
                  disabled={!hasNextPage}
                >
                  <ChevronLastIcon className="h-5 w-5 dark:text-[#98A2B3]" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// --- Reusable Sub-components ---
const SortableHeader: FC<{
  column: Column<Booking, unknown>;
  children: React.ReactNode;
}> = ({ column, children }) => {
  const isSorted = column.getIsSorted();
  return (
    <div
      className="flex items-center gap-2 cursor-pointer select-none"
      onClick={column.getToggleSortingHandler()}
    >
      {children}
      {isSorted === "desc" ? (
        <ChevronDownIcon size={16} className="dark:text-[#D0D5DD]" />
      ) : (
        <ChevronUpIcon
          size={16}
          className={cn(
            isSorted === "asc"
              ? "text-gray-800 dark:text-[#D0D5DD]"
              : "text-gray-400 dark:text-[#98A2B3]"
          )}
        />
      )}
    </div>
  );
};

function RowActions({
  row,
  checkOutMutation,
  deleteBookingMutation,
  checkingOutId,
}: {
  row: Row<Booking>;
  checkOutMutation: any;
  deleteBookingMutation: any;
  checkingOutId: string | null;
}) {
  const navigate = useNavigate();
  const booking = row.original;
  const isCheckingOut = checkingOutId === booking.id;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex justify-center">
          <Button
            size="icon"
            variant="ghost"
            className="h-9 w-9 rounded-full hover:bg-indigo-100 dark:hover:bg-[#1C2433] text-gray-600 dark:text-[#98A2B3]"
          >
            <EllipsisIcon size={18} />
          </Button>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="bg-white dark:bg-[#101828] border-gray-200 dark:border-[#1D2939] rounded-lg shadow-lg"
      >
        <DropdownMenuItem
          onClick={() => navigate(`/bookings/${booking.id}`)}
          className="gap-2 text-gray-700 dark:text-[#D0D5DD] hover:bg-indigo-50 dark:hover:bg-[#1C2433]"
        >
          <Eye className="h-5 w-5 text-indigo-600" /> View Details
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => checkOutMutation.mutate(booking.id)}
          disabled={isCheckingOut}
          className="gap-2 text-gray-700 dark:text-[#D0D5DD] hover:bg-indigo-50 dark:hover:bg-[#1C2433]"
        >
          {isCheckingOut ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <LogOut className="h-5 w-5 text-orange-600" />
          )}
          <span>Check Out</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="dark:bg-[#1D2939]" />
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <div className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-rose-50 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-400">
              <Trash2 className="mr-2 h-5 w-5" />
              <span>Delete</span>
            </div>
          </AlertDialogTrigger>
          <AlertDialogContent className="dark:bg-[#101828] dark:border-[#1D2939]">
            <AlertDialogHeader>
              <AlertDialogTitle className="dark:text-[#D0D5DD]">
                Confirm Deletion
              </AlertDialogTitle>
              <AlertDialogDescription className="dark:text-[#98A2B3]">
                This will permanently delete the booking for '
                {booking.full_name}'. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="dark:bg-[#171F2F] dark:text-[#D0D5DD] dark:hover:bg-[#1C2433] border-none">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                className="bg-rose-600 hover:bg-rose-700"
                onClick={() => deleteBookingMutation.mutate(booking.id)}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
