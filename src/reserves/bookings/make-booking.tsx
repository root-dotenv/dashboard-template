// - - - src/pages/bookings/make-booking.tsx
"use client";
import { useState } from "react";
import { Wallet, Smartphone } from "lucide-react";
import CashBooking from "./cash-booking";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Define the type for the selection
type PaymentSelection = "cash" | "mobile" | null;

// Array of partner logos with descriptions for tooltips
const partners = [
  {
    src: "/images/MPESA.png",
    alt: "M-Pesa",
    desc: "Safaricom M-Pesa, mobile money service.",
  },
  {
    src: "/images/airtel_tanzania.png",
    alt: "Airtel Money",
    desc: "Airtel Money payments.",
  },
  {
    src: "/images/AZAM_PESA.png",
    alt: "Azam Pesa",
    desc: "Convenient payments with Azam Pesa.",
  },
  {
    src: "/images/MIXX.png",
    alt: "YAS",
    desc: "YAS Payment Solutions.",
  },
  {
    src: "/images/NMB_BANK.png",
    alt: "NMB",
    desc: "Pay directly with NMB Bank.",
  },
];

export default function MakeBooking() {
  const [selection, setSelection] = useState<PaymentSelection>(null);

  if (selection === "cash") {
    return <CashBooking />;
  }

  // TODO: Uncomment this section and include the Mobile-Payment Booking Component
  // if (selection === "mobile") {
  //   return <MobileBooking />;
  // }

  return (
    <>
      <div className="max-w-4xl mx-auto p-6 md:p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Create a New Booking
          </h1>
          <p className="text-gray-600 text-lg">
            How would you like to pay for your booking?
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card for Cash Payment */}
          <Card
            onClick={() => setSelection("cash")}
            className="border-[#DADCE0] bg-[#FFF] border-[1.5px] rounded-md shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
          >
            <CardHeader className="flex items-center justify-center">
              <div className="relative w-fit rounded-full text-[#274777] font-medium text-[1rem] bg-gradient-to-t from-[#FFFFFF] to-[#ECF5FF] border border-[#DDDFEB] px-3 py-3 shadow-[0px_2px_4px_0px_#D4DEE966]">
                <Wallet className="h-6 w-6 text-[#0081FB]" />
              </div>
            </CardHeader>
            <CardContent className="text-center">
              <CardTitle className="text-xl font-semibold text-gray-800 mb-3">
                Pay with Cash
              </CardTitle>
              <CardDescription className="text-gray-600 text-[1rem]">
                Complete the booking now and pay with cash upon arrival at the
                front desk. Ideal for walk-in guests or staff-assisted bookings.
              </CardDescription>
            </CardContent>
          </Card>

          {/* Card for Mobile Payment with Tooltip */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Card className="border-[#DADCE0] bg-gray-50 border-[1.5px] rounded-md shadow-sm cursor-not-allowed opacity-70">
                  <CardHeader className="flex items-center justify-center">
                    <div className="relative w-fit rounded-full text-[#274777] font-medium text-[1rem] bg-gradient-to-t from-[#FFFFFF] to-[#ECF5FF] border border-[#DDDFEB] px-3 py-3 shadow-[0px_2px_4px_0px_#D4DEE966]">
                      <Smartphone className="h-6 w-6 text-orange-500" />
                    </div>
                  </CardHeader>
                  <CardContent className="text-center">
                    <CardTitle className="text-xl font-semibold text-gray-800 mb-3">
                      Pay with Mobile
                    </CardTitle>
                    <CardDescription className="text-gray-600 text-[1rem]">
                      Pay securely now using your mobile money provider (e.g.
                      M-Pesa, Tigo Pesa). Ideal for online or remote bookings.
                    </CardDescription>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent className="border-[1.125px] border-[#DADCE0] bg-gray-800 text-white shadow">
                <p className="text-[0.9375rem] font-medium">
                  Payments via mobile payment is currently under integration,
                  please proceed to pay with Cash.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* - - - - - Mobile Payments Partners (Scrolling Marquee with Tooltips) - - - - - */}
      <div className="w-full max-w-6xl mx-auto px-6 py-8 overflow-hidden">
        <div className="text-center mb-6">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
            Our Trusted Mobile Payment Partners
          </h3>
        </div>
        <TooltipProvider>
          <div className="w-full h-24">
            <div className="w-full h-full flex items-center gap-x-6 animate-scroll">
              {partners.map((partner, index) => (
                <Tooltip key={index}>
                  <TooltipTrigger asChild>
                    <div className="w-108 bg-[#FFF] border-[1.5px] shadow rounded-md border-[#DADCE0] h-full flex items-center justify-center gap-x-[1rem] cursor-pointer">
                      <img
                        src={partner.src}
                        alt={partner.alt}
                        className="max-h-12 object-contai grayscale-0 transition-all duration-300"
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="bg-gray-800 text-white border-none rounded-md shadow-lg">
                    <p>{partner.desc}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </div>
        </TooltipProvider>
      </div>
    </>
  );
}
