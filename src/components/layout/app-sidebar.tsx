// src/components/layout/app-sidebar.tsx
import { Link, useLocation } from "react-router-dom";
import { ChevronDown, ChevronUp, MoreVertical } from "lucide-react";
import { useSidebarStore } from "@/store/sidebar-store";
import { navData } from "@/lib/nav-data";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserMenuItems } from "./user-menu-items";

const NavItem = ({
  item,
  isCollapsed,
  isOpen,
  onToggle,
}: {
  item: any;
  isCollapsed: boolean;
  isOpen: boolean;
  onToggle: () => void;
}) => {
  const location = useLocation();
  const hasChildren = item.items && item.items.length > 0;

  const isLinkActive = (url: string) => {
    return url === "/"
      ? location.pathname === "/"
      : location.pathname.startsWith(url);
  };

  const isActive = hasChildren
    ? item.items.some((child: any) => isLinkActive(child.url))
    : isLinkActive(item.url);

  if (hasChildren) {
    return (
      <Collapsible open={isOpen && !isCollapsed} onOpenChange={onToggle}>
        <CollapsibleTrigger
          disabled={isCollapsed}
          className={cn(
            "flex w-full items-center rounded-lg p-2 transition-colors duration-200",
            isCollapsed ? "justify-center" : "justify-between",
            isActive
              ? "bg-blue-50 text-blue-700 dark:bg-[#162142] dark:text-[#7592FF]"
              : "text-gray-600 hover:bg-gray-100 dark:hover:bg-[#1C2433] dark:text-[#7592FF]"
          )}
        >
          <div className="flex items-center gap-3">
            <item.icon
              className={cn(
                "h-5 w-5",
                isActive
                  ? "text-blue-600 dark:text-[#7592FF]"
                  : "text-[#344055] dark:text-[#D0D5DD]"
              )}
            />
            {!isCollapsed && (
              <span
                className={cn(
                  "text-sm font-medium",
                  !isActive && "text-[#344055] dark:text-[#D0D5DD]"
                )}
              >
                {item.title}
              </span>
            )}
          </div>
          {!isCollapsed && (
            <>
              <ChevronDown className="h-4 w-4 data-[state=open]:hidden dark:text-[#98A2B3]" />
              <ChevronUp className="h-4 w-4 hidden data-[state=open]:block dark:text-[#98A2B3]" />
            </>
          )}
        </CollapsibleTrigger>
        <CollapsibleContent className="py-1 pl-6">
          <div className="flex flex-col space-y-1">
            {item.items.map((child: any) => {
              const isChildActive = isLinkActive(child.url);
              return (
                <Link
                  key={child.title}
                  to={child.url}
                  className={cn(
                    "flex items-center gap-3 p-2 text-sm rounded-md transition-colors duration-200",
                    isChildActive
                      ? "bg-blue-50 font-medium text-blue-700 dark:bg-[#162142] dark:text-[#7592FF]"
                      : "text-[#667085] hover:bg-gray-100/50 hover:text-gray-800 dark:text-[#98A2B3] dark:hover:bg-[#1C2433]"
                  )}
                >
                  {/* --- ENHANCEMENT START --- */}
                  <child.icon
                    className={cn(
                      "h-2 w-2 border-none hover:border-none hover:bg-none",
                      isChildActive ? "fill-blue-700" : "text-[#344055]"
                    )}
                  />
                  <span>{child.title}</span>
                  {/* --- ENHANCEMENT END --- */}
                </Link>
              );
            })}
          </div>
        </CollapsibleContent>
      </Collapsible>
    );
  }

  return (
    <Link
      to={item.url}
      className={cn(
        "flex w-full items-center rounded-lg p-2 transition-colors duration-200",
        isCollapsed ? "justify-center" : "justify-between",
        isActive
          ? "bg-blue-50 text-blue-700 font-semibold dark:bg-[#162142]"
          : "text-gray-600 hover:bg-gray-100 dark:hover:bg-[#1C2433]"
      )}
    >
      <div className="flex items-center gap-3">
        <item.icon
          className={cn(
            "h-5 w-5",
            isActive
              ? "text-blue-600 dark:text-[#7592FF]"
              : "text-[#344055] dark:text-[#D0D5DD]"
          )}
        />
        {!isCollapsed && (
          <span
            className={cn(
              "text-sm font-medium",
              !isActive && "text-[#344055] dark:text-[#D0D5DD]"
            )}
          >
            {item.title}
          </span>
        )}
      </div>
    </Link>
  );
};

