// - - - src/pages/bookings/cash-payment/checkin-guest.tsx
import React, { useState, useEffect } from "react";
import {
  Loader2,
  AlertCircle,
  CheckCircle,
  Printer,
  LogIn,
  User,
  Calendar,
  Bed,
  Hash,
  Phone,
} from "lucide-react";
import { toast } from "sonner";
import type { FinalBookingDetails } from "./types";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useHotel } from "@/providers/hotel-provider";

interface CheckinGuestProps {
  bookingId: string;
}

export const CheckinGuest: React.FC<CheckinGuestProps> = ({ bookingId }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [finalBooking, setFinalBooking] = useState<FinalBookingDetails | null>(
    null
  );
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const BOOKING_BASE_URL = "http://booking.safaripro.net/api/v1/";

  const { hotel } = useHotel();

  useEffect(() => {
    const fetchBookingStatus = async () => {
      try {
        const response = await fetch(
          `${BOOKING_BASE_URL}bookings/${bookingId}`
        );
        if (!response.ok) {
          throw new Error("Could not fetch final booking status.");
        }
        const data: FinalBookingDetails = await response.json();
        setFinalBooking(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchBookingStatus();
    }, 5000);

    return () => clearTimeout(timer);
  }, [bookingId]);

  const handleCheckIn = async () => {
    setIsCheckingIn(true);
    try {
      const response = await fetch(
        `${BOOKING_BASE_URL}bookings/${bookingId}/check_in`,
        { method: "POST" }
      );

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.detail || "Check-in failed.");
        throw new Error("Check-in failed.");
      }

      toast.success("Guest checked-in successfully!");

      setFinalBooking((prev) =>
        prev
          ? {
              ...prev,
              checkin: new Date().toISOString(),
              booking_status: "Checked-in",
            }
          : null
      );

      setTimeout(() => {
        navigate("/bookings/all-bookings");
      }, 1500);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsCheckingIn(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <Card className="max-w-[640px] rounded-md w-[540px] mx-auto border-gray-200 shadow-sm text-center">
        <CardContent className="p-6">
          <Loader2 className="h-12 w-12 mx-auto animate-spin text-blue-600" />
          <CardTitle className="mt-4 text-xl font-semibold text-gray-800">
            Finalizing Booking...
          </CardTitle>
          <CardDescription className="text-gray-600">
            Please wait a moment.
          </CardDescription>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="max-w-md mx-auto border-gray-200 shadow-sm">
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-red-600" />
          <CardTitle className="mt-4 text-xl font-semibold text-gray-800">
            An Error Occurred
          </CardTitle>
          <CardDescription className="text-red-700">{error}</CardDescription>
        </CardContent>
      </Card>
    );
  }

  if (!finalBooking) {
    return (
      <Card className="max-w-md mx-auto border-gray-200 shadow-sm">
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-yellow-600" />
          <CardTitle className="mt-4 text-xl font-semibold text-gray-800">
            Could Not Load Booking
          </CardTitle>
          <CardDescription className="text-gray-600">
            The final booking details could not be loaded. Please try again
            later.
          </CardDescription>
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6 non-printable">
        <div className="flex items-center gap-2 text-green-600">
          <CheckCircle className="h-6 w-6" />
          <h2 className="text-2xl font-bold text-gray-800">
            Booking Confirmed
          </h2>
        </div>
        <div className="flex gap-4">
          <Button
            onClick={handlePrint}
            className="bg-gray-600 rounded hover:bg-gray-700 text-white"
          >
            <Printer className="mr-1 h-4 w-4" /> Print Ticket
          </Button>
          <Button
            onClick={handleCheckIn}
            disabled={isCheckingIn || !!finalBooking.checkin}
            className="bg-blue-600 rounded hover:bg-blue-700 disabled:bg-gray-400 text-white"
          >
            {isCheckingIn ? (
              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
            ) : (
              <LogIn className="mr-1 h-4 w-4" />
            )}
            {finalBooking.checkin ? "Checked-In" : "Check-In Guest"}
          </Button>
        </div>
      </div>

      <Card
        id="booking-ticket"
        className="border-gray-200 shadow-sm printable-area rounded-md"
      >
        <CardHeader className="bg-gray-50/10 border-b shadow border-b-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl font-bold text-gray-800">
                Booking Receipt
              </CardTitle>
              <CardDescription className="text-gray-600">
                {hotel?.name} - {hotel?.address}
              </CardDescription>
            </div>
            <div className="text-right">
              <p className="font-mono text-lg text-gray-800">
                {finalBooking.code}
              </p>
              <p className="text-sm text-gray-600">
                Ref: {finalBooking.reference_number}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                Guest Information
              </h3>
              <p className="flex items-center text-gray-600">
                <User className="mr-2 h-4 w-4" />
                <strong>Name:</strong>{" "}
                <span className="ml-1">{finalBooking.full_name}</span>
              </p>
              <p className="flex items-center text-gray-600">
                <Phone className="mr-2 h-4 w-4" />
                <strong>Phone:</strong>{" "}
                <span className="ml-1">{finalBooking.phone_number}</span>
              </p>
              <p className="flex items-center text-gray-600">
                <Hash className="mr-2 h-4 w-4" />
                <strong>Guests:</strong>{" "}
                <span className="ml-1">
                  {finalBooking.number_of_guests} Adults,{" "}
                  {finalBooking.number_of_children} Children
                </span>
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                Booking Details
              </h3>
              <p className="flex items-center text-gray-600">
                <Bed className="mr-2 h-4 w-4" />
                <strong>Room:</strong>{" "}
                <span className="ml-1">{finalBooking.property_item_type}</span>
              </p>
              <p className="flex items-center text-gray-600">
                <Calendar className="mr-2 h-4 w-4" />
                <strong>Dates:</strong>{" "}
                <span className="ml-1">
                  {finalBooking.start_date} to {finalBooking.end_date}
                </span>
              </p>
              <p className="flex items-center text-gray-600">
                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                <strong>Status:</strong>{" "}
                <span className="ml-1">
                  {finalBooking.booking_status} / Paid via{" "}
                  {finalBooking.payment_method}
                </span>
              </p>
            </div>
          </div>
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
              Billing Summary
            </h3>
            <div className="mt-4 flex justify-between font-bold text-lg text-gray-800">
              <span>Total Paid ({finalBooking.currency_paid})</span>
              <span>
                {parseFloat(finalBooking.amount_paid).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>
          <div className="mt-6 text-center text-xs text-gray-600 border-t pt-4">
            <p>{hotel?.description}</p>
            <p>
              Thank you for choosing {hotel?.name} We wish you a pleasant stay!
            </p>
          </div>
        </CardContent>
      </Card>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .printable-area,
          .printable-area * {
            visibility: visible;
          }
          .printable-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            border: none;
            box-shadow: none;
          }
          .non-printable {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};
