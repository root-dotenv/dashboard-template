// src/components/custom/notifications.tsx

"use client";
import { useState } from "react";
import { BellIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";

// Custom types for notifications
type Notification = {
  id: number;
  user: string;
  action: string;
  target: string;
  timestamp: string;
  unread: boolean;
};

function Dot({ className }: { className?: string }) {
  return (
    <svg
      width="6"
      height="6"
      fill="currentColor"
      viewBox="0 0 6 6"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <circle cx="3" cy="3" r="3" />
    </svg>
  );
}

export function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      user: "Front Desk",
      action: "reported",
      target: "Room 203 needs cleaning",
      timestamp: "15 minutes ago",
      unread: true,
    },
    {
      id: 2,
      user: "Housekeeping",
      action: "completed",
      target: "Room 305 cleaning",
      timestamp: "45 minutes ago",
      unread: true,
    },
    {
      id: 3,
      user: "Reservation System",
      action: "assigned you",
      target: "New booking for Suite 401",
      timestamp: "2 hours ago",
      unread: false,
    },
    {
      id: 4,
      user: "Maintenance",
      action: "updated status for",
      target: "AC repair in Room 102",
      timestamp: "5 hours ago",
      unread: false,
    },
    {
      id: 5,
      user: "Billing",
      action: "processed payment for",
      target: "Guest John Smith",
      timestamp: "1 day ago",
      unread: false,
    },
  ]);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const handleMarkAllAsRead = () => {
    setNotifications(
      notifications.map((notification) => ({
        ...notification,
        unread: false,
      }))
    );
  };

  const handleNotificationClick = (id: number) => {
    setNotifications(
      notifications.map((notification) =>
        notification.id === id
          ? { ...notification, unread: false }
          : notification
      )
    );
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative hover:bg-accent"
          aria-label="Open notifications"
        >
          <BellIcon className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 flex items-center justify-center"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end" sideOffset={10}>
        <div className="flex items-baseline justify-between gap-4 px-4 py-3">
          <h3 className="text-sm font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <button
              className="text-xs font-medium text-primary hover:underline"
              onClick={handleMarkAllAsRead}
            >
              Mark all as read
            </button>
          )}
        </div>
        <Separator />
        <div className="max-h-[400px] overflow-y-auto">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className="hover:bg-accent transition-colors"
              >
                <div className="relative flex items-start px-4 py-3">
                  <div className="flex-1 space-y-1">
                    <button
                      className="text-left w-full after:absolute after:inset-0"
                      onClick={() => handleNotificationClick(notification.id)}
                    >
                      <p className="text-sm">
                        <span className="font-medium">{notification.user}</span>{" "}
                        {notification.action}{" "}
                        <span className="font-medium">
                          {notification.target}
                        </span>
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {notification.timestamp}
                      </p>
                    </button>
                  </div>
                  {notification.unread && (
                    <div className="absolute right-4 top-4">
                      <span className="sr-only">Unread</span>
                      <Dot className="text-primary" />
                    </div>
                  )}
                </div>
                <Separator />
              </div>
            ))
          ) : (
            <div className="px-4 py-6 text-center text-sm text-muted-foreground">
              No notifications
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
