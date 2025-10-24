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
