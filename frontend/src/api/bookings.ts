import { apiClient } from "./client";
import type { AvailabilityResponse, Booking } from "../types";

export interface CreateBookingPayload {
  service_id: number;
  full_name: string;
  phone_number: string;
  event_location: string;
  number_of_guests?: number | null;
  message?: string;
  event_date: string;
  event_time: string;
}

export async function getAvailability(date: string): Promise<AvailabilityResponse> {
  const { data } = await apiClient.get<AvailabilityResponse>("/availability/", {
    params: { date },
  });
  return data;
}

export async function createBooking(payload: CreateBookingPayload): Promise<Booking> {
  const { data } = await apiClient.post<Booking>("/bookings/", payload);
  return data;
}

export async function listMyBookings(): Promise<Booking[]> {
  const { data } = await apiClient.get<Booking[]>("/bookings/");
  return data;
}
