// Updated Step5_CheckInAndFinish.tsx with debugging and fallback logic
"use client";
import { useMemo, useRef } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useBookingStore } from "@/store/booking.store";
import { useNavigate } from "react-router-dom";
import bookingClient from "@/api/booking-client";
import { toast } from "sonner";
import { useReactToPrint } from "react-to-print";
import { QRCodeCanvas } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Loader2,
  Info,
  CheckCircle,
  Printer,
  LogIn,
  ArrowRight,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { format } from "date-fns";
import { type BookingDetails } from "./booking-types";
import companyLogo from "/images/SafariPro_Logo.png";

export default function Step5_CheckInAndFinish() {
  const {
    bookingDetails,
    createdBooking,
    reset: resetBookingStore,
    setStep,
    setBookingDetails,
  } = useBookingStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const ticketRef = useRef<HTMLDivElement>(null);

  // Enhanced debugging
  console.log("=== STEP 5 DEBUG INFO ===");
  console.log("bookingDetails from store:", bookingDetails);
  console.log("createdBooking from store:", createdBooking);
  console.log("bookingDetails ID:", bookingDetails?.id);
  console.log("createdBooking ID:", createdBooking?.id);
  console.log("========================");

  // Fallback: If bookingDetails is missing but createdBooking exists, fetch the details
  const shouldFetchBookingDetails = !bookingDetails && !!createdBooking?.id;

  const {
    data: fetchedBookingDetails,
    isLoading: isFetchingDetails,
    isError: fetchError,
    error: fetchErrorMessage,
  } = useQuery<BookingDetails>({
    queryKey: ["bookingDetails", createdBooking?.id],
    queryFn: async () => {
      console.log("Fetching booking details for ID:", createdBooking!.id);
      const response = await bookingClient.get(
        `/bookings/${createdBooking!.id}`
      );
      console.log("Fetched booking details:", response.data);
      return response.data;
    },
    enabled: shouldFetchBookingDetails,
    onSuccess: (data) => {
      console.log("Setting booking details in store:", data);
      setBookingDetails(data);
    },
    retry: 2,
  });

  // Use either existing bookingDetails or freshly fetched ones
  const currentBookingDetails = bookingDetails || fetchedBookingDetails;

  const currencyConversionDetails = useMemo(() => {
    if (!currentBookingDetails) return null;
    const conversionAction = currentBookingDetails.status_history.find(
      (action) => action.action === "currency_conversion"
    );
    console.log("Currency conversion details:", conversionAction?.details);
    return conversionAction?.details || null;
  }, [currentBookingDetails]);

  const checkInMutation = useMutation({
    mutationFn: (bookingId: string) =>
      bookingClient.post(`/bookings/${bookingId}/check_in`),
    onSuccess: () => {
      toast.success("Guest checked in successfully!", {
        description: "The room status has been updated.",
      });
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      resetBookingStore();
      navigate("/bookings/all-bookings");
    },
    onError: (error) => {
      console.error("Check-in mutation error:", error);
      toast.error(`Check-in failed: ${error.message}`);
    },
  });

  const handlePrint = useReactToPrint({
    content: () => ticketRef.current,
    documentTitle: `Booking-Ticket-${currentBookingDetails?.code}`,
  });

  const handleFinish = () => {
    toast.success("Booking created successfully!", {
      description:
        "You can check the guest in later from the main bookings page.",
    });
    resetBookingStore();
    navigate("/bookings/all-bookings");
  };

  // Show loading state while fetching missing booking details
  if (isFetchingDetails) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-20">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          Loading Booking Details...
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Preparing your booking ticket and final details.
        </p>
      </div>
    );
  }

  // Show error if fetching failed
  if (fetchError) {
    return (
      <div className="text-red-600 bg-red-50 dark:bg-red-900/20 p-6 rounded-lg flex flex-col items-center text-center">
        <AlertCircle className="h-10 w-10 mb-4" />
        <h3 className="text-lg font-semibold">
          Failed to Load Booking Details
        </h3>
        <p className="mb-4">{fetchErrorMessage?.message}</p>
        <div className="flex items-center gap-4 mt-4">
          <Button onClick={() => setStep(4)} variant="outline">
            Go Back to Step 4
          </Button>
          <Button
            onClick={() =>
              queryClient.invalidateQueries({ queryKey: ["bookingDetails"] })
            }
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // Show error if no booking details and no createdBooking to fetch from
  if (!currentBookingDetails && !createdBooking) {
    return (
      <div className="text-center py-16 text-gray-500">
        <Info className="mx-auto h-12 w-12 text-red-400 mb-4" />
        <p className="font-semibold">Missing Booking Information</p>
        <p>
          No booking details found. Please start the booking process from Step
          1.
        </p>
        <div className="flex justify-center gap-4 mt-4">
          <Button onClick={() => setStep(1)} variant="outline">
            Go Back to Step 1
          </Button>
          <Button onClick={() => setStep(4)}>Try Step 4 Again</Button>
        </div>
      </div>
    );
  }

  // If we still don't have booking details, show error
  if (!currentBookingDetails) {
    return (
      <div className="text-center py-16 text-gray-500">
        <Info className="mx-auto h-12 w-12 text-red-400 mb-4" />
        <p className="font-semibold">Booking Data Not Found</p>
        <p>Could not load the completed booking. Please go back.</p>
        <Button onClick={() => setStep(4)} className="mt-4">
          Go Back to Step 4
        </Button>
      </div>
    );
  }

  // Check if currency conversion is available (needed for the ticket)
  if (!currencyConversionDetails) {
    return (
      <div className="text-center py-16 text-amber-600">
        <Info className="mx-auto h-12 w-12 mb-4" />
        <p className="font-semibold">Currency Conversion Pending</p>
        <p>The final TZS amount calculation is still in progress.</p>
        <div className="flex justify-center gap-4 mt-4">
          <Button onClick={() => setStep(4)} variant="outline">
            Go Back to Step 4
          </Button>
          <Button
            onClick={() =>
              queryClient.invalidateQueries({ queryKey: ["bookingDetails"] })
            }
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh Data
          </Button>
        </div>
      </div>
    );
  }

  const amountRequiredUSD = parseFloat(
    currentBookingDetails.amount_required
  ).toFixed(2);
  const amountPaidTZS = currencyConversionDetails.converted_required;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Debug info panel - remove in production */}
      <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
        <h4 className="font-semibold text-green-800">Debug Info:</h4>
        <p className="text-sm text-green-700">
          Booking ID: {currentBookingDetails.id} | Status:{" "}
          {currentBookingDetails.booking_status} | Currency Conversion:{" "}
          {currencyConversionDetails ? "✓" : "✗"} | Amount TZS: {amountPaidTZS}
        </p>
      </div>

      <div
        className="bg-white dark:bg-[#171F2F] p-6 rounded-lg shadow-lg border dark:border-gray-700"
        ref={ticketRef}
      >
        {/* Printable Ticket Content */}
        <div className="flex justify-between items-start">
          <div>
            <img src={companyLogo} alt="SafariPro Logo" className="h-12" />
            <h2 className="text-2xl font-bold mt-2">Booking Ticket</h2>
            <p className="text-sm text-muted-foreground">
              Booking Code:{" "}
              <span className="font-mono">{currentBookingDetails.code}</span>
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center justify-end gap-2 text-green-600 dark:text-green-400">
              <CheckCircle className="h-8 w-8" />
              <span className="text-3xl font-bold uppercase">Paid</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Issued on: {format(new Date(), "MMM dd, yyyy")}
            </p>
          </div>
        </div>

        <Separator className="my-6" />

        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-2">Guest Information</h3>
            <p>{currentBookingDetails.full_name}</p>
            <p className="text-sm text-muted-foreground">
              {currentBookingDetails.email}
            </p>
            <p className="text-sm text-muted-foreground">
              {currentBookingDetails.phone_number}
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Booking Period</h3>
            <p>
              <strong>Check-in:</strong>{" "}
              {format(
                new Date(currentBookingDetails.start_date),
                "MMM dd, yyyy"
              )}
            </p>
            <p>
              <strong>Check-out:</strong>{" "}
              {format(new Date(currentBookingDetails.end_date), "MMM dd, yyyy")}
            </p>
            <p>
              <strong>Duration:</strong> {currentBookingDetails.duration_days}{" "}
              Night(s)
            </p>
          </div>
        </div>

        <Separator className="my-6" />

        <div>
          <h3 className="font-semibold mb-4">Payment Summary</h3>
          <div className="space-y-2 border dark:border-gray-700 rounded-lg p-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                Base Price + Taxes & Fees (USD)
              </span>
              <span>${amountRequiredUSD}</span>
            </div>
            <div className="flex justify-between font-bold text-lg">
              <span className="text-muted-foreground">Amount Paid (TZS)</span>
              <span>
                {new Intl.NumberFormat("en-US").format(amountPaidTZS)} TZS
              </span>
            </div>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-center flex-col gap-4 text-center">
          <QRCodeCanvas
            value={`https://safaripro.net/booking-details/${currentBookingDetails.id}`}
            id="qr-code-canvas"
            size={128}
            bgColor={"#ffffff"}
            fgColor={"#000000"}
            level={"L"}
            includeMargin={true}
          />
          <p className="text-xs text-muted-foreground">
            Scan this code to view your booking details online.
          </p>
        </div>
      </div>

      {/* Action Buttons (Not part of the printed ticket) */}
      <div className="mt-8 flex flex-col sm:flex-row justify-end gap-4">
        <Button variant="outline" onClick={handlePrint}>
          <Printer className="mr-2 h-4 w-4" /> Print Ticket
        </Button>
        <Button variant="outline" onClick={handleFinish}>
          Finish & Go to Bookings <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
        <Button
          onClick={() => checkInMutation.mutate(currentBookingDetails.id)}
          disabled={checkInMutation.isPending}
        >
          {checkInMutation.isPending && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          <LogIn className="mr-2 h-4 w-4" /> Check-In Guest Now
        </Button>
      </div>
    </div>
  );
}
