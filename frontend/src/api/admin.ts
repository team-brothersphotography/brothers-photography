import { apiClient } from "./client";
import type { BlockedSlot, Booking, BookingStatus, DashboardStats } from "../types";

export async function getDashboardStats(): Promise<DashboardStats> {
  const { data } = await apiClient.get<DashboardStats>("/admin/dashboard-stats/");
  return data;
}

export async function listAllBookings(status?: BookingStatus): Promise<Booking[]> {
  const { data } = await apiClient.get<Booking[]>("/admin/bookings/", {
    params: status ? { status } : undefined,
  });
  return data;
}

export async function updateBookingStatus(id: number, status: BookingStatus): Promise<Booking> {
  const { data } = await apiClient.patch<Booking>(`/admin/bookings/${id}/`, { status });
  return data;
}

export async function listBlockedSlots(): Promise<BlockedSlot[]> {
  const { data } = await apiClient.get<BlockedSlot[]>("/admin/blocked-slots/");
  return data;
}

export async function createBlockedSlot(payload: {
  date: string;
  time?: string | null;
  reason?: string;
}): Promise<BlockedSlot> {
  const { data } = await apiClient.post<BlockedSlot>("/admin/blocked-slots/", payload);
  return data;
}

export async function deleteBlockedSlot(id: number): Promise<void> {
  await apiClient.delete(`/admin/blocked-slots/${id}/`);
}
