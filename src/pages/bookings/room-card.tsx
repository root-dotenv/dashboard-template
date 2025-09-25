// import { useState } from "react";
// import { useQuery } from "@tanstack/react-query";
// import hotelClient from "@/api/hotel-client";
// import { type AvailableRoom, type DetailedRoom } from "./booking-types";
// import { Button } from "@/components/ui/button";
// import { Skeleton } from "@/components/ui/skeleton";
// import {
//   AlertTriangle,
//   Star,
//   Users,
//   Building,
//   Hash,
//   ChevronLeft,
//   ChevronRight,
// } from "lucide-react";
// import { cn } from "@/lib/utils";
// import { BsDash } from "react-icons/bs";

// interface RoomCardProps {
//   room: AvailableRoom;
//   duration: number;
//   onSelectRoom: (room: AvailableRoom) => void;
// }

// export default function RoomCard({
//   room,
//   duration,
//   onSelectRoom,
// }: RoomCardProps) {
//   const [currentImageIndex, setCurrentImageIndex] = useState(0);

//   const {
//     data: detailedRoom,
//     isLoading,
//     isError,
//   } = useQuery<DetailedRoom>({
//     queryKey: ["detailedRoom", room.room_id],
//     queryFn: async () => {
//       const response = await hotelClient.get(`/rooms/${room.room_id}`);
//       return response.data;
//     },
//     staleTime: 1000 * 60 * 5, // Cache for 5 minutes
//     refetchOnWindowFocus: false,
//   });

//   if (isLoading) {
//     return <RoomCardSkeleton />;
//   }

//   if (isError || !detailedRoom) {
//     return <RoomCardError />;
//   }

//   const handlePrevImage = () => {
//     setCurrentImageIndex((prev) =>
//       prev === 0 ? detailedRoom.images.length - 1 : prev - 1
//     );
//   };

//   const handleNextImage = () => {
//     setCurrentImageIndex((prev) =>
//       prev === detailedRoom.images.length - 1 ? 0 : prev + 1
//     );
//   };

//   // Pricing calculations
//   const taxAndFeeMultiplier = 1.27;
//   const basePricePerNight = detailedRoom.price_per_night;
//   const totalCostWithTaxes = basePricePerNight * taxAndFeeMultiplier * duration;
//   const rating = parseFloat(detailedRoom.average_rating);
//   const topAmenities = detailedRoom.amenities.slice(0, 3);

//   return (
//     <div className=" rounded-lg flex items-start justify-between w-fit transition-all bg-[#FFF] shadow-2xs dark:border-gray-700 border-0">
//       {/* Left Column: Image Slider */}
//       <div className="relative group max-w-[236px] max-h-[251px]">
//         <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
//         <img
//           src={
//             detailedRoom.images[currentImageIndex]?.url ||
//             "https://placehold.co/600x400/EEE/31343C?text=Image+Not+Available"
//           }
//           alt={detailedRoom.room_type_name}
//           className="object-cover h-[251px] w-[236px] rounded-l-lg"
//         />
//         {detailedRoom.images.length > 1 && (
//           <>
//             {/* --- UPDATED: Chevrons now appear on hover --- */}
//             <Button
//               variant="outline"
//               size="icon"
//               className="absolute top-1/2 left-2 -translate-y-1/2 rounded-full h-8 w-8 bg-black/30 hover:bg-black/50 border-none text-white opacity-0 group-hover:opacity-100 transition-opacity"
//               onClick={handlePrevImage}
//             >
//               <ChevronLeft className="h-4 w-4" />
//             </Button>
//             <Button
//               variant="outline"
//               size="icon"
//               className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full h-8 w-8 bg-black/30 hover:bg-black/50 border-none text-white opacity-0 group-hover:opacity-100 transition-opacity"
//               onClick={handleNextImage}
//             >
//               <ChevronRight className="h-4 w-4" />
//             </Button>
//             {/* --- UPDATED: Image progress dots --- */}
//             <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
//               {detailedRoom.images.map((_, index) => (
//                 <div
//                   key={index}
//                   className={cn(
//                     "h-2 w-2 rounded-full bg-white/50 transition-all",
//                     index === currentImageIndex && "bg-white scale-125"
//                   )}
//                 />
//               ))}
//             </div>
//           </>
//         )}
//       </div>

