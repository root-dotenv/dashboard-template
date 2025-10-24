// src/pages/bookings/components/Step4_MobilePayment.tsx
"use client";
import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useBookingStore } from "@/store/booking.store";
import bookingClient from "@/api/booking-client";
import paymentClient from "@/api/paymentClient"; // Import the new client
import { toast } from "sonner";
import {
  type CurrencyConversionResponse,
  type InitiateMobilePaymentPayload,
  type InitiateMobilePaymentResponse,
  type BookingDetails, // Needed for polling check
} from "./booking-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Loader2,
  Smartphone, // Renamed icon import
  RefreshCw,
  AlertCircle,
  ArrowLeft,
  CheckCircle, // For success state
  Hourglass, // For pending state
  Phone,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Schema for the mobile payment form (just the phone number)
const mobilePaymentSchema = yup.object({
  accountNumber: yup
    .string()
    .required("Guest's phone number is required.")
    .matches(
      /^(\+?255|0)\d{9}$/,
      "Enter a valid Tanzanian phone number (e.g., 0xxxxxxxxx or +255xxxxxxxxx)."
    ), // Basic TZ phone validation
});

type MobilePaymentFormData = yup.InferType<typeof mobilePaymentSchema>;

// Enum for payment status tracking
enum PaymentStatus {
  IDLE = "idle", // Ready to initiate
  INITIATING = "initiating", // Calling /checkout
  PENDING = "pending", // Waiting for guest confirmation / Polling booking status
  SUCCESS = "success", // Payment confirmed via polling
  FAILED_INITIATION = "failed_initiation", // /checkout call failed
  FAILED_CONFIRMATION = "failed_confirmation", // Polling failed or timed out
}

