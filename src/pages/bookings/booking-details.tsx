"use client";
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { format } from "date-fns";
import {
  ArrowLeft,
  CalendarCheck,
  Clock,
  FilePenLine,
  Mail,
  MapPin,
  Phone,
  Printer,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { toTitleCase } from "../../utils/capitalize";
import BookingPrintTicket from "./booking-ticket";
import { cn } from "@/lib/utils";
import EditBookingForm from "./edit-booking-modal";

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

// --- HELPER COMPONENTS & CONFIG ---
const InfoItem: React.FC<{
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
}> = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-4">
    <div className="flex-shrink-0 p-2 bg-[#EFF6FF] dark:bg-[#162142] rounded-full">
      <Icon className="h-5 w-5 text-blue-600 dark:text-[#7592FF]" />
    </div>
    <div>
      <p className="text-sm text-gray-500 dark:text-[#98A2B3]">{label}</p>
      <p className="font-semibold text-[#1D2939] dark:text-[#D0D5DD]">
        {value}
      </p>
    </div>
  </div>
);

const statusConfig = {
  confirmed: "bg-green-100 text-green-800 border-green-200",
  "checked in": "bg-blue-100 text-blue-800 border-blue-200",
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
  expired: "bg-red-100 text-red-800 border-red-200",
  paid: "bg-green-100 text-green-800 border-green-200",
  default: "bg-gray-100 text-gray-800 border-gray-200",
};

const getStatusClass = (status: string) => {
  const lowerCaseStatus = status?.toLowerCase() || "default";
  return (
    statusConfig[lowerCaseStatus as keyof typeof statusConfig] ||
    statusConfig.default
  );
};

