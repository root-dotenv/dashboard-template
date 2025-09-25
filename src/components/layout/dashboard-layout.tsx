// src/components/layout/dashboard-layout.tsx
import { AppSidebar } from "@/components/layout/app-sidebar";
import { TopNavigationBar } from "@/components/layout/top-navigation-bar";
import { Outlet } from "react-router-dom";

export default function DashboardLayout() {
  return (
    // Updated dark mode styles for the main wrapper
    <div
      className="flex h-screen max-h-screen w-full sticky top-0
    left-0 bg-white dark:bg-[#101828] "
    >
      <AppSidebar />
      {/* Updated dark mode styles for the content area */}
      <div className="flex flex-1 flex-col bg-[#FFF] dark:bg-[#101828]">
        <TopNavigationBar />
        <main className="flex-1 overflow-y-auto overflow-x-scroll p-0 md:p-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
