// src/providers/hotel-provider.tsx
import { createContext, useContext, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import hotelClient from "../api/hotel-client";
// import { useAuthStore } from "@/store/auth.store";
import type { Hotel } from "@/types/hotel-types";

// Define the shape of the context's value
interface HotelContextType {
  hotel: Hotel | null;
  isLoading: boolean;
  error: Error | null;
  isError: boolean;
  refetch: () => void;
}

// Create the Context
const HotelContext = createContext<HotelContextType | undefined>(undefined);

// Create the Provider Component
export function HotelProvider({ children }: { children: ReactNode }) {
  // TODO: Uncomment this part here
  // const { hotelId } = useAuthStore(); // Get the dynamic hotelId from the auth store

  const hotelId = "552e27a3-7ac2-4f89-bc80-1349f3198105";

  const {
    data: hotel,
    isLoading,
    error,
    isError,
    refetch,
  } = useQuery<Hotel, Error>({
    // The queryKey is now dynamic, tied to the hotelId from the store.
    // TanStack Query will automatically refetch when this ID changes.
    queryKey: ["hotel", hotelId],
    queryFn: async () => {
      // Use the dynamic hotelId in the API request URL.
      const response = await hotelClient.get(`hotels/${hotelId}`);
      return response.data;
    },
    // The query will only run if a hotelId exists in the auth store.
    enabled: !!hotelId,
    // Keep the data fresh for 30 minutes before considering it stale.
    staleTime: 1000 * 60 * 30,
  });

  // --- REMOVED BLOCKING LOGIC ---
  // The provider no longer blocks rendering on load or error.
  // It will now always render the children, providing them with the
  // current loading/error state via the context value.

  // Define the value to be passed down through the context
  const value = {
    hotel: hotel || null,
    isLoading,
    error,
    isError,
    refetch: refetch as () => void,
  };

  return (
    <HotelContext.Provider value={value}>{children}</HotelContext.Provider>
  );
}

// Custom hook for consuming the context
export function useHotel() {
  const context = useContext(HotelContext);

  if (context === undefined) {
    throw new Error("useHotel must be used within a HotelProvider");
  }

  return context;
}
