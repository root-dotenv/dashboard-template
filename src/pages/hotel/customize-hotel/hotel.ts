export interface Country {
  id: string;
  name: string;
  code: string | null;
  continent: string;
}

export interface RoomType {
  id: string;
  name: string;
  code: string;
  // Add other room type properties if needed
}

export interface Theme {
  id: string;
  name: string;
}
export interface MealType {
  id: string;
  name: string;
  code: string;
}
export interface Amenity {
  id: string;
  name: string;
}
export interface Service {
  id: string;
  name: string;
}
export interface Facility {
  id: string;
  name: string;
}

export interface Translation {
  id: string;
  language: string;
  country_name: string;
}

export interface Region {
  id: string;
  name: string;
}

export interface HotelType {
  id: string;
  name: string;
}

export interface Hotel {
  id: string;
  image_ids: string[];
  room_type: RoomType[];
  staff_ids: string[];
  promotion_ids: string[];
  event_space_ids: string[];
  department_ids: string[];
  activity_ids: string[];
  maintenance_request_ids: string[];
  pricing_data: { min: number; max: number /* ... */ };
  availability_stats: { status_counts: Record<string, number> /* ... */ };
  has_more: { images: boolean; rooms: boolean /* ... */ };
  next_page_tokens: { images: number; rooms: number /* ... */ };
  website_url: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  twitter_url: string | null;
  Maps_url: string | null;
  summary_counts: { rooms: number; images: number /* ... */ };
  average_room_price: number;
  occupancy_rate: number;
  created_by: string;
  updated_by: string;
  deleted_by: string | null;
  is_active: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  vendor_id: string;
  name: string;
  code: string;
  description: string;
  star_rating: number;
  zip_code: string;
  address: string;
  latitude: number;
  longitude: number;
  distance_from_center_km: number | null;
  destination: string | null;
  score_availability: number | null;
  number_rooms: number;
  number_floors: number | null;
  number_restaurants: number | null;
  number_bars: number | null;
  number_parks: number | null;
  number_halls: number | null;
  discount: number | null;
  timezone: string | null;
  directions: string | null;
  is_superhost: boolean;
  is_eco_certified: boolean;
  max_discount_percent: number | null;
  year_built: number;
  number_activities: number | null;
  rate_options: string;
  check_in_from: string | null;
  check_out_to: string | null;
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