export default function Step4_MobilePayment() {
  const { createdBooking, setStep, setBookingDetails, bookingDetails } =
    useBookingStore();
  const queryClient = useQueryClient();
  const [paymentState, setPaymentState] = useState<PaymentStatus>(
    PaymentStatus.IDLE
  );
  const [lastTransactionId, setLastTransactionId] = useState<string | null>(
    null
  );

  const form = useForm<MobilePaymentFormData>({
    resolver: yupResolver(mobilePaymentSchema),
    mode: "onChange",
    // Pre-fill phone number if available from createdBooking
    defaultValues: {
      accountNumber: createdBooking?.phone_number
        ? String(createdBooking.phone_number) // Convert number to string
        : "",
    },
  });

  // --- Query 1: Fetch Conversion Details (needed for amount and reference) ---
  const {
    data: fetchedConversionData,
    isLoading: isFetchingConversion,
    isError: conversionError,
    error: conversionErrorMessage,
    refetch: refetchConversion, // Allow manual refetch if needed
  } = useQuery<CurrencyConversionResponse>({
    // Use the same query key as other steps for consistency
    queryKey: ["bookingCurrencyConversion", createdBooking?.id],
    queryFn: async () => {
      const response = await bookingClient.get(
        `/bookings/${createdBooking!.id}/currency-conversions`
      );
      return response.data;
    },
    enabled: !!createdBooking?.id && paymentState !== PaymentStatus.SUCCESS, // Fetch initially, stop if payment successful
    retry: 1,
    refetchOnWindowFocus: false, // Don't refetch just for focus
    onSuccess: (response) => {
      // Keep main booking details up-to-date
      setBookingDetails(response.data.booking);
    },
  });

  const currentBookingDetails =
    bookingDetails || fetchedConversionData?.data.booking;
  const paymentReference = currentBookingDetails?.payment_reference;
  const currencyConversionDetails = useMemo(() => {
    const conversions = fetchedConversionData?.data.conversions;
    if (!conversions) return null;
    return (
      conversions.find(
        (c) => c.conversion_type === "amount_required_reference"
      ) || null
    );
  }, [fetchedConversionData]);
  const finalAmountTZS = currencyConversionDetails?.converted_amount;

  // --- Mutation: Initiate Mobile Payment (/checkout) ---
  const initiatePaymentMutation = useMutation<
    InitiateMobilePaymentResponse,
    Error,
    InitiateMobilePaymentPayload
  >({
    mutationFn: (payload) => paymentClient.post("/checkout", payload),
    onMutate: () => {
      setPaymentState(PaymentStatus.INITIATING);
    },
    onSuccess: (response) => {
      if (response.success && response.transactionId) {
        toast.info("Payment initiated.", {
          description:
            "Please ask the guest to confirm the payment on their phone.",
        });
        setLastTransactionId(response.transactionId);
        setPaymentState(PaymentStatus.PENDING); // Start polling
      } else {
        toast.error("Failed to initiate payment.", {
          description:
            response.message || "Unknown error from payment service.",
        });
        setPaymentState(PaymentStatus.FAILED_INITIATION);
      }
    },
    onError: (error) => {
      toast.error("Failed to initiate payment.", {
        description: error.message || "Could not connect to payment service.",
      });
      setPaymentState(PaymentStatus.FAILED_INITIATION);
    },
  });

  // --- Query 2: Poll Booking Status (checks if payment is confirmed) ---
  const { data: polledBookingData, error: pollingError } =
    useQuery<BookingDetails>({
      queryKey: ["bookingDetailsPoll", createdBooking?.id],
      queryFn: async () => {
        console.log(`Polling booking status for ID: ${createdBooking!.id}`);
        const response = await bookingClient.get(
          `/bookings/${createdBooking!.id}`
        );
        return response.data;
      },
      enabled: paymentState === PaymentStatus.PENDING && !!createdBooking?.id, // Only poll when pending
      refetchInterval: 5000, // Poll every 5 seconds
      refetchOnWindowFocus: false,
      retry: false, // Don't retry polling errors automatically, let user retry manually
      onSuccess: (data) => {
        // Update the main booking details in the store
        setBookingDetails(data);
        if (
          data.payment_status === "Paid" &&
          data.booking_status === "Confirmed"
        ) {
          toast.success("Payment Confirmed!", {
            description: "Booking status updated successfully.",
          });
          setPaymentState(PaymentStatus.SUCCESS); // Stop polling, show success
          // Invalidate broader queries to update lists etc.
          queryClient.invalidateQueries({ queryKey: ["bookings"] });
          queryClient.invalidateQueries({
            queryKey: ["bookingCurrencyConversion", createdBooking?.id],
          });
        } else {
          console.log(
            `Payment status: ${data.payment_status}, Booking status: ${data.booking_status}`
          );
        }
      },
      onError: (err) => {
        console.error("Polling error:", err);
        setPaymentState(PaymentStatus.FAILED_CONFIRMATION); // Stop polling on error
        toast.error("Error checking payment status.", {
          description: err.message || "Could not verify payment.",
        });
      },
    });

  const onSubmit = (data: MobilePaymentFormData) => {
    if (!paymentReference || !finalAmountTZS) {
      toast.error("Cannot initiate payment.", {
        description: "Missing payment reference or TZS amount.",
      });
      return;
    }

    const payload: InitiateMobilePaymentPayload = {
      accountNumber: data.accountNumber.replace("+", ""), // Ensure no '+' for API if needed
      referenceId: paymentReference,
      amount: finalAmountTZS,
    };
    initiatePaymentMutation.mutate(payload);
  };

  // --- Render Logic ---

  if (isFetchingConversion && !currentBookingDetails) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-20">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
        <h2 className="text-xl font-semibold">Loading Payment Details...</h2>
      </div>
    );
  }

  if (conversionError || (!finalAmountTZS && !isFetchingConversion)) {
    return (
      <div className="text-red-600 bg-red-50 dark:bg-red-900/20 p-6 rounded-lg flex flex-col items-center text-center">
        <AlertCircle className="h-10 w-10 mb-4" />
        <h3 className="text-lg font-semibold">
          Failed to Load Payment Details
        </h3>
        <p className="mb-4">
          Could not retrieve the final TZS amount or payment reference.
          <br />
          {conversionErrorMessage instanceof Error
            ? conversionErrorMessage.message
            : String(conversionErrorMessage)}
        </p>
        <div className="flex items-center gap-4 mt-4">
          <Button onClick={() => setStep(3)} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Confirmation
          </Button>
          <Button
            onClick={() => refetchConversion()}
            disabled={isFetchingConversion}
          >
            <RefreshCw
              className={cn(
                "mr-2 h-4 w-4",
                isFetchingConversion && "animate-spin"
              )}
            />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // Success State
  if (paymentState === PaymentStatus.SUCCESS) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-20 border border-green-300 bg-green-50 dark:bg-green-900/20 rounded-lg">
        <CheckCircle className="h-16 w-16 text-green-600 mb-4" />
        <h2 className="text-2xl font-semibold text-green-800 dark:text-green-200 mb-2">
          Payment Successful!
        </h2>
        <p className="text-gray-700 dark:text-gray-300 mb-6 max-w-md">
          The mobile payment has been confirmed and the booking is updated.
        </p>
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => setStep(3)}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Details
          </Button>
          <Button variant="main" onClick={() => setStep(5)}>
            Proceed to Check-In / Finish
          </Button>
        </div>
      </div>
    );
  }

  // Pending / Polling State
  if (paymentState === PaymentStatus.PENDING) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-20 border border-amber-300 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
        <Hourglass className="h-16 w-16 text-amber-600 mb-4 animate-spin" />
        <h2 className="text-2xl font-semibold text-amber-800 dark:text-amber-200 mb-2">
          Waiting for Payment Confirmation...
        </h2>
        <p className="text-gray-700 dark:text-gray-300 mb-6 max-w-md">
          Payment initiated (Transaction ID: {lastTransactionId || "N/A"}).
          Please ask the guest to approve the payment on their phone.
          <br />
          We are checking the status automatically.
        </p>
        {pollingError && (
          <p className="text-red-600 text-sm mb-4">
            Error checking status: {pollingError.message}. Retrying...
          </p>
        )}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => setPaymentState(PaymentStatus.IDLE)}
          >
            Cancel & Retry Payment
          </Button>
          {/* Optional: Manual Refresh? */}
          <Button
            onClick={() =>
              queryClient.invalidateQueries({
                queryKey: ["bookingDetailsPoll", createdBooking?.id],
              })
            }
          >
            <RefreshCw className="mr-2 h-4 w-4" /> Check Status Now
          </Button>
        </div>
      </div>
    );
  }

  // Default / Idle State (Show form)
  return (
    <div className="max-w-2xl mx-auto">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Smartphone /> Initiate Mobile Payment
          </CardTitle>
          <CardDescription>
            Enter the guest's phone number to send the payment request.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Display Amounts */}
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
              <p className="text-sm text-muted-foreground">Total in USD</p>
              <p className="text-2xl font-bold">
                $
                {currentBookingDetails?.billing_meta_data?.calculation_breakdown?.final_amount?.toFixed(
                  2
                ) ?? "0.00"}
              </p>
            </div>
            <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                Amount to Pay (TZS)
              </p>
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                {new Intl.NumberFormat("en-US").format(finalAmountTZS || 0)} TZS
              </p>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            Payment Reference:{" "}
            <span className="font-mono text-xs">
              {paymentReference || "N/A"}
            </span>
          </p>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="accountNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Guest's Mobile Number (TZS)</FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="e.g., 0712345678 or +255712345678"
                        {...field}
                        icon={Phone}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Show error messages if initiation failed */}
              {(paymentState === PaymentStatus.FAILED_INITIATION ||
                paymentState === PaymentStatus.FAILED_CONFIRMATION) && (
                <div className="text-red-600 bg-red-50 dark:bg-red-900/20 p-3 rounded-md text-sm">
                  <p className="font-semibold">Payment Issue:</p>
                  {initiatePaymentMutation.error && (
                    <p>{initiatePaymentMutation.error.message}</p>
                  )}
                  {pollingError && <p>{pollingError.message}</p>}
                  <p>Please check the number and try again, or use cash.</p>
                </div>
              )}

              <div className="flex justify-between items-center pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(3)}
                  disabled={initiatePaymentMutation.isPending}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back to Confirmation
                </Button>
                <Button
                  type="submit"
                  disabled={
                    !form.formState.isValid ||
                    initiatePaymentMutation.isPending ||
                    paymentState === PaymentStatus.PENDING // Disable if already pending
                  }
                >
                  {(initiatePaymentMutation.isPending ||
                    paymentState === PaymentStatus.INITIATING) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Initiate Payment Request
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
