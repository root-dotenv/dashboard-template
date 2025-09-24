import { create } from "zustand";
import { type DateRange } from "react-day-picker";

/**
 * Defines the shape of the availability search store, including the state and actions.
 */
interface AvailabilitySearchState {
  dateRange: DateRange | undefined;
  setDateRange: (dateRange: DateRange | undefined) => void;
}

/**
 * A Zustand store to persist the date range for the available rooms search.
 * This allows the search state to be preserved even when the user navigates away
 * from the component and returns later.
 */
export const useAvailabilitySearchStore = create<AvailabilitySearchState>(
  (set) => ({
    // The selected date range. Initialized as undefined.
    dateRange: undefined,
    // Action to update the date range in the store.
    setDateRange: (dateRange) => set({ dateRange }),
  })
);
