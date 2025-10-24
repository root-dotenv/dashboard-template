// src/pages/bookings/make-booking.tsx
"use client";
import { useBookingStore } from "@/store/booking.store";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { Loader2 } from "lucide-react"; // For loading state
import Step1_SelectRoom from "./Step1_SelectRoom";
import Step2_GuestDetails from "./Step2_GuestDetails";
import Step3_ConfirmBooking from "./Step3_ConfirmBooking";
import Step4_MobilePayment from "./Step4_MobilePayment";
import Step4_ReceivePayment from "./Step4_ReceivePayment copy";
import Step5_CheckInAndFinish from "./Step5_CheckInAndFinish";

// Redesigned Stepper UI Component
const BookingStepper = ({ currentStep }: { currentStep: number }) => {
  const steps = [
    "Select Room",
    "Guest Details",
    "Confirmation",
    "Payment",
    "Check-In",
  ];

  return (
    <nav aria-label="Progress">
      <ol role="list" className="flex items-center">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = currentStep > stepNumber;
          const isCurrent = currentStep === stepNumber;

          return (
            <li
              key={step}
              className={cn(
                "relative flex-1",
                index !== steps.length - 1 ? "pr-8 sm:pr-20" : ""
              )}
            >
              {isCompleted ? (
                <>
                  <div
                    className="absolute inset-0 flex items-center"
                    aria-hidden="true"
                  >
                    <div className="h-0.5 w-full bg-blue-600" />
                  </div>
                  <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-blue-600">
                    <Check className="h-5 w-5 text-white" />
                  </div>
                </>
              ) : isCurrent ? (
                <>
                  <div
                    className="absolute inset-0 flex items-center"
                    aria-hidden="true"
                  >
                    <div className="h-0.5 w-full bg-gray-200" />
                  </div>
                  <div className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-blue-600 bg-white dark:bg-gray-800">
                    <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
                  </div>
                </>
              ) : (
                <>
                  <div
                    className="absolute inset-0 flex items-center"
                    aria-hidden="true"
                  >
                    <div className="h-0.5 w-full bg-gray-200" />
                  </div>
                  <div className="group relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-300 bg-white dark:bg-gray-800" />
                </>
              )}
              {/* --- ADDED centering classes --- */}
              <div className="absolute top-10 w-max -translate-x-1/2 left-1/2 px-1">
                <p
                  className={cn(
                    "text-sm font-medium text-center", // Added text-center
                    isCurrent ? "text-blue-600" : "text-gray-500"
                  )}
                >
                  {step}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default function MakeBookingPage() {
  const { step, bookingDetails, createdBooking } = useBookingStore(); // Get details needed for conditional render

  const renderStep = () => {
    switch (step) {
      case 1:
        return <Step1_SelectRoom />;
      case 2:
        return <Step2_GuestDetails />;
      case 3:
        return <Step3_ConfirmBooking />;
      // --- UPDATED: Conditional rendering for Step 4 ---
      case 4: {
        // Prefer bookingDetails if available (updated via API), else fallback to createdBooking
        const paymentMethod =
          bookingDetails?.payment_method || createdBooking?.payment_method;

        if (paymentMethod === "Mobile") {
          return <Step4_MobilePayment />;
        } else if (paymentMethod === "Cash") {
          // --- FIX: Return Step4_ReceivePayment for Cash ---
          return <Step4_ReceivePayment />;
        } else {
          // Fallback or loading state if payment method is unknown/loading
          console.warn("Payment method unknown in Step 4, showing loader.");
          return (
            <div className="flex justify-center py-20">
              <Loader2 className="h-10 w-10 animate-spin" />
            </div>
          );
        }
      }
      case 5:
        return <Step5_CheckInAndFinish />;
      default:
        return <Step1_SelectRoom />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-[#101828]">
      {/* --- Header --- */}
      <div className="bg-white/80 dark:bg-[#101828]/80 backdrop-blur-sm border-b border-gray-200 dark:border-[#1D2939] sticky top-[60px] z-30">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 py-6">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-[#D0D5DD]">
                Create New Booking
              </h1>
              <p className="text-gray-600 dark:text-[#98A2B3]">
                Follow the steps to create a new physical booking for a guest.
              </p>
            </div>
          </div>
        </div>
      </div>
      <main className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* --- Stepper --- */}
        <div className="bg-transparent shadow-none p-6 border-transparent mb-12 pt-16">
          <BookingStepper currentStep={step} />
        </div>
        {/* --- Step Content --- */}
        <div className="bg-transparent dark:bg-transparent rounded-lg">
          {renderStep()}
        </div>
      </main>
    </div>
  );
}
