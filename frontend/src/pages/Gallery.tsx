import { useEffect, useState } from "react";
import Layout from "../components/layout/Layout";
import { listGallery } from "../api/gallery";
import { CATEGORIES } from "../utils/categories";
import type { GalleryImage, ServiceCategory } from "../types";

export default function Gallery() {
  const [activeCategory, setActiveCategory] = useState<ServiceCategory | "all">("all");
  const [photos, setPhotos] = useState<GalleryImage[] | null>(null);
  const [lightbox, setLightbox] = useState<GalleryImage | null>(null);

  useEffect(() => {
    setPhotos(null);
    listGallery(activeCategory === "all" ? undefined : { category: activeCategory }).then(setPhotos);
  }, [activeCategory]);

  return (
    <Layout>
      <section className="mx-auto max-w-6xl px-6 py-16">
        <p className="text-sm uppercase tracking-[0.2em] text-gold">Our work</p>
        <h1 className="mt-2 font-display text-4xl text-cream md:text-5xl">Gallery</h1>

        <div className="mt-8 flex flex-wrap gap-2">
          <button
            onClick={() => setActiveCategory("all")}
            className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
              activeCategory === "all"
                ? "border-gold bg-gold text-ink"
                : "border-line text-cream-dim hover:border-gold/50"
            }`}
          >
            All
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setActiveCategory(cat.value)}
              className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                activeCategory === cat.value
                  ? "border-gold bg-gold text-ink"
                  : "border-line text-cream-dim hover:border-gold/50"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {photos === null ? (
          <div className="mt-10 columns-2 gap-4 sm:columns-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="mb-4 h-56 animate-pulse rounded-xl bg-panel" />
            ))}
          </div>
        ) : photos.length === 0 ? (
          <p className="mt-14 text-cream-dim">No photos in this category yet — check back soon.</p>
        ) : (
          <div className="mt-10 columns-2 gap-4 sm:columns-3">
            {photos.map((photo) => (
              <button
                key={photo.id}
                onClick={() => setLightbox(photo)}
                className="mb-4 block w-full break-inside-avoid overflow-hidden rounded-xl bg-panel-soft"
              >
                <img
                  src={photo.image_url}
                  alt={photo.title || photo.category_display}
                  loading="lazy"
                  className="w-full object-cover transition-transform hover:scale-[1.02]"
                />
              </button>
            ))}
          </div>
        )}
      </section>

      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/95 p-6"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute right-6 top-6 text-cream"
            onClick={() => setLightbox(null)}
            aria-label="Close"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
          <img
            src={lightbox.image_url}
            alt={lightbox.title || lightbox.category_display}
            className="max-h-[85vh] max-w-full rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </Layout>
  );
}
