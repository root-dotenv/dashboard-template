// - - - src/pages/bookings/cash-payment/types.ts

/**
 * Represents the structure of a single available room
 * received from the availability search API.
 */
export interface Room {
  room_id: string;
  room_type_name: string;
  bed_type: string;
  price_per_night: number;
  room_code: string;
  availability: {
    date: string;
    availability_status: "Available" | "Booked";
  }[];
}

/**
 * Represents the details collected from the guest in the form.
 */
export interface GuestDetails {
  full_name: string;
  phone_number: string;
  service_notes: string;
  special_requests: string;
  number_of_children: number;
  number_of_guests: number;
  number_of_infants: number;
  payment_method: "Mobile" | "Cash" | "Card";
  address: string | null;
  email: string | null;
}

// Sub-interfaces for better structure in BookingConfirmation
interface BillingMetaData {
  charge_report: {
    item_type: string;
    description: string;
    amount: string;
  }[];
  // Add other billing_meta_data fields if needed
}

interface StatusHistory {
  action: string;
  details: {
    original_required: number;
    converted_required: number;
    from_currency: string;
    to_currency: string;
    // Add other details fields if needed
  };
}

/**
 * Represents the structure of the successful booking
 * response object from the API.
 */
export interface BookingConfirmation {
  id: string;
  payment_status: string;
  full_name: string;
  code: string;
  phone_number: number;
  user_id: string | null;
  device_id: string | null;
  address: string | null;
  email: string | null;
  start_date: string;
  end_date: string;
  checkin: string | null;
  checkout: string | null;
  microservice_item_id: string;
  property_item_type: string;
  reference_number: string;
  booking_status: string;
  booking_type: string;
  payment_reference: string;
  payment_method: string;
  service_notes: string;
  special_requests: string;
  created_at: string;
  updated_at: string;
  billing_meta_data: BillingMetaData;
  status_history: StatusHistory[];
}

/**
 * For the successful payment submission response from the checkout service.
 */
export interface PaymentSuccessResponse {
  success: boolean;
  message: string;
  transactionId: string;
}

/**
 * For the final, detailed booking object after payment is confirmed.
 * This extends BookingConfirmation with additional fields that appear after payment.
 */
export interface FinalBookingDetails extends BookingConfirmation {
  duration_days: number;
  amount_paid: string;
  currency_paid: string;
  number_of_guests: number;
  number_of_infants: number;
  number_of_children: number;
}
