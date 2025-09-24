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
  bookingPayload?: CreateBookingPayload;
  createdBooking?: CreateBookingResponse;
  bookingDetails?: BookingDetails;
}

interface BookingActions {
  setStep: (step: number) => void;
  setDates: (dates: { start?: Date; end?: Date }) => void;
  setSelectedRoom: (room: AvailableRoom) => void;
  // --- BUG FIX: Renamed this action for consistency ---
  setBookingPayload: (payload: CreateBookingPayload) => void;
  setCreatedBooking: (booking: CreateBookingResponse) => void;
  setBookingDetails: (details: BookingDetails) => void;
  reset: () => void;
}

const initialState: BookingState = {
  step: 1,
  startDate: new Date(),
  endDate: new Date(new Date().setDate(new Date().getDate() + 4)),
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

    // --- BUG FIX: Implementing the correctly named action ---
    setBookingPayload: (payload) => set({ bookingPayload: payload }),

    setCreatedBooking: (booking) => set({ createdBooking: booking }),

    setBookingDetails: (details) => set({ bookingDetails: details }),

    reset: () => set(initialState),
  })
);
