// src/components/layout/top-navigation-bar.tsx
import { Search, Moon, Sun, ChevronDown, BellIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Notifications } from "@/components/custom/notifications";
import { navData } from "@/lib/nav-data";
import { useSidebarStore } from "@/store/sidebar-store";
import { useTheme } from "@/providers/theme-provider";
import { TbLayoutSidebarLeftCollapse } from "react-icons/tb";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserMenuItems } from "./user-menu-items";

export function TopNavigationBar() {
  const { toggleSidebar } = useSidebarStore();
  const { theme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-[#FFF] px-4 md:px-6 dark:bg-gray-900 dark:border-gray-700">
      {/* Left Side: Sidebar Toggle and Search */}
      <div className="flex items-center gap-4">
        <button onClick={toggleSidebar} className="p-2">
          <TbLayoutSidebarLeftCollapse className="h-5 w-5 dark:text-gray-300" />
          <span className="sr-only">Toggle Sidebar</span>
        </button>
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <button className="flex h-9 w-full items-center justify-between rounded-md border bg-background px-3 py-2 pl-9 text-sm text-muted-foreground ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-w-[250px] lg:min-w-[400px] dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:placeholder:text-gray-500">
            <span>Search or type command...</span>
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100 dark:bg-gray-700 dark:text-gray-400">
              <span className="text-xs">⌘</span>K
            </kbd>
          </button>
        </div>
      </div>

      {/* Right Side: Actions (Redesigned) */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Theme Toggle Button */}
        <Button
          variant="ghost"
          size="icon"
          className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[#E4E7EC] bg-white text-gray-700  hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
          <span className="sr-only">Toggle Theme</span>
        </Button>

        {/* Notifications Button */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[#E4E7EC] bg-[#FFF] text-gray-700  hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <BellIcon className="h-5 w-5" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-orange-500" />
              <span className="sr-only">View notifications</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-80 p-0" align="end" sideOffset={8}>
            <Notifications />
          </DropdownMenuContent>
        </DropdownMenu>

        {/* NavUser with Pill Design */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div
              role="button"
              className="group flex cursor-pointer items-center gap-2 rounded-full border border-gray-200 p-[5px] pr-3 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={navData.user.avatar}
                  alt={navData.user.name}
                />
                <AvatarFallback className="text-[#344054] bg-[#F2F4F7]">
                  {navData.user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span className="hidden text-sm font-semibold text-gray-900 dark:text-white md:block">
                {navData.user.name}
              </span>
              <ChevronDown className="hidden h-4 w-4 text-gray-500 transition-transform duration-200 group-data-[state=open]:rotate-180 dark:text-gray-400 md:block" />
              <span className="sr-only">Toggle user menu</span>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-56 rounded-lg"
            align="end"
            sideOffset={8}
          >
            <UserMenuItems user={navData.user} />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
