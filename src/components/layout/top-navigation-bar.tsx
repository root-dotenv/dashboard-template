// src/components/layout/top-navigation-bar.tsx
import { Search, ChevronDown, BellIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Notifications } from "@/components/custom/notifications";
import { navData } from "@/lib/nav-data";
import { useSidebarStore } from "@/store/sidebar-store";
import { TbLayoutSidebarLeftCollapse } from "react-icons/tb";
import { BiCog } from "react-icons/bi";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserMenuItems } from "./user-menu-items";
import { ThemeToggle } from "../custom/theme-toggle";

export function TopNavigationBar() {
  const { toggleSidebar } = useSidebarStore();

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b shadow-md bg-[#FFF] px-4 md:px-6 dark:bg-[#101828] dark:border-[#1D2939]">
      <div className="flex items-center gap-4">
        <button onClick={toggleSidebar} className="p-2">
          <TbLayoutSidebarLeftCollapse className="h-5 w-5 text-gray-500 dark:text-[#D0D5DD]" />
          <span className="sr-only">Toggle Sidebar</span>
        </button>
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground dark:text-[#98A2B3]" />
          <button className="flex h-9 w-full items-center justify-between rounded-md border bg-background px-3 py-2 pl-9 text-sm text-muted-foreground ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-w-[250px] lg:min-w-[400px] dark:bg-[#171F2F] dark:border-[#1D2939] dark:text-[#D0D5DD] dark:placeholder:text-[#5D636E]">
            <span>Search or type command...</span>
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100 dark:bg-[#101828] dark:border-[#1D2939] dark:text-[#98A2B3]">
              <span className="text-xs">⌘</span>K
            </kbd>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        {/* --- NEW Theme Toggle Switch --- */}
        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[#E4E7EC] bg-[#FFF] text-gray-700 hover:bg-gray-50 dark:bg-[#171F2F] dark:border-[#1D2939] dark:text-[#D0D5DD] dark:hover:bg-[#1C2433]"
            >
              <BellIcon className="h-5 w-5" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-orange-500" />
              <span className="sr-only">View notifications</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-80 p-0 dark:bg-[#101828] dark:border-[#1D2939]"
            align="end"
            sideOffset={8}
          >
            <Notifications />
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="ghost"
          size="icon"
          className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[#E4E7EC] bg-white text-gray-700 hover:bg-gray-50 dark:bg-[#171F2F] dark:border-[#1D2939] dark:text-[#D0D5DD] dark:hover:bg-[#1C2433]"
        >
          <BiCog className="h-5 w-5" />
          <span className="sr-only">Settings</span>
        </Button>

        <Separator orientation="vertical" className="h-6 dark:bg-[#1D2939]" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div
              role="button"
              className="group flex cursor-pointer items-center gap-2 rounded-full border border-gray-200 p-[5px] pr-3 transition-colors hover:bg-gray-100 dark:border-[#1D2939] dark:hover:bg-[#1C2433]"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={navData.user.avatar}
                  alt={navData.user.name}
                />
                <AvatarFallback className="text-[#344054] bg-[#F2F4F7] dark:bg-[#171F2F] dark:text-[#D0D5DD]">
                  {navData.user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span className="hidden text-sm font-semibold text-gray-900 dark:text-[#D0D5DD] md:block">
                {navData.user.name}
              </span>
              <ChevronDown className="hidden h-4 w-4 text-gray-500 transition-transform duration-200 group-data-[state=open]:rotate-180 dark:text-[#98A2B3] md:block" />
              <span className="sr-only">Toggle user menu</span>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-56 rounded-lg dark:bg-[#101828] dark:border-[#1D2939]"
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
