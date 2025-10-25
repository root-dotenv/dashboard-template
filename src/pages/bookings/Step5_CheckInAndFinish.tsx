// // src/pages/bookings/components/Step5_CheckInAndFinish.tsx
// "use client";
// import { useMemo, useRef } from "react";
// import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
// import { useBookingStore } from "@/store/booking.store";
// import { useNavigate } from "react-router-dom";
// import bookingClient from "@/api/booking-client";
// import { toast } from "sonner";
// import { useReactToPrint } from "react-to-print";
// import { QRCodeCanvas } from "qrcode.react";
// import { Button } from "@/components/ui/button";
// import { Separator } from "@/components/ui/separator";
// import {
//   Loader2,
//   Info,
//   CheckCircle,
//   Printer,
//   LogIn,
//   ArrowRight,
//   AlertCircle,
//   RefreshCw,
//   ArrowLeft, // Added for consistency
// } from "lucide-react";
// import { format } from "date-fns";
// import { type CurrencyConversionResponse } from "./booking-types";
// import companyLogo from "/images/SafariPro_Logo.png";

// export default function Step5_CheckInAndFinish() {
//   const {
//     bookingDetails,
//     createdBooking,
//     reset: resetBookingStore,
//     setStep,
//     setBookingDetails,
//   } = useBookingStore();
//   const navigate = useNavigate();
//   const queryClient = useQueryClient();
//   const ticketRef = useRef<HTMLDivElement>(null);

//   const {
//     data: fetchedConversionData,
//     isLoading: isFetchingDetails,
//     isError: fetchError,
//     error: fetchErrorMessage,
//     refetch: refetchConversion,
//   } = useQuery<CurrencyConversionResponse>({
//     queryKey: ["bookingCurrencyConversion", createdBooking?.id],
//     queryFn: async () => {
//       const response = await bookingClient.get(
//         `/bookings/${createdBooking!.id}/currency-conversions`
//       );
//       return response.data;
//     },
//     // Fetch only if needed (e.g., direct navigation or refresh)
//     enabled: !!createdBooking?.id && !bookingDetails?.payment_status, // Enable if bookingDetails might be stale
//     staleTime: 1000 * 60, // Consider data stale after 1 minute
//     refetchOnWindowFocus: false,
//     retry: 1,
//     onSuccess: (response) => {
//       setBookingDetails(response.data.booking);
//     },
//   });

//   // Prioritize potentially fresher data from the store if payment was just confirmed
//   const currentBookingDetails =
//     bookingDetails || fetchedConversionData?.data.booking;

//   // Use conversion details from the fetched data
//   const currencyConversionDetails = useMemo(() => {
//     // Make sure to use fetchedConversionData, not bookingDetails for conversions
//     const conversions = fetchedConversionData?.data.conversions;
//     if (!conversions) return null;
//     return (
//       conversions.find(
//         (c) => c.conversion_type === "amount_required_reference"
//       ) || null
//     );
//   }, [fetchedConversionData]);

//   const checkInMutation = useMutation({
//     mutationFn: (bookingId: string) =>
//       bookingClient.post(`/bookings/${bookingId}/check_in`),
//     onSuccess: () => {
//       toast.success("Guest checked in successfully!", {
//         description: "The room status has been updated.",
//       });
//       queryClient.invalidateQueries({ queryKey: ["rooms"] });
//       queryClient.invalidateQueries({ queryKey: ["bookings"] });
//       resetBookingStore();
//       navigate("/bookings/all-bookings");
//     },
//     onError: (error) => {
//       console.error("Check-in mutation error:", error);
//       toast.error(`Check-in failed: ${error.message}`);
//     },
//   });

//   const handlePrint = useReactToPrint({
//     content: () => ticketRef.current,
//     documentTitle: `Booking-Ticket-${currentBookingDetails?.code}`,
//   });

