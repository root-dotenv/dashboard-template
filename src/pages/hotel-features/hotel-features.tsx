// // --- src/pages/hotel/hotel-features-layout.tsx ---
// "use client";
// import { useState, type JSX } from "react";
// import HotelFacilities from "./hotel-facilities";
// import HotelServices from "./hotel-services";
// import HotelMealTypes from "./hotel-meals";
// import HotelAmenities from "./hotel-amenities";
// import HotelTranslations from "./hotel-translations";
// import { cn } from "@/lib/utils";
// import { Circle } from "lucide-react";

// type FeatureView =
//   | "amenities"
//   | "facilities"
//   | "services"
//   | "mealTypes"
//   | "translations";

// interface NavItem {
//   id: FeatureView;
//   label: string;
//   icon: JSX.Element;
// }

// export default function HotelFeaturesLayout() {
//   const [activeView, setActiveView] = useState<FeatureView>("amenities");

//   const navItems: NavItem[] = [
//     { id: "amenities", label: "Amenities", icon: <Circle size={8} /> },
//     { id: "facilities", label: "Facilities", icon: <Circle size={8} /> },
//     { id: "services", label: "Services", icon: <Circle size={8} /> },
//     { id: "mealTypes", label: "Meal Types", icon: <Circle size={8} /> },
//     {
//       id: "translations",
//       label: "Translations",
//       icon: <Circle size={8} />,
//     },
//   ];

//   const renderContent = () => {
//     switch (activeView) {
//       case "amenities":
//         return <HotelAmenities />;
//       case "facilities":
//         return <HotelFacilities />;
//       case "services":
//         return <HotelServices />;
//       case "mealTypes":
//         return <HotelMealTypes />;
//       case "translations":
//         return <HotelTranslations />;
//       default:
//         return <HotelAmenities />;
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 dark:bg-[#101828]">
//       <div className="bg-white/90 dark:bg-[#101828]/90 backdrop-blur-xl border-b border-gray-200 dark:border-[#1D2939] sticky top-0 z-30 shadow-xs">
//         <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="py-8">
//             <h1 className="text-3xl font-bold text-gray-900 dark:text-[#D0D5DD]">
//               Hotel Features
//             </h1>
//             <p className="mt-2 text-gray-600 dark:text-[#98A2B3]">
//               Manage all features associated with your hotel, from amenities to
//               services.
//             </p>
//           </div>
//         </div>
//       </div>

//       <main className="max-w-8xl mx-auto p-4 md:p-6">
//         <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
//           {/* Left Side Navigation */}
//           <aside className="w-full md:w-60 lg:w-64 flex-shrink-0">
//             <nav className="space-y-1.5 sticky top-40 bg-[#FFF] border border-[#E4E7EC] p-4 rounded-lg">
//               {navItems.map((item) => (
//                 <button
//                   key={item.id}
//                   onClick={() => setActiveView(item.id)}
//                   className={cn(
//                     "w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm font-medium rounded-lg transition-colors",
//                     activeView === item.id
//                       ? "bg-blue-600 text-white shadow-xs"
//                       : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-100"
//                   )}
//                 >
//                   <div className="w-5 h-5 flex items-center justify-center">
//                     {item.icon}
//                   </div>
//                   {item.label}
//                 </button>
//               ))}
//             </nav>
//           </aside>

//           {/* Right Content Area */}
//           <div className="flex-1 min-w-0">{renderContent()}</div>
//         </div>
//       </main>
//     </div>
//   );
// }

// --- src/pages/hotel/hotel-features-layout.tsx ---
"use client";
import { useState, type JSX } from "react";
import HotelFacilities from "./hotel-facilities";
import HotelServices from "./hotel-services";
import HotelMealTypes from "./hotel-meals";
import HotelAmenities from "./hotel-amenities";
import HotelTranslations from "./hotel-translations";
import { cn } from "@/lib/utils";
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
    <div className="min-h-screen bg-gray-50 dark:bg-[#101828]">
      <div className="bg-white/90 dark:bg-[#101828]/90 backdrop-blur-xl border-b border-gray-200 dark:border-[#1D2939] sticky top-0 z-30 shadow-sm">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
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

      <main className="max-w-8xl mx-auto p-4 md:p-6">
        <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
          {/* Left Side Navigation */}
          <aside className="w-full md:w-60 lg:w-64 flex-shrink-0">
            <nav className="space-y-1.5 sticky top-36 bg-white dark:bg-[#171F2F] border border-gray-200 dark:border-[#1D2939] p-3 rounded-xl shadow-sm">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm font-medium rounded-lg transition-colors",
                    activeView === item.id
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-100"
                  )}
                >
                  <div className="w-5 h-5 flex items-center justify-center">
                    {item.icon}
                  </div>
                  {item.label}
                </button>
              ))}
            </nav>
          </aside>

          {/* Right Content Area */}
          <div className="flex-1 min-w-0">{renderContent()}</div>
        </div>
      </main>
    </div>
  );
}