//       {/* Right Column: Details */}
//       <div className="md:col-span-2 flex flex-col px-8">
//         <div>
//           <h3 className="text-xl font-bold">{detailedRoom.room_type_name}</h3>
//           <p className="text-md text-blue-600 dark:text-blue-400">
//             {detailedRoom.code}
//           </p>
//           <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-muted-foreground">
//             <div className="flex items-center gap-1">
//               <Star className="w-4 h-4 text-amber-500" />
//               <span className="font-semibold">{rating.toFixed(1)}</span>
//               <span>({detailedRoom.review_count} reviews)</span>
//             </div>
//             <div className="flex items-center gap-1">
//               <Users className="w-4 h-4" />
//               <span>Up to {detailedRoom.max_occupancy} guests</span>
//             </div>
//             <div className="flex items-center gap-1">
//               <Hash className="w-4 h-4" />
//               <span>{detailedRoom.code}</span>
//             </div>
//           </div>
//         </div>

//         {/* --- UPDATED: Amenities, Floor Number & Price/CTA Section --- */}
//         <div className="mt-4 pt-4 border-t dark:border-gray-700 flex-grow flex flex-col md:flex-row justify-between gap-4">
//           {/* --- UPDATED: Left side with amenities and floor number --- */}
//           <div className="flex flex-col gap-y-4 text-sm text-muted-foreground w-full rounded-md p-4 bg-gradient-to-r from-[#F5F8FA] to-transparent">
//             <div>
//               <p className="font-semibold mb-1">Top Amenities:</p>
//               <div className="flex flex-row flex-wrap items-center gap-x-4 gap-y-1">
//                 {topAmenities.map((amenity) => (
//                   <span key={amenity.id} className="flex items-center">
//                     <span className="text-blue-500 mr-2">
//                       {" "}
//                       <BsDash />{" "}
//                     </span>
//                     {amenity.name}
//                   </span>
//                 ))}
//               </div>
//             </div>
//             <div className="text-[#10294D] font-medium text-[0.9375rem] flex items-center gap-1">
//               <Building className="w-4 h-4" />
//               <span>Floor {detailedRoom.floor_number}</span>
//             </div>
//           </div>

//           {/* --- Right side with pricing and button --- */}
//           <div className="flex flex-col items-end flex-shrink-0">
//             <p className="text-xs text-muted-foreground">
//               ${basePricePerNight.toFixed(2)} / night (base)
//             </p>
//             <p className="text-2xl font-bold">
//               ${totalCostWithTaxes.toFixed(2)}
//             </p>
//             <p className="text-xs text-muted-foreground">
//               Total for {duration} nights incl. taxes & fees
//             </p>
//             <Button
//               className="mt-4 w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
//               onClick={() => onSelectRoom(room)}
//             >
//               Book Room
//             </Button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// // --- Helper components for loading and error states ---

// function RoomCardSkeleton() {
//   return (
//     <div className="grid grid-cols-1 md:grid-cols-3 border rounded-lg overflow-hidden dark:border-gray-700">
//       <Skeleton className="h-48 md:h-full w-full" />
//       <div className="p-4 flex flex-col justify-between">
//         <div>
//           <Skeleton className="h-6 w-3/4 mb-2" />
//           <Skeleton className="h-4 w-1/2 mb-4" />
//           <div className="flex gap-4">
//             <Skeleton className="h-4 w-24" />
//             <Skeleton className="h-4 w-24" />
//           </div>
//         </div>
//         <div className="flex justify-between items-end mt-4">
//           <div className="space-y-1">
//             <Skeleton className="h-4 w-20" />
//             <Skeleton className="h-4 w-20" />
//           </div>
//           <Skeleton className="h-10 w-24" />
//         </div>
//       </div>
//     </div>
//   );
// }

// function RoomCardError() {
//   return (
//     <div className="flex flex-col items-center justify-center text-center border rounded-lg p-8 dark:border-gray-700 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400">
//       <AlertTriangle className="w-10 h-10 mb-2" />
//       <p className="font-semibold">Could not load room details.</p>
//       <p className="text-sm">Please try again later.</p>
//     </div>
//   );
// }

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import hotelClient from "@/api/hotel-client";
import { type AvailableRoom, type DetailedRoom } from "./booking-types";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertTriangle,
  Star,
  Users,
  Building,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface RoomCardProps {
  room: AvailableRoom;
  duration: number;
  onSelectRoom: (room: AvailableRoom) => void;
}

