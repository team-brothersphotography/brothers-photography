import { apiClient } from "./client";
import type { SiteSettings } from "../types";

export async function getSiteSettings(): Promise<SiteSettings> {
  const { data } = await apiClient.get<SiteSettings>("/site-settings/");
  return data;
}

export async function updateSiteSettings(payload: Partial<SiteSettings>): Promise<SiteSettings> {
  const { data } = await apiClient.patch<SiteSettings>("/site-settings/", payload);
  return data;
}
