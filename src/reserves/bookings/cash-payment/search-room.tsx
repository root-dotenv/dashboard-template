// - - - src/pages/bookings/cash-payment/search-room.tsx
import React, { useState, useMemo } from "react";
import {
  Calendar as CalendarIcon,
  Bed,
  AlertCircle,
  Loader2,
  ListFilterIcon,
} from "lucide-react";
import type { Room } from "./types";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { addDays, format } from "date-fns";
import type { DateRange } from "react-day-picker";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { TbCalendarSearch } from "react-icons/tb";
import { LuArrowDownUp, LuTicketPlus } from "react-icons/lu";
import { IoSearchOutline } from "react-icons/io5";

// --- Reusable Sortable Header Component ---
const SortableHeader = ({ column, title }: { column: any; title: string }) => (
  <div
    className="flex items-center gap-2 cursor-pointer select-none"
    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
  >
    {title}
    <LuArrowDownUp size={14} className="text-muted-foreground/70" />
  </div>
);

// --- UPDATED SEARCH ROOM AVAILABILITY COMPONENT ---
interface SearchRoomAvailabilityProps {
  startDate: string;
  setStartDate: React.Dispatch<React.SetStateAction<string>>;
  endDate: string;
  setEndDate: React.Dispatch<React.SetStateAction<string>>;
  availableRooms: Room[];
  loading: boolean;
  error: string;
  onSearchRooms: () => void;
  onSelectRoom: (room: Room) => void;
}

export const SearchRoomAvailability: React.FC<SearchRoomAvailabilityProps> = ({
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  availableRooms,
  loading,
  error,
  onSearchRooms,
  onSelectRoom,
}) => {
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 7),
  });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const handleDateSelect = (range: DateRange | undefined) => {
    if (range) {
      setDate(range);
      if (range.from) {
        setStartDate(format(range.from, "yyyy-MM-dd"));
      }
      if (range.to) {
        setEndDate(format(range.to, "yyyy-MM-dd"));
      }
    }
  };

  const isRoomFullyAvailable = (room: Room) => {
    return room.availability.every(
      (day) => day.availability_status === "Available"
    );
  };

  const columns = useMemo<ColumnDef<Room>[]>(
    () => [
      {
        accessorKey: "room_type_name",
        header: ({ column }) => (
          <SortableHeader column={column} title="Room Type" />
        ),
      },
      {
        accessorKey: "bed_type",
        header: ({ column }) => (
          <SortableHeader column={column} title="Bed Type" />
        ),
      },
      {
        accessorKey: "price_per_night",
        header: ({ column }) => (
          <SortableHeader column={column} title="Price/Night" />
        ),
        cell: ({ row }) =>
          new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
          }).format(row.getValue("price_per_night")),
      },
      {
        accessorKey: "room_code",
        header: ({ column }) => (
          <SortableHeader column={column} title="Room Code" />
        ),
      },
      {
        id: "actions",
        header: () => <div className="text-center">Action</div>,
        cell: ({ row }) => (
          <div className="text-center">
            <Button
              onClick={() => onSelectRoom(row.original)}
              disabled={!isRoomFullyAvailable(row.original)}
              className="bg-[#0081FB] text-white hover:bg-blue-700 h-8 px-3"
            >
              Select & Book
              <LuTicketPlus size={14} className="ml-2" />
            </Button>
          </div>
        ),
      },
    ],
    [onSelectRoom]
  );

  const table = useReactTable({
    data: availableRooms,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 5 } },
  });

  return (
    <div className="flex flex-col w-full m-0 p-0">
      {/* Date Selection Form */}
      <Card className="shadow-none bg-none border-none rounded-lg mb-8 w-full max-w-4xl">
        <CardHeader className="p-0 m-0">
          <CardTitle className="text-2xl inter font-semibold text-gray-800 flex items-center">
            <TbCalendarSearch className="mr-3 h-6 w-6 text-blue-600" />
            Find The Perfect Stay
          </CardTitle>
          <CardDescription>
            Enter{" "}
            <span className="font-semibold text-[#0081FB]">*Start Date*</span>{" "}
            and{" "}
            <span className="font-semibold text-[#0081FB]">*End Ddate*</span> to
            Search for available rooms
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 m-0">
          <div className="flex flex-col p-0 m-0 md:flex-row gap-4">
            {/* Gradient Border Wrapper */}
            <div className="relative p-[1.5px] bg-blue-500 rounded-full w-full md:w-[540px]">
              <Popover>
                <PopoverTrigger
                  className="active:bg-none hover:bg-none"
                  asChild
                >
                  <Button
                    id="date"
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal rounded-full h-12 text-base px-6 border-none",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-3 h-5 w-5" />
                    {date?.from ? (
                      date.to ? (
                        <>
                          {format(date.from, "LLL dd, y")} -{" "}
                          {format(date.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(date.from, "LLL dd, y")
                      )
                    ) : (
                      <span>Pick a date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={date?.from}
                    selected={date}
                    onSelect={handleDateSelect}
                    numberOfMonths={2}
                    disabled={(day) =>
                      day < new Date(new Date().setHours(0, 0, 0, 0))
                    }
                  />
                </PopoverContent>
              </Popover>
            </div>
            <Button
              onClick={onSearchRooms}
              disabled={loading || !startDate || !endDate}
              className="w-full md:w-auto bg-[#0081FB] hover:bg-blue-600 disabled:bg-blue-400 disabled:cursor-not-allowed text-white py-3 text-base rounded-full h-12 px-8"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <IoSearchOutline className="mr-2 h-5 w-5" />
                  <span>Search</span>
                </>
              )}
            </Button>
          </div>
          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-md flex items-center gap-3 max-w-md mx-auto">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">{error}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available Rooms Table */}
      {availableRooms.length > 0 && (
        <Card className="border-none shadow-none bg-none w-full max-w-4xl">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-800 flex items-center">
              <Bed className="mr-3 h-6 w-6 text-blue-600" />
              Available Rooms ({table.getRowModel().rows.length} Rooms Found)
            </CardTitle>
            <CardDescription className="text-gray-600 pt-1">
              Showing results for:{" "}
              <span className="font-semibold text-gray-700">{startDate}</span>{" "}
              to <span className="font-semibold text-gray-700">{endDate}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="relative flex-1">
                <Input
                  className="peer w-full max-w-md ps-9"
                  value={globalFilter}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  placeholder="Filter by room type, code..."
                />
                <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3">
                  <ListFilterIcon size={16} />
                </div>
              </div>
            </div>
            <div className="overflow-hidden rounded-md border">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow
                      key={headerGroup.id}
                      className="hover:bg-transparent"
                    >
                      {headerGroup.headers.map((header) => (
                        <TableHead
                          key={header.id}
                          className="h-12 text-left px-6"
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
                  {table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          className="text-left px-6 py-4"
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Showing {table.getRowModel().rows.length} of{" "}
                {availableRooms.length} rooms.
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  Previous
                </Button>
                <span className="text-sm">
                  Page {table.getState().pagination.pageIndex + 1} of{" "}
                  {table.getPageCount()}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Results Message */}
      {!loading &&
        availableRooms.length === 0 &&
        startDate &&
        endDate &&
        !error && (
          <Card className="border-gray-200 border-dashed shadow-none text-center w-full max-w-4xl">
            <CardContent className="p-10">
              <Bed className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                No Rooms Available
              </h3>
              <p className="text-gray-500">
                Unfortunately, no rooms match your selected dates. Please try a
                different date range.
              </p>
            </CardContent>
          </Card>
        )}
    </div>
  );
};