export default function RoomCard({
  room,
  duration,
  onSelectRoom,
}: RoomCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const {
    data: detailedRoom,
    isLoading,
    isError,
  } = useQuery<DetailedRoom>({
    queryKey: ["detailedRoom", room.room_id],
    queryFn: async () => {
      const response = await hotelClient.get(`/rooms/${room.room_id}`);
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  if (isLoading) return <RoomCardSkeleton />;
  if (isError || !detailedRoom) return <RoomCardError />;

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) =>
      prev === 0 ? detailedRoom.images.length - 1 : prev - 1
    );
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) =>
      prev === detailedRoom.images.length - 1 ? 0 : prev + 1
    );
  };

  const totalCostWithTaxes = detailedRoom.price_per_night * 1.27 * duration;
  const rating = parseFloat(detailedRoom.average_rating);
  const topAmenities = detailedRoom.amenities.slice(0, 3);

  return (
    <div className="flex flex-col sm:flex-row border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden transition-all bg-white dark:bg-[#171F2F] shadow-xs">
      <div className="relative group flex-shrink-0 sm:w-1/3 md:w-1/4">
        <img
          src={
            detailedRoom.images[currentImageIndex]?.url ||
            "https://placehold.co/600x400/EEE/31343C?text=No+Image"
          }
          alt={detailedRoom.room_type_name}
          className="object-cover h-48 w-full sm:h-full transition-transform duration-300 group-hover:scale-105"
        />
        {detailedRoom.images.length > 1 && (
          <>
            <Button
              variant="outline"
              size="icon"
              className="absolute top-1/2 left-2 -translate-y-1/2 rounded-full h-8 w-8 bg-black/30 hover:bg-black/50 border-none text-white opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handlePrevImage}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full h-8 w-8 bg-black/30 hover:bg-black/50 border-none text-white opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handleNextImage}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>

      <div className="flex flex-col flex-grow p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-bold">{detailedRoom.room_type_name}</h3>
            <p className="text-sm text-blue-600 dark:text-blue-400">
              {detailedRoom.code}
            </p>
          </div>
          <div className="text-right flex-shrink-0 pl-4">
            <p className="text-xl font-bold">
              ${totalCostWithTaxes.toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground">
              Total for {duration} nights
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 my-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-amber-500" />
            <span className="font-semibold">{rating.toFixed(1)}</span>
            <span>({detailedRoom.review_count} reviews)</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{detailedRoom.max_occupancy} guests</span>
          </div>
          <div className="flex items-center gap-1">
            <Building className="w-4 h-4" />
            <span>Floor {detailedRoom.floor_number}</span>
          </div>
        </div>

        <div className="mt-auto pt-4 border-t dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-xs text-muted-foreground">
            <p className="font-semibold mb-1">Includes:</p>
            <p>{topAmenities.map((a) => a.name).join(", ")}</p>
          </div>
          <Button
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
            onClick={() => onSelectRoom(room)}
          >
            Book This Room
          </Button>
        </div>
      </div>
    </div>
  );
}

function RoomCardSkeleton() {
  return (
    <div className="flex flex-col sm:flex-row border rounded-lg overflow-hidden dark:border-gray-700 shadow-xs">
      <Skeleton className="h-48 sm:h-auto sm:w-1/3 md:w-1/4" />
      <div className="flex flex-col flex-grow p-4 space-y-4">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="text-right space-y-2">
            <Skeleton className="h-6 w-20 ml-auto" />
            <Skeleton className="h-4 w-28 ml-auto" />
          </div>
        </div>
        <div className="flex gap-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="mt-auto pt-4 border-t dark:border-gray-700 flex justify-between items-center">
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
    </div>
  );
}

function RoomCardError() {
  return (
    <div className="flex flex-col items-center justify-center text-center border rounded-lg p-8 dark:border-gray-700 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 shadow-xs">
      <AlertTriangle className="w-10 h-10 mb-2" />
      <p className="font-semibold">Could not load room details.</p>
      <p className="text-sm">Please try again later.</p>
    </div>
  );
}
