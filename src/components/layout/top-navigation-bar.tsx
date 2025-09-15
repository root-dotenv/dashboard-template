// src/components/layout/top-navigation-bar.tsx
import { Search, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Notifications } from "@/components/custom/notifications";
import { NavUser } from "@/components/layout/nav-user";
import { navData } from "@/lib/nav-data";
import { useSidebarStore } from "@/store/sidebar-store";
import { useTheme } from "@/providers/theme-provider";
import { TbLayoutSidebarLeftCollapse } from "react-icons/tb";

export function TopNavigationBar() {
  const { toggleSidebar } = useSidebarStore();
  const { theme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-[#FFF] px-4 md:px-6">
      {/* Left Side: Sidebar Toggle and Search */}
      <div className="flex items-center gap-4">
        <button onClick={toggleSidebar} className="p-2">
          <TbLayoutSidebarLeftCollapse className="h-5 w-5" />
          <span className="sr-only">Toggle Sidebar</span>
        </button>
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <button className="flex h-9 w-full items-center justify-between rounded-md border bg-background px-3 py-2 pl-9 text-sm text-muted-foreground ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-w-[250px] lg:min-w-[400px]">
            <span>Search or type command...</span>
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
              <span className="text-xs">⌘</span>K
            </kbd>
          </button>
        </div>
      </div>

      {/* Right Side: Actions */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
          <span className="sr-only">Toggle Theme</span>
        </Button>
        <Notifications />
        <NavUser user={navData.user} />
      </div>
    </header>
  );
}