//   const handleFinish = () => {
//     toast.success("Booking completed successfully!", {
//       // Changed message slightly
//       description:
//         "You can view the booking details or check the guest in later from the main bookings page.",
//     });
//     resetBookingStore();
//     navigate("/bookings/all-bookings");
//   };

//   if (isFetchingDetails && !currentBookingDetails) {
//     // Show loader only if no details available at all
//     return (
//       <div className="flex flex-col items-center justify-center text-center py-20">
//         <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
//         <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
//           Loading Booking Ticket...
//         </h2>
//         <p className="text-gray-600 dark:text-gray-400 mt-2">
//           Preparing your booking ticket and final details.
//         </p>
//       </div>
//     );
//   }

//   // Handle case where fetch failed AND we don't have details from the store
//   if (fetchError && !currentBookingDetails) {
//     return (
//       <div className="text-red-600 bg-red-50 dark:bg-red-900/20 p-6 rounded-lg flex flex-col items-center text-center">
//         <AlertCircle className="h-10 w-10 mb-4" />
//         <h3 className="text-lg font-semibold">
//           Failed to Load Final Booking Details
//         </h3>
//         <p className="mb-4">{fetchErrorMessage?.message}</p>
//         <div className="flex items-center gap-4 mt-4">
//           <Button onClick={() => setStep(4)} variant="outline">
//             <ArrowLeft className="mr-2 h-4 w-4" /> Go Back to Payment Step
//           </Button>
//           <Button
//             onClick={() => refetchConversion()} // Retry fetching conversion data
//             disabled={isFetchingDetails}
//           >
//             <RefreshCw
//               className={cn(
//                 "mr-2 h-4 w-4",
//                 isFetchingDetails && "animate-spin"
//               )}
//             />
//             Retry
//           </Button>
//         </div>
//       </div>
//     );
//   }

//   // Handle case where booking ID itself is missing (shouldn't happen in normal flow)
//   if (!currentBookingDetails && !createdBooking) {
//     return (
//       <div className="text-center py-16 text-gray-500">
//         <Info className="mx-auto h-12 w-12 text-red-400 mb-4" />
//         <p className="font-semibold">Missing Booking Information</p>
//         <p>Cannot display ticket. Please start the booking process again.</p>
//         <Button
//           onClick={() => {
//             resetBookingStore();
//             setStep(1);
//           }}
//           variant="outline"
//           className="mt-4"
//         >
//           Start New Booking
//         </Button>
//       </div>
//     );
//   }

//   // Handle case where booking details exist but conversion details are missing (could happen on refresh if API fails)
//   if (
//     currentBookingDetails &&
//     !currencyConversionDetails &&
//     !isFetchingDetails
//   ) {
//     return (
//       <div className="text-center py-16 text-amber-600">
//         <Info className="mx-auto h-12 w-12 mb-4" />
//         <p className="font-semibold">Could Not Load Full Pricing Details</p>
//         <p>
//           The final TZS amount could not be loaded for the ticket. Basic booking
//           details are shown below.
//         </p>
//         {/* Render basic ticket without pricing or allow retry */}
//         <div className="flex justify-center gap-4 mt-4">
//           <Button onClick={() => setStep(4)} variant="outline">
//             <ArrowLeft className="mr-2 h-4 w-4" /> Back to Payment Step
//           </Button>
//           <Button
//             onClick={() => refetchConversion()}
//             disabled={isFetchingDetails}
//           >
//             <RefreshCw
//               className={cn(
//                 "mr-2 h-4 w-4",
//                 isFetchingDetails && "animate-spin"
//               )}
//             />
//             Retry Fetching Pricing
//           </Button>
//         </div>
//         {/* Optionally render partial ticket here */}
//       </div>
//     );
//   }

//   // Ensure we definitely have booking details to proceed
//   if (!currentBookingDetails) {
//     return (
//       // Generic fallback if somehow still missing
//       <div className="flex flex-col items-center justify-center text-center py-20">
//         <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
//         <p>Loading...</p>
//       </div>
//     );
//   }

