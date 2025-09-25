// - - - src/pages/bookings/booking-ticket.tsx

import { useHotel } from "@/providers/hotel-provider";
import { format } from "date-fns";

interface BookingPrintTicketProps {
  booking: {
    code: string;
    full_name: string;
    email: string;
    phone_number: string;
    start_date: string;
    end_date: string;
    duration_days: number;
    number_of_guests: number;
    microservice_item_name: string;
    booking_status: string;
    payment_status: string;
    amount_paid: string;
  };
  roomDetails?: {
    room_type_name: string;
    code: string;
  } | null;
}

export default function BookingPrintTicket({
  booking,
  roomDetails,
}: BookingPrintTicketProps) {
  const { hotel } = useHotel();
  return (
    <div className="max-w-md mx-auto bg-white text-black print:shadow-none shadow-lg">
      {/* Ticket Container with perforated edges effect */}
      <div className="border-2 border-dashed border-gray-400 p-6 font-mono text-sm">
        {/* Header */}
        <div className="text-center border-b-2 border-gray-300 pb-4 mb-6">
          <h1 className="text-3xl font-bold tracking-widest text-gray-800 mb-2">
            {hotel?.name}{" "}
          </h1>
          <div className="text-lg font-semibold text-gray-600 mb-1">
            BOOKING VOUCHER
          </div>
          <div className="inline-block bg-gray-800 text-white px-4 py-1 text-xs font-bold tracking-wider">
            #{booking.code}
          </div>
        </div>

        {/* Guest Information */}
        <div className="mb-6">
          <div className="bg-gray-100 px-3 py-2 mb-3 font-bold text-gray-800 border-l-4 border-gray-600">
            GUEST INFORMATION
          </div>
          <div className="pl-2 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="font-semibold text-gray-600">Name:</span>
              <span className="font-bold text-right flex-1 ml-2">
                {booking.full_name}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-gray-600">Email:</span>
              <span className="text-right flex-1 ml-2 break-all">
                {booking.email}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-gray-600">Phone:</span>
              <span className="text-right flex-1 ml-2">
                {booking.phone_number}
              </span>
            </div>
          </div>
        </div>

        {/* Reservation Details */}
        <div className="mb-6">
          <div className="bg-gray-100 px-3 py-2 mb-3 font-bold text-gray-800 border-l-4 border-gray-600">
            RESERVATION DETAILS
          </div>
          <div className="pl-2 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="font-semibold text-gray-600">Check-in:</span>
              <span className="font-bold text-right flex-1 ml-2">
                {format(new Date(booking.start_date), "MMM dd, yyyy")}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-gray-600">Check-out:</span>
              <span className="font-bold text-right flex-1 ml-2">
                {format(new Date(booking.end_date), "MMM dd, yyyy")}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-gray-600">Duration:</span>
              <span className="text-right flex-1 ml-2">
                {booking.duration_days} Night
                {booking.duration_days > 1 ? "s" : ""}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-gray-600">Room Type:</span>
              <span className="text-right flex-1 ml-2">
                {roomDetails?.room_type_name || "N/A"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-gray-600">Room Code:</span>
              <span className="font-bold text-right flex-1 ml-2">
                {roomDetails?.code || "N/A"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-gray-600">Guests:</span>
              <span className="text-right flex-1 ml-2">
                {booking.number_of_guests} Guest
                {booking.number_of_guests > 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>

        {/* Status and Payment */}
        <div className="mb-6">
          <div className="bg-gray-100 px-3 py-2 mb-3 font-bold text-gray-800 border-l-4 border-gray-600">
            STATUS & PAYMENT
          </div>
          <div className="pl-2 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="font-semibold text-gray-600">
                Booking Status:
              </span>
              <span className="font-bold text-right flex-1 ml-2 uppercase">
                {booking.booking_status}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-gray-600">
                Payment Status:
              </span>
              <span className="font-bold text-right flex-1 ml-2 uppercase">
                {booking.payment_status}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-gray-600">Amount Paid:</span>
              <span className="font-bold text-right flex-1 ml-2">
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "TZS",
                }).format(parseFloat(booking.amount_paid))}
              </span>
            </div>
          </div>
        </div>

        {/* QR Code Placeholder */}
        <div className="text-center mb-6">
          <div className="inline-block border-2 border-gray-300 p-2">
            <div className="w-16 h-16 bg-gray-200 flex items-center justify-center text-xs text-gray-500">
              QR CODE
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t-2 border-gray-300 pt-4 text-center">
          <div className="text-xs text-gray-600 mb-2">
            Thank you for choosing SafariPro!
          </div>
          <div className="font-bold text-xs text-gray-800">
            {booking.microservice_item_name}
          </div>
          <div className="text-xs text-gray-500 mt-3">
            Keep this voucher for your records
          </div>
        </div>

        {/* Perforated bottom edge effect */}
        <div className="mt-4 text-center">
          <div className="text-gray-400 text-xs tracking-widest">
            ✂ ✂ ✂ ✂ ✂ ✂ ✂ ✂ ✂ ✂ ✂ ✂ ✂ ✂ ✂
          </div>
        </div>
      </div>
    </div>
  );
}