export default function BookingDetailsPage() {
  const { booking_id } = useParams<{ booking_id: string }>();
  const navigate = useNavigate();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [showPrintView, setShowPrintView] = useState(false);
  const [isFormDirty, setIsFormDirty] = useState(false);
  const [showUnsavedChangesDialog, setShowUnsavedChangesDialog] =
    useState(false);

  const handleSheetOpenChange = (open: boolean) => {
    if (!open && isFormDirty) {
      setShowUnsavedChangesDialog(true);
      return;
    }
    setIsSheetOpen(open);
  };

  const handleDiscardChanges = () => {
    setIsFormDirty(false);
    setIsSheetOpen(false);
  };

  const HOTEL_BASE_URL = "http://hotel.safaripro.net/api/v1/";
  const BOOKING_BASE_URL = "http://booking.safaripro.net/api/v1/";

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
      <div className="flex items-center justify-center h-screen bg-[#F9FAFB] dark:bg-[#101828]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
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
    <Sheet open={isSheetOpen} onOpenChange={handleSheetOpenChange}>
      <div className="min-h-screen bg-[#F9FAFB] dark:bg-[#101828]">
        <div className="bg-white/80 dark:bg-[#101828]/80 backdrop-blur-sm border-b border-gray-200 dark:border-[#1D2939] sticky top-0 z-40">
          <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between gap-4 py-6">
              <div className="space-y-1">
                <button
                  onClick={() => navigate(-1)}
                  className="flex items-center gap-2 text-sm text-gray-500 dark:text-[#98A2B3] hover:text-blue-600"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Bookings
                </button>
                <div className="flex items-center gap-x-3 flex-wrap">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-[#D0D5DD]">
                    Booking: {booking.code}
                  </h1>
                  <Badge className={cn(getStatusClass(booking.booking_status))}>
                    {toTitleCase(booking.booking_status)}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <SheetTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <FilePenLine className="h-4 w-4" /> Edit
                  </Button>
                </SheetTrigger>
                <Button
                  onClick={handlePrint}
                  className="gap-2 bg-blue-600 hover:bg-blue-700"
                >
                  <Printer className="h-4 w-4" /> Print Ticket
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row items-start gap-8">
            <div className="w-full lg:w-[35%] xl:w-[30%] flex-shrink-0 space-y-6 lg:sticky lg:top-36">
              <Card className="bg-[#FFF] dark:bg-[#171F2F] border border-[#E4E7EC] dark:border-[#1D2939] shadow-none">
                <CardHeader>
                  <CardTitle>Guest Profile</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold">
                      {booking.full_name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 dark:text-[#D0D5DD]">
                        {toTitleCase(booking.full_name)}
                      </h3>
                      <p className="text-sm text-gray-500">Guest</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-3">
                      <Mail className="h-4 w-4 mt-1 text-gray-400" />
                      <span className="break-all">{booking.email}</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Phone className="h-4 w-4 mt-1 text-gray-400" />
                      <span>{booking.phone_number}</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="h-4 w-4 mt-1 text-gray-400" />
                      <span>{toTitleCase(booking.address)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              {roomDetails?.image && (
                <img
                  src={roomDetails.image}
                  alt={roomDetails.room_type_name}
                  className="w-full h-52 object-cover rounded-lg border dark:border-[#1D2939] shadow-none"
                />
              )}
            </div>

            <div className="w-full lg:w-[65%] xl:w-[70%] space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <InfoItem
                  icon={CalendarCheck}
                  label="Check-in"
                  value={format(new Date(booking.start_date), "PP")}
                />
                <InfoItem
                  icon={CalendarCheck}
                  label="Check-out"
                  value={format(new Date(booking.end_date), "PP")}
                />
                <InfoItem
                  icon={Clock}
                  label="Duration"
                  value={`${booking.duration_days} Nights`}
                />
                <InfoItem
                  icon={Users}
                  label="Guests"
                  value={booking.number_of_guests}
                />
              </div>

              <Card className="bg-[#FFF] dark:bg-[#171F2F] border border-[#E4E7EC] dark:border-[#1D2939] shadow-none">
                <CardHeader>
                  <CardTitle>Booking & Room Details</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Payment Status:</span>
                    <Badge
                      className={cn(getStatusClass(booking.payment_status))}
                    >
                      {toTitleCase(booking.payment_status)}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Booking Type:</span>
                    <Badge variant="outline">
                      {toTitleCase(booking.booking_type)}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Room Type:</span>
                    <span className="font-semibold">
                      {booking.property_item_type}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Room Code:</span>
                    <span className="font-semibold">
                      {roomDetails?.code || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Booked On:</span>
                    <span className="font-semibold">
                      {format(new Date(booking.created_at), "PP")}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Actual Check-in:</span>
                    <span className="font-semibold">
                      {booking.checkin
                        ? format(new Date(booking.checkin), "p")
                        : "Not yet"}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {(booking.special_requests || booking.service_notes) && (
                <Card className="bg-[#FFF] dark:bg-[#171F2F] border border-[#E4E7EC] dark:border-[#1D2939] shadow-none">
                  <CardHeader>
                    <CardTitle>Additional Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {booking.special_requests && (
                      <div>
                        <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-1">
                          Guest's Special Requests
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-[#98A2B3] pl-2 border-l-2 border-blue-500">
                          {booking.special_requests}
                        </p>
                      </div>
                    )}
                    {booking.service_notes && (
                      <div>
                        <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-1">
                          Internal Service Notes
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-[#98A2B3] pl-2 border-l-2 border-blue-500">
                          {booking.service_notes}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {roomDetails && roomDetails.amenities.length > 0 && (
                <Card className="bg-[#FFF] dark:bg-[#171F2F] border border-[#E4E7EC] dark:border-[#1D2939] shadow-none">
                  <CardHeader>
                    <CardTitle>Room Amenities</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {roomDetails.amenities.slice(0, 8).map((amenity) => (
                        <Badge
                          key={amenity.id}
                          className="bg-[#EFF6FF] text-blue-600 border border-blue-200 dark:bg-[#162142] dark:border-transparent dark:text-[#98A2B3]"
                        >
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
      <SheetContent className="w-full sm:max-w-2xl p-0 bg-white dark:bg-[#101828] border-l dark:border-l-[#1D2939]">
        {booking && (
          <EditBookingForm
            booking={booking}
            onUpdateComplete={() => {
              setIsSheetOpen(false);
              setIsFormDirty(false);
            }}
            onDirtyChange={setIsFormDirty}
          />
        )}
      </SheetContent>

      <AlertDialog
        open={showUnsavedChangesDialog}
        onOpenChange={setShowUnsavedChangesDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>You have unsaved changes!</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to close? Your changes will be discarded.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, keep editing</AlertDialogCancel>
            <AlertDialogAction
              className="bg-blue-600 hover:bg-blue-700"
              onClick={handleDiscardChanges}
            >
              Yes, discard changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Sheet>
  );
}
