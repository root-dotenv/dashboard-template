// src/lib/nav-data.ts
import {
  PieChart,
  Hotel,
  Bed,
  Folder,
  Share,
  MoreHorizontal,
} from "lucide-react";
import { FiUserCheck } from "react-icons/fi";
import { BiSupport } from "react-icons/bi";
import { HiOutlineDocumentReport } from "react-icons/hi";
import { LuTicketCheck } from "react-icons/lu";
import { TbFileTypeCsv } from "react-icons/tb";
import { MdOutlineFeedback } from "react-icons/md";

export const navData = {
  user: {
    name: "Root Dotenv",
    email: "dotenv@ostub.com",
    avatar: "/avatars/admin.jpg",
  },
  navMain: [
    {
      title: "Hotel Management",
      url: "#",
      icon: Hotel,
      items: [
        { title: "My Hotel", url: "/hotel/hotel-details" },
        { title: "Hotel Features", url: "/hotel/hotel-features" },
      ],
    },
    {
      title: "Bookings",
      url: "#",
      icon: LuTicketCheck,
      items: [
        { title: "New Booking", url: "/bookings/new-booking" },
        { title: "All Bookings", url: "/bookings/all-bookings" },
        { title: "Safari Pro Bookings", url: "/bookings/safaripro-bookings" },
      ],
    },
    {
      title: "Rooms",
      url: "#",
      icon: Bed,
      items: [
        { title: "New Room", url: "/rooms/new-room" },
        { title: "Available Rooms", url: "/rooms/available-rooms" },
        { title: "Booked Rooms", url: "/rooms/booked-rooms" },
        { title: "Maintenance Rooms", url: "/rooms/maintenance-rooms" },
        { title: "Room Types", url: "/rooms/room-types" },
        {
          title: "Available Rooms By Dates",
          url: "/rooms/available-rooms-dates",
        },
      ],
    },
    {
      title: "Reservations",
      url: "#",
      icon: FiUserCheck,
      items: [
        { title: "Checkin", url: "/reservations/checkin" },
        { title: "Checkout", url: "/reservations/checkout" },
        { title: "Cancelled", url: "/reservations/cancelled" },
        { title: "Special Requests", url: "/reservations/special-requests" },
      ],
    },
  ],
  navSecondary: [
    { title: "Support", url: "/support", icon: BiSupport },
    { title: "Feedback", url: "/feedback", icon: MdOutlineFeedback },
  ],
  projects: [
    {
      name: "Analytics",
      url: "/analytics",
      icon: PieChart,
    },
    {
      name: "Reports",
      url: "/reports",
      icon: HiOutlineDocumentReport,
      actions: [
        {
          label: "View Reports",
          url: "/view-reports",
          icon: Folder,
        },
        {
          label: "Share Report",
          url: "/share-reports",
          icon: Share,
        },
        {
          label: "Export Report",
          url: "/export-report",
          icon: TbFileTypeCsv,
        },
      ],
    },
  ],
  moreLinks: [
    { label: "Demo Link 1", url: "#", icon: MoreHorizontal },
    { label: "Demo Link 2", url: "#", icon: MoreHorizontal },
    { label: "Demo Link 3", url: "#", icon: MoreHorizontal },
    { label: "Demo Link 4", url: "#", icon: MoreHorizontal },
  ],
};
