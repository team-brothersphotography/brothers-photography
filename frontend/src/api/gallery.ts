import { apiClient } from "./client";
import type { GalleryImage, ServiceCategory } from "../types";

export async function listGallery(params?: {
  category?: ServiceCategory;
  featured?: boolean;
  limit?: number;
  offset?: number;
}): Promise<GalleryImage[]> {
  const { data } = await apiClient.get<GalleryImage[]>("/gallery/", {
    params: {
      ...(params?.category ? { category: params.category } : {}),
      ...(params?.featured ? { featured: "true" } : {}),
      ...(params?.limit !== undefined ? { limit: params.limit } : {}),
      ...(params?.offset !== undefined ? { offset: params.offset } : {}),
    },
  });
  return data;
}

export async function galleryCount(category?: ServiceCategory): Promise<number> {
  const { data } = await apiClient.get<{ count: number }>("/gallery/count/", {
    params: category ? { category } : undefined,
  });
  return data.count;
}

export async function uploadGalleryImage(payload: {
  title: string;
  category: ServiceCategory;
  is_featured: boolean;
  file: File;
}): Promise<GalleryImage> {
  const formData = new FormData();
  formData.append("title", payload.title);
  formData.append("category", payload.category);
  formData.append("is_featured", String(payload.is_featured));
  formData.append("image", payload.file);
  const { data } = await apiClient.post<GalleryImage>("/gallery/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function deleteGalleryImage(id: number): Promise<void> {
  await apiClient.delete(`/gallery/${id}/`);
}
