import { useEffect, useRef, useState } from "react";
import AdminLayout from "./AdminLayout";
import Button from "../../components/ui/Button";
import { FieldWrapper, Input } from "../../components/ui/Field";
import { listGallery, uploadGalleryImage, deleteGalleryImage } from "../../api/gallery";
import { extractErrorMessage } from "../../api/client";
import { CATEGORIES } from "../../utils/categories";
import type { GalleryImage, ServiceCategory } from "../../types";

export default function GalleryManager() {
  const [photos, setPhotos] = useState<GalleryImage[] | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<ServiceCategory>("wedding");
  const [isFeatured, setIsFeatured] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const PAGE_SIZE = 60;

  function refresh() {
    listGallery({ limit: PAGE_SIZE + 1 }).then((data) => {
      setHasMore(data.length > PAGE_SIZE);
      setPhotos(data.slice(0, PAGE_SIZE));
    });
  }

  function loadAll() {
    listGallery().then((data) => {
      setPhotos(data);
      setHasMore(false);
    });
  }

  useEffect(refresh, []);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setError("Please choose a photo to upload.");
      return;
    }
    setError("");
    setIsUploading(true);
    try {
      await uploadGalleryImage({ title, category, is_featured: isFeatured, file });
      setTitle("");
      setIsFeatured(false);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      refresh();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsUploading(false);
    }
  }

  async function handleDelete(photo: GalleryImage) {
    if (!confirm("Remove this photo from the gallery?")) return;
    await deleteGalleryImage(photo.id);
    refresh();
  }

  return (
    <AdminLayout>
      <div className="grid gap-8 lg:grid-cols-[1fr_1.4fr]">
        <form onSubmit={handleUpload} className="rounded-xl border border-line bg-panel p-6">
          <p className="font-display text-xl text-cream">Upload a photo</p>
          <div className="mt-5 flex flex-col gap-4">
            <FieldWrapper label="Title (optional)">
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </FieldWrapper>
            <FieldWrapper label="Category">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ServiceCategory)}
                className="w-full rounded-lg border border-line bg-panel px-4 py-2.5 text-cream focus:border-gold"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </FieldWrapper>
            <FieldWrapper label="Photo file">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full text-sm text-cream-dim file:mr-4 file:rounded-full file:border-0 file:bg-gold file:px-4 file:py-2 file:text-sm file:text-ink"
              />
            </FieldWrapper>
            <label className="flex items-center gap-2 text-sm text-cream-dim">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="h-4 w-4 accent-gold"
              />
              Feature on home page
            </label>

            {error && <p className="text-sm text-clay">{error}</p>}

            <Button type="submit" isLoading={isUploading}>
              Upload photo
            </Button>
          </div>
        </form>

        <div>
          {photos === null ? (
            <div className="grid grid-cols-3 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-square animate-pulse rounded-lg bg-panel" />
              ))}
            </div>
          ) : photos.length === 0 ? (
            <p className="text-cream-dim">No photos uploaded yet.</p>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {photos.map((photo) => (
                <div key={photo.id} className="group relative aspect-square overflow-hidden rounded-lg bg-panel-soft">
                  <img src={photo.image_url} alt={photo.title || photo.category_display} className="h-full w-full object-cover" />
                  {photo.is_featured && (
                    <span className="absolute left-1.5 top-1.5 rounded-full bg-gold px-2 py-0.5 text-[10px] text-ink">
                      Featured
                    </span>
                  )}
                  <button
                    onClick={() => handleDelete(photo)}
                    className="absolute inset-0 flex items-center justify-center bg-ink/70 text-sm text-cream opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
          {hasMore && (
            <div className="mt-4 text-center">
              <Button variant="outline" onClick={loadAll}>
                Load all photos
              </Button>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