//   // --- Data Extraction for Ticket ---
//   // Use fetched conversion data primarily for amounts
//   const amountRequiredUSD =
//     currencyConversionDetails?.original_amount ??
//     // Fallback to booking data if conversion missing (less accurate)
//     parseFloat(currentBookingDetails.amount_required);
//   // Amount paid should reflect the confirmed TZS amount from conversion
//   const amountPaidTZS = currencyConversionDetails?.converted_amount ?? 0; // Default to 0 if missing

//   return (
//     <div className="max-w-3xl mx-auto">
//       {/* Ticket Div */}
//       <div
//         className="bg-white dark:bg-[#171F2F] p-6 rounded-lg shadow-lg border dark:border-gray-700"
//         ref={ticketRef}
//       >
//         <div className="flex justify-between items-start">
//           <div>
//             <img src={companyLogo} alt="SafariPro Logo" className="h-12" />
//             <h2 className="text-2xl font-bold mt-2">Booking Ticket</h2>
//             <p className="text-sm text-muted-foreground">
//               Booking Code:{" "}
//               <span className="font-mono">{currentBookingDetails.code}</span>
//             </p>
//           </div>
//           <div className="text-right">
//             {/* Show Paid status based on bookingDetails */}
//             {(currentBookingDetails.payment_status === "Paid" ||
//               currentBookingDetails.booking_status === "Confirmed") && (
//               <div className="flex items-center justify-end gap-2 text-green-600 dark:text-green-400">
//                 <CheckCircle className="h-8 w-8" />
//                 <span className="text-3xl font-bold uppercase">Paid</span>
//               </div>
//             )}
//             {/* Optional: Show Pending if needed */}
//             {currentBookingDetails.payment_status === "Pending" &&
//               currentBookingDetails.booking_status !== "Confirmed" && (
//                 <div className="flex items-center justify-end gap-2 text-amber-600 dark:text-amber-400">
//                   <Hourglass className="h-8 w-8" />
//                   <span className="text-3xl font-bold uppercase">Pending</span>
//                 </div>
//               )}
//             <p className="text-sm text-muted-foreground">
//               Issued on: {format(new Date(), "MMM dd, yyyy")}
//             </p>
//           </div>
//         </div>

//         <Separator className="my-6" />

//         {/* Guest and Booking Period */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
//           <div>
//             <h3 className="font-semibold mb-2">Guest Information</h3>
//             <p>{currentBookingDetails.full_name}</p>
//             <p className="text-sm text-muted-foreground truncate">
//               {currentBookingDetails.email}
//             </p>
//             <p className="text-sm text-muted-foreground">
//               {currentBookingDetails.phone_number}
//             </p>
//           </div>
//           <div>
//             <h3 className="font-semibold mb-2">Booking Period</h3>
//             <p>
//               <strong>Check-in:</strong>{" "}
//               {format(
//                 new Date(currentBookingDetails.start_date),
//                 "MMM dd, yyyy"
//               )}
//             </p>
//             <p>
//               <strong>Check-out:</strong>{" "}
//               {format(new Date(currentBookingDetails.end_date), "MMM dd, yyyy")}
//             </p>
//             <p>
//               <strong>Duration:</strong> {currentBookingDetails.duration_days}{" "}
//               Night(s)
//             </p>
//             <p className="text-sm text-muted-foreground mt-1">
//               Room: {currentBookingDetails.property_item_type}
//             </p>
//           </div>
//         </div>

//         <Separator className="my-6" />

