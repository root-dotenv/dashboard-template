// src/routes/index.tsx
import { ThemeProvider } from "@/providers/theme-provider";
import { createBrowserRouter, Outlet } from "react-router-dom";
import DashboardLayout from "@/components/layout/dashboard-layout";
import MainHomePage from "@/pages/main-homepage";

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
          {
            index: true,
            element: <MainHomePage />,
          },
          // { path: "bookings", element: <BookingsPage /> },
        ],
      },
    ],
  },
]);
