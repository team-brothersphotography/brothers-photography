export type ServiceCategory =
  | "wedding"
  | "pre_wedding"
  | "home_ceremony"
  | "birthday"
  | "naming_ceremony"
  | "maternity"
  | "modeling"
  | "candid";

export interface Service {
  id: number;
  name: string;
  category: ServiceCategory;
  category_display: string;
  highlights: string[]; // up to 3 short descriptive points - no prices anywhere
  image_url: string | null;
  is_active: boolean;
  order: number;
}

export interface GalleryImage {
  id: number;
  title: string | null;
  category: ServiceCategory;
  category_display: string;
  image_url: string;
  is_featured: boolean;
  uploaded_at: string;
}

export interface User {
  id: number;
  full_name: string;
  phone_number: string;
  email: string | null;
  is_owner: boolean;
}

export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";

export interface Booking {
  id: number;
  reference_number: string;
  service_id: number;
  service: Service;
  full_name: string;
  phone_number: string;
  event_location: string;
  number_of_guests: number | null;
  message: string | null;
  event_date: string;
  event_time: string;
  status: BookingStatus;
  status_display: string;
  created_at: string;
}

export interface SlotAvailability {
  time: string;
  available: boolean;
}

export interface AvailabilityResponse {
  date: string;
  day_blocked: boolean;
  slots: SlotAvailability[];
}

export interface SiteSettings {
  business_name: string;
  tagline: string;
  intro_text: string;
  brother_one_name: string;
  brother_one_role: string;
  brother_one_bio: string;
  brother_one_photo: string | null;
  brother_two_name: string;
  brother_two_role: string;
  brother_two_bio: string;
  brother_two_photo: string | null;
  phone_number: string;
  alternate_phone_number: string;
  whatsapp_number: string;
  email: string;
  address: string;
  google_maps_url: string;
  logo: string | null;
}

export interface DashboardStats {
  total_bookings: number;
  pending_bookings: number;
  confirmed_bookings: number;
  completed_bookings: number;
  cancelled_bookings: number;
  upcoming_bookings: number;
  active_services: number;
}

export interface BlockedSlot {
  id: number;
  date: string;
  time: string | null;
  reason: string | null;
}

export interface ApiErrorShape {
  detail?: string;
  [field: string]: unknown;
}