//         {/* Payment Summary */}
//         <div>
//           <h3 className="font-semibold mb-4">Payment Summary</h3>
//           <div className="space-y-2 border dark:border-gray-700 rounded-lg p-4">
//             <div className="flex justify-between text-sm">
//               <span className="text-muted-foreground">Total Amount (USD)</span>
//               <span>${(amountRequiredUSD ?? 0).toFixed(2)}</span>
//             </div>
//             {/* Conditionally show Exchange Rate */}
//             {currencyConversionDetails && (
//               <div className="flex justify-between text-xs text-muted-foreground">
//                 <span>Exchange Rate (approx.)</span>
//                 <span>
//                   1 USD ≈ {currencyConversionDetails.exchange_rate.toFixed(2)}{" "}
//                   TZS
//                 </span>
//               </div>
//             )}
//             <div className="flex justify-between font-bold text-lg">
//               <span className="text-muted-foreground">Amount Paid (TZS)</span>
//               <span>
//                 {new Intl.NumberFormat("en-US").format(amountPaidTZS)} TZS
//               </span>
//             </div>
//             <p className="text-xs text-muted-foreground pt-1">
//               Payment Method: {currentBookingDetails.payment_method}
//             </p>
//           </div>
//         </div>

//         {/* QR Code */}
//         <div className="mt-8 flex items-center justify-center flex-col gap-4 text-center">
//           <QRCodeCanvas
//             value={`https://safaripro.net/booking-details/${currentBookingDetails.id}`} // Ensure ID is correct
//             id="qr-code-canvas"
//             size={128}
//             bgColor={"#ffffff"}
//             fgColor={"#000000"}
//             level={"L"}
//             includeMargin={true}
//           />
//           <p className="text-xs text-muted-foreground">
//             Scan QR code to view booking details online.
//           </p>
//         </div>
//       </div>

