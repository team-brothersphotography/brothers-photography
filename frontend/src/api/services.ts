import { apiClient } from "./client";
import type { Service, ServiceCategory } from "../types";

export async function listServices(category?: ServiceCategory): Promise<Service[]> {
  const { data } = await apiClient.get<Service[]>("/services/", {
    params: category ? { category } : undefined,
  });
  return data;
}

/** Owner-only: includes inactive services, for the admin dashboard. */
export async function listAllServices(): Promise<Service[]> {
  const { data } = await apiClient.get<Service[]>("/services/all/");
  return data;
}

export interface ServiceFormPayload {
  name: string;
  category: ServiceCategory;
  highlights: string[]; // up to 3 short points - no pricing fields
  is_active: boolean;
  order?: number;
  image?: File | null;
}

function toFormData(payload: Partial<ServiceFormPayload>): FormData {
  const form = new FormData();
  if (payload.name !== undefined) form.append("name", payload.name);
  if (payload.category !== undefined) form.append("category", payload.category);
  if (payload.highlights !== undefined) {
    form.append("highlight_1", payload.highlights[0] ?? "");
    form.append("highlight_2", payload.highlights[1] ?? "");
    form.append("highlight_3", payload.highlights[2] ?? "");
  }
  if (payload.is_active !== undefined) form.append("is_active", String(payload.is_active));
  if (payload.order !== undefined) form.append("order", String(payload.order));
  if (payload.image) form.append("image", payload.image);
  return form;
}

export async function createService(payload: ServiceFormPayload): Promise<Service> {
  const { data } = await apiClient.post<Service>("/services/", toFormData(payload));
  return data;
}

export async function updateService(id: number, payload: Partial<ServiceFormPayload>): Promise<Service> {
  const { data } = await apiClient.patch<Service>(`/services/${id}/`, toFormData(payload));
  return data;
}

export async function deleteService(id: number): Promise<void> {
  await apiClient.delete(`/services/${id}/`);
}
