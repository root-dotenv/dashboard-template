// src/pages/rooms/room-types/types.ts
export interface HotelImage {
  id: string;
  tag: string;
  original: string;
  category: string;
}

export interface Amenity {
  id: string;
  name: string;
  icon: string;
}

export interface RoomTypeAvailability {
  status_counts: {
    Maintenance?: number;
    Available?: number;
    Booked?: number;
  };
  total_rooms: number;
  available_rooms: number;
  booked_rooms: number;
  maintenance_rooms: number;
  occupancy_percentage: number;
}

export interface RoomTypePricing {
  min_price: number;
  max_price: number;
  avg_price: number;
}

export interface HotelRoomType {
  id: string;
  name: string;
  code: string;
  description: string;
  max_occupancy: number;
  bed_type: string;
  size_sqm: string;
  base_price: string;
  images: any[];
  amenities: Amenity[];
  availability: RoomTypeAvailability;
  pricing: RoomTypePricing; // MODIFICATION: Added the missing pricing property
}

export interface Hotel {
  id: string;
  name: string;
  images: HotelImage[];
  room_type: HotelRoomType[];
  availability_stats: {
    status_counts: {
      Available: number;
    };
    occupancy_rate: number;
  };
  summary_counts: {
    rooms: number;
    available_rooms: number;
  };
  pricing_data: {
    avg: number;
  };
}

export interface AmenityDetail {
  id: string;
  name: string;
  code: string;
  description: string;
  icon: string;
  is_active: boolean;
}

// NEW: Represents the raw data from the /room-types/ list endpoint
export interface SafariProRoomTypeSummary {
  id: string;
  name: string;
  code: string;
  description: string;
  bed_type: string;
  max_occupancy: number;
  room_availability: number;
  image: string;
  size_sqm: string | null;
  base_price: string;
  is_active: boolean;
  features: any[]; // Assuming features are not used for now
  amenities: string[]; // This is the key difference: an array of ID strings
}

// Represents the FINAL data shape after we fetch amenity details
export interface DetailedRoomType {
  id: string;
  name: string;
  code: string;
  description: string;
  bed_type: string;
  max_occupancy: number;
  room_availability: number;
  image: string;
  size_sqm: string | null;
  base_price: string;
  is_active: boolean;
  features_list: { id: string; name: string }[];
  amenities_details: AmenityDetail[]; // The card component expects this
}

// UPDATE: This now uses the new summary type
export interface PaginatedRoomTypes {
  count: number;
  next: string | null;
  previous: string | null;
  results: SafariProRoomTypeSummary[]; // Changed from DetailedRoomType
}
