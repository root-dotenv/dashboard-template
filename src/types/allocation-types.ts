// src/types/allocation-types.ts
// Corresponds to the /allocations/ endpoint.
export interface Allocation {
  id: string;
  name: string;
  start_date: string; // YYYY-MM-DD
  end_date: string; // YYYY-MM-DD
  status: "Draft" | "Pending" | "Confirmed" | "Cancelled" | "Expired";
  total_rooms: number;
  notes?: string;
  hotel: string; // UUID
  room_type: string; // UUID
  created_at: string; // ISO 8601
  updated_at: string; // ISO 8601
  approval_date?: string; // ISO 8601
  // --- NEW FIELDS FOR UI ---
  room_type_name?: string; // To hold the fetched name
  rooms_used?: number; // To hold aggregated usage data
}

// Represents the payload for creating a new allocation.
export type NewAllocationPayload = Omit<
  Allocation,
  "id" | "created_at" | "updated_at" | "room_type_name" | "rooms_used"
>;

// --- NEW ---
// Represents the payload for updating an existing allocation.
// It's partial because we only send the fields that have changed.
export type EditAllocationPayload = Partial<NewAllocationPayload>;

// Represents the detailed breakdown of rooms within an allocation.
// Corresponds to the /allocation-details/ endpoint.
export interface AllocationDetail {
  id: string;
  date: string; // YYYY-MM-DD
  status: "Available" | "Booked";
  allocation: string; // Allocation UUID
  hotel: string; // Hotel UUID
  room: string; // Room UUID
  room_type: string; // RoomType UUID
}

// Represents the usage tracking for an allocation.
// Corresponds to the /allocation-usage/ endpoint.
export interface AllocationUsage {
  id: string;
  date: string; // YYYY-MM-DD
  status: "Used" | "Released";
  rooms_used: number;
  booking_reference?: string;
  notes?: string;
  allocation: string; // Allocation UUID
}

// For API list responses
export interface PaginatedAllocationsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Allocation[];
}
