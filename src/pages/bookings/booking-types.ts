// export interface AvailabilityStatus {
//   date: string;
//   availability_status: "Available" | "Booked" | "Maintenance";
// }

// export interface AvailableRoom {
//   room_id: string;
//   room_code: string;
//   room_type_id: string;
//   room_type_name: string;
//   bed_type: string;
//   price_per_night: number;
//   availability: AvailabilityStatus[];
// }

// export interface AvailabilityRangeResponse {
//   hotel_id: string;
//   room_type_id: string | null;
//   start_date: string;
//   end_date: string;
//   rooms: AvailableRoom[];
// }

// // --- Type for a single detailed room response ---
// export interface RoomImage {
//   id: string;
//   url: string;
// }

// export interface RoomAmenity {
//   id: string;
//   name: string;
//   icon: string;
// }

// export interface DetailedRoom {
//   id: string;
//   hotel_name: string;
//   room_type_name: string;
//   images: RoomImage[];
//   amenities: RoomAmenity[];
//   description: string;
//   max_occupancy: number;
//   price_per_night: number;
//   average_rating: string;
//   review_count: number;
//   code: string; // ADDED
//   floor_number: number; // ADDED
// }

// // --- STEP 2: Create Booking ---

// export interface CreateBookingPayload {
//   full_name: string;
//   phone_number: string;
//   email: string;
//   address: string;
//   amount_required: string;
//   property_item_type: string;
//   start_date: string;
//   end_date: string;
//   microservice_item_id: string;
//   service_notes?: string;
//   number_of_children: number;
//   number_of_guests: number;
//   number_of_infants: number;
//   booking_type: "Physical";
//   booking_status: "Processing";
//   special_requests?: string;
//   payment_method: "Cash";
// }

// export interface CreateBookingResponse {
//   id: string;
//   payment_status: "Pending";
//   full_name: string;
//   code: string;
//   address: string;
//   phone_number: number;
//   email: string;
//   start_date: string;
//   end_date: string;
//   microservice_item_id: string;
//   amount_required: string;
//   property_item_type: string;
//   booking_status: "Processing";
//   payment_method: "Cash";
//   created_at: string;
//   updated_at: string;
// }

// // --- STEP 3: Booking Details with Billing ---

// export interface BillingMetaData {
//   success: boolean;
//   currency: "USD";
//   final_amount: number;
//   charges_breakdown: {
//     tax: { amount: number; description: string };
//     safari_pro_fee: { amount: number; description: string };
//     base_charge: { amount: number; description: string };
//     [key: string]: any;
//   };
//   [key: string]: any;
// }

// export interface BookingDetails extends CreateBookingResponse {
//   duration_days: number;
//   amount_required: string;
//   billing_meta_data: BillingMetaData;
//   status_history: any[];
// }

// // --- STEP 4: Update Payment ---
// export interface UpdatePaymentPayload {
//   booking_status: "Confirmed";
//   currency_paid: "TZS";
//   amount_paid: string;
// }

// // --- STEP 5: Check-In ---
// export interface CheckInResponse {
//   success: boolean;
//   message: string;
//   booking: BookingDetails & {
//     checkin: string;
//     booking_status: "Checked In";
//     payment_status: "Paid";
//   };
// }

export interface AvailabilityStatus {
  date: string;
  availability_status: "Available" | "Booked" | "Maintenance";
}

export interface AvailableRoom {
  room_id: string;
  room_code: string;
  room_type_id: string;
  room_type_name: string;
  bed_type: string;
  price_per_night: number;
  availability: AvailabilityStatus[];
}

export interface AvailabilityRangeResponse {
  hotel_id: string;
  room_type_id: string | null;
  start_date: string;
  end_date: string;
  rooms: AvailableRoom[];
}

export interface RoomImage {
  id: string;
  url: string;
}

export interface RoomAmenity {
  id: string;
  name: string;
  icon: string;
}

export interface DetailedRoom {
  id: string;
  hotel_name: string;
  room_type_name: string;
  images: RoomImage[];
  amenities: RoomAmenity[];
  description: string;
  max_occupancy: number;
  price_per_night: number;
  average_rating: string;
  review_count: number;
  code: string;
  floor_number: number;
}

export interface CreateBookingPayload {
  full_name: string;
  phone_number: string;
  email: string;
  address: string;
  amount_required: string;
  property_item_type: string;
  start_date: string;
  end_date: string;
  microservice_item_id: string;
  service_notes?: string;
  number_of_children: number;
  number_of_guests: number;
  number_of_infants: number;
  booking_type: "Physical";
  booking_status: "Processing";
  special_requests?: string;
  payment_method: "Cash";
}

export interface CreateBookingResponse {
  id: string;
  payment_status: "Pending";
  full_name: string;
  code: string;
  address: string;
  phone_number: number;
  email: string;
  start_date: string;
  end_date: string;
  microservice_item_id: string;
  amount_required: string;
  property_item_type: string;
  booking_status: "Processing";
  payment_method: "Cash";
  created_at: string;
  updated_at: string;
  vendor_id: string;
  property_id: string;
  status_history: any[];
  billing_meta_data: object;
}

export interface BillingMetaData {
  success: boolean;
  currency: "USD";
  final_amount: number;
  charges_breakdown: {
    tax: { amount: number; description: string };
    safari_pro_fee: { amount: number; description: string };
    base_charge: { amount: number; description: string };
    [key: string]: any;
  };
  [key: string]: any;
}

export interface BookingDetails extends CreateBookingResponse {
  duration_days: number;
}

export interface UpdatePaymentPayload {
  booking_status: "Confirmed";
  currency_paid: "TZS";
  amount_paid: string;
}

export interface CheckInResponse {
  success: boolean;
  message: string;
  booking: BookingDetails & {
    checkin: string;
    booking_status: "Checked In";
    payment_status: "Paid";
  };
}
