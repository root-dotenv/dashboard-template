export interface RoomTypeSummary {
  id: string;
  name: string;
  code: string;
  max_occupancy: number;
  bed_type: string;
  room_counts: {
    Available: number;
    Booked: number;
    Maintenance: number;
    Cancelled: number;
    Pending: number;
    Processing: number;
    Not_Available: number;
    total: number;
  };
  availability: {
    status_counts: {
      Available: number;
      Booked: number;
      [key: string]: number;
    };
    total_rooms: number;
    available_rooms: number;
    booked_rooms: number;
    maintenance_rooms: number;
    occupancy_percentage: number;
  };
  pricing: {
    min_price: number;
    max_price: number;
    avg_price: number;
  };
}

export interface PricingData {
  min: number;
  max: number;
  avg: number;
  currency: string;
  has_promotions: boolean;
}

export interface AvailabilityStats {
  status_counts: {
    Available: number;
    Booked: number;
    [key: string]: number;
  };
  occupancy_rate: number;
  last_updated: string;
}

export interface HasMore {
  images: boolean;
  rooms: boolean;
  staff: boolean;
  promotions: boolean;
  events: boolean;
  activities: boolean;
}

export interface NextPageTokens {
  images: number;
  rooms: number;
  staff: number;
  promotions: number;
  events: number;
  activities: number;
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

export interface Hotel {
  id: string;
  image_ids: string[];
  room_type: RoomTypeSummary[];
  staff_ids: string[];
  promotion_ids: string[];
  event_space_ids: string[];
  department_ids: string[];
  activity_ids: string[];
  maintenance_request_ids: string[];
  pricing_data: PricingData;
  availability_stats: AvailabilityStats;
  has_more: HasMore;
  next_page_tokens: NextPageTokens;
  website_url: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  twitter_url: string | null;
  youtube_url: string | null;
  Maps_url: string | null; // Corrected from Google_Maps_url based on previous turn's output
  summary_counts: SummaryCounts;
  average_room_price: number;
  occupancy_rate: number;
  created_by: string;
  updated_by: string;
  deleted_by: string;
  is_active: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  name: string;
  code: string;
  description: string;
  star_rating: number;
  zip_code: string;
  address: string;
  latitude: number;
  longitude: number;
  distance_from_center_km: number;
  destination: string;
  score_availability: number;
  number_rooms: number;
  number_floors: number;
  number_restaurants: number;
  number_bars: number;
  number_parks: number;
  number_halls: number;
  discount: number;
  timezone: string;
  directions: string;
  is_superhost: boolean;
  is_eco_certified: boolean;
  max_discount_percent: number | null;
  year_built: number;
  number_activities: number;
  rate_options: string;
  check_in_from: string;
  check_out_to: string;
  average_rating: string;
  review_count: number;
  country: string;
  hotel_type: string;
  regions: string[];
  themes: string[];
  meal_types: string[];
  amenities: string[];
  services: string[];
  facilities: string[];
  translations: string[];
}

// Interface for the paginated response structure for hotels
export interface PaginatedHotelsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Hotel[];
}

export interface HotelType {
  id: string;
  created_by: string | null;
  updated_by: string | null;
  deleted_by: string | null;
  is_active: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  name: string;
  code: string;
  description: string;
  translation: string | null;
}

export interface HotelImage {
  id: string;
  hotel_name: string;
  hotel_id: string;
  category_name: string;
  category_id: string;
  thumbnails: null; // Or `any[]` or a more specific type if known
  created_by: string | null;
  updated_by: string | null;
  deleted_by: string | null;
  is_active: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  tag: string;
  original: string;
  image_type: string;
  is_primary: boolean;
  caption: string | null;
  category: string;
  hotel: string;
  translation: string | null;
}

export interface Region {
  id: string;
  country_name: string;
  country_id: string;
  hotel_count: number;
  created_by: string | null;
  updated_by: string | null;
  deleted_by: string | null;
  is_active: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  name: string;
  kind: string;
  state_code: string | null;
  country: string;
}

export interface Theme {
  id: string;
  translation_language: string | null;
  translation_id: string | null;
  hotel_count: number;
  created_by: string | null;
  updated_by: string | null;
  deleted_by: string | null;
  is_active: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  name: string;
  description: string;
  translation: string | null;
}

export interface MealType {
  id: string;
  name: string;
  code: string;
  description: string;
  score: number;
  hotel_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// New interfaces for Country, Service, and Translation
export interface Country {
  id: string;
  name: string;
  // Add other properties if available in the actual API response
  // e.g., code: string;
}

export interface Service {
  id: string;
  created_by: string | null;
  updated_by: string | null;
  deleted_by: string | null;
  is_active: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  name: string;
  description: string;
  amendment: string | null;
  icon: string | null;
  service_type: string; // ID
  service_scope: string; // ID
  translation: string | null;
}

export interface Translation {
  id: string;
  country_id: string;
  created_by: string | null;
  updated_by: string | null;
  deleted_by: string | null;
  is_active: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  language: string;
  country: string; // ID
}

// types/hotel-types.ts

export interface IHotelFormData {
  name: string;
  code: string;
  country: string;
  hotel_type: string;
  website_url?: string;
  facebook_url?: string;
  instagram_url?: string;
  twitter_url?: string;
  youtube_url?: string;
  regions: string[];
  themes: string[];
  meal_types: string[];
  amenities: string[];
  services: string[];
  facilities: string[];
  translations: string[];
  is_eco_certified: boolean;
  year_built: number;
  check_in_from: string;
  check_out_to: string;
  number_rooms: number;
  number_floors: number;
  number_restaurants: number;
  number_bars: number;
  number_parks: number;
  number_halls: number;
  star_rating: number;
  zip_code: string;
  address: string;
  latitude: number;
  longitude: number;
  description: string;
  room_types: string[];
}

// --- TypeScript Type Definitions for Hotel & Booking APIs ---

// Response from /rooms/availability/range/
export interface Availability {
  date: string;
  availability_status: "Available" | "Booked";
}

export interface RoomInAvailability {
  room_id: string;
  room_code: string;
  room_type_id: string;
  price_per_night: number;
  availability: Availability[];
}

export interface AvailabilityResponse {
  hotel_id: string;
  room_type_id: string;
  start_date: string;
  end_date: string;
  rooms: RoomInAvailability[];
}

// Response from /room-types/{id}
export interface Feature {
  id: string;
  name: string;
  description: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  description: string;
  is_active: boolean;
  created_at: string;
  hotel: string;
}

export interface RoomTypeDetails {
  id: string;
  name: string;
  description: string;
  max_occupancy: number;
  image: string;
  base_price: string;
  features_list: Feature[];
}

// A combined type we'll use for rendering in the UI
export interface DisplayableRoomType {
  roomTypeId: string;
  name: string;
  description: string;
  maxOccupancy: number;
  image: string;
  price: number;
  availableRooms: RoomInAvailability[];
}
