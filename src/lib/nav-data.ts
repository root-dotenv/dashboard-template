// src/lib/nav-data.ts
import { Bed, PieChart } from "lucide-react";
import { FiUserCheck } from "react-icons/fi";
import { MdOutlineInventory2 } from "react-icons/md";
import { BsGrid } from "react-icons/bs";
import { RiHotelLine } from "react-icons/ri";
import { HiOutlineTicket } from "react-icons/hi2";
import { MdPayment } from "react-icons/md";
import { HiOutlineDocumentReport } from "react-icons/hi";
import { BiSupport } from "react-icons/bi";

export const navData = {
  // The user object that was missing
  user: {
    name: "Dotenv",
    email: "rootdotenv@safaripro.com",
    avatar: "/avatars/shadcn.jpg",
  },

  // Main navigation items for the hotel dashboard
  navMain: [
    { title: "Main Overview", icon: BsGrid, url: "/" },
    {
      title: "Hotel Management",
      icon: RiHotelLine,
      items: [
        { title: "My Hotel", url: "/hotel/hotel-details" },
        { title: "Hotel Features", url: "/hotel/hotel-features" },
      ],
    },
    {
      title: "Bookings",
      icon: HiOutlineTicket,
      items: [
        { title: "New Booking", url: "/bookings/new-booking" },
        { title: "All Bookings", url: "/bookings/all-bookings" },
        { title: "SafariPro Bookings", url: "/bookings/safaripro-bookings" },
      ],
    },
    {
      title: "Rooms",
      icon: Bed,
      items: [
        { title: "New Room", url: "/rooms/new-room" },
        { title: "Available Rooms", url: "/rooms/available-rooms" },
        { title: "Booked Rooms", url: "/rooms/booked-rooms" },
        { title: "Maintenance Rooms", url: "/rooms/maitenance-rooms" },
        { title: "Room Types", url: "/rooms/room-types" },
        {
          title: "Available Rooms By Date",
          url: "/rooms/available-rooms-by-date",
        },
        { title: "Allocate Rooms", url: "/rooms/allocate-rooms" },
        { title: "Allocations", url: "/rooms/rooms-allocations" },
      ],
    },
    {
      title: "Reservations",
      icon: FiUserCheck,
      items: [
        { title: "Check-in", url: "/reservations/checkin" },
        { title: "Check-out", url: "/reservations/checkout" },
        { title: "Special Requests", url: "/reservations/special-requests" },
      ],
    },
    {
      title: "House Keeping",
      icon: MdOutlineInventory2,
      items: [
        { title: "Departments", url: "/house-keeping/departments" },

        {
          title: "Inventory Categories",
          url: "/house-keeping/inventory-categories",
        },
        { title: "Inventory Items", url: "/house-keeping/inventory-items" },
        {
          title: "Event Spaces Types",
          url: "/house-keeping/event-space-types",
        },
        { title: "Event Spaces", url: "/house-keeping/event-spaces" },
      ],
    },

    {
      title: "Billings & Payments",
      icon: MdPayment,
      items: [
        { title: "Payouts", url: "/billings/payouts" },
        { title: "Charges", url: "/billings/charges" },
        { title: "Invoices", url: "/billings/invoices" },
      ],
    },
  ],
  // Support links that you wanted to keep
  supportLinks: [
    { title: "Analytics", icon: PieChart, url: "/analytics" },
    {
      title: "Reports",
      icon: HiOutlineDocumentReport,
      url: "/reports",
    },
    { title: "Support", icon: BiSupport, url: "/support" },
  ],
};
