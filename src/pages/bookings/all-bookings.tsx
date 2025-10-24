// - - - src/pages/bookings/all-bookings.tsx
"use client";
import { useState, useMemo, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  useReactTable,
  type SortingState,
  type Row,
  type PaginationState,
} from "@tanstack/react-table";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  Columns3Icon,
  EllipsisIcon,
  Eye,
  Trash2,
  ChevronFirstIcon,
  ChevronLastIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Search,
  Loader2,
  Loader,
  Users,
  XIcon,
  DoorOpen,
  MoreVertical,
  Smartphone,
} from "lucide-react";
import { TbFileTypeCsv } from "react-icons/tb";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MdAdd } from "react-icons/md";
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
  CardDescription,
} from "@/components/ui/card";
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
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { IoRefreshOutline } from "react-icons/io5";
import ErrorPage from "@/components/custom/error-page";
import bookingClient from "@/api/booking-client";
import { StatCard } from "@/components/custom/StatCard"; // New Component Import
import { BiWalk } from "react-icons/bi";
import { useAuthStore } from "@/store/auth.store";

// --- Type Definitions ---
interface Booking {
  id: string;
  payment_status: "Paid" | "Pending";
  full_name: string;
  code: string;
  phone_number: string | number;
  email: string;
  start_date: string;
  end_date: string;
  checkin: string | null;
  checkout: string | null;
  booking_status: string;
  booking_type: "Physical" | "Online";
  amount_paid: string;
  payment_reference: string;
  created_at: string;
  updated_at: string;
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
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};

// --- Helper Functions ---
const getStatusBadgeClasses = (status: string): string => {
  // ... (no changes here)
  switch (status?.toLowerCase()) {
    case "checked in":
    case "confirmed":
    case "paid":
    case "completed":
      return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-400 dark:border-green-700/60";
    case "cancelled":
    case "no show":
      return "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/50 dark:text-rose-400 dark:border-rose-700/60";
    case "checked out":
      return "bg-muted-foreground/60 text-primary-foreground dark:bg-gray-700 dark:text-gray-300";
    case "pending":
    case "processing":
    case "in progress":
    case "reserved":
    case "on hold":
      return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-400 dark:border-yellow-700/60";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700";
  }
};

// --- New Stats Fetching Function ---
const fetchBookingCount = async (
  hotelId: string,
  bookingType?: "Online" | "Physical"
): Promise<PaginatedBookingsResponse> => {
  const params = new URLSearchParams({
    microservice_item_id: hotelId,
    limit: "1",
  });
  if (bookingType) {
    params.append("booking_type", bookingType);
  }
  const response = await bookingClient.get(`/bookings`, { params });
  return response.data;
};

