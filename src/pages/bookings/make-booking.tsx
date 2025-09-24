// src/pages/bookings/make-booking.tsx
"use client";

import { useBookingStore } from "@/store/booking.store";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

// Replacing placeholders with the actual, functional components
import Step1_SelectRoom from "./Step1_SelectRoom";
import Step2_GuestDetails from "./Step2_GuestDetails";
import Step3_ConfirmBooking from "./Step3_ConfirmBooking";
import Step4_ReceivePayment from "./Step4_ReceivePayment";
import Step5_CheckInAndFinish from "./Step5_CheckInAndFinish";

// Stepper UI Component
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
      <ol
        role="list"
        className="flex items-center border border-gray-200 dark:border-gray-700 rounded-md divide-y divide-gray-200 dark:divide-gray-700 md:divide-y-0 md:divide-x"
      >
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = currentStep > stepNumber;
          const isCurrent = currentStep === stepNumber;

          return (
            <li key={step} className="relative flex-1 flex">
              <div
                className={cn(
                  "group flex items-center w-full transition-colors",
                  isCurrent || isCompleted ? "cursor-pointer" : "cursor-default"
                )}
              >
                <span className="px-6 py-4 flex items-center text-sm font-medium">
                  <span
                    className={cn(
                      "flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full",
                      isCompleted
                        ? "bg-blue-600"
                        : isCurrent
                        ? "border-2 border-blue-600 bg-white dark:bg-gray-800"
                        : "border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                    )}
                  >
                    {isCompleted ? (
                      <Check className="w-6 h-6 text-white" />
                    ) : (
                      <span
                        className={cn(
                          "text-gray-500",
                          isCurrent && "text-blue-600"
                        )}
                      >
                        0{stepNumber}
                      </span>
                    )}
                  </span>
                  <span
                    className={cn(
                      "ml-4 text-sm font-medium",
                      isCurrent
                        ? "text-blue-600"
                        : "text-gray-500 dark:text-gray-400"
                    )}
                  >
                    {step}
                  </span>
                </span>
              </div>

              {index !== steps.length - 1 ? (
                <div
                  className="hidden md:block absolute top-0 right-0 h-full w-5"
                  aria-hidden="true"
                >
                  <svg
                    className="h-full w-full text-gray-300 dark:text-gray-600"
                    viewBox="0 0 22 80"
                    fill="none"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M0 -2L20 40L0 82"
                      vectorEffect="non-scaling-stroke"
                      stroke="currentcolor"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default function MakeBookingPage() {
  const { step } = useBookingStore();

  const renderStep = () => {
    switch (step) {
      case 1:
        return <Step1_SelectRoom />;
      case 2:
        return <Step2_GuestDetails />;
      case 3:
        return <Step3_ConfirmBooking />;
      case 4:
        return <Step4_ReceivePayment />;
      case 5:
        return <Step5_CheckInAndFinish />;
      default:
        return <Step1_SelectRoom />;
    }
  };

  return (
    <div className="flex-1 space-y-6 bg-[#F6F7FA] dark:bg-[#101828] p-6">
      <div className="bg-white dark:bg-[#171F2F] p-6 rounded-lg shadow-sm border border-gray-200 dark:border-[#1D2939]">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Create New Booking
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Follow the steps below to create a new physical booking for a guest.
        </p>
        <BookingStepper currentStep={step} />
      </div>

      <div className="bg-none min-h-screen dark:bg-[#171F2F] p-4 rounded-lg shadow-none border-none">
        {renderStep()}
      </div>
    </div>
  );
}