export function AppSidebar() {
  const { isCollapsed } = useSidebarStore();
  const location = useLocation();

  const initiallyOpenMenu =
    navData.navMain.find((item) =>
      item.items?.some((child) => location.pathname.startsWith(child.url))
    )?.title || null;

  const [openMenu, setOpenMenu] = React.useState<string | null>(
    initiallyOpenMenu
  );

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col h-screen bg-[#FFF] border-r border-[#E4E7EC] transition-all duration-300 dark:bg-[#101828] dark:border-[#1D2939]",
        isCollapsed ? "w-20" : "w-68"
      )}
    >
      <div className="flex items-center h-16 border-b px-6 dark:border-[#1D2939]">
        {!isCollapsed && (
          <h1 className="text-[20px] font-bold text-gray-900 dark:text-[#D0D5DD]">
            SafariPro Dashboard
          </h1>
        )}
      </div>
      <nav className="flex-1 space-y-2 p-4 overflow-y-auto">
        <div>
          {!isCollapsed && (
            <h2 className="px-2 text-[11px] font-medium text-gray-400 uppercase tracking-wide dark:text-[#98A2B3]">
              Main Menu
            </h2>
          )}
          <div className="mt-2 space-y-1">
            {navData.navMain.map((item) => (
              <NavItem
                key={item.title}
                item={item}
                isCollapsed={isCollapsed}
                isOpen={openMenu === item.title}
                onToggle={() =>
                  setOpenMenu(openMenu === item.title ? null : item.title)
                }
              />
            ))}
          </div>
        </div>
        <div className="pt-4">
          {!isCollapsed && (
            <h2 className="px-2 text-[11px] font-medium text-gray-400 uppercase tracking-wide dark:text-[#98A2B3]">
              Report Overview
            </h2>
          )}
          <div className="mt-2 space-y-1">
            {navData.supportLinks.map((item) => (
              <NavItem
                key={item.title}
                item={item}
                isCollapsed={isCollapsed}
                isOpen={openMenu === item.title}
                onToggle={() =>
                  setOpenMenu(openMenu === item.title ? null : item.title)
                }
              />
            ))}
          </div>
        </div>
      </nav>
      {!isCollapsed && (
        <div className="mt-auto">
          <div className="p-4">
            <div className="p-4 rounded-lg bg-[#F9FAFB] border-[0.9px] border-[#E4E7EC] text-center dark:bg-[#171F2F] dark:border-[#1D2939]">
              <h3 className="font-bold text-sm text-gray-900 dark:text-[#D0D5DD]">
                The All-in-One Platform
              </h3>
              <p className="text-xs text-gray-500 mt-1 dark:text-[#98A2B3]">
                Unlock tour management, car rentals, and unified analytics to
                streamline your business.
              </p>
              <Button
                variant={"main"}
                size="sm"
                className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
              >
                Upgrade to Pro
              </Button>
            </div>
          </div>
          <div className="p-4 border-t dark:border-[#1D2939]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={navData.user.avatar}
                    alt={navData.user.name}
                  />
                  <AvatarFallback>{navData.user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <p className="text-sm font-semibold text-gray-900 dark:text-[#D0D5DD]">
                    {navData.user.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate dark:text-[#98A2B3]">
                    {navData.user.email}
                  </p>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                  >
                    <MoreVertical className="h-4 w-4 text-gray-500 dark:text-[#98A2B3]" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  side="right"
                  align="start"
                  sideOffset={10}
                  className="w-56 rounded-lg ml-3 mb-2 dark:bg-[#101828] dark:border-[#1D2939]"
                >
                  <UserMenuItems user={navData.user} />
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
