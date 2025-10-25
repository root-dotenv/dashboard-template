// "use client";
// import { useState } from "react";
// import { useQuery } from "@tanstack/react-query";
// import { format, differenceInDays } from "date-fns";
// import { useBookingStore } from "@/store/booking.store";
// import { useHotel } from "@/providers/hotel-provider";
// import hotelClient from "@/api/hotel-client";
// import {
//   type AvailabilityRangeResponse,
//   type AvailableRoom,
// } from "./booking-types";
// import { Button } from "@/components/ui/button";
// import { Calendar } from "@/components/ui/calendar";
// import { Label } from "@/components/ui/label";
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/popover";
// import { toast } from "sonner";
// import {
//   Loader2,
//   AlertCircle,
//   Bed,
//   CalendarIcon,
//   CheckCircle,
// } from "lucide-react";
// import { cn } from "@/lib/utils";
// import RoomCard from "./room-card";
// import { Separator } from "@/components/ui/separator";

// export default function Step1_SelectRoom() {
//   const { hotel } = useHotel();
//   const { startDate, endDate, setDates, setSelectedRoom, setStep } =
//     useBookingStore();

//   const [checkinDate, setCheckinDate] = useState<Date | undefined>(startDate);
//   const [checkoutDate, setCheckoutDate] = useState<Date | undefined>(endDate);
//   const [selectedRoomTypeId, setSelectedRoomTypeId] = useState<string | null>(
//     null
//   );
//   const [hasSearched, setHasSearched] = useState(false);

//   const {
//     data: availabilityData,
//     isError,
//     error,
//     isFetching,
//   } = useQuery<AvailabilityRangeResponse>({
//     queryKey: [
//       "roomAvailabilitySearch",
//       hotel?.id,
//       checkinDate,
//       checkoutDate,
//       selectedRoomTypeId,
//     ],
//     queryFn: async () => {
//       if (!hotel?.id || !checkinDate || !checkoutDate) {
//         throw new Error("A valid hotel and date range are required.");
//       }
//       const params = new URLSearchParams({
//         hotel_id: hotel.id,
//         start_date: format(checkinDate, "yyyy-MM-dd"),
//         end_date: format(checkoutDate, "yyyy-MM-dd"),
//       });
//       if (selectedRoomTypeId) {
//         params.append("room_type_id", selectedRoomTypeId);
//       }
//       const response = await hotelClient.get(
//         `rooms/availability/range/?${params.toString()}`
//       );
//       return response.data;
//     },
//     enabled: hasSearched && !!hotel?.id && !!checkinDate && !!checkoutDate,
//     retry: 1,
//   });

//   const handleSearch = () => {
//     if (!checkinDate || !checkoutDate) {
//       toast.error("Please select both a check-in and check-out date.");
//       return;
//     }
//     if (checkoutDate <= checkinDate) {
//       toast.error("Check-out date must be after the check-in date.");
//       return;
//     }
//     setDates({ start: checkinDate, end: checkoutDate });
//     setHasSearched(true);
//   };

//   const handleSelectRoom = (room: AvailableRoom) => {
//     setSelectedRoom(room);
//     setStep(2);
//     toast.success(`Selected room: ${room.room_type_name}`);
//   };

//   const fullyAvailableRooms =
//     availabilityData?.rooms.filter((room) =>
//       room.availability.every((d) => d.availability_status === "Available")
//     ) ?? [];

