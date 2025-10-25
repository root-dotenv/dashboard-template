// src/pages/bookings/make-booking.tsx
"use client";
import { useBookingStore } from "@/store/booking.store";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { Loader2 } from "lucide-react";
import Step1_SelectRoom from "./Step1_SelectRoom";
import Step2_GuestDetails from "./Step2_GuestDetails";
import Step3_ConfirmBooking from "./Step3_ConfirmBooking";
import Step4_MobilePayment from "./Step4_MobilePayment";
import Step4_ReceivePayment from "./Step4_ReceivePayment copy";
import Step5_CheckInAndFinish from "./Step5_CheckInAndFinish";

// Enhanced Professional Stepper UI Component
const BookingStepper = ({ currentStep }: { currentStep: number }) => {
  const steps = [
    { number: 1, label: "Select Room", description: "Choose accommodation" },
    { number: 2, label: "Guest Details", description: "Personal information" },
    { number: 3, label: "Confirmation", description: "Review booking" },
    { number: 4, label: "Payment", description: "Secure payment" },
    { number: 5, label: "Check-In", description: "Complete process" },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="relative">
        {/* Progress Line */}
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 dark:bg-gray-700 -z-10">
          <div
            className="h-full bg-blue-600 transition-all duration-500 ease-in-out"
            style={{
              width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
            }}
          />
        </div>

        <div className="flex justify-between">
          {steps.map((step, index) => {
            const isCompleted = currentStep > step.number;
            const isCurrent = currentStep === step.number;
            const isUpcoming = currentStep < step.number;

            return (
              <div
                key={step.number}
                className="flex flex-col items-center flex-1"
              >
                {/* Step Circle */}
                <div
                  className={cn(
                    "relative flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300 mb-3",
                    isCompleted && "bg-blue-600 border-blue-600",
                    isCurrent &&
                      "border-blue-600 bg-white dark:bg-gray-800 shadow-lg scale-110",
                    isUpcoming &&
                      "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4 text-white" />
                  ) : (
                    <span
                      className={cn(
                        "text-sm font-semibold",
                        isCurrent && "text-blue-600",
                        isUpcoming && "text-gray-400"
                      )}
                    >
                      {step.number}
                    </span>
                  )}

                  {/* Active Pulse Animation */}
                  {isCurrent && (
                    <div className="absolute inset-0 rounded-full bg-blue-600 animate-ping opacity-20" />
                  )}
                </div>

                {/* Step Labels */}
                <div className="text-center px-2">
                  <p
                    className={cn(
                      "text-sm font-semibold mb-1",
                      isCompleted || isCurrent
                        ? "text-gray-900 dark:text-white"
                        : "text-gray-500 dark:text-gray-400"
                    )}
                  >
                    {step.label}
                  </p>
                  <p
                    className={cn(
                      "text-xs hidden sm:block",
                      isCompleted || isCurrent
                        ? "text-gray-600 dark:text-gray-300"
                        : "text-gray-400 dark:text-gray-500"
                    )}
                  >
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Enhanced Header Component
const BookingHeader = ({ currentStep }: { currentStep: number }) => {
  const stepTitles = {
    1: "Select Your Accommodation",
    2: "Guest Information",
    3: "Confirm Your Booking",
    4: "Secure Payment",
    5: "Check-In Completion",
  };

  const stepDescriptions = {
    1: "Choose from our available rooms and suites for your stay",
    2: "Provide guest details for a seamless booking experience",
    3: "Review and confirm your booking details",
    4: "Complete your payment securely",
    5: "Finalize your check-in process",
  };

  return (
    <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-blue-100 text-sm mb-4">
            <span>Bookings</span>
            <span className="text-blue-200">/</span>
            <span className="text-white font-medium">New Booking</span>
          </nav>

          {/* Main Header */}
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between">
            <div className="flex-1">
              <h1 className="text-3xl lg:text-4xl font-bold mb-3">
                {stepTitles[currentStep as keyof typeof stepTitles]}
              </h1>
              <p className="text-blue-100 text-lg max-w-2xl">
                {stepDescriptions[currentStep as keyof typeof stepDescriptions]}
              </p>
            </div>

            {/* Step Indicator */}
            <div className="mt-4 lg:mt-0 lg:text-right">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
                <span className="text-blue-100 text-sm mr-2">Step</span>
                <span className="text-white font-bold text-lg">
                  {currentStep}
                </span>
                <span className="text-blue-200 mx-2">of</span>
                <span className="text-white font-bold text-lg">5</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function MakeBookingPage() {
  const { step, bookingDetails, createdBooking } = useBookingStore();

  const renderStep = () => {
    switch (step) {
      case 1:
        return <Step1_SelectRoom />;
      case 2:
        return <Step2_GuestDetails />;
      case 3:
        return <Step3_ConfirmBooking />;
      case 4: {
        const paymentMethod =
          bookingDetails?.payment_method || createdBooking?.payment_method;

        if (paymentMethod === "Mobile") {
          return <Step4_MobilePayment />;
        } else if (paymentMethod === "Cash") {
          return <Step4_ReceivePayment />;
        } else {
          return (
            <div className="flex justify-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Enhanced Header with Gradient */}
      <BookingHeader currentStep={step} />

      {/* Main Content */}
      <main className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        {/* Stepper Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 mb-8 p-8">
          <BookingStepper currentStep={step} />
        </div>

        {/* Step Content */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {renderStep()}
        </div>

        {/* Assistance Section */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Need assistance?{" "}
            <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium underline">
              Contact our support team
            </button>
          </p>
        </div>
      </main>
    </div>
  );
}
