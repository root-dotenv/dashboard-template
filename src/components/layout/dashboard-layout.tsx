// src/components/layout/dashboard-layout.tsx
import { AppSidebar } from "@/components/layout/app-sidebar";
import { TopNavigationBar } from "@/components/layout/top-navigation-bar";
import { Outlet } from "react-router-dom";

export default function DashboardLayout() {
  return (
    <div className="flex min-h-screen w-full bg-white">
      <AppSidebar />
      <div className="flex flex-1 flex-col bg-[#F9FAFB]">
        <TopNavigationBar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
