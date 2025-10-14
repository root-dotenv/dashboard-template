"use client";
import { BadgeCheck, Bell, CreditCard, LogOut, Sparkles } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "../../store/auth.store";
import { useNavigate } from "react-router-dom";

export function UserMenuItems() {
  const { userProfile, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
  };

  if (!userProfile) return null;

  return (
    <>
      <DropdownMenuLabel className="p-0 font-normal">
        <div className="flex items-center gap-3 p-2 text-left">
          <Avatar className="h-9 w-9">
            <AvatarImage src={""} alt={userProfile.first_name} />
            <AvatarFallback>{userProfile.first_name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium dark:text-[#D0D5DD]">
              {userProfile.first_name} {userProfile.last_name}
            </span>
            <span className="truncate text-xs text-muted-foreground dark:text-[#98A2B3]">
              {userProfile.email}
            </span>
          </div>
        </div>
      </DropdownMenuLabel>
      <DropdownMenuSeparator className="dark:bg-[#1D2939]" />
      <DropdownMenuGroup className="dark:text-[#D0D5DD]">
        <DropdownMenuItem className="dark:focus:bg-[#1C2433]">
          <Sparkles className="mr-2 h-4 w-4 dark:text-[#98A2B3]" />
          <span>Upgrade to Pro</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => navigate("/profile")}
          className="dark:focus:bg-[#1C2433]"
        >
          <BadgeCheck className="mr-2 h-4 w-4 dark:text-[#98A2B3]" />
          <span>Account</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="dark:focus:bg-[#1C2433]">
          <CreditCard className="mr-2 h-4 w-4 dark:text-[#98A2B3]" />
          <span>Billing</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="dark:focus:bg-[#1C2433]">
          <Bell className="mr-2 h-4 w-4 dark:text-[#98A2B3]" />
          <span>Notifications</span>
        </DropdownMenuItem>
      </DropdownMenuGroup>
      <DropdownMenuSeparator className="dark:bg-[#1D2939]" />
      <DropdownMenuItem
        onClick={handleLogout}
        className="dark:focus:bg-[#1C2433] dark:text-[#D0D5DD]"
      >
        <LogOut className="mr-2 h-4 w-4 dark:text-[#98A2B3]" />
        <span>Log out</span>
      </DropdownMenuItem>
    </>
  );
}
