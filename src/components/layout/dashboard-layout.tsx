// src/components/layout/dashboard-layout.tsx
import { AppSidebar } from "@/components/layout/app-sidebar";
import { TopNavigationBar } from "@/components/layout/top-navigation-bar";
import { Outlet } from "react-router-dom";
import { CommandSearch } from "@/components/custom/command-search"; // Import the component
import { HotelProvider } from "@/providers/hotel-provider"; // --- 1. Import the HotelProvider ---

export default function DashboardLayout() {
  return (
    <>
      <HotelProvider>
        <div className="flex h-screen w-full flex-col bg-white dark:bg-[#101828]">
          {/* Top Navigation Bar is now the first element and will span full width */}
          <TopNavigationBar />

          {/* This new container holds the sidebar and main content side-by-side */}
          <div className="flex flex-1 overflow-hidden">
            <AppSidebar />
            <main className="flex-1 overflow-y-auto p-0">
              <Outlet />
            </main>
          </div>
        </div>
        {/* Add the CommandSearch component here, outside the main layout flow */}
        <CommandSearch />
      </HotelProvider>
    </>
  );
}
