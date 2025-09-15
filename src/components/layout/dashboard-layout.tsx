// src/components/layout/dashboard-layout.tsx
import React from "react";
import { AppSidebar } from "@/components/layout/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Outlet, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import { ThemeToggle } from "@/components/custom/theme-toggle";
import { Notifications } from "@/components/custom/notifications";
import { QuickActionsModal } from "@/components/custom/quick-actions-modal";
import { useBreadcrumbs } from "@/hooks/use-breadcrumbs";

export default function DashboardLayout() {
  const breadcrumbs = useBreadcrumbs();

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex flex-col h-screen">
        {/* Top Navigation Bar */}
        <header className="sticky m-0 rounded-none top-0 z-10 bg-none">
          <div className="flex h-16 items-center justify-between px-4">
            {/* Left side - Breadcrumbs and sidebar toggle */}
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="mr-2 data-[orientation=vertical]:h-4"
              />
              <Breadcrumb>
                <BreadcrumbList>
                  {breadcrumbs.map((crumb, index) => (
                    <React.Fragment key={index}>
                      <BreadcrumbItem className="hidden md:flex items-center">
                        {index === breadcrumbs.length - 1 ? (
                          <BreadcrumbPage>{crumb.title}</BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink asChild>
                            <Link to={crumb.url}>{crumb.title}</Link>
                          </BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                      {index < breadcrumbs.length - 1 && (
                        <BreadcrumbSeparator className="hidden md:block" />
                      )}
                    </React.Fragment>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>
            </div>

            {/* Right side - Navigation items */}
            <div className="flex items-center justify-between gap-4">
              {/* - - - Calendar Modal */}
              {/* Search Command */}
              <div className="h-full flex items-center gap-x-1.5">
                <QuickActionsModal /> {/* <-- Replace the old button */}
                <ThemeToggle />
                <Button variant="ghost" size="icon">
                  <Mail className="h-5 w-5" />
                </Button>
                <Notifications />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="flex flex-col gap-4 p-4 pt-0">
            <Outlet />
            {/* - - - Hotel Details Sheet */}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
