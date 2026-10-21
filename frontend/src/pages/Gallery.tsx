import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "../components/layout/Layout";
import { listGallery } from "../api/gallery";
import { CATEGORIES } from "../utils/categories";
import { extractErrorMessage } from "../api/client";
import { trackActivity } from "../services/activityTracker";
import type { GalleryImage, ServiceCategory } from "../types";

export default function Gallery() {
  const [activeCategory, setActiveCategory] = useState<ServiceCategory | "all">("all");
  const [photos, setPhotos] = useState<GalleryImage[] | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setPhotos(null);
    setError("");
    listGallery(activeCategory === "all" ? undefined : { category: activeCategory })
      .then((data) => {
        setPhotos(data);
        trackActivity("GALLERY_VIEW", "/gallery", { category: activeCategory, count: data.length });
      })
      .catch((err) => setError(extractErrorMessage(err)));
  }, [activeCategory]);

  const currentPhoto = selectedIndex !== null && photos ? photos[selectedIndex] : null;

  const handleNext = useCallback(() => {
    if (selectedIndex !== null && photos) {
      setSelectedIndex((selectedIndex + 1) % photos.length);
    }
  }, [selectedIndex, photos]);

  const handlePrev = useCallback(() => {
    if (selectedIndex !== null && photos) {
      setSelectedIndex((selectedIndex - 1 + photos.length) % photos.length);
    }
  }, [selectedIndex, photos]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (selectedIndex === null) return;
      if (e.key === "Escape") setSelectedIndex(null);
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIndex, handleNext, handlePrev]);

  return (
    <Layout>
      <section className="mx-auto max-w-6xl px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-sm uppercase tracking-[0.25em] text-gold font-medium">Portfolio</p>
          <h1 className="mt-2 font-display text-4xl text-cream md:text-5xl">Photo Gallery</h1>
          <p className="mt-4 max-w-2xl text-cream-dim leading-relaxed">
            Browse our curated gallery of wedding memories, pre-wedding stories, and family celebrations.
          </p>
        </motion.div>

        {/* Category Filters */}
        <div className="mt-8 flex flex-wrap gap-2">
          <button
            onClick={() => setActiveCategory("all")}
            className={`rounded-full border px-4 py-1.5 text-sm transition-all duration-200 ${
              activeCategory === "all"
                ? "border-gold bg-gold text-ink font-medium shadow-sm"
                : "border-line text-cream-dim hover:border-gold/50 hover:text-cream"
            }`}
          >
            All Works
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setActiveCategory(cat.value)}
              className={`rounded-full border px-4 py-1.5 text-sm transition-all duration-200 ${
                activeCategory === cat.value
                  ? "border-gold bg-gold text-ink font-medium shadow-sm"
                  : "border-line text-cream-dim hover:border-gold/50 hover:text-cream"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Error State */}
        {error && (
          <div className="mt-10 rounded-xl border border-clay/40 bg-clay/10 p-6 text-center text-clay">
            {error}
          </div>
        )}

        {/* Loading State */}
        {photos === null && !error && (
          <div className="mt-10 columns-2 gap-4 sm:columns-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="mb-4 h-64 animate-pulse rounded-xl bg-panel" />
            ))}
          </div>
        )}

        {/* Empty State */}
        {photos !== null && photos.length === 0 && !error && (
          <div className="mt-14 rounded-2xl border border-line bg-panel p-10 text-center text-cream-dim">
            No photos uploaded in this category yet — check back soon.
          </div>
        )}

        {/* Photo Grid */}
        {photos !== null && photos.length > 0 && (
          <div className="mt-10 columns-2 gap-4 sm:columns-3">
            {photos.map((photo, index) => (
              <motion.button
                key={photo.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: (index % 6) * 0.05 }}
                onClick={() => {
                  setSelectedIndex(index);
                  trackActivity("PHOTO_VIEW", "/gallery", { photo_id: photo.id, category: photo.category });
                }}
                className="group relative mb-4 block w-full break-inside-avoid overflow-hidden rounded-xl bg-panel-soft text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
              >
                <img
                  src={photo.image_url}
                  alt={photo.title || photo.category_display}
                  loading="lazy"
                  className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-end p-4">
                  <div>
                    <span className="text-xs uppercase tracking-wider text-gold font-medium">
                      {photo.category_display}
                    </span>
                    {photo.title && <p className="text-sm font-display text-cream">{photo.title}</p>}
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </section>

      {/* Lightbox Modal with Next/Prev and Keyboard Nav */}
      <AnimatePresence>
        {currentPhoto && selectedIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-ink/95 backdrop-blur-sm p-4 sm:p-8"
            onClick={() => setSelectedIndex(null)}
          >
            {/* Close Button */}
            <button
              className="absolute right-6 top-6 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-line bg-panel/80 text-cream transition-colors hover:border-gold hover:text-gold"
              onClick={() => setSelectedIndex(null)}
              aria-label="Close Lightbox"
            >
              ✕
            </button>

            {/* Previous Button */}
            {photos && photos.length > 1 && (
              <button
                className="absolute left-4 sm:left-8 z-10 flex h-12 w-12 items-center justify-center rounded-full border border-line bg-panel/80 text-cream transition-colors hover:border-gold hover:text-gold text-xl"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrev();
                }}
                aria-label="Previous Photo"
              >
                ‹
              </button>
            )}

            {/* Next Button */}
            {photos && photos.length > 1 && (
              <button
                className="absolute right-4 sm:right-8 z-10 flex h-12 w-12 items-center justify-center rounded-full border border-line bg-panel/80 text-cream transition-colors hover:border-gold hover:text-gold text-xl"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                aria-label="Next Photo"
              >
                ›
              </button>
            )}

            {/* Image & Caption */}
            <div
              className="relative max-h-[85vh] max-w-4xl overflow-hidden rounded-xl bg-panel p-2 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={currentPhoto.image_url}
                alt={currentPhoto.title || currentPhoto.category_display}
                className="max-h-[75vh] w-auto max-w-full rounded-lg object-contain mx-auto"
              />
              <div className="mt-3 flex items-center justify-between px-3 text-xs text-cream-dim">
                <span>{currentPhoto.title || currentPhoto.category_display}</span>
                <span>
                  {selectedIndex + 1} / {photos?.length}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
}
