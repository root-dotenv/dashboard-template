// src/pages/rooms/components/RoomTypeCard.tsx
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BedDouble, Users, Maximize, Star, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DetailedRoomType } from "./types";
import { HiOutlineTicket } from "react-icons/hi2";

interface RoomTypeCardProps {
  room: DetailedRoomType;
  variant: "hotel" | "safaripro";
}

export function RoomTypeCard({ room, variant }: RoomTypeCardProps) {
  const navigate = useNavigate();

  // Real data calculation for occupancy percentage, now used conditionally
  const occupancyPercentage =
    room.room_count > 0
      ? ((room.room_count - room.room_availability) / room.room_count) * 100
      : 0;

  return (
    <Card className="group relative overflow-hidden bg-[#FFF] border border-[#E4E7EC] dark:bg-[#171F2F] shadow-xs hover:shadow-2xs transition-all duration-500 transform hover:-translate-y-0.5">
      {/* Content Section */}
      <div className="p-6 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-xl font-bold text-gray-900 dark:text-white tracking-tight line-clamp-1">
              {room.name}
            </CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <Badge
                variant="secondary"
                className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-0"
              >
                {room.bed_type} Bed
              </Badge>
              {room.size_sqm && (
                <Badge
                  variant="outline"
                  className="text-xs border-gray-200 dark:border-gray-700"
                >
                  {room.size_sqm}m²
                </Badge>
              )}
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-[#2463EB] dark:text-white">
                ${parseFloat(room.base_price).toFixed(0)}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                /night
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        <CardContent className="p-0">
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-2">
            {room.description ||
              "Experience comfort and luxury in this thoughtfully designed room with premium amenities and modern furnishings."}
          </p>
        </CardContent>

        {/* Room Features */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
            <Users className="h-5 w-5 text-gray-600 dark:text-gray-400 mx-auto mb-1" />
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
              {room.max_occupancy} Guests
            </span>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
            <BedDouble className="h-5 w-5 text-gray-600 dark:text-gray-400 mx-auto mb-1" />
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
              {room.room_count} Total
            </span>
          </div>
          {room.size_sqm && (
            <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
              <Maximize className="h-5 w-5 text-gray-600 dark:text-gray-400 mx-auto mb-1" />
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                {room.size_sqm}m²
              </span>
            </div>
          )}
        </div>

        {/* Amenities Preview */}
        {room.amenities_details && room.amenities_details.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Top Amenities
            </h4>
            <div className="flex items-center gap-4">
              {room.amenities_details.slice(0, 3).map((amenity) => (
                <div
                  key={amenity.id}
                  className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400"
                >
                  {/* UPDATE: All amenities now use the Star icon */}
                  <Star className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span>{amenity.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Occupancy Indicator (Hotel view only) */}
        {variant === "hotel" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600 dark:text-gray-400">
                Occupancy Level
              </span>
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {Math.round(occupancyPercentage)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
              <div
                className={cn(
                  "h-full transition-all duration-500 rounded-full",
                  occupancyPercentage > 80
                    ? "bg-red-500"
                    : occupancyPercentage > 50
                    ? "bg-yellow-500"
                    : "bg-green-500"
                )}
                style={{ width: `${occupancyPercentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Action Buttons (Hotel view only) */}
        {variant === "hotel" && (
          <CardFooter className="p-0 pt-4 flex gap-3">
            <Button
              onClick={() => navigate("/bookings/new-booking")}
              variant="outline"
              className="flex-1 border-gray-200 dark:border-gray-700 dark:hover:bg-gray-800 bg-blue-600 hover:bg-blue-700 text-[#FFF]  hover:text-[#FFF] border-0 rounded-lg font-medium  transition-all duration-300 cursor-pointer"
            >
              <HiOutlineTicket className="h-4 w-4 mr-2" />
              Book Now
            </Button>

            <Button
              onClick={() => navigate("/rooms/hotel-rooms")}
              variant={"ghost"}
              className="text-[#2463EB] hover:text-[#2463EB] px-4 font-semibold transition-all duration-300 cursor-pointer hover:bg-transparent"
            >
              <Eye className="h-4 w-4 mr-1" />
              View Rooms
            </Button>
          </CardFooter>
        )}
      </div>
    </Card>
  );
}