//       {/* Action Buttons */}
//       <div className="mt-8 flex flex-col sm:flex-row justify-end gap-4">
//         <Button variant="outline" onClick={handlePrint}>
//           <Printer className="mr-2 h-4 w-4" /> Print Ticket
//         </Button>
//         <Button variant="outline" onClick={handleFinish}>
//           Finish & Go to Bookings <ArrowRight className="ml-2 h-4 w-4" />
//         </Button>
//         <Button
//           onClick={() => checkInMutation.mutate(currentBookingDetails.id)}
//           disabled={
//             checkInMutation.isPending ||
//             currentBookingDetails.booking_status === "Checked In"
//           } // Disable if already checked in
//         >
//           {checkInMutation.isPending ? (
//             <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//           ) : (
//             <LogIn className="mr-2 h-4 w-4" />
//           )}
//           {currentBookingDetails.booking_status === "Checked In"
//             ? "Already Checked-In"
//             : "Check-In Guest Now"}
//         </Button>
//       </div>
//     </div>
//   );
// }

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
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Loader2,
  Info,
  CheckCircle,
  Printer,
  LogIn,
  ArrowRight,
  AlertCircle,
  RefreshCw,
  ArrowLeft,
  Calendar,
  User,
  CreditCard,
  MapPin,
  Clock,
  Shield,
} from "lucide-react";
import { format } from "date-fns";
import { type CurrencyConversionResponse } from "./booking-types";
import { cn } from "@/lib/utils";
import companyLogo from "../../../public/images/safaripro-company-logo-blue.png";

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
    enabled: !!createdBooking?.id && !bookingDetails?.payment_status,
    staleTime: 1000 * 60,
    refetchOnWindowFocus: false,
    retry: 1,
    onSuccess: (response) => {
      setBookingDetails(response.data.booking);
    },
  });

  const currentBookingDetails =
    bookingDetails || fetchedConversionData?.data.booking;

  const currencyConversionDetails = useMemo(() => {
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
      toast.success("Guest Checked In Successfully!", {
        description:
          "The room status has been updated and guest is now checked in.",
      });
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      resetBookingStore();
      navigate("/bookings/all-bookings");
    },
    onError: (error) => {
      console.error("Check-in mutation error:", error);
      toast.error(`Check-in Failed: ${error.message}`);
    },
  });

  const handlePrint = useReactToPrint({
    content: () => ticketRef.current,
    documentTitle: `Booking-Ticket-${currentBookingDetails?.code}`,
  });

  const handleFinish = () => {
    toast.success("Booking Process Completed!", {
      description:
        "The booking has been successfully created and payment confirmed.",
    });
    resetBookingStore();
    navigate("/bookings/all-bookings");
  };

  if (isFetchingDetails && !currentBookingDetails) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-20">
        <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-6">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          Preparing Your Booking Ticket
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Loading final booking details and generating your ticket...
        </p>
      </div>
    );
  }

  if (fetchError && !currentBookingDetails) {
    return (
      <Card className="max-w-2xl mx-auto border-red-200 dark:border-red-800">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Failed to Load Booking Details
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {fetchErrorMessage?.message}
            </p>
            <div className="flex items-center justify-center gap-4">
              <Button onClick={() => setStep(4)} variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Payment
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
                Retry
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!currentBookingDetails && !createdBooking) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Info className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Missing Booking Information
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Cannot display ticket. Please start the booking process again.
            </p>
            <Button
              onClick={() => {
                resetBookingStore();
                setStep(1);
              }}
              variant="outline"
              className="w-full"
            >
              Start New Booking
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (
    currentBookingDetails &&
    !currencyConversionDetails &&
    !isFetchingDetails
  ) {
    return (
      <Card className="max-w-2xl mx-auto border-amber-200 dark:border-amber-800">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Info className="h-8 w-8 text-amber-600 dark:text-amber-400" />
            </div>
            <h3 className="text-xl font-semibold text-amber-800 dark:text-amber-200 mb-2">
              Partial Details Available
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              The final TZS amount could not be loaded. Basic booking details
              are shown below.
            </p>
            <div className="flex justify-center gap-4">
              <Button onClick={() => setStep(4)} variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Payment
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
                Retry Pricing
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!currentBookingDetails) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-20">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
        <p className="text-gray-600 dark:text-gray-400">
          Loading booking details...
        </p>
      </div>
    );
  }

  const amountRequiredUSD =
    currencyConversionDetails?.original_amount ??
    parseFloat(currentBookingDetails.amount_required);
  const amountPaidTZS = currencyConversionDetails?.converted_amount ?? 0;

  return (
    <div className="space-y-8 p-8">
      {/* Header Section */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 px-4 py-2 rounded-full text-sm font-medium mb-4">
          <CheckCircle className="h-4 w-4" />
          Step 5: Booking Complete
        </div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
          Booking Confirmed & Ready
        </h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Your booking has been successfully created and paid. You can now print
          the ticket or check in the guest.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Ticket */}
        <div className="lg:col-span-2">
          <Card
            className="border border-gray-200 dark:border-gray-700 shadow-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900"
            ref={ticketRef}
          >
            <CardContent className="p-8">
              {/* Ticket Header */}
              <div className="flex justify-between items-start mb-8">
                <div className="flex items-center gap-4">
                  <img
                    src={companyLogo}
                    alt="SafariPro Logo"
                    className="h-10"
                  />
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                      Booking Confirmation
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Confirmation Code:{" "}
                      <Badge className="font-mono bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                        {currentBookingDetails.code}
                      </Badge>
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  {(currentBookingDetails.payment_status === "Paid" ||
                    currentBookingDetails.booking_status === "Confirmed") && (
                    <div className="flex items-center justify-end gap-3 text-green-600 dark:text-green-400">
                      <CheckCircle className="h-10 w-10" />
                      <div>
                        <span className="text-3xl font-bold uppercase block">
                          Paid
                        </span>
                        <span className="text-xs text-green-500 dark:text-green-300 block">
                          Payment Confirmed
                        </span>
                      </div>
                    </div>
                  )}
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    Issued: {format(new Date(), "MMM dd, yyyy 'at' h:mm a")}
                  </p>
                </div>
              </div>

              <Separator className="my-6 bg-gray-200 dark:bg-gray-700" />

              {/* Guest and Stay Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-6 bg-blue-600 rounded-full"></div>
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                      <User className="h-5 w-5 text-blue-600" />
                      Guest Information
                    </h3>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 space-y-2">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {currentBookingDetails.full_name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {currentBookingDetails.email}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {currentBookingDetails.phone_number}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-6 bg-blue-600 rounded-full"></div>
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-blue-600" />
                      Stay Details
                    </h3>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">
                        Check-in:
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {format(
                          new Date(currentBookingDetails.start_date),
                          "MMM dd, yyyy"
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">
                        Check-out:
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {format(
                          new Date(currentBookingDetails.end_date),
                          "MMM dd, yyyy"
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">
                        Duration:
                      </span>
                      <Badge
                        variant="secondary"
                        className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                      >
                        {currentBookingDetails.duration_days} Night
                        {currentBookingDetails.duration_days > 1 ? "s" : ""}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">
                        Room Type:
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {currentBookingDetails.property_item_type}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <Separator className="my-6 bg-gray-200 dark:bg-gray-700" />

              {/* Payment Summary */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-6 bg-blue-600 rounded-full"></div>
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-blue-600" />
                    Payment Summary
                  </h3>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">
                      Total Amount (USD)
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      ${(amountRequiredUSD ?? 0).toFixed(2)}
                    </span>
                  </div>

                  {currencyConversionDetails && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500 dark:text-gray-400">
                        Exchange Rate
                      </span>
                      <span className="text-gray-500 dark:text-gray-400">
                        1 USD ≈{" "}
                        {currencyConversionDetails.exchange_rate.toFixed(2)} TZS
                      </span>
                    </div>
                  )}

                  <Separator className="bg-gray-200 dark:bg-gray-700" />

                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">
                      Amount Paid (TZS)
                    </span>
                    <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {new Intl.NumberFormat("en-US").format(amountPaidTZS)} TZS
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 dark:text-gray-400">
                      Payment Method
                    </span>
                    <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                      {currentBookingDetails.payment_method}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* QR Code */}
              <div className="mt-8 flex flex-col items-center justify-center text-center">
                <div className="bg-white p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <QRCodeCanvas
                    value={`https://safaripro.net/booking-details/${currentBookingDetails.id}`}
                    id="qr-code-canvas"
                    size={120}
                    bgColor={"#ffffff"}
                    fgColor={"#000000"}
                    level={"L"}
                    includeMargin={true}
                  />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
                  Scan to view booking details online
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Actions */}
        <div className="lg:col-span-1 space-y-6">
          {/* Action Buttons */}
          <Card className="border border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                Next Steps
              </h4>
              <div className="space-y-4">
                <Button
                  onClick={handlePrint}
                  variant="outline"
                  className="w-full justify-start h-12"
                >
                  <Printer className="mr-3 h-4 w-4" />
                  Print Booking Ticket
                </Button>

                <Button
                  onClick={handleFinish}
                  variant="outline"
                  className="w-full justify-start h-12"
                >
                  Finish & View Bookings
                  <ArrowRight className="ml-auto h-4 w-4" />
                </Button>

                <Button
                  onClick={() =>
                    checkInMutation.mutate(currentBookingDetails.id)
                  }
                  disabled={
                    checkInMutation.isPending ||
                    currentBookingDetails.booking_status === "Checked In"
                  }
                  className="w-full justify-start h-12 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {checkInMutation.isPending ? (
                    <Loader2 className="mr-3 h-4 w-4 animate-spin" />
                  ) : (
                    <LogIn className="mr-3 h-4 w-4" />
                  )}
                  {currentBookingDetails.booking_status === "Checked In"
                    ? "Already Checked In"
                    : "Check-In Guest Now"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Support Card */}
          <Card className="border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100">
                    Need Assistance?
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Our team is here to help
                  </p>
                </div>
              </div>
              <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                <li className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Available 24/7
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Front Desk Support
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
