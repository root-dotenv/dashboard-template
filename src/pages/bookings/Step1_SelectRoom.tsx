"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, differenceInDays } from "date-fns";
import { useBookingStore } from "@/store/booking.store";
import { useHotel } from "@/providers/hotel-provider";
import hotelClient from "@/api/hotel-client";
import {
  type AvailabilityRangeResponse,
  type AvailableRoom,
} from "./booking-types";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
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
  CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import RoomCard from "./room-card";
import { Separator } from "@/components/ui/separator";

export default function Step1_SelectRoom() {
  const { hotel } = useHotel();
  const { startDate, endDate, setDates, setSelectedRoom, setStep } =
    useBookingStore();

  const [checkinDate, setCheckinDate] = useState<Date | undefined>(startDate);
  const [checkoutDate, setCheckoutDate] = useState<Date | undefined>(endDate);
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
      checkinDate,
      checkoutDate,
      selectedRoomTypeId,
    ],
    queryFn: async () => {
      if (!hotel?.id || !checkinDate || !checkoutDate) {
        throw new Error("A valid hotel and date range are required.");
      }
      const params = new URLSearchParams({
        hotel_id: hotel.id,
        start_date: format(checkinDate, "yyyy-MM-dd"),
        end_date: format(checkoutDate, "yyyy-MM-dd"),
      });
      if (selectedRoomTypeId) {
        params.append("room_type_id", selectedRoomTypeId);
      }
      const response = await hotelClient.get(
        `rooms/availability/range/?${params.toString()}`
      );
      return response.data;
    },
    enabled: hasSearched && !!hotel?.id && !!checkinDate && !!checkoutDate,
    retry: 1,
  });

  const handleSearch = () => {
    if (!checkinDate || !checkoutDate) {
      toast.error("Please select both a check-in and check-out date.");
      return;
    }
    if (checkoutDate <= checkinDate) {
      toast.error("Check-out date must be after the check-in date.");
      return;
    }
    setDates({ start: checkinDate, end: checkoutDate });
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
      <div className="flex flex-col sm:flex-row items-end gap-4 rounded-lg bg-none dark:bg-gray-900/50">
        <div className="grid gap-2 w-full">
          <Label htmlFor="start-date">Check-in Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="start-date"
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !checkinDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {checkinDate ? (
                  format(checkinDate, "PPP")
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={checkinDate}
                onSelect={setCheckinDate}
                disabled={(date) =>
                  date < new Date(new Date().setHours(0, 0, 0, 0))
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="grid gap-2 w-full">
          <Label htmlFor="end-date">Check-out Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="end-date"
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !checkoutDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {checkoutDate ? (
                  format(checkoutDate, "PPP")
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={checkoutDate}
                onSelect={setCheckoutDate}
                disabled={(date) =>
                  checkinDate ? date <= checkinDate : date < new Date()
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        <Button
          onClick={handleSearch}
          disabled={isFetching}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
        >
          {isFetching && hasSearched && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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

      {hasSearched && (
        <div>
          <div className="w-full flex flex-col lg:flex-row gap-8 items-start">
            <div className="w-full lg:w-64 flex-shrink-0 p-4 border rounded-md bg-[#FFFFFF] dark:bg-gray-800 dark:border-gray-700 lg:sticky lg:top-36">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Filter by Room Type</h3>
                {selectedRoomTypeId && (
                  <Button
                    variant="link"
                    className="h-auto p-0 text-sm text-blue-600 cursor-pointer dark:text-blue-400"
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
                        "text-sm",
                        selectedRoomTypeId === type.id
                          ? "font-medium text-blue-800 dark:text-blue-200"
                          : "text-gray-700 dark:text-gray-200"
                      )}
                    >
                      {type.name}
                    </span>
                  </div>
                ))}
                {hotel?.room_type.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No room types available.
                  </p>
                )}
              </div>
            </div>

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
                      checkinDate && checkoutDate
                        ? differenceInDays(checkoutDate, checkinDate) || 1
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