//   return (
//     <div className="space-y-6">
//       <div className="flex flex-col sm:flex-row items-end gap-4 rounded-lg bg-none dark:bg-gray-900/50">
//         <div className="grid gap-2 w-full">
//           <Label htmlFor="start-date">Check-in Date</Label>
//           <Popover>
//             <PopoverTrigger asChild>
//               <Button
//                 id="start-date"
//                 variant={"outline"}
//                 className={cn(
//                   "w-full justify-start text-left font-normal",
//                   !checkinDate && "text-muted-foreground"
//                 )}
//               >
//                 <CalendarIcon className="mr-2 h-4 w-4" />
//                 {checkinDate ? (
//                   format(checkinDate, "PPP")
//                 ) : (
//                   <span>Pick a date</span>
//                 )}
//               </Button>
//             </PopoverTrigger>
//             <PopoverContent className="w-auto p-0" align="start">
//               <Calendar
//                 mode="single"
//                 selected={checkinDate}
//                 onSelect={setCheckinDate}
//                 disabled={(date) =>
//                   date < new Date(new Date().setHours(0, 0, 0, 0))
//                 }
//                 initialFocus
//               />
//             </PopoverContent>
//           </Popover>
//         </div>
//         <div className="grid gap-2 w-full">
//           <Label htmlFor="end-date">Check-out Date</Label>
//           <Popover>
//             <PopoverTrigger asChild>
//               <Button
//                 id="end-date"
//                 variant={"outline"}
//                 className={cn(
//                   "w-full justify-start text-left font-normal",
//                   !checkoutDate && "text-muted-foreground"
//                 )}
//               >
//                 <CalendarIcon className="mr-2 h-4 w-4" />
//                 {checkoutDate ? (
//                   format(checkoutDate, "PPP")
//                 ) : (
//                   <span>Pick a date</span>
//                 )}
//               </Button>
//             </PopoverTrigger>
//             <PopoverContent className="w-auto p-0" align="start">
//               <Calendar
//                 mode="single"
//                 selected={checkoutDate}
//                 onSelect={setCheckoutDate}
//                 disabled={(date) =>
//                   checkinDate ? date <= checkinDate : date < new Date()
//                 }
//                 initialFocus
//               />
//             </PopoverContent>
//           </Popover>
//         </div>
//         <Button
//           onClick={handleSearch}
//           disabled={isFetching}
//           className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
//         >
//           {isFetching && hasSearched && (
//             <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//           )}
//           Find Available Rooms
//         </Button>
//       </div>

//       <Separator />

//       {isError && (
//         <div className="text-red-600 bg-red-50 dark:bg-red-900/20 p-4 rounded-md flex items-center gap-2">
//           <AlertCircle /> Error searching for rooms: {error.message}
//         </div>
//       )}

//       {hasSearched && (
//         <div>
//           <div className="w-full flex flex-col lg:flex-row gap-8 items-start">
//             <div className="w-full lg:w-64 flex-shrink-0 p-4 border rounded-md bg-[#FFFFFF] dark:bg-gray-800 dark:border-gray-700 lg:sticky lg:top-36">
//               <div className="flex justify-between items-center mb-4">
//                 <h3 className="text-lg font-semibold">Filter by Room Type</h3>
//                 {selectedRoomTypeId && (
//                   <Button
//                     variant="link"
//                     className="h-auto p-0 text-sm text-blue-600 cursor-pointer dark:text-blue-400"
//                     onClick={() => setSelectedRoomTypeId(null)}
//                   >
//                     Clear
//                   </Button>
//                 )}
//               </div>
//               <div className="flex flex-col gap-2">
//                 {hotel?.room_type.map((type) => (
//                   <div
//                     key={type.id}
//                     className={cn(
//                       "flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors hover:bg-gray-100 dark:hover:bg-gray-700",
//                       selectedRoomTypeId === type.id &&
//                         "bg-blue-50 dark:bg-blue-900/20"
//                     )}
//                     onClick={() =>
//                       setSelectedRoomTypeId(
//                         selectedRoomTypeId === type.id ? null : type.id
//                       )
//                     }
//                   >
//                     {selectedRoomTypeId === type.id ? (
//                       <CheckCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
//                     ) : (
//                       <div className="h-4 w-4 rounded-full border-2 border-gray-400 dark:border-gray-500" />
//                     )}
//                     <span
//                       className={cn(
//                         "text-sm",
//                         selectedRoomTypeId === type.id
//                           ? "font-medium text-blue-800 dark:text-blue-200"
//                           : "text-gray-700 dark:text-gray-200"
//                       )}
//                     >
//                       {type.name}
//                     </span>
//                   </div>
//                 ))}
//                 {hotel?.room_type.length === 0 && (
//                   <p className="text-sm text-muted-foreground">
//                     No room types available.
//                   </p>
//                 )}
//               </div>
//             </div>

