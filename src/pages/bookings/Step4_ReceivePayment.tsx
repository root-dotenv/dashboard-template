// Updated Step4_ReceivePayment.tsx with debugging and fallback logic
"use client";
import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useBookingStore } from "@/store/booking.store";
import bookingClient from "@/api/booking-client";
import { toast } from "sonner";
import {
  type UpdatePaymentPayload,
  type BookingDetails,
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
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Info, Banknote, ShieldCheck, RefreshCw } from "lucide-react";

const paymentSchema = yup.object({
  amountReceived: yup
    .number()
    .required("Amount is required.")
    .typeError("Please enter a valid number."),
  confirmAmountReceived: yup
    .number()
    .oneOf([yup.ref("amountReceived")], "Amounts must match.")
    .required("Please confirm the amount.")
    .typeError("Please enter a valid number."),
});

type PaymentFormData = yup.InferType<typeof paymentSchema>;

export default function Step4_ReceivePayment() {
  const { bookingDetails, createdBooking, setStep, setBookingDetails } =
    useBookingStore();

  // Enhanced debugging
  console.log("=== STEP 4 DEBUG INFO ===");
  console.log("bookingDetails from store:", bookingDetails);
  console.log("createdBooking from store:", createdBooking);
  console.log("bookingDetails ID:", bookingDetails?.id);
  console.log("createdBooking ID:", createdBooking?.id);
  console.log("========================");

  const queryClient = useQueryClient();
  const [isConfirmed, setIsConfirmed] = useState(false);

  const form = useForm<PaymentFormData>({
    resolver: yupResolver(paymentSchema),
    mode: "onChange",
  });

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

  const mutation = useMutation({
    mutationFn: (payload: { bookingId: string; data: UpdatePaymentPayload }) =>
      bookingClient.patch(`/bookings/${payload.bookingId}`, payload.data),
    onSuccess: (response) => {
      toast.success("Payment recorded successfully!");
      queryClient.setQueryData(
        ["bookingDetails", currentBookingDetails?.id],
        response.data
      );
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      setStep(5);
    },
    onError: (error) => {
      console.error("Payment mutation error:", error);
      toast.error(`Failed to record payment: ${error.message}`);
    },
  });

  const onSubmit = (data: PaymentFormData) => {
    if (!currentBookingDetails) {
      toast.error("Booking details are missing. Cannot proceed.");
      return;
    }
    if (!currencyConversionDetails?.converted_required) {
      toast.error("Final TZS amount has not been calculated yet.", {
        description: "Please go back to Step 3 and refresh.",
      });
      return;
    }

    const payload: UpdatePaymentPayload = {
      booking_status: "Confirmed",
      currency_paid: "TZS",
      amount_paid: String(data.amountReceived),
    };

    console.log("Submitting payment with payload:", payload);
    mutation.mutate({ bookingId: currentBookingDetails.id, data: payload });
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
          Fetching the latest booking information.
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
          <Button onClick={() => setStep(3)} variant="outline">
            Go Back to Step 3
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
          <Button onClick={() => setStep(3)}>Try Step 3 Again</Button>
        </div>
      </div>
    );
  }

  // If we still don't have booking details at this point, show error
  if (!currentBookingDetails) {
    return (
      <div className="text-center py-16 text-gray-500">
        <Info className="mx-auto h-12 w-12 text-red-400 mb-4" />
        <p className="font-semibold">Missing Booking Details</p>
        <p>Could not load the booking details. Please go back.</p>
        <Button onClick={() => setStep(3)} className="mt-4">
          Go Back to Step 3
        </Button>
      </div>
    );
  }

  const finalAmountUSD = currentBookingDetails.billing_meta_data?.final_amount;
  const finalAmountTZS = currencyConversionDetails?.converted_required;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Debug info panel - remove in production */}
      <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h4 className="font-semibold text-yellow-800">Debug Info:</h4>
        <p className="text-sm text-yellow-700">
          Booking ID: {currentBookingDetails.id} | Status:{" "}
          {currentBookingDetails.booking_status} | Currency Conversion:{" "}
          {currencyConversionDetails ? "✓" : "✗"}
        </p>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Receive Cash Payment</CardTitle>
          <CardDescription>
            Confirm the amount received in cash from the guest to finalize the
            booking payment.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
              <p className="text-sm text-muted-foreground">Total in USD</p>
              <p className="text-2xl font-bold">
                ${finalAmountUSD?.toFixed(2) || "0.00"}
              </p>
            </div>
            <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                Total to be Paid (TZS)
              </p>
              {finalAmountTZS ? (
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                  {new Intl.NumberFormat("en-US").format(finalAmountTZS)} TZS
                </p>
              ) : (
                <div className="text-sm text-amber-600 font-semibold pt-2">
                  Pending Calculation... <br /> (Go back and refresh)
                </div>
              )}
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="amountReceived"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount Received (TZS)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter TZS amount..."
                          {...field}
                          icon={Banknote}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmAmountReceived"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Amount Received (TZS)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Re-enter TZS amount..."
                          {...field}
                          icon={ShieldCheck}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="items-top flex space-x-2 pt-4">
                <Checkbox
                  id="confirm-amount"
                  checked={isConfirmed}
                  onCheckedChange={(checked) => setIsConfirmed(!!checked)}
                />
                <div className="grid gap-1.5 leading-none">
                  <label
                    htmlFor="confirm-amount"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    I confirm the cash amount received is correct.
                  </label>
                  <p className="text-xs text-muted-foreground">
                    This action will mark the booking as paid.
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-center pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(3)}
                >
                  Back to Confirmation
                </Button>
                <Button
                  type="submit"
                  disabled={
                    !isConfirmed ||
                    !form.formState.isValid ||
                    mutation.isPending ||
                    !finalAmountTZS
                  }
                >
                  {mutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Mark as Paid & Finalize
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
