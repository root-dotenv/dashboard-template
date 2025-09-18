// - - - src/main.tsx
import React from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import "./index.css";
import { HotelProvider } from "./providers/hotel-provider";

const queryClient = new QueryClient();

// - - - Render the App component at the root of your application
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <HotelProvider>
        <App />
      </HotelProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
