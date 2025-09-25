// src/pages/hotel/hotel-types.ts

// =================================================================
// GENERAL & PAGINATION TYPES
// =================================================================

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface BaseAuditModel {
  created_by: string | null;
  updated_by: string | null;
  deleted_by: string | null;
  is_active: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

// =================================================================
// HOTEL & RELATED TYPES
// =================================================================

export interface RoomCounts {
  Available: number;
  Booked: number;
  Maintenance: number;
  Cancelled: number;
  Pending: number;
  Processing: number;
  Not_Available: number;
  total: number;
}

export interface RoomAvailability {
  status_counts: Record<string, number>;
  total_rooms: number;
  available_rooms: number;
  booked_rooms: number;
  maintenance_rooms: number;
  occupancy_percentage: number;
}

export interface RoomPricing {
  min_price: number;
  max_price: number;
  avg_price: number;
}

export interface RoomType {
  id: string;
  name: string;
  code: string;
  max_occupancy: number;
  bed_type: string;
  room_counts: RoomCounts;
  availability: RoomAvailability;
  pricing: RoomPricing;
}

export interface HotelPricingData {
  min: number;
  max: number;
  avg: number;
  currency: string;
  has_promotions: boolean;
}

export interface HotelAvailabilityStats {
  status_counts: {
    Available: number;
    Processing: number;
    Booked: number;
  };
  occupancy_rate: number;
  last_updated: string;
}

export interface SummaryCounts {
  rooms: number;
  images: number;
  reviews: number;
  staff: number;
  event_spaces: number;
  promotions: number;
  available_rooms: number;
  maintenance_requests: number;
}

export interface HotelImage {
  id: string;
  original: string;
  thumbnail: string;
  tag: string | null;
  is_hero_image: boolean;
  hotel: string;
}

export interface Hotel extends BaseAuditModel {
  id: string;
  images: HotelImage[];
  room_type: RoomType[];
  staff_ids: string[];
  promotion_ids: string[];
  event_space_ids: string[];
  department_ids: string[];
  activity_ids: string[];
  maintenance_request_ids: string[];
  pricing_data: HotelPricingData;
  availability_stats: HotelAvailabilityStats;
  summary_counts: SummaryCounts;
  average_room_price: number;
  occupancy_rate: number;
  vendor_id: string;
  name: string;
  code: string;
  description: string;
  star_rating: number;
  zip_code: string;
  address: string;
  latitude: number;
  longitude: number;
  year_built: number;
  check_in_from: string;
  check_out_to: string;
  average_rating: string;
  review_count: number;
  country: string;
  hotel_type: string;
  directions: string;
  discount: number;
  max_discount_percent: number | null;
  number_floors: number;
  number_restaurants: number;
  number_bars: number;
  number_parks: number;
  number_halls: number;
  regions: string[];
  themes: string[];
  meal_types: string[];
  amenities: string[];
  services: string[];
  facilities: string[];
  translations: string[];
}

// =================================================================
// FEATURES (AMENITIES, FACILITIES, SERVICES, ETC.)
// =================================================================

export interface Amenity {
  id: string;
  name: string;
  code: string;
  description: string;
  icon: string;
  usage_count?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FacilityCategory {
  id: string;
  name: string;
  description: string;
  facility_count?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Facility {
  id: string;
  name: string;
  code: string;
  description: string;
  icon: string;
  availability: string | null;
  category_id: string;
  category_name?: string;
  fee_applies: boolean;
  reservation_required: boolean;
  additional_info: string | null;
  hotel_count?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ServiceType extends BaseAuditModel {
  name: string;
  icon: string;
  description: string;
  translation: string | null;
  country: string | null;
}

export interface ServiceScope extends BaseAuditModel {
  name: string;
  icon: string;
  description: string;
  translation: string | null;
}

export interface Service extends BaseAuditModel {
  name: string;
  description: string;
  amendment: string;
  icon: string;
  service_type: string;
  service_scope: string;
  translation: string | null;
}

export interface MealType extends BaseAuditModel {
  code: string;
  name: string;
  score: number;
  description: string;
  translation: string | null;
}

export interface Translation extends BaseAuditModel {
  id: string;
  language: string;
  country: string;
  country_name?: string; // from specific endpoint
  usage_count?: number; // from specific endpoint
}

// =================================================================
// DEPARTMENTS, INVENTORY, EVENTS
// =================================================================

export interface Department extends BaseAuditModel {
  name: string;
  code: string;
  description: string;
  hotel: string;
}

export interface InventoryCategory extends BaseAuditModel {
  name: string;
  description: string;
  hotel: string;
}

export interface InventoryItem extends BaseAuditModel {
  name: string;
  description: string;
  quantity_instock: number;
  unit: string;
  reorder_level: number;
  quantity_in_reorder: number;
  cost_per_unit: string;
  category: string;
  hotel: string;
}

export interface EventSpaceType extends BaseAuditModel {
  name: string;
  description: string;
  hotel: string;
}

export interface EventSpace extends BaseAuditModel {
  name: string;
  code: string;
  description: string;
  capacity: number;
  size_sqm: string;
  floor: string;
  hourly_rate: string;
  event_space_type: string;
  hotel: string;
  amenities: string[];
}

// =================================================================
// BOOKING & BILLING TYPES
// =================================================================

export interface StatusHistory {
  action?: string;
  automated?: boolean;
  timestamp: string;
  new_amount?: number;
  workflow_id?: string;
  previous_amount?: number;
  details?: {
    to_currency: string;
    from_currency: string;
    original_paid: number;
    converted_paid: number;
    original_required: number;
    conversion_records: string[];
    converted_required: number;
    exchange_rate_paid: number | null;
    overflow_protection: boolean;
    conversion_timestamp: string;
    exchange_rate_required: number;
    booking_amounts_updated: boolean;
  };
  reason?: string | null;
  status?: string;
  updated_by?: string;
  amount_paid?: number;
  payment_reference?: string;
  new_status?: string;
  previous_status?: string;
}

export interface FeeOrTax {
  type?: string;
  amount: number;
  details: {
    fee_rate?: string;
    tax_rate?: string;
    base_amount: string;
  };
  description: string;
}

export interface BillingHistory {
  timestamp: string;
  invoice_id: string;
  new_amount: number;
  workflow_id: string;
  previous_amount: number;
  calculation_summary: {
    discounts: number;
    final_total: number;
    base_charges: number;
  };
}

export interface PaymentHistory {
  reason: string;
  timestamp: string;
  updated_by: string;
  new_amount_paid: number;
  payment_reference: string;
  previous_amount_paid: number;
}

export interface ChargeBreakdownItem {
  amount: number;
  success: boolean;
  currency: string;
  description: string;
  calculation_details: {
    tax_rate?: string;
    base_amount?: string;
    fee_rate?: string;
  };
}

export interface CalculationResult {
  amount: number;
  success: boolean;
  currency: string;
  charge_type: string;
  description: string;
  calculation_details?: {
    fee_rate?: string;
    base_amount?: string;
    tax_rate?: string;
  };
  schemes_applied?: any[];
  penalties_applied?: any[];
  discounts_applied?: any[];
}

export interface BillingMetaData {
  success: boolean;
  currency: string;
  booking_id: string;
  invoice_id: string;
  workflow_id: string;
  fees_applied: FeeOrTax[];
  final_amount: number;
  processed_at: string;
  taxes_applied: FeeOrTax[];
  tenant_schema: string;
  invoice_number: string;
  billing_history: BillingHistory[];
  discount_amount: number;
  payment_history: PaymentHistory[];
  charges_breakdown: Record<string, ChargeBreakdownItem>;
  discounts_applied: any[];
  financial_schemes: any[];
  penalties_applied: any[];
  calculation_results: CalculationResult[];
  last_billing_update: {
    timestamp: string;
    invoice_id: string;
    workflow_id: string;
    processed_by: string;
    invoice_number: string;
  };
  calculation_breakdown: {
    currency: string;
    final_amount: number;
    discount_amount: number;
    previous_amount: number;
    calculation_results: CalculationResult[];
    total_before_discount: number;
  };
  total_before_discount: number;
}

export interface Booking {
  id: string;
  payment_status: "Paid" | "Unpaid" | "Pending";
  full_name: string;
  code: string;
  address: string;
  phone_number: number;
  user_id: string | null;
  device_id: string | null;
  email: string;
  start_date: string;
  end_date: string;
  checkin: string | null;
  checkout: string | null;
  microservice_item_id: string;
  vendor_id: string;
  microservice_item_name: string;
  property_id: string;
  number_of_booked_property: number;
  number_of_guests: number;
  number_of_children: number;
  number_of_infants: number;
  amount_paid: string;
  currency_paid: string;
  amount_required: string;
  currency_required: string;
  property_item_type: string;
  reference_number: string;
  booking_status: "Confirmed" | "Processing" | "Cancelled" | "Pending";
  booking_type: "Online" | "Walk-in";
  voucher_code: string | null;
  service_notes: string;
  special_requests: string;
  booking_source: string;
  payment_reference: string;
  payment_method: string;
  cancellation_policy: string;
  cancellation_details: string | null;
  rules_violated: string | null;
  status_history: StatusHistory[];
  billing_meta_data: BillingMetaData;
  modification_count: number;
  payment_id: string | null;
  vendor_payment_processed: boolean;
  vendor_payment_transaction_id: string | null;
  vendor_payment_amount: number | null;
  vendor_payment_processed_at: string | null;
  created_at: string;
  updated_at: string;
  duration_days?: number; // Only on specific booking
}

export interface Allocation {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  total_rooms: number;
  status: "Confirmed" | "Pending" | "Expired" | "Draft" | "Cancelled";
  room_type: string;
  hotel: string;
  created_at: string;
  updated_at: string;
  // This property will be added dynamically after fetching
  room_type_name?: string;
}
