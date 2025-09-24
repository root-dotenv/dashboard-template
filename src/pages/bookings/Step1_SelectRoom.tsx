"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, differenceInDays } from "date-fns";
import { type DateRange } from "react-day-picker";
import { useBookingStore } from "@/store/booking.store";
import { useHotel } from "@/providers/hotel-provider";
import hotelClient from "@/api/hotel-client";
import {
  type AvailabilityRangeResponse,
  type AvailableRoom,
} from "./booking-types";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import {
  Loader2,
  AlertCircle,
  Bed,
  CalendarIcon,
  CheckCircle, // For the checked state
} from "lucide-react";
import { cn } from "@/lib/utils";
import RoomCard from "./room-card";
import { Separator } from "@/components/ui/separator";

export default function Step1_SelectRoom() {
  const { hotel } = useHotel();
  const { startDate, endDate, setDates, setSelectedRoom, setStep } =
    useBookingStore();

  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startDate,
    to: endDate,
  });
  const [selectedRoomTypeId, setSelectedRoomTypeId] = useState<string | null>(
    null
  );
  const [hasSearched, setHasSearched] = useState(false);

  const {
    data: availabilityData,
    isError,
    error,
    isFetching,
  } = useQuery<AvailabilityRangeResponse>({
    queryKey: [
      "roomAvailabilitySearch",
      hotel?.id,
      dateRange?.from,
      dateRange?.to,
      selectedRoomTypeId,
    ],
    queryFn: async () => {
      if (!hotel?.id || !dateRange?.from || !dateRange?.to) {
        throw new Error("A valid hotel and date range are required.");
      }
      const params = new URLSearchParams({
        hotel_id: hotel.id,
        start_date: format(dateRange.from, "yyyy-MM-dd"),
        end_date: format(dateRange.to, "yyyy-MM-dd"),
      });
      if (selectedRoomTypeId) {
        params.append("room_type_id", selectedRoomTypeId);
      }
      const response = await hotelClient.get(
        `rooms/availability/range/?${params.toString()}`
      );
      return response.data;
    },
    enabled: hasSearched && !!hotel?.id && !!dateRange?.from && !!dateRange?.to,
    retry: 1,
  });

  const handleSearch = () => {
    if (!dateRange?.from || !dateRange?.to) {
      toast.error("Please select both a start and end date.");
      return;
    }
    setDates({ start: dateRange.from, end: dateRange.to });
    setHasSearched(true);
  };

  const handleSelectRoom = (room: AvailableRoom) => {
    setSelectedRoom(room);
    setStep(2);
    toast.success(`Selected room: ${room.room_type_name}`);
  };

  const fullyAvailableRooms =
    availabilityData?.rooms.filter((room) =>
      room.availability.every((d) => d.availability_status === "Available")
    ) ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center gap-4 rounded-lg bg-none dark:bg-gray-900/50">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full sm:w-[280px] justify-start text-left font-normal",
                !dateRange && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange?.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "LLL dd, y")} -{" "}
                    {format(dateRange.to, "LLL dd, y")}
                  </>
                ) : (
                  format(dateRange.from, "LLL dd, y")
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
              defaultMonth={dateRange?.from}
              selected={dateRange}
              onSelect={setDateRange}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
        <Button
          variant={"main"}
          onClick={handleSearch}
          disabled={isFetching}
          className="w-full sm:w-auto"
        >
          {isFetching && hasSearched ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            " "
          )}
          Find Available Rooms
        </Button>
      </div>

      <Separator />

      {isError && (
        <div className="text-red-600 bg-red-50 dark:bg-red-900/20 p-4 rounded-md flex items-center gap-2">
          <AlertCircle /> Error searching for rooms: {error.message}
        </div>
      )}

      {/* Show results only after the first search has been initiated */}
      {hasSearched && (
        <div>
          <div className="w-full flex flex-col lg:flex-row gap-8 items-start">
            {/* --- Filters Column --- */}
            <div className="w-full sticky left-0 right-0 top-16 lg:w-64 flex-shrink-0 p-4 border rounded-md bg-[#FFFFFF] dark:bg-gray-800 dark:border-gray-700">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Filter by Room Type</h3>
                {selectedRoomTypeId && (
                  <Button
                    variant="link"
                    className="h-auto p-0 text-[0.9375rem] text-blue-600 cursor-pointer dark:text-blue-400"
                    onClick={() => setSelectedRoomTypeId(null)}
                  >
                    Clear
                  </Button>
                )}
              </div>
              <div className="flex flex-col gap-2">
                {hotel?.room_type.map((type) => (
                  <div
                    key={type.id}
                    className={cn(
                      "flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors hover:bg-gray-100 dark:hover:bg-gray-700",
                      selectedRoomTypeId === type.id &&
                        "bg-blue-50 dark:bg-blue-900/20"
                    )}
                    onClick={() =>
                      setSelectedRoomTypeId(
                        selectedRoomTypeId === type.id ? null : type.id
                      )
                    }
                  >
                    {selectedRoomTypeId === type.id ? (
                      <CheckCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border-2 border-gray-400 dark:border-gray-500" />
                    )}
                    <span
                      className={cn(
                        "text-base",
                        selectedRoomTypeId === type.id
                          ? "font-medium text-blue-800 dark:text-blue-200"
                          : "text-[#10294D] dark:text-gray-200"
                      )}
                    >
                      {type.name}
                    </span>
                  </div>
                ))}
                {/* Fallback for no room types or specific "All" option if desired */}
                {hotel?.room_type.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No room types available.
                  </p>
                )}
              </div>
            </div>

            {/* --- Room Cards Column --- */}
            <div className="flex-1 w-full">
              {isFetching ? (
                <div className="flex justify-center items-center py-16">
                  <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                </div>
              ) : fullyAvailableRooms.length > 0 ? (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">
                    {fullyAvailableRooms.length} Available Rooms Found
                  </h3>
                  {fullyAvailableRooms.map((room) => {
                    const duration =
                      dateRange?.from && dateRange?.to
                        ? differenceInDays(dateRange.to, dateRange.from) || 1
                        : 1;

                    return (
                      <RoomCard
                        key={room.room_id}
                        room={room}
                        duration={duration}
                        onSelectRoom={handleSelectRoom}
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-16 text-muted-foreground border-dashed border-2 dark:border-gray-700 rounded-lg">
                  <Bed className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="font-semibold">No Rooms Found</p>
                  <p>
                    No rooms are available for the selected dates and filter.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
