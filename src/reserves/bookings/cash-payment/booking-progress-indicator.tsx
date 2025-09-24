// - - - src/pages/bookings/cash-payment/booking-progress-indicator.tsx
import React from "react";
import { cn } from "@/lib/utils";
import { Search, User, Receipt, Wallet, CheckCircle } from "lucide-react";

type Step = "search" | "details" | "billing" | "payment" | "confirmation";

interface BookingProgressIndicatorProps {
  currentStep: Step;
  className?: string;
}

const steps = [
  {
    id: "search" as const,
    title: "Search Rooms",
    icon: Search,
    description: "Find available rooms",
  },
  {
    id: "details" as const,
    title: "Guest Details",
    icon: User,
    description: "Enter guest information",
  },
  {
    id: "billing" as const,
    title: "Review Booking",
    icon: Receipt,
    description: "Confirm booking details",
  },
  {
    id: "payment" as const,
    title: "Payment",
    icon: Wallet,
    description: "Process cash payment",
  },
  {
    id: "confirmation" as const,
    title: "Check-in",
    icon: CheckCircle,
    description: "Complete check-in",
  },
];

const stepOrder: Record<Step, number> = {
  search: 0,
  details: 1,
  billing: 2,
  payment: 3,
  confirmation: 4,
};

export const BookingProgressIndicator: React.FC<
  BookingProgressIndicatorProps
> = ({ currentStep, className }) => {
  const currentStepIndex = stepOrder[currentStep];

  return (
    <div className={cn("w-full bg-[#FFF] px-0 py-6", className)}>
      <div className="max-w-4xl mx-auto px-0">
        <div className="flex items-start justify-between relative">
          {/* Background Connector Line */}
          <div className="absolute top-5 left-0 w-full h-0.5 bg-gray-300" />
          <div
            className="absolute top-5 left-0 h-0.5 bg-green-500 transition-all duration-500 ease-in-out"
            style={{
              width: `${(currentStepIndex / (steps.length - 1)) * 100}%`,
            }}
          />

          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentStepIndex;
            const isCompleted = index < currentStepIndex;
            const isUpcoming = index > currentStepIndex;

            return (
              <div
                key={step.id}
                className="flex flex-col items-center relative z-10 w-24"
              >
                {/* Step Circle */}
                <div
                  className={cn(
                    "w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-300",
                    isActive &&
                      "bg-[#0081FB] border-[#0081FB] text-white shadow scale-110",
                    isCompleted && "bg-green-500 border-green-500 text-white",
                    isUpcoming && "bg-white border-gray-300 text-gray-400"
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>

                {/* Step Label */}
                <div className="mt-2 text-center">
                  <p
                    className={cn(
                      "text-sm font-semibold transition-colors duration-300",
                      isActive && "text-[#0081FB]",
                      isCompleted && "text-green-500",
                      isUpcoming && "text-gray-500"
                    )}
                  >
                    {step.title}
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