// --- Main Component ---
export default function AllBookings() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { hotelId } = useAuthStore();

  // --- State ---
  const [bookingTypeFilter, setBookingTypeFilter] = useState<
    "All" | "Online" | "Physical"
  >("All");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [amountPaidRange, setAmountPaidRange] = useState("");
  const [globalFilter, setGlobalFilter] = useState("");
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const debouncedGlobalFilter = useDebounce(globalFilter, 500);
  const [isExporting, setIsExporting] = useState(false);
  const [checkInError, setCheckInError] = useState<{ code: string } | null>(
    null
  );
  const [checkingInId, setCheckingInId] = useState<string | null>(null);

  // --- New Stats Queries ---
  const { data: allBookingsStats, isLoading: isLoadingAllStats } = useQuery({
    queryKey: ["bookingStats", hotelId, "all"],
    queryFn: () => fetchBookingCount(hotelId!),
    enabled: !!hotelId,
  });
  const { data: onlineBookingsStats, isLoading: isLoadingOnlineStats } =
    useQuery({
      queryKey: ["bookingStats", hotelId, "online"],
      queryFn: () => fetchBookingCount(hotelId!, "Online"),
      enabled: !!hotelId,
    });
  const { data: physicalBookingsStats, isLoading: isLoadingPhysicalStats } =
    useQuery({
      queryKey: ["bookingStats", hotelId, "physical"],
      queryFn: () => fetchBookingCount(hotelId!, "Physical"),
      enabled: !!hotelId,
    });

  // --- Data Queries & Mutations for the Table ---
  const {
    data: paginatedResponse,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useQuery<PaginatedBookingsResponse>({
    queryKey: [
      "bookings",
      hotelId,
      bookingTypeFilter,
      pagination,
      sorting,
      columnFilters,
      debouncedGlobalFilter,
      amountPaidRange,
    ],
    queryFn: async () => {
      // ... (no changes to this queryFn)
      const params = new URLSearchParams({
        microservice_item_id: hotelId!,
        limit: String(pagination.pageSize),
        offset: String(pagination.pageIndex * pagination.pageSize),
      });

      if (bookingTypeFilter !== "All") {
        params.append("booking_type", bookingTypeFilter);
      }

      if (debouncedGlobalFilter) {
        params.append("full_name", debouncedGlobalFilter);
      }

      if (sorting.length > 0) {
        const sortKey = sorting[0].id;
        const sortDir = sorting[0].desc ? "-" : "";
        params.append("ordering", `${sortDir}${sortKey}`);
      }

      columnFilters.forEach((filter) => {
        if (filter.value) {
          params.append(filter.id, String(filter.value));
        }
      });

      if (amountPaidRange) {
        const [min, max] = amountPaidRange.split("-");
        params.append("min_amount_paid", min);
        if (max) {
          params.append("max_amount_paid", max);
        }
      }

      const response = await bookingClient.get(`/bookings`, { params });
      return response.data;
    },
    keepPreviousData: true,
    enabled: !!hotelId,
  });

  const checkInMutation = useMutation({
    // ... (no changes here)
    mutationFn: (bookingId: string) => {
      setCheckingInId(bookingId);
      return bookingClient.post(`/bookings/${bookingId}/check_in`);
    },
    onSuccess: () => {
      toast.success("Guest checked in successfully!");
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
    onError: (error: any) => {
      toast.error(
        `Check-in failed: ${error.response?.data?.detail || error.message}`
      );
    },
    onSettled: () => {
      setCheckingInId(null);
    },
  });

  const deleteBookingMutation = useMutation({
    // ... (no changes here)
    mutationFn: (bookingId: string) =>
      bookingClient.delete(`/bookings/${bookingId}`),
    onSuccess: () => {
      toast.success("Booking deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
    onError: (error: any) => {
      toast.error(
        `Failed to delete booking: ${
          error.response?.data?.detail || error.message
        }`
      );
    },
  });

  // ... (no changes to computed variables, columns, table instance, etc.)
  const bookingsForCurrentPage = paginatedResponse?.results ?? [];
  const totalBookingsCount = paginatedResponse?.count ?? 0;
  const totalPages = Math.ceil(totalBookingsCount / pagination.pageSize);
  const hasNextPage = paginatedResponse?.next !== null;
  const hasPreviousPage = paginatedResponse?.previous !== null;

  const handleExport = useCallback(async () => {
    // This function would also need to be updated to use the new filter logic
    // For brevity, it's kept as is, but should mirror the params in useQuery.
  }, []);

  const columns = useMemo<ColumnDef<Booking>[]>(
    () => [
      //... (no changes in columns definition)
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
              className="border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-800 mr-5"
            />
          </div>
        ),
        cell: ({ row }) => (
          <div className="w-full flex items-center justify-center">
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(value) => row.toggleSelected(!!value)}
              aria-label="Select row"
              className="border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800 mr-5"
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
        accessorKey: "booking_status",
        header: "Booking Status",
        cell: ({ row }) => (
          <Badge
            className={cn(
              "rounded-full px-3 py-1 font-medium",
              getStatusBadgeClasses(row.original.booking_status)
            )}
          >
            {row.original.booking_status}
          </Badge>
        ),
        size: 160,
      },
      {
        accessorKey: "payment_status",
        header: "Payment Status",
        cell: ({ row }) => (
          <Badge
            variant={
              row.original.payment_status === "Paid" ? "success" : "pending"
            }
            className="dark:text-white"
          >
            {row.original.payment_status}
          </Badge>
        ),
        size: 150,
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
              checkingInId={checkingInId}
              checkInMutation={checkInMutation}
              deleteBookingMutation={deleteBookingMutation}
              setCheckInError={setCheckInError}
            />
          </div>
        ),
        size: 80,
        enableHiding: false,
      },
    ],
    [checkInMutation, checkingInId, deleteBookingMutation, setCheckInError]
  );

  const table = useReactTable({
    // ... (no changes to table instance)
    data: bookingsForCurrentPage,
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
    // ... (no changes here)
    const selectedRows = table.getSelectedRowModel().rows;
    selectedRows.forEach((row) => {
      deleteBookingMutation.mutate(row.original.id);
    });
    table.resetRowSelection();
  };

  const clearFilters = () => {
    // ... (no changes here)
    setGlobalFilter("");
    setColumnFilters([]);
    setAmountPaidRange("");
    setSorting([]);
  };

  const TABS_CONFIG = [
    {
      label: "All Bookings",
      value: "All",
      icon: Users,
    },
    {
      label: "Online Bookings",
      value: "Online",
      icon: Smartphone,
    },
    {
      label: "Physical Bookings",
      value: "Physical",
      icon: BiWalk, // Changed Icon
    },
  ];

  // ... (no changes to filter options or activeFilters logic)
  const BOOKING_STATUS_OPTIONS = [
    "Processing",
    "Confirmed",
    "Paid",
    "Checked In",
    "Checked Out",
    "Cancelled",
    "No Show",
    "Refunded",
    "Pending",
    "In Progress",
    "Completed",
    "Reserved",
    "On Hold",
  ];
  const PAYMENT_STATUS_OPTIONS = ["Paid", "Pending"];
  const AMOUNT_PAID_RANGES = [
    { label: "TZS 0 - 50k", value: "0-50000" },
    { label: "TZS 50k - 100k", value: "50000-100000" },
    { label: "TZS 100k - 200k", value: "100000-200000" },
    { label: "TZS 200k+", value: "200000-99999999" },
  ];

  const activeFilters = useMemo(() => {
    const filters = [];
    if (globalFilter) {
      filters.push({
        label: `Guest: "${globalFilter}"`,
        onClear: () => setGlobalFilter(""),
      });
    }
    const statusFilter = columnFilters.find((f) => f.id === "booking_status");
    if (statusFilter?.value) {
      filters.push({
        label: `Status: ${statusFilter.value}`,
        onClear: () =>
          setColumnFilters((prev) =>
            prev.filter((f) => f.id !== "booking_status")
          ),
      });
    }
    const paymentFilter = columnFilters.find((f) => f.id === "payment_status");
    if (paymentFilter?.value) {
      filters.push({
        label: `Payment: ${paymentFilter.value}`,
        onClear: () =>
          setColumnFilters((prev) =>
            prev.filter((f) => f.id !== "payment_status")
          ),
      });
    }
    if (amountPaidRange) {
      const rangeLabel =
        AMOUNT_PAID_RANGES.find((r) => r.value === amountPaidRange)?.label ??
        amountPaidRange;
      filters.push({
        label: `Amount: ${rangeLabel}`,
        onClear: () => setAmountPaidRange(""),
      });
    }
    return filters;
  }, [globalFilter, columnFilters, amountPaidRange]);

  if (isError) return <ErrorPage error={error as Error} onRetry={refetch} />;

  return (
    <div className="flex-1 space-y-6 bg-gray-50 dark:bg-[#101828]">
      <Card className="border-none p-0 bg-[#FFF] dark:bg-[#171F2F] rounded-none shadow-none">
        <CardHeader className="bg-white/80 dark:bg-[#101828]/80 backdrop-blur-sm border-b border-gray-200 dark:border-[#1D2939] sticky top-0 z-30 mb-4 pt-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[1.5rem] font-bold tracking-wide">
                Guest Bookings
              </h2>
              <CardDescription className="text-[0.9375rem] text-gray-600 dark:text-[#98A2B3] mt-1">
                Manage and view all guest bookings with ease.
              </CardDescription>
            </div>
            <Button
              className="bg-blue-600 hover:bg-blue-700 gap-2"
              onClick={() => navigate("/bookings/new-booking")}
            >
              <MdAdd size={20} />
              New Booking
            </Button>
          </div>
        </CardHeader>
        <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Total Bookings"
            count={allBookingsStats?.count}
            isLoading={isLoadingAllStats}
            icon={Users}
          />
          <StatCard
            title="Online Bookings"
            count={onlineBookingsStats?.count}
            isLoading={isLoadingOnlineStats}
            icon={Smartphone}
          />
          <StatCard
            title="Physical (Walk-in) Bookings"
            count={physicalBookingsStats?.count}
            isLoading={isLoadingPhysicalStats}
            icon={BiWalk}
          />
        </div>
        <CardContent className="px-6 py-4">
          <div className="flex items-center gap-2 bg-white dark:bg-[#101828] border border-gray-200 dark:border-[#1D2939] rounded-md shadow-2xs p-[6px] w-fit mb-6">
            {TABS_CONFIG.map((tab) => (
              <button
                key={tab.value}
                onClick={() =>
                  setBookingTypeFilter(tab.value as typeof bookingTypeFilter)
                }
                className={cn(
                  "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200",
                  bookingTypeFilter === tab.value
                    ? "bg-blue-600 dark:bg-[#1c263a] text-white shadow"
                    : "bg-transparent text-gray-600 dark:text-[#98A2B3] hover:text-gray-800 dark:hover:text-white"
                )}
              >
                <tab.icon
                  className={cn(
                    "h-5 w-5",
                    bookingTypeFilter === tab.value
                      ? "text-white"
                      : "text-black dark:text-white" // Updated Icon Colors
                  )}
                />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="flex flex-wrap items-center gap-2">
              {/* ... (no changes to filter inputs) */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-[#5D636E]" />
                <Input
                  placeholder="Search by guest name..."
                  value={globalFilter}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  className="pl-10 pr-10 w-full sm:w-60 bg-white dark:bg-[#101828] border-gray-200 dark:border-[#1D2939] text-gray-800 dark:text-[#D0D5DD] rounded-md shadow focus:ring-2 focus:ring-blue-500 dark:placeholder:text-[#5D636E]"
                />
                {globalFilter && (
                  <button
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600 dark:text-[#98A2B3]"
                    onClick={() => setGlobalFilter("")}
                  >
                    <XIcon size={18} />
                  </button>
                )}
              </div>
              <Select
                value={
                  (table
                    .getColumn("booking_status")
                    ?.getFilterValue() as string) ?? ""
                }
                onValueChange={(value) =>
                  table
                    .getColumn("booking_status")
                    ?.setFilterValue(value === "all" ? "" : value)
                }
              >
                <SelectTrigger className="w-40 bg-white dark:bg-[#101828] border-gray-200 dark:border-[#1D2939] text-gray-800 dark:text-[#D0D5DD] rounded-md shadow focus:ring-2 focus:ring-blue-500">
                  <SelectValue placeholder="Booking Status" />
                </SelectTrigger>
                <SelectContent className="dark:bg-[#101828] dark:border-[#1D2939]">
                  <SelectItem
                    value="all"
                    className="dark:text-[#D0D5DD] dark:hover:bg-[#1C2433]"
                  >
                    All Statuses
                  </SelectItem>
                  {BOOKING_STATUS_OPTIONS.map((status) => (
                    <SelectItem
                      key={status}
                      value={status}
                      className="dark:text-[#D0D5DD] dark:hover:bg-[#1C2433]"
                    >
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={
                  (table
                    .getColumn("payment_status")
                    ?.getFilterValue() as string) ?? ""
                }
                onValueChange={(value) =>
                  table
                    .getColumn("payment_status")
                    ?.setFilterValue(value === "all" ? "" : value)
                }
              >
                <SelectTrigger className="w-40 bg-white dark:bg-[#101828] border-gray-200 dark:border-[#1D2939] text-gray-800 dark:text-[#D0D5DD] rounded-md shadow focus:ring-2 focus:ring-blue-500">
                  <SelectValue placeholder="Payment Status" />
                </SelectTrigger>
                <SelectContent className="dark:bg-[#101828] dark:border-[#1D2939]">
                  <SelectItem
                    value="all"
                    className="dark:text-[#D0D5DD] dark:hover:bg-[#1C2433]"
                  >
                    All Payments
                  </SelectItem>
                  {PAYMENT_STATUS_OPTIONS.map((status) => (
                    <SelectItem
                      key={status}
                      value={status}
                      className="dark:text-[#D0D5DD] dark:hover:bg-[#1C2433]"
                    >
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={amountPaidRange}
                onValueChange={(value) =>
                  setAmountPaidRange(value === "all" ? "" : value)
                }
              >
                <SelectTrigger className="w-44 bg-white dark:bg-[#101828] border-gray-200 dark:border-[#1D2939] text-gray-800 dark:text-[#D0D5DD] rounded-md shadow focus:ring-2 focus:ring-blue-500">
                  <SelectValue placeholder="Amount Paid (TZS)" />
                </SelectTrigger>
                <SelectContent className="dark:bg-[#101828] dark:border-[#1D2939]">
                  <SelectItem
                    value="all"
                    className="dark:text-[#D0D5DD] dark:hover:bg-[#1C2433]"
                  >
                    Any Amount
                  </SelectItem>
                  {AMOUNT_PAID_RANGES.map((range) => (
                    <SelectItem
                      key={range.value}
                      value={range.value}
                      className="dark:text-[#D0D5DD] dark:hover:bg-[#1C2433]"
                    >
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-3">
              {/* ... (no changes to bulk delete, column toggle, refresh) */}
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
                  {/* Removed "New Booking" from here */}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* ... (no changes to active filters, table rendering, or pagination) */}
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <span className="text-sm font-semibold text-gray-700 dark:text-[#98A2B3]">
                Active Filters:
              </span>
              {activeFilters.map((filter, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="flex items-center gap-2 bg-blue-100 dark:bg-[#162142] border border-blue-200 dark:border-blue-900 text-blue-800 dark:text-[#7592FF]"
                >
                  {filter.label}
                  <button
                    onClick={filter.onClear}
                    className="rounded-full hover:bg-blue-200 dark:hover:bg-blue-800/50 p-0.5"
                  >
                    <XIcon className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              <span
                className="text-blue-600 text-sm font-medium cursor-pointer hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 p-1.5"
                onClick={clearFilters}
              >
                Clear All
              </span>
            </div>
          )}

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
                        className="h-14 px-6 text-left align-middle font-semibold text-[13px] uppercase tracking-wide text-[#667085] dark:text-[#98A2B3] border-r border-gray-300 dark:border-r-[#1D2939] last:border-r-0 bg-gradient-to-b from-slate-50 to-slate-100 dark:from-[#101828] dark:to-[#101828]/90 shadow-sm"
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
                          className="px-6 py-4 align-middle border-r border-gray-200 dark:border-r-[#1D2939] last:border-r-0 text-gray-700 dark:text-[#D0D5DD]"
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
                      No bookings found matching your criteria.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between gap-4 mt-6">
            <div className="flex-1 text-sm text-gray-600 dark:text-[#98A2B3]">
              {table.getFilteredSelectedRowModel().rows.length} of{" "}
              {table.getFilteredRowModel().rows.length} row(s) selected.
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

      <AlertDialog
        open={!!checkInError}
        onOpenChange={() => setCheckInError(null)}
      >
        <AlertDialogContent className="dark:bg-[#101828] dark:border-[#1D2939]">
          <AlertDialogHeader>
            <AlertDialogTitle className="dark:text-[#D0D5DD]">
              Check-in Not Allowed
            </AlertDialogTitle>
            <AlertDialogDescription className="dark:text-[#98A2B3]">
              The guest with booking code{" "}
              <span className="font-semibold">{checkInError?.code}</span> cannot
              be checked in. A booking must be "Confirmed" to allow check-in.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setCheckInError(null)}>
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// --- Reusable Sub-components ---
// ... (no changes to SortableHeader or RowActions)
const SortableHeader = ({
  column,
  children,
}: {
  column: any;
  children: React.ReactNode;
}) => {
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
  checkingInId,
  checkInMutation,
  deleteBookingMutation,
  setCheckInError,
}: {
  row: Row<Booking>;
  checkingInId: string | null;
  checkInMutation: any;
  deleteBookingMutation: any;
  setCheckInError: (error: { code: string } | null) => void;
}) {
  const navigate = useNavigate();
  const booking = row.original;
  const canCheckIn = booking.booking_status === "Confirmed";
  const isCheckingIn = checkingInId === booking.id;

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
          onClick={() => {
            if (canCheckIn) {
              checkInMutation.mutate(booking.id);
            } else {
              setCheckInError({ code: booking.code });
            }
          }}
          disabled={!canCheckIn || isCheckingIn}
          className="gap-2 text-gray-700 dark:text-[#D0D5DD] hover:bg-indigo-50 dark:hover:bg-[#1C2433]"
        >
          {isCheckingIn ? (
            <Loader className="h-5 w-5 animate-spin" />
          ) : (
            <DoorOpen className="h-5 w-5 text-green-600" />
          )}
          <span>Check In</span>
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
