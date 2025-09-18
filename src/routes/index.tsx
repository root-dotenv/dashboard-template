// src/routes/index.tsx
import { ThemeProvider } from "@/providers/theme-provider";
import { createBrowserRouter, Outlet } from "react-router-dom";
import DashboardLayout from "@/components/layout/dashboard-layout";
import MainHomePage from "@/pages/main-homepage";
import PlaceholderPage from "@/pages/placeholder-page";
import Login from "@/pages/authentication/login";
import OtpVerify from "@/pages/authentication/otp-verify";
import Signup from "@/pages/authentication/signup";

// Import the route protectors
import { ProtectedRoute, PublicRoute } from "./protected-routes";
import HotelRooms from "@/pages/rooms/hotel-rooms";
import RoomDetailsPage from "@/pages/rooms/room-details";
import AllBookings from "@/pages/bookings/all-bookings";

const RootLayout = () => {
  return (
    <ThemeProvider defaultTheme="system" storageKey="hotel-management-theme">
      <Outlet />
    </ThemeProvider>
  );
};

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    errorElement: <p>Error page</p>,
    children: [
      // --- Public Routes (No Dashboard Layout) ---
      {
        element: <PublicRoute />,
        children: [
          { path: "/login", element: <Login /> },
          { path: "/signup", element: <Signup /> },
          { path: "/otp-verify", element: <OtpVerify /> },
        ],
      },
      // --- Protected Routes (With Dashboard Layout) ---
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: "/",
            element: <DashboardLayout />,
            children: [
              { index: true, element: <MainHomePage /> },
              { path: "profile", element: <PlaceholderPage /> },
              { path: "hotel/hotel-details", element: <PlaceholderPage /> },
              { path: "rooms/hotel-rooms", element: <HotelRooms /> },
              { path: "rooms/:room_id", element: <RoomDetailsPage /> },
              { path: "bookings/all-bookings", element: <AllBookings /> },
            ],
          },
        ],
      },
    ],
  },
]);
