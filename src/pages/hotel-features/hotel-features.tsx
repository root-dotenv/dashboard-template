// --- src/pages/hotel/hotel-features-layout.tsx ---
"use client";
import { useState, type JSX } from "react";
import HotelFacilities from "./hotel-facilities";
import HotelServices from "./hotel-services";
import HotelMealTypes from "./hotel-meals";
import HotelAmenities from "./hotel-amenities";
import HotelTranslations from "./hotel-translations";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { FaConciergeBell, FaStar } from "react-icons/fa";
import { BsGridFill } from "react-icons/bs";
import { GiMeal } from "react-icons/gi";
import { MdGTranslate } from "react-icons/md";

type FeatureView =
  | "amenities"
  | "facilities"
  | "services"
  | "mealTypes"
  | "translations";

interface NavItem {
  id: FeatureView;
  label: string;
  icon: JSX.Element;
}

export default function HotelFeaturesLayout() {
  const [activeView, setActiveView] = useState<FeatureView>("amenities");

  const navItems: NavItem[] = [
    { id: "amenities", label: "Amenities", icon: <FaStar /> },
    { id: "facilities", label: "Facilities", icon: <BsGridFill /> },
    { id: "services", label: "Services", icon: <FaConciergeBell /> },
    { id: "mealTypes", label: "Meal Types", icon: <GiMeal size={18} /> },
    {
      id: "translations",
      label: "Translations",
      icon: <MdGTranslate size={18} />,
    },
  ];

  const renderContent = () => {
    switch (activeView) {
      case "amenities":
        return <HotelAmenities />;
      case "facilities":
        return <HotelFacilities />;
      case "services":
        return <HotelServices />;
      case "mealTypes":
        return <HotelMealTypes />;
      case "translations":
        return <HotelTranslations />;
      default:
        return <HotelAmenities />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-[#101828]">
      {/* --- Page Header --- */}
      <div className="bg-white/90 dark:bg-[#101828]/90 backdrop-blur-xl border-b border-gray-200 dark:border-[#1D2939] sticky top-0 z-30 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-[#D0D5DD]">
              Hotel Features
            </h1>
            <p className="mt-2 text-gray-600 dark:text-[#98A2B3]">
              Manage all features associated with your hotel, from amenities to
              services.
            </p>
          </div>
        </div>
      </div>

      <main className="container mx-auto p-4 md:p-6 space-y-6">
        {/* --- Redesigned Horizontal Navigation --- */}
        <div className="overflow-x-auto pb-2">
          <div className="flex items-center gap-2 w-max">
            {navItems.map((item) => (
              <Button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-semibold shadow-none transition-all duration-200 flex items-center gap-2",
                  activeView === item.id
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "text-[#1D2939] border border-gray-200 bg-white hover:bg-gray-100 dark:text-[#98A2B3] dark:hover:bg-[#1C2433] dark:bg-[#171F2F] dark:border-[#1D2939]"
                )}
              >
                {item.icon}
                {item.label}
              </Button>
            ))}
          </div>
        </div>

        {/* --- Content Area --- */}
        <div className="min-w-0">{renderContent()}</div>
      </main>
    </div>
  );
}
