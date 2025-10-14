"use client";
import { useState, useMemo, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { format, eachDayOfInterval, parseISO, addDays } from "date-fns";
import { type DateRange } from "react-day-picker";
import {
  Loader2,
  AlertCircle,
  Bed,
  ListFilter,
  Ticket,
  Check,
  X,
  Minus,
  Users,
  ImageIcon,
  ChevronFirst,
  ChevronLeft,
  ChevronRight,
  ChevronLast,
  Eye,
  Calendar as CalendarIcon,
  Layers,
} from "lucide-react";
import { useHotel } from "@/providers/hotel-provider";
import hotelClient from "@/api/hotel-client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AvailabilityRangeResponse, DetailedRoom } from "./types/rooms";

// --- Room Details Sub-Component with Redesigned Gallery ---
function RoomDetailsView({ roomId }: { roomId: string }) {
  const {
    data: room,
    isLoading,
    isError,
    error,
  } = useQuery<DetailedRoom>({
    queryKey: ["roomDetails", roomId],
    queryFn: async () => (await hotelClient.get(`rooms/${roomId}`)).data,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-red-600 flex items-center gap-2">
        <AlertCircle /> Error loading room details: {error.message}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full space-y-6 p-6">
      <div className="space-y-4">
        <h3 className="font-semibold text-lg flex items-center gap-2 text-[#1D2939] dark:text-[#D0D5DD]">
          <ImageIcon className="text-blue-600" />
          Room Gallery
        </h3>

        <div
          className="flex gap-4 overflow-x-auto pb-4 noScroll"
          style={{ scrollBehavior: "smooth" }}
        >
          {room.images.length > 0 ? (
            room.images.map((img, index) => (
              <div
                key={img.id}
                className="flex-shrink-0 w-64 h-40 rounded-lg overflow-hidden border dark:border-[#1D2939] shadow-xs"
              >
                <img
                  src={img.url}
                  alt={img.code || `Room image ${index + 1}`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            ))
          ) : (
            <div className="flex-shrink-0 w-64 h-40 flex items-center justify-center bg-gray-100 dark:bg-[#171F2F] rounded-lg border dark:border-[#1D2939]">
              <div className="text-center">
                <ImageIcon className="h-8 w-8 mx-auto mb-2 text-gray-400 dark:text-[#5D636E]" />
                <p className="text-sm text-gray-500 dark:text-[#98A2B3]">
                  No images available
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="font-semibold text-lg flex items-center gap-2 text-[#1D2939] dark:text-[#D0D5DD]">
            Top Amenities
          </h3>
          <div className="flex flex-wrap gap-2 mt-2">
            {room.amenities.map((amenity) => (
              <Badge
                key={amenity.id}
                className="bg-[#EFF6FF] dark:bg-[#162142] text-blue-600 dark:text-[#98A2B3] border border-blue-200 dark:border-[#162142]"
              >
                {amenity.name}
              </Badge>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2"></div>
          <div className="flex items-center gap-2">
            <Users className="text-gray-600 dark:text-[#98A2B3]" />
            <span className="font-medium text-[#1D2939] dark:text-[#D0D5DD]">
              Max Occupancy:
            </span>
            <span className="text-gray-600 dark:text-[#98A2B3]">
              {room.max_occupancy}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Layers className="text-gray-600 dark:text-[#98A2B3]" />
            <span className="font-medium text-[#1D2939] dark:text-[#D0D5DD]">
              Floor Number:
            </span>
            <span className="text-gray-600 dark:text-[#98A2B3]">
              {room.floor_number}
            </span>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-[#1D2939] dark:text-[#D0D5DD] mb-2">
            Room Description
          </h4>
          <p className="text-sm text-gray-600 dark:text-[#98A2B3] leading-relaxed">
            {room.description}
          </p>
        </div>
      </div>
    </div>
  );
}

// --- Main Component ---
export default function AvailableRoomsByDate() {
  const navigate = useNavigate();
  const { hotel } = useHotel();
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 4),
  });
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [selectedRoomTypeId, setSelectedRoomTypeId] = useState<string | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 15 });
  const isInitialMount = useRef(true);

  const startDate = dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : "";
  const endDate = dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : "";

  const { data, isError, error, refetch, isFetching } =
    useQuery<AvailabilityRangeResponse>({
      queryKey: [
        "roomAvailability",
        hotel?.id,
        startDate,
        endDate,
        selectedRoomTypeId,
      ],
      queryFn: async () => {
        if (!hotel?.id || !startDate || !endDate) {
          return Promise.reject(
            new Error("A valid date range is required to search.")
          );
        }
        const params = new URLSearchParams({
          hotel_id: hotel.id,
          start_date: startDate,
          end_date: endDate,
        });
        if (selectedRoomTypeId) {
          params.append("room_type_id", selectedRoomTypeId);
        }
        const response = await hotelClient.get(
          `rooms/availability/range/?${params.toString()}`
        );
        return response.data;
      },
      enabled: false,
      retry: false,
    });

  useEffect(() => {
    handleSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (startDate && endDate) {
      refetch();
    }
  }, [selectedRoomTypeId, refetch, startDate, endDate]);

  const handleSearch = () => {
    if (startDate && endDate) {
      refetch();
    }
  };

  const filteredRooms = useMemo(() => {
    if (!data?.rooms) return [];
    let rooms = [...data.rooms];
    if (searchTerm) {
      const lowerCaseSearch = searchTerm.toLowerCase();
      rooms = rooms.filter(
        (room) =>
          room.room_code.toLowerCase().includes(lowerCaseSearch) ||
          room.room_type_name.toLowerCase().includes(lowerCaseSearch)
      );
    }
    return rooms;
  }, [data?.rooms, searchTerm]);

  const pageCount = Math.ceil(filteredRooms.length / pagination.pageSize);
  const paginatedRooms = useMemo(() => {
    const start = pagination.pageIndex * pagination.pageSize;
    const end = start + pagination.pageSize;
    return filteredRooms.slice(start, end);
  }, [filteredRooms, pagination]);

  const dateHeaders = useMemo(() => {
    if (!data?.start_date || !data?.end_date) return [];
    return eachDayOfInterval({
      start: parseISO(data.start_date),
      end: parseISO(data.end_date),
    });
  }, [data]);

  const renderStatusCell = (status: string) => {
    switch (status) {
      case "Available":
        return (
          <div className="flex items-center justify-center gap-1 text-green-600">
            <Check size={16} />
          </div>
        );
      case "Booked":
        return (
          <div className="flex items-center justify-center gap-1 text-amber-600">
            <Minus size={16} />
          </div>
        );
      case "Maintenance":
        return (
          <div className="flex items-center justify-center gap-1 text-rose-600">
            <X size={16} />
          </div>
        );
      default:
        return <span className="text-gray-400">-</span>;
    }
  };

  return (
    <div className="min-h-screen dark:bg-[#101828]">
      <div className="bg-white/80 dark:bg-[#101828]/80 backdrop-blur-sm border-b border-gray-200 dark:border-[#1D2939] sticky top-0 z-30">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 py-5">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold text-[#1D2939] dark:text-[#D0D5DD]">
                Room Availability
              </h1>
              <p className="text-[0.9375rem] mt-1 text-gray-600 dark:text-[#98A2B3]">
                Check room status across different date ranges.
              </p>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-8xl bg-[#F9FAFB] dark:bg-transparent min-h-screen mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-end justify-between gap-4 pb-4">
          <div className="flex gap-x-4 items-end">
            <div className="flex items-center gap-2 w-full">
              <div className="grid gap-2 w-full">
                <Label htmlFor="start-date">Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="start-date"
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal bg-white",
                        !dateRange?.from && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange?.from ? (
                        format(dateRange.from, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateRange?.from}
                      onSelect={(day) =>
                        setDateRange((prev) => ({
                          ...prev,
                          from: day,
                          to:
                            day && prev?.to && day > prev.to
                              ? undefined
                              : prev?.to,
                        }))
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="grid gap-2 w-full">
                <Label htmlFor="end-date">End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="end-date"
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal bg-white",
                        !dateRange?.to && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange?.to ? (
                        format(dateRange.to, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateRange?.to}
                      onSelect={(day) =>
                        setDateRange((prev) => ({ ...prev, to: day }))
                      }
                      disabled={(date) =>
                        dateRange?.from ? date < dateRange.from : false
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <Button
              onClick={handleSearch}
              disabled={!startDate || !endDate || isFetching}
              className="bg-blue-600 text-[#FFF] text-[0.9375rem] font-medium border-none"
            >
              {isFetching ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Find Rooms"
              )}
            </Button>
          </div>
        </div>

        {isFetching && (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
          </div>
        )}
        {isError && !isFetching && (
          <div className="p-6 text-center text-red-600 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="mx-auto h-8 w-8 mb-2" />
            <h3 className="font-semibold">An Error Occurred</h3>
            <p>{error.message}</p>
          </div>
        )}
        {data && !isFetching && (
          <div className="rounded-lg border border-gray-200 dark:border-[#1D2939] shadow-sm bg-white dark:bg-[#171F2F] overflow-hidden">
            <div className="p-4 flex flex-col sm:flex-row gap-4 justify-between items-center">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge
                  onClick={() => setSelectedRoomTypeId(null)}
                  className={cn(
                    "cursor-pointer text-[13px]",
                    selectedRoomTypeId === null
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "text-[#1547E5] bg-[#EFF6FF] hover:bg-blue-200"
                  )}
                >
                  All Types
                </Badge>
                {hotel?.room_type.map((rt) => (
                  <Badge
                    key={rt.id}
                    onClick={() => setSelectedRoomTypeId(rt.id)}
                    className={cn(
                      "cursor-pointer text-[13px]",
                      selectedRoomTypeId === rt.id
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "text-[#1547E5] bg-[#EFF6FF] hover:bg-blue-200"
                    )}
                  >
                    {rt.name}
                  </Badge>
                ))}
              </div>
              <div className="relative w-full sm:w-64">
                <ListFilter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Filter by code or type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white dark:bg-[#101828]"
                />
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-500 mb-4 px-4">
              <strong>Key:</strong>
              <div className="flex items-center gap-1 text-green-600">
                <Check size={16} /> Available
              </div>
              <div className="flex items-center gap-1 text-amber-600">
                <Minus size={16} /> Booked
              </div>
              <div className="flex items-center gap-1 text-rose-600">
                <X size={16} /> Maintenance
              </div>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-y-2 border-gray-300 dark:border-y-[#1D2939]">
                    <TableHead className="h-14 px-6 font-semibold text-[13px] uppercase text-[#667085] dark:text-[#98A2B3] bg-gradient-to-b from-slate-50 to-slate-100 dark:from-[#101828] dark:to-[#101828]/90 shadow-sm sticky left-0 z-20 min-w-[200px] border-r border-gray-300 dark:border-r-[#1D2939]">
                      Room
                    </TableHead>
                    {dateHeaders.map((date) => (
                      <TableHead
                        key={date.toString()}
                        className="h-14 px-6 font-semibold text-[13px] uppercase text-[#667085] dark:text-[#98A2B3] bg-gradient-to-b from-slate-50 to-slate-100 dark:from-[#101828] dark:to-[#101828]/90 text-center border-r border-gray-300 dark:border-r-[#1D2939]"
                      >
                        {format(date, "MMM dd")}
                      </TableHead>
                    ))}
                    <TableHead className="h-14 px-6 font-semibold text-[13px] uppercase text-[#667085] dark:text-[#98A2B3] bg-gradient-to-b from-slate-50 to-slate-100 dark:from-[#101828] dark:to-[#101828]/90 text-center sticky right-[120px] z-20 min-w-[120px] border-x border-gray-300 dark:border-x-[#1D2939]">
                      Details
                    </TableHead>
                    <TableHead className="h-14 px-6 font-semibold text-[13px] uppercase text-[#667085] dark:text-[#98A2B3] bg-gradient-to-b from-slate-50 to-slate-100 dark:from-[#101828] dark:to-[#101828]/90 text-center sticky right-0 z-20 min-w-[120px] border-l border-gray-300 dark:border-l-[#1D2939]">
                      Booking
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedRooms.length > 0 ? (
                    paginatedRooms.map((room) => (
                      <TableRow
                        key={room.room_id}
                        className="border-b border-gray-200 dark:border-b-[#1D2939] hover:bg-indigo-50/30 dark:hover:bg-[#1C2433]"
                      >
                        <TableCell className="px-6 py-4 sticky left-0 z-10 bg-white dark:bg-[#171F2F] border-r border-gray-200 dark:border-r-[#1D2939]">
                          <div className="font-bold text-gray-800 dark:text-gray-200">
                            {room.room_code}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {room.room_type_name}
                          </div>
                        </TableCell>
                        {dateHeaders.map((date) => {
                          const day = room.availability.find(
                            (d) => d.date === format(date, "yyyy-MM-dd")
                          );
                          return (
                            <TableCell
                              key={format(date, "yyyy-MM-dd")}
                              className="px-6 py-4 text-center font-semibold text-xs border-r border-gray-200 dark:border-r-[#1D2939]"
                            >
                              {renderStatusCell(day?.availability_status || "")}
                            </TableCell>
                          );
                        })}
                        <TableCell className="px-6 py-4 text-center sticky right-[120px] z-10 bg-white dark:bg-[#171F2F] border-x border-gray-200 dark:border-x-[#1D2939]">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSelectedRoomId(room.room_id)}
                            className="text-blue-600 h-8 w-8 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/40"
                          >
                            <Eye className="h-5 w-5" />
                          </Button>
                        </TableCell>
                        <TableCell className="px-6 py-4 text-center sticky right-0 z-10 bg-white dark:bg-[#171F2F] border-l border-gray-200 dark:border-l-[#1D2939]">
                          <Button
                            size="sm"
                            onClick={() => navigate("/bookings/new-booking")}
                            className="bg-blue-600 text-white hover:bg-blue-700"
                          >
                            <Ticket className="h-4 w-4 mr-2" />
                            Book
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={dateHeaders.length + 3}
                        className="h-48 text-center text-gray-500"
                      >
                        <Bed className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-xl font-semibold">
                          No Rooms Found
                        </h3>
                        <p>No rooms match your current criteria.</p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            <div className="flex items-center justify-between gap-4 mt-4 px-4 pb-4">
              <div className="flex-1 text-sm text-gray-600 dark:text-[#98A2B3]">
                Page {pagination.pageIndex + 1} of {pageCount || 1}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  className="h-9 w-9 p-0"
                  onClick={() => setPagination((p) => ({ ...p, pageIndex: 0 }))}
                  disabled={pagination.pageIndex === 0}
                >
                  <ChevronFirst className="h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  className="h-9 w-9 p-0"
                  onClick={() =>
                    setPagination((p) => ({ ...p, pageIndex: p.pageIndex - 1 }))
                  }
                  disabled={pagination.pageIndex === 0}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  className="h-9 w-9 p-0"
                  onClick={() =>
                    setPagination((p) => ({ ...p, pageIndex: p.pageIndex + 1 }))
                  }
                  disabled={pagination.pageIndex >= pageCount - 1}
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  className="h-9 w-9 p-0"
                  onClick={() =>
                    setPagination((p) => ({ ...p, pageIndex: pageCount - 1 }))
                  }
                  disabled={pagination.pageIndex >= pageCount - 1}
                >
                  <ChevronLast className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
      <Sheet
        open={!!selectedRoomId}
        onOpenChange={(isOpen) => !isOpen && setSelectedRoomId(null)}
      >
        <SheetContent className="w-full sm:max-w-[540px] p-0 bg-white dark:bg-[#101828] border-l dark:border-l-[#1D2939]">
          <SheetHeader className="p-6 border-b border-gray-200 dark:border-b-[#1D2939] bg-white dark:bg-[#101828]">
            <SheetTitle className="text-[#1D2939] text-2xl dark:text-[#D0D5DD]">
              Room Details:{" "}
              {data?.rooms.find((r) => r.room_id === selectedRoomId)?.room_code}
            </SheetTitle>
          </SheetHeader>
          <div className="h-full overflow-y-auto">
            {selectedRoomId && <RoomDetailsView roomId={selectedRoomId} />}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
