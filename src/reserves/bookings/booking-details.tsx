// - - - src/pages/hotels/booking-details.tsx
"use client";
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { format } from "date-fns";
import {
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaCreditCard,
  FaDesktop,
  FaBed,
  FaClock,
  FaUsers,
  FaTimes,
} from "react-icons/fa";
import {
  FaCalendarCheck,
  FaCalendarXmark,
  FaRegCircleCheck,
} from "react-icons/fa6";
import { BiPrinter } from "react-icons/bi";
import { TbChevronsLeft } from "react-icons/tb";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import EditBookingModal from "./edit-booking-modal";
import { BedDouble } from "lucide-react";
import { FiEdit2 } from "react-icons/fi";
import { Separator } from "@/components/ui/separator";
import BookingPrintTicket from "./booking-ticket";
import { toTitleCase } from "@/utils/capitalize";

// --- TYPE DEFINITIONS ---
interface Booking {
  id: string;
  code: string;
  full_name: string;
  email: string;
  phone_number: string;
  address: string;
  start_date: string;
  end_date: string;
  checkin: string | null;
  checkout: string | null;
  duration_days: number;
  number_of_guests: number;
  booking_status: string;
  payment_status: string;
  amount_required: string;
  amount_paid: string;
  payment_reference: string;
  booking_type: string;
  microservice_item_name: string;
  property_item_type: string;
  property_id: string;
  special_requests: string | null;
  service_notes: string | null;
  feedback: string | null;
  created_at: string;
}

interface Amenity {
  id: string;
  name: string;
}

interface RoomDetails {
  id: string;
  code: string;
  image: string;
  description: string;
  max_occupancy: number;
  average_rating: string;
  room_type_name: string;
  amenities: Amenity[];
}

// --- HELPER COMPONENTS ---
const BookingStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  let statusClasses = "";
  switch (status?.toLowerCase()) {
    case "confirmed":
    case "checked in":
      statusClasses = "bg-green-100 text-green-800 border-green-200";
      break;
    case "pending":
      statusClasses = "bg-yellow-100 text-yellow-800 border-yellow-200";
      break;
    case "cancelled":
      statusClasses = "bg-red-100 text-red-800 border-red-200";
      break;
    case "expired":
      statusClasses = "bg-red-100 text-red-800 border-red-200";
      break;
    default:
      statusClasses = "bg-gray-100 text-gray-800 border-gray-200";
  }
  return <Badge className={statusClasses}>{status}</Badge>;
};

const PaymentStatusLabel: React.FC<{ status: string }> = ({ status }) => {
  const isCompleted = status?.toLowerCase().includes("paid");
  const isPending = status?.toLowerCase().includes("pending");

  return (
    <Badge
      variant={isCompleted ? "default" : isPending ? "secondary" : "outline"}
      className={
        isCompleted
          ? "bg-green-100 text-green-800 border-green-200"
          : isPending
          ? "bg-yellow-100 text-yellow-800 border-yellow-200"
          : ""
      }
    >
      {status}
    </Badge>
  );
};