//             <div className="flex-1 w-full">
//               {isFetching ? (
//                 <div className="flex justify-center items-center py-16">
//                   <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
//                 </div>
//               ) : fullyAvailableRooms.length > 0 ? (
//                 <div className="space-y-6">
//                   <h3 className="text-lg font-semibold">
//                     {fullyAvailableRooms.length} Available Rooms Found
//                   </h3>
//                   {fullyAvailableRooms.map((room) => {
//                     const duration =
//                       checkinDate && checkoutDate
//                         ? differenceInDays(checkoutDate, checkinDate) || 1
//                         : 1;
//                     return (
//                       <RoomCard
//                         key={room.room_id}
//                         room={room}
//                         duration={duration}
//                         onSelectRoom={handleSelectRoom}
//                       />
//                     );
//                   })}
//                 </div>
//               ) : (
//                 <div className="text-center py-16 text-muted-foreground border-dashed border-2 dark:border-gray-700 rounded-lg">
//                   <Bed className="mx-auto h-12 w-12 text-gray-400 mb-4" />
//                   <p className="font-semibold">No Rooms Found</p>
//                   <p>
//                     No rooms are available for the selected dates and filter.
//                   </p>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// src/pages/bookings/Step1_SelectRoom.tsx
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
  Search,
  Filter,
  MapPin,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import RoomCard from "./room-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
    <div className="space-y-8 p-8">
      {/* Search Section */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-gray-900 dark:text-white">
            <Search className="h-6 w-6 text-blue-600" />
            Find Available Rooms
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-end">
            <div className="lg:col-span-2">
              <Label
                htmlFor="start-date"
                className="text-sm font-semibold mb-2 block"
              >
                Check-in Date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="start-date"
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal h-12 bg-white dark:bg-gray-800",
                      !checkinDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {checkinDate ? (
                      format(checkinDate, "PPP")
                    ) : (
                      <span>Select check-in date</span>
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

            <div className="lg:col-span-2">
              <Label
                htmlFor="end-date"
                className="text-sm font-semibold mb-2 block"
              >
                Check-out Date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="end-date"
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal h-12 bg-white dark:bg-gray-800",
                      !checkoutDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {checkoutDate ? (
                      format(checkoutDate, "PPP")
                    ) : (
                      <span>Select check-out date</span>
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
              className="h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            >
              {isFetching && hasSearched ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Search className="mr-2 h-4 w-4" />
              )}
              Search Rooms
            </Button>
          </div>
        </CardContent>
      </Card>

      {isError && (
        <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-red-700 dark:text-red-400">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <div>
                <p className="font-semibold">Search Error</p>
                <p className="text-sm">{error.message}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {hasSearched && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Filter className="h-5 w-5 text-blue-600" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm text-gray-900 dark:text-white mb-3">
                      Room Types
                    </h4>
                    <div className="space-y-2">
                      {hotel?.room_type.map((type) => (
                        <div
                          key={type.id}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all border",
                            selectedRoomTypeId === type.id
                              ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                              : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
                          )}
                          onClick={() =>
                            setSelectedRoomTypeId(
                              selectedRoomTypeId === type.id ? null : type.id
                            )
                          }
                        >
                          {selectedRoomTypeId === type.id ? (
                            <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          ) : (
                            <div className="h-5 w-5 rounded-full border-2 border-gray-400 dark:border-gray-500" />
                          )}
                          <span
                            className={cn(
                              "text-sm font-medium",
                              selectedRoomTypeId === type.id
                                ? "text-blue-800 dark:text-blue-200"
                                : "text-gray-700 dark:text-gray-200"
                            )}
                          >
                            {type.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {selectedRoomTypeId && (
                    <Button
                      variant="outline"
                      className="w-full text-sm"
                      onClick={() => setSelectedRoomTypeId(null)}
                    >
                      Clear Filter
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Hotel Info Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  Property Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {hotel?.name}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {hotel?.room_type.length} room types available
                  </p>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Clock className="h-4 w-4" />
                  Check-in: 3:00 PM • Check-out: 11:00 AM
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results Section */}
          <div className="lg:col-span-3">
            {isFetching ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex justify-center items-center py-16">
                    <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                  </div>
                </CardContent>
              </Card>
            ) : fullyAvailableRooms.length > 0 ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {fullyAvailableRooms.length} Available Rooms
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      Perfect accommodations for your stay
                    </p>
                  </div>
                  {selectedRoomTypeId && (
                    <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm font-medium">
                      Filtered
                    </div>
                  )}
                </div>

                <div className="space-y-4">
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
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-16">
                    <Bed className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      No Rooms Available
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                      We couldn't find any available rooms matching your
                      criteria. Try adjusting your dates or filters.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => setHasSearched(false)}
                    >
                      Modify Search
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {!hasSearched && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Start Your Booking Journey
              </h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-6">
                Select your check-in and check-out dates to discover available
                rooms and suites for your perfect stay.
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <Clock className="h-4 w-4" />
                Quick and easy booking process
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
