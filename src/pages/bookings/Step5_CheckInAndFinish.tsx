// src/pages/bookings/components/Step5_CheckInAndFinish.tsx
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
  ArrowLeft, // Added for consistency
} from "lucide-react";
import { format } from "date-fns";
import { type CurrencyConversionResponse } from "./booking-types";
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

  const {
    data: fetchedConversionData,
    isLoading: isFetchingDetails,
    isError: fetchError,
    error: fetchErrorMessage,
    refetch: refetchConversion,
  } = useQuery<CurrencyConversionResponse>({
    queryKey: ["bookingCurrencyConversion", createdBooking?.id],
    queryFn: async () => {
      const response = await bookingClient.get(
        `/bookings/${createdBooking!.id}/currency-conversions`
      );
      return response.data;
    },
    // Fetch only if needed (e.g., direct navigation or refresh)
    enabled: !!createdBooking?.id && !bookingDetails?.payment_status, // Enable if bookingDetails might be stale
    staleTime: 1000 * 60, // Consider data stale after 1 minute
    refetchOnWindowFocus: false,
    retry: 1,
    onSuccess: (response) => {
      setBookingDetails(response.data.booking);
    },
  });

  // Prioritize potentially fresher data from the store if payment was just confirmed
  const currentBookingDetails =
    bookingDetails || fetchedConversionData?.data.booking;

  // Use conversion details from the fetched data
  const currencyConversionDetails = useMemo(() => {
    // Make sure to use fetchedConversionData, not bookingDetails for conversions
    const conversions = fetchedConversionData?.data.conversions;
    if (!conversions) return null;
    return (
      conversions.find(
        (c) => c.conversion_type === "amount_required_reference"
      ) || null
    );
  }, [fetchedConversionData]);

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
    toast.success("Booking completed successfully!", {
      // Changed message slightly
      description:
        "You can view the booking details or check the guest in later from the main bookings page.",
    });
    resetBookingStore();
    navigate("/bookings/all-bookings");
  };

  if (isFetchingDetails && !currentBookingDetails) {
    // Show loader only if no details available at all
    return (
      <div className="flex flex-col items-center justify-center text-center py-20">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          Loading Booking Ticket...
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Preparing your booking ticket and final details.
        </p>
      </div>
    );
  }

  // Handle case where fetch failed AND we don't have details from the store
  if (fetchError && !currentBookingDetails) {
    return (
      <div className="text-red-600 bg-red-50 dark:bg-red-900/20 p-6 rounded-lg flex flex-col items-center text-center">
        <AlertCircle className="h-10 w-10 mb-4" />
        <h3 className="text-lg font-semibold">
          Failed to Load Final Booking Details
        </h3>
        <p className="mb-4">{fetchErrorMessage?.message}</p>
        <div className="flex items-center gap-4 mt-4">
          <Button onClick={() => setStep(4)} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" /> Go Back to Payment Step
          </Button>
          <Button
            onClick={() => refetchConversion()} // Retry fetching conversion data
            disabled={isFetchingDetails}
          >
            <RefreshCw
              className={cn(
                "mr-2 h-4 w-4",
                isFetchingDetails && "animate-spin"
              )}
            />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // Handle case where booking ID itself is missing (shouldn't happen in normal flow)
  if (!currentBookingDetails && !createdBooking) {
    return (
      <div className="text-center py-16 text-gray-500">
        <Info className="mx-auto h-12 w-12 text-red-400 mb-4" />
        <p className="font-semibold">Missing Booking Information</p>
        <p>Cannot display ticket. Please start the booking process again.</p>
        <Button
          onClick={() => {
            resetBookingStore();
            setStep(1);
          }}
          variant="outline"
          className="mt-4"
        >
          Start New Booking
        </Button>
      </div>
    );
  }

  // Handle case where booking details exist but conversion details are missing (could happen on refresh if API fails)
  if (
    currentBookingDetails &&
    !currencyConversionDetails &&
    !isFetchingDetails
  ) {
    return (
      <div className="text-center py-16 text-amber-600">
        <Info className="mx-auto h-12 w-12 mb-4" />
        <p className="font-semibold">Could Not Load Full Pricing Details</p>
        <p>
          The final TZS amount could not be loaded for the ticket. Basic booking
          details are shown below.
        </p>
        {/* Render basic ticket without pricing or allow retry */}
        <div className="flex justify-center gap-4 mt-4">
          <Button onClick={() => setStep(4)} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Payment Step
          </Button>
          <Button
            onClick={() => refetchConversion()}
            disabled={isFetchingDetails}
          >
            <RefreshCw
              className={cn(
                "mr-2 h-4 w-4",
                isFetchingDetails && "animate-spin"
              )}
            />
            Retry Fetching Pricing
          </Button>
        </div>
        {/* Optionally render partial ticket here */}
      </div>
    );
  }

  // Ensure we definitely have booking details to proceed
  if (!currentBookingDetails) {
    return (
      // Generic fallback if somehow still missing
      <div className="flex flex-col items-center justify-center text-center py-20">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
        <p>Loading...</p>
      </div>
    );
  }

  // --- Data Extraction for Ticket ---
  // Use fetched conversion data primarily for amounts
  const amountRequiredUSD =
    currencyConversionDetails?.original_amount ??
    // Fallback to booking data if conversion missing (less accurate)
    parseFloat(currentBookingDetails.amount_required);
  // Amount paid should reflect the confirmed TZS amount from conversion
  const amountPaidTZS = currencyConversionDetails?.converted_amount ?? 0; // Default to 0 if missing

  return (
    <div className="max-w-3xl mx-auto">
      {/* Ticket Div */}
      <div
        className="bg-white dark:bg-[#171F2F] p-6 rounded-lg shadow-lg border dark:border-gray-700"
        ref={ticketRef}
      >
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
            {/* Show Paid status based on bookingDetails */}
            {(currentBookingDetails.payment_status === "Paid" ||
              currentBookingDetails.booking_status === "Confirmed") && (
              <div className="flex items-center justify-end gap-2 text-green-600 dark:text-green-400">
                <CheckCircle className="h-8 w-8" />
                <span className="text-3xl font-bold uppercase">Paid</span>
              </div>
            )}
            {/* Optional: Show Pending if needed */}
            {currentBookingDetails.payment_status === "Pending" &&
              currentBookingDetails.booking_status !== "Confirmed" && (
                <div className="flex items-center justify-end gap-2 text-amber-600 dark:text-amber-400">
                  <Hourglass className="h-8 w-8" />
                  <span className="text-3xl font-bold uppercase">Pending</span>
                </div>
              )}
            <p className="text-sm text-muted-foreground">
              Issued on: {format(new Date(), "MMM dd, yyyy")}
            </p>
          </div>
        </div>

        <Separator className="my-6" />

        {/* Guest and Booking Period */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-2">Guest Information</h3>
            <p>{currentBookingDetails.full_name}</p>
            <p className="text-sm text-muted-foreground truncate">
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
            <p className="text-sm text-muted-foreground mt-1">
              Room: {currentBookingDetails.property_item_type}
            </p>
          </div>
        </div>

        <Separator className="my-6" />

        {/* Payment Summary */}
        <div>
          <h3 className="font-semibold mb-4">Payment Summary</h3>
          <div className="space-y-2 border dark:border-gray-700 rounded-lg p-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Amount (USD)</span>
              <span>${(amountRequiredUSD ?? 0).toFixed(2)}</span>
            </div>
            {/* Conditionally show Exchange Rate */}
            {currencyConversionDetails && (
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Exchange Rate (approx.)</span>
                <span>
                  1 USD ≈ {currencyConversionDetails.exchange_rate.toFixed(2)}{" "}
                  TZS
                </span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg">
              <span className="text-muted-foreground">Amount Paid (TZS)</span>
              <span>
                {new Intl.NumberFormat("en-US").format(amountPaidTZS)} TZS
              </span>
            </div>
            <p className="text-xs text-muted-foreground pt-1">
              Payment Method: {currentBookingDetails.payment_method}
            </p>
          </div>
        </div>

        {/* QR Code */}
        <div className="mt-8 flex items-center justify-center flex-col gap-4 text-center">
          <QRCodeCanvas
            value={`https://safaripro.net/booking-details/${currentBookingDetails.id}`} // Ensure ID is correct
            id="qr-code-canvas"
            size={128}
            bgColor={"#ffffff"}
            fgColor={"#000000"}
            level={"L"}
            includeMargin={true}
          />
          <p className="text-xs text-muted-foreground">
            Scan QR code to view booking details online.
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex flex-col sm:flex-row justify-end gap-4">
        <Button variant="outline" onClick={handlePrint}>
          <Printer className="mr-2 h-4 w-4" /> Print Ticket
        </Button>
        <Button variant="outline" onClick={handleFinish}>
          Finish & Go to Bookings <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
        <Button
          onClick={() => checkInMutation.mutate(currentBookingDetails.id)}
          disabled={
            checkInMutation.isPending ||
            currentBookingDetails.booking_status === "Checked In"
          } // Disable if already checked in
        >
          {checkInMutation.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <LogIn className="mr-2 h-4 w-4" />
          )}
          {currentBookingDetails.booking_status === "Checked In"
            ? "Already Checked-In"
            : "Check-In Guest Now"}
        </Button>
      </div>
    </div>
  );
}
