// src/pages/rooms/available-rooms-by-date/types.ts

// Type for the availability status on a single day
export interface DailyAvailability {
  date: string;
  availability_status: "Available" | "Booked" | "Maintenance"; // Add other potential statuses
}

// Type for a single room in the availability list response
export interface RoomInList {
  room_id: string;
  room_code: string;
  room_type_id: string;
  room_type_name: string;
  bed_type: string;
  price_per_night: number;
  availability: DailyAvailability[];
}

// Type for the main response from the /availability/range/ endpoint
export interface AvailabilityRangeResponse {
  hotel_id: string;
  start_date: string;
  end_date: string;
  rooms: RoomInList[];
}

// --- Types for the Detailed Room View ---

export interface Amenity {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export interface RoomImage {
  id: string;
  code: string;
  url: string;
}

// Type for the response from the /rooms/{id} endpoint
export interface DetailedRoom {
  id: string;
  hotel_name: string;
  room_type_name: string;
  amenities: Amenity[];
  images: RoomImage[];
  code: string;
  description: string;
  max_occupancy: number;
  price_per_night: number;
  floor_number: number;
}
