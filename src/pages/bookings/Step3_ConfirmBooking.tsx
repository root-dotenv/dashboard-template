"use client";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useBookingStore } from "@/store/booking.store";
import bookingClient from "@/api/booking-client";
import { type BookingDetails } from "./booking-types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Loader2,
  AlertCircle,
  FileText,
  User,
  Calendar,
  RefreshCw,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function Step3_ConfirmBooking() {
  const { createdBooking, setBookingDetails, setStep } = useBookingStore();

  const {
    data: bookingData,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery<BookingDetails>({
    queryKey: ["bookingDetails", createdBooking?.id],
    queryFn: async () => {
      const response = await bookingClient.get(
        `/bookings/${createdBooking!.id}`
      );
      return response.data;
    },
    enabled: !!createdBooking?.id,
    onSuccess: (data) => {
      setBookingDetails(data);
    },
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data || !data.status_history || data.status_history.length === 0) {
        return false;
      }
      const hasConversion = data.status_history.some(
        (action) => action.action === "currency_conversion"
      );
      return hasConversion ? false : 2000;
    },
    refetchOnWindowFocus: false,
    retry: 2,
  });

  const currencyConversionDetails = useMemo(() => {
    if (!bookingData) return null;
    const conversionAction = bookingData.status_history.find(
      (action) => action.action === "currency_conversion"
    );
    return conversionAction?.details || null;
  }, [bookingData]);

  if (isLoading || (isFetching && !currencyConversionDetails)) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-20">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          Finalizing Invoice...
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Confirming final taxes, fees, and currency conversion.
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-red-600 bg-red-50 dark:bg-red-900/20 p-6 rounded-lg flex flex-col items-center text-center">
        <AlertCircle className="h-10 w-10 mb-4" />
        <h3 className="text-lg font-semibold">
          Failed to Load Booking Details
        </h3>
        <p className="mb-4">{error.message}</p>
        <div className="flex items-center gap-4 mt-4">
          <Button onClick={() => setStep(2)} variant="outline">
            Go Back
          </Button>
          <Button onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw
              className={cn("mr-2 h-4 w-4", isFetching && "animate-spin")}
            />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (bookingData) {
    const { billing_meta_data: billing } = bookingData;
    const charges = billing?.charges_breakdown;

    return (
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-none">
          <CardHeader className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-6 flex flex-row justify-between items-center">
            <div>
              <CardTitle className="text-2xl flex items-center gap-3">
                <FileText className="text-blue-600" />
                Booking Confirmation & Invoice
              </CardTitle>
              <CardDescription>
                Please review the final booking details and pricing below.
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
            >
              <RefreshCw
                className={cn("mr-2 h-4 w-4", isFetching && "animate-spin")}
              />
              Refresh
            </Button>
          </CardHeader>
          <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2">
                  <User size={16} />
                  Guest Details
                </h4>
                <p>{bookingData.full_name}</p>
                <p className="text-sm text-gray-500">{bookingData.email}</p>
                <p className="text-sm text-gray-500">
                  {bookingData.phone_number}
                </p>
              </div>
              <Separator />
              <div>
                <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2">
                  <Calendar size={16} />
                  Booking Period
                </h4>
                <div className="flex justify-between">
                  <span>Check-in:</span>{" "}
                  <span className="font-semibold text-[#10294D]">
                    {format(new Date(bookingData.start_date), "MMM dd, yyyy")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Check-out:</span>{" "}
                  <span className="font-semibold text-[#10294D]">
                    {format(new Date(bookingData.end_date), "MMM dd, yyyy")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Duration:</span>{" "}
                  <span className="font-semibold text-[#10294D]">
                    {bookingData.duration_days} Night(s)
                  </span>
                </div>
              </div>
              <Separator />
              <div>
                <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2">
                  Reference
                </h4>
                <div className="flex justify-between text-sm">
                  <span>Booking Code:</span>{" "}
                  <span className="font-mono text-[#10294D] font-semibold">
                    {bookingData.code}
                  </span>
                </div>
              </div>
            </div>
            <div className="space-y-4 bg-[#F6F7FA] dark:bg-gray-900/50 p-6 border border-[#E4E7EC] rounded-lg dark:border-gray-700">
              <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                Pricing Breakdown
              </h4>
              <div className="space-y-2 text-sm">
                {charges?.base_charge && (
                  <div className="flex justify-between">
                    <span>Base Price ({bookingData.duration_days} nights)</span>
                    {/* --- FIX: Added optional chaining --- */}
                    <span>${charges.base_charge.amount?.toFixed(2)}</span>
                  </div>
                )}
                {charges?.tax && (
                  <div className="flex justify-between">
                    <span>{charges.tax.description}</span>
                    {/* --- FIX: Added optional chaining --- */}
                    <span>${charges.tax.amount?.toFixed(2)}</span>
                  </div>
                )}
                {charges?.safari_pro_fee && (
                  <div className="flex justify-between">
                    <span>{charges.safari_pro_fee.description}</span>
                    {/* --- FIX: Added optional chaining --- */}
                    <span>${charges.safari_pro_fee.amount?.toFixed(2)}</span>
                  </div>
                )}
              </div>
              <Separator className="my-4" />
              <div className="flex justify-between font-bold text-lg">
                <span>Total (USD)</span>
                {/* --- FIX: Added optional chaining and a fallback text --- */}
                <span>${billing?.final_amount?.toFixed(2) ?? "0.00"}</span>
              </div>
              <div className="p-4 bg-[#E6F6F8] border-[1.25px] border-[#06AEBD14] dark:bg-blue-900/30 rounded-md text-center mt-4">
                <p className="text-sm text-[#05AEBD] dark:text-blue-300">
                  Total Amount to be Paid
                </p>
                <p className="text-3xl font-bold text-[#05AEBD] dark:text-blue-400">
                  {currencyConversionDetails ? (
                    new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "TZS",
                    }).format(currencyConversionDetails.converted_required)
                  ) : (
                    <Loader2 className="h-6 w-6 animate-spin inline-block" />
                  )}
                </p>
                {currencyConversionDetails && (
                  <p className="text-xs text-muted-foreground pt-1">
                    (Rate: 1 USD ≈{" "}
                    {parseFloat(
                      currencyConversionDetails.exchange_rate_required
                    ).toFixed(2)}{" "}
                    TZS)
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="flex justify-between items-center mt-8">
          <Button variant="outline" onClick={() => setStep(2)}>
            Back to Guest Details
          </Button>
          <Button
            variant={"main"}
            onClick={() => setStep(4)}
            disabled={!currencyConversionDetails || isFetching}
          >
            Proceed to Payment
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