export default function BookingDetailsPage() {
  const { booking_id } = useParams<{ booking_id: string }>();
  const navigate = useNavigate();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showPrintView, setShowPrintView] = useState(false);
  const [fullscreenImageUrl, setFullscreenImageUrl] = useState<string | null>(
    null
  );

  const HOTEL_BASE_URL = import.meta.env.VITE_HOTEL_BASE_URL;
  const BOOKING_BASE_URL = import.meta.env.VITE_BOOKING_BASE_URL;

  const {
    data: booking,
    isLoading: isLoadingBooking,
    isError,
    error,
  } = useQuery<Booking>({
    queryKey: ["bookingDetails", booking_id],
    queryFn: async () => {
      const response = await axios.get(
        `${BOOKING_BASE_URL}bookings/${booking_id}`
      );
      return response.data;
    },
    enabled: !!booking_id,
  });

  const { data: roomDetails, isLoading: isLoadingRoom } = useQuery<RoomDetails>(
    {
      queryKey: ["roomDetails", booking?.property_id],
      queryFn: async () => {
        if (!booking?.property_id)
          throw new Error("No room ID found in booking.");
        const response = await axios.get(
          `${HOTEL_BASE_URL}rooms/${booking.property_id}/`
        );
        return response.data;
      },
      enabled: !!booking?.property_id,
    }
  );

  const handlePrint = () => {
    setShowPrintView(true);
    setTimeout(() => {
      window.print();
      setShowPrintView(false);
    }, 100);
  };

  if (isLoadingBooking || isLoadingRoom) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#006DE4]"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 text-center text-red-600">
        Error: {(error as Error).message}
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="p-8 text-center text-gray-500">Booking not found.</div>
    );
  }

  if (showPrintView) {
    return (
      <div className="print:block hidden">
        <BookingPrintTicket booking={booking} roomDetails={roomDetails} />
      </div>
    );
  }

  return (
    <>
      <div className="bg-none min-h-screen p-4 md:p-4 lg:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex justify-between items-center">
            <Button
              className="ml-1"
              variant="outline"
              onClick={() => navigate(-1)}
            >
              <TbChevronsLeft className="h-4 w-4" /> Back
            </Button>
            <div className="flex items-center gap-2">
              <Button
                className="bg-[#0081FB] hover:border-[#FFFFFF] text-[#FFF] hover:bg-blue-600 hover:text-[#FFF] cursor-pointer transition-all inter font-medium"
                variant="outline"
                onClick={() => setIsEditModalOpen(true)}
              >
                <FiEdit2 className="h-4 w-4" /> Edit Booking
              </Button>
              <Button
                variant="outline"
                className="transition-all inter font-medium"
                onClick={handlePrint}
              >
                <BiPrinter className="h-4 w-4" /> Print Ticket
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Column: Guest Profile & Room Image */}
            <div className="lg:col-span-1 space-y-6">
              <Card className="shadow rounded-md">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    Guest Profile
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-gray-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-4">
                      {booking.full_name.charAt(0)}
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">
                      {toTitleCase(booking.full_name)}
                    </h3>
                    <Badge variant="outline" className="mt-2">
                      ID: {booking.code}
                    </Badge>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <FaPhone className="text-[#006DE4]" />
                      <span className="font-medium">
                        {booking.phone_number}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <FaEnvelope className="text-[#006DE4]" />
                      <span className="font-medium break-all">
                        {booking.email}
                      </span>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <FaMapMarkerAlt className="text-[#006DE4] mt-1" />
                      <span className="font-medium">
                        {toTitleCase(booking.address)}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FaCreditCard className="text-[#006DE4]" />
                        <span className="font-medium">Payment</span>
                      </div>
                      <PaymentStatusLabel status={booking.payment_status} />
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FaDesktop className="text-[#006DE4]" />
                        <span className="font-medium">Booking Type</span>
                      </div>
                      <Badge variant="outline">{booking.booking_type}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* --- CORRECTED POSITION: Room Image Card below Guest Profile --- */}
              {roomDetails && (
                <Card className="shadow-none rounded-md border-none p-0">
                  <CardHeader className="p-0 mb-0">
                    <CardTitle className="text-base my-0 font-semibold">
                      {roomDetails.room_type_name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-hidden rounded-md">
                      <img
                        src={
                          roomDetails.image ||
                          "https://placehold.co/600x400?text=Room"
                        }
                        alt={roomDetails.room_type_name}
                        className="w-full h-52 block my-0 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => setFullscreenImageUrl(roomDetails.image)}
                      />
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column: Booking Details */}
            <div className="lg:col-span-3 space-y-6">
              <Card className="shadow rounded-md">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl font-semibold flex items-center gap-2">
                        Booking Information
                      </CardTitle>
                      <CardDescription className="mt-1">
                        Booked on:{" "}
                        {format(new Date(booking.created_at), "PPP p")}
                      </CardDescription>
                    </div>
                    <BookingStatusBadge status={booking.booking_status} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-1 text-sm text-gray-600">
                        <FaCalendarCheck className="text-[#006DE4]" />
                        <span>Check-in</span>
                      </div>
                      <p className="font-semibold text-gray-800">
                        {format(new Date(booking.start_date), "PP")}
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 border border-gray-200  rounded-lg">
                      <div className="flex items-center gap-2 mb-1 text-sm text-gray-600">
                        <FaCalendarXmark className="text-[#006DE4]" />
                        <span>Check-out</span>
                      </div>
                      <p className="font-semibold text-gray-800">
                        {format(new Date(booking.end_date), "PP")}
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 border border-gray-200  rounded-lg">
                      <div className="flex items-center gap-2 mb-1 text-sm text-gray-600">
                        <FaClock className="text-[#006DE4]" />
                        <span>Duration</span>
                      </div>
                      <p className="font-semibold text-gray-800">
                        {booking.duration_days} Nights
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-1 text-sm text-gray-600">
                        <FaBed className="text-[#006DE4]" />
                        <span>Room Type</span>
                      </div>
                      <p className="font-semibold text-gray-800">
                        {booking.property_item_type}
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 border border-gray-200  rounded-lg">
                      <div className="flex items-center gap-2 mb-1 text-sm text-gray-600">
                        <BedDouble className="text-[#006DE4]" size={16} />
                        <span>Room Code</span>
                      </div>
                      <p className="font-semibold text-gray-800">
                        {roomDetails?.code || "N/A"}
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 border border-gray-200  rounded-lg">
                      <div className="flex items-center gap-2 mb-1 text-sm text-gray-600">
                        <FaUsers className="text-[#006DE4]" />
                        <span>Guests</span>
                      </div>
                      <p className="font-semibold text-gray-800">
                        {booking.number_of_guests}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {booking.special_requests || booking.service_notes ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="shadow rounded-md">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold flex items-center gap-2">
                        Additional Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {booking.special_requests && (
                        <div>
                          <h4 className="font-medium flex items-center gap-2 mb-1">
                            Guest&apos;s Requests
                          </h4>
                          <p className="text-sm text-gray-600 pl-6 capitalize">
                            {booking.special_requests}
                          </p>
                        </div>
                      )}
                      <Separator />
                      {booking.service_notes && (
                        <div>
                          <h4 className="font-medium flex items-center gap-2 mb-1">
                            Service Notes
                          </h4>
                          <p className="text-sm text-gray-600 pl-6 capitalize">
                            {booking.service_notes}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  <Card className="shadow rounded-md">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold flex items-center gap-2">
                        Room Description
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600">
                        {roomDetails?.description || "No description available"}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Card className="shadow rounded-md">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      Room Description
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">
                      {roomDetails?.description || "No description available"}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* --- CORRECTED POSITION: Room Amenities below other cards --- */}
              {roomDetails && roomDetails.amenities.length > 0 && (
                <Card className="shadow bg-[#FFF] rounded-md">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold flex items-center gap-1">
                      Room Amenities
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {roomDetails.amenities.slice(0, 8).map((amenity) => (
                        <Badge
                          key={amenity.id}
                          variant="secondary"
                          className="font-medium text-[0.875rem] bg-gray-50 border border-gray-200"
                        >
                          <FaRegCircleCheck className="text-green-600 mr-1.5 h-3 w-3" />
                          {amenity.name}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="print-area hidden">
        <BookingPrintTicket booking={booking} roomDetails={roomDetails} />
      </div>

      {isEditModalOpen && booking && (
        <EditBookingModal
          booking={booking}
          onClose={() => setIsEditModalOpen(false)}
        />
      )}

      {fullscreenImageUrl && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setFullscreenImageUrl(null)}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-gray-300 z-50"
            aria-label="Close fullscreen image"
          >
            <FaTimes size={24} />
          </button>
          <img
            src={fullscreenImageUrl}
            alt="Fullscreen hotel room"
            className="max-w-full max-h-full object-contain rounded-none cursor-default"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
