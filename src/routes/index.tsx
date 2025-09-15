// src/routes/index.tsx
import { ThemeProvider } from "@/providers/theme-provider";
import { createBrowserRouter, Outlet } from "react-router-dom";
import DashboardLayout from "@/components/layout/dashboard-layout";
import MainHomePage from "@/pages/main-homepage";
import PlaceholderPage from "@/pages/placeholder-page";

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
      {
        path: "/",
        element: <DashboardLayout />,
        children: [
          { index: true, element: <MainHomePage /> },
          // --- Add all our new routes here ---
          { path: "profile", element: <PlaceholderPage /> },
          { path: "hotel/hotel-details", element: <PlaceholderPage /> },
          { path: "hotel/hotel-features", element: <PlaceholderPage /> },
          { path: "bookings/new-booking", element: <PlaceholderPage /> },
          { path: "bookings/all-bookings", element: <PlaceholderPage /> },
          { path: "rooms/new-room", element: <PlaceholderPage /> },
          { path: "rooms/available-rooms", element: <PlaceholderPage /> },
          { path: "rooms/room-types", element: <PlaceholderPage /> },
          { path: "reservations/checkin", element: <PlaceholderPage /> },
          { path: "reservations/checkout", element: <PlaceholderPage /> },
          {
            path: "house-keeping/inventory-items",
            element: <PlaceholderPage />,
          },
          { path: "house-keeping/event-spaces", element: <PlaceholderPage /> },
          { path: "billings/payouts", element: <PlaceholderPage /> },
          { path: "billings/invoices", element: <PlaceholderPage /> },
          { path: "support/chat", element: <PlaceholderPage /> },
          { path: "support/tickets", element: <PlaceholderPage /> },
          { path: "support/email", element: <PlaceholderPage /> },
        ],
      },
    ],
  },
]);
