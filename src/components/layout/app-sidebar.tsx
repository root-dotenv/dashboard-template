// src/components/layout/app-sidebar.tsx
import { Link } from "react-router-dom";
import { ChevronRight, GanttChartSquare } from "lucide-react";
import { useSidebarStore } from "@/store/sidebar-store";
import { navData } from "@/lib/nav-data";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// A new, simplified NavItem component for the new design
const NavItem = ({ item, isCollapsed }: any) => {
  return (
    <Link
      to={item.url}
      className="flex items-center justify-between p-2 rounded-lg text-gray-600 hover:bg-gray-100"
    >
      <div className="flex items-center gap-3">
        <item.icon className="h-5 w-5" />
        {!isCollapsed && (
          <span className="text-sm font-medium">{item.title}</span>
        )}
      </div>
      {!isCollapsed && item.items && <ChevronRight className="h-4 w-4" />}
      {!isCollapsed && item.tag && (
        <span className="text-xs bg-blue-100 text-blue-600 font-semibold px-2 py-0.5 rounded-md">
          {item.tag}
        </span>
      )}
    </Link>
  );
};

export function AppSidebar() {
  const { isCollapsed } = useSidebarStore();

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col h-screen bg-white border-r transition-all duration-300",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-3 h-16 border-b px-6">
        <GanttChartSquare className="h-7 w-7 text-blue-600" />
        {!isCollapsed && <h1 className="text-lg font-bold">SafariPro</h1>}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 p-4">
        <div>
          <h2
            className={cn(
              "px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider",
              isCollapsed && "text-center"
            )}
          >
            {isCollapsed ? "M" : "Menu"}
          </h2>
          <div className="mt-2 space-y-1">
            {navData.navMain.map((item) => (
              <NavItem key={item.title} item={item} isCollapsed={isCollapsed} />
            ))}
          </div>
        </div>
        <div className="pt-4">
          <h2
            className={cn(
              "px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider",
              isCollapsed && "text-center"
            )}
          >
            {isCollapsed ? "S" : "Support"}
          </h2>
          <div className="mt-2 space-y-1">
            {navData.supportLinks.map((item) => (
              <NavItem key={item.title} item={item} isCollapsed={isCollapsed} />
            ))}
          </div>
        </div>
      </nav>

      {/* Footer CTA */}
      {!isCollapsed && (
        <div className="mt-auto p-4">
          <div className="p-4 rounded-lg bg-gray-50 text-center">
            <h3 className="font-bold text-sm">#1 Tailwind CSS Dashboard</h3>
            <p className="text-xs text-gray-500 mt-1">
              Leading Tailwind CSS Admin Template...
            </p>
            <Button
              size="sm"
              className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
            >
              Purchase Plan
            </Button>
          </div>
        </div>
      )}
    </aside>
  );
}
