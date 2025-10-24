// src/store/booking.store.ts
import { create } from "zustand";
import {
  type AvailableRoom,
  type CreateBookingPayload,
  type CreateBookingResponse,
  type BookingDetails,
} from "@/pages/bookings/booking-types";

interface BookingState {
  step: number;
  startDate?: Date;
  endDate?: Date;
  selectedRoom?: AvailableRoom;
  bookingPayload?: CreateBookingPayload; // Note: Might be less useful now
  createdBooking?: CreateBookingResponse; // Holds initial response (incl. ID, payment_reference)
  bookingDetails?: BookingDetails; // Holds detailed/updated booking info
}

interface BookingActions {
  setStep: (step: number) => void;
  setDates: (dates: { start?: Date; end?: Date }) => void;
  setSelectedRoom: (room: AvailableRoom) => void;
  setBookingPayload: (payload: CreateBookingPayload) => void; // Keep for logging/debugging?
  setCreatedBooking: (booking: CreateBookingResponse) => void;
  setBookingDetails: (details: BookingDetails) => void;
  reset: () => void;
}

const initialState: BookingState = {
  step: 1,
  // Sensible defaults
  startDate: new Date(),
  endDate: new Date(new Date().setDate(new Date().getDate() + 1)), // Default to 1 night
  selectedRoom: undefined,
  bookingPayload: undefined,
  createdBooking: undefined,
  bookingDetails: undefined,
};

export const useBookingStore = create<BookingState & BookingActions>()(
  (set) => ({
    ...initialState,

    setStep: (step) => set({ step }),

    setDates: (dates) => set({ startDate: dates.start, endDate: dates.end }),

    setSelectedRoom: (room) => set({ selectedRoom: room }),

    setBookingPayload: (payload) => set({ bookingPayload: payload }),

    setCreatedBooking: (booking) => set({ createdBooking: booking }),

    setBookingDetails: (details) => set({ bookingDetails: details }),

    reset: () => set(initialState),
  })
);
