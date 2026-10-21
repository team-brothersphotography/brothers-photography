import { useEffect, useState, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Layout from "../components/layout/Layout";
import Button from "../components/ui/Button";
import { listServices } from "../api/services";
import { listGallery } from "../api/gallery";
import { useSiteSettings } from "../hooks/useSiteSettings";
import { trackActivity } from "../services/activityTracker";
import type { GalleryImage, Service } from "../types";
import officialLogo from "../assets/branding/brothers-photography-logo.jpg";

// Official Four Hero Photographs
import heroWedding from "../assets/hero/hero-wedding.jpg";
import heroPreWedding from "../assets/hero/hero-pre-wedding.png";
import heroModelling from "../assets/hero/hero-modelling.png";
import heroHouseWarming from "../assets/hero/hero-house-warming.png";

export interface HeroSlide {
  id: string;
  category: string;
  title: string;
  titleSpan: string;
  subtitle: string;
  image: string;
  objectPosition: string;
  ctaText: string;
  ctaLink: string;
  slideNum: string;
}

const HERO_SLIDES: HeroSlide[] = [
  {
    id: "wedding",
    category: "WEDDINGS",
    title: "YOUR LOVE.",
    titleSpan: "YOUR FOREVER.",
    subtitle: "Timeless moments captured with emotion, elegance and meaning.",
    image: heroWedding,
    objectPosition: "object-center",
    ctaText: "VIEW WEDDINGS",
    ctaLink: "/gallery",
    slideNum: "01",
  },
  {
    id: "pre-wedding",
    category: "PRE-WEDDING STORIES",
    title: "BEFORE THE",
    titleSpan: "FOREVER.",
    subtitle: "Capturing the authentic romance and quiet chemistry before your big day.",
    image: heroPreWedding,
    objectPosition: "object-[75%_center] sm:object-center",
    ctaText: "VIEW STORIES",
    ctaLink: "/gallery",
    slideNum: "02",
  },
  {
    id: "modelling",
    category: "MODELLING",
    title: "YOUR STYLE.",
    titleSpan: "YOUR FRAME.",
    subtitle: "Bold portraits and refined imagery created to make every frame stand out.",
    image: heroModelling,
    objectPosition: "object-center",
    ctaText: "VIEW MODELLING",
    ctaLink: "/gallery",
    slideNum: "03",
  },
  {
    id: "house-warming",
    category: "HOUSE WARMING",
    title: "A NEW HOME.",
    titleSpan: "A NEW CHAPTER.",
    subtitle: "Preserving the warmth, joy and memories of your special beginning.",
    image: heroHouseWarming,
    objectPosition: "object-center",
    ctaText: "VIEW STORIES",
    ctaLink: "/gallery",
    slideNum: "04",
  },
];

export default function Home() {
  const { settings } = useSiteSettings();
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();

  const [services, setServices] = useState<Service[]>([]);
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [activeSlide, setActiveSlide] = useState(0);
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryImage | null>(null);

  const touchStartX = useRef<number | null>(null);

  // Load Services & Gallery from Backend APIs for downstream sections
  useEffect(() => {
    listServices().then(setServices).catch(() => {});
    listGallery({ featured: true }).then(setGallery).catch(() => {});
  }, []);

  const totalSlides = HERO_SLIDES.length;
  const currentSlide = HERO_SLIDES[activeSlide] || HERO_SLIDES[0];

  const handleNext = useCallback(() => {
    setActiveSlide((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const handlePrev = useCallback(() => {
    setActiveSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  const handleDotClick = useCallback((index: number) => {
    setActiveSlide(index);
  }, []);

  // Single Automatic Slideshow Timer (6000ms, resets on manual navigation)
  useEffect(() => {
    const timer = setInterval(() => {
      handleNext();
    }, 6000);

    return () => clearInterval(timer);
  }, [handleNext, activeSlide]);

  // Track slide views
  useEffect(() => {
    trackActivity("HERO_SLIDE_VIEWED", "/", {
      slideIndex: activeSlide,
      category: currentSlide.category,
      title: currentSlide.title,
    });
  }, [activeSlide, currentSlide.category, currentSlide.title]);

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const activeTag = (document.activeElement?.tagName || "").toUpperCase();
      if (["INPUT", "TEXTAREA", "SELECT"].includes(activeTag)) return;

      if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNext, handlePrev]);

  // Mobile Touch Swipe
  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    if (diff > 40) {
      handleNext();
    } else if (diff < -40) {
      handlePrev();
    }
    touchStartX.current = null;
  }

  const featuredServices = services.slice(0, 4);
  const featuredGallery = gallery.slice(0, 6);

  return (
    <Layout>
      {/* ============================================================ */}
      {/* 1. CINEMATIC HERO SLIDESHOW SECTION (100vh with 3-Zone Layout) */}
      {/* ============================================================ */}
      <section
        className="relative h-screen min-h-[680px] w-full overflow-hidden bg-ink select-none"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        aria-label="Brothers Photography Official Hero Showcase"
      >
        {/* Background Image Slide with Tailored objectPosition */}
        <AnimatePresence mode="sync">
          <motion.img
            key={currentSlide.id + "-" + activeSlide}
            src={currentSlide.image}
            alt={currentSlide.category}
            initial={
              prefersReducedMotion
                ? { opacity: 0 }
                : { opacity: 0, scale: 1.04 }
            }
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: [0.25, 1, 0.5, 1] }}
            className={`absolute inset-0 h-full w-full object-cover ${currentSlide.objectPosition}`}
          />
        </AnimatePresence>

        {/* Controlled Gradient Overlays for Maximum Text Legibility & Bright Subject Visibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-ink/95 via-ink/65 to-transparent w-full md:w-3/4 lg:w-3/5" />
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-ink/80 via-ink/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-44 bg-gradient-to-t from-ink via-ink/40 to-transparent" />

        {/* 3-ZONE STRUCTURAL HERO CONTAINER */}
        <div className="relative z-10 mx-auto flex h-full max-w-6xl flex-col justify-between px-6 pb-8 sm:pb-12 pt-28 sm:pt-32 md:pt-36">
          {/* ZONE 1 (TOP): Clearance spacing below fixed Navbar/Logo */}
          <div className="h-2 sm:h-4" />

          {/* ZONE 2 (MIDDLE): Hero Content Wrapper (Category -> Headline -> Subtitle -> CTA) */}
          <div className="max-w-2xl space-y-4 my-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSlide}
                initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: prefersReducedMotion ? 0 : -16 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
                className="space-y-4"
              >
                {/* Category Badge - Strictly Separated Below Navbar */}
                <motion.div
                  initial={{ opacity: 0, y: prefersReducedMotion ? 0 : -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.08 }}
                >
                  <span className="inline-block rounded-full border border-gold/40 bg-ink/75 px-4 py-1.5 text-xs font-semibold tracking-[0.25em] text-gold uppercase backdrop-blur-md shadow-lg">
                    {currentSlide.category}
                  </span>
                </motion.div>

                {/* Headline */}
                <motion.h1
                  initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: 0.16 }}
                  className="font-display text-4xl leading-[1.08] text-cream sm:text-6xl md:text-7xl lg:text-8xl tracking-tight drop-shadow-lg"
                >
                  {currentSlide.title}
                  <br />
                  <span className="italic text-gold font-light">
                    {currentSlide.titleSpan}
                  </span>
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                  initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.24 }}
                  className="max-w-xl text-base sm:text-lg md:text-xl text-cream-dim/95 font-light leading-relaxed drop-shadow"
                >
                  {currentSlide.subtitle}
                </motion.p>

                {/* CTA Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.32 }}
                  className="pt-2 flex flex-wrap items-center gap-4"
                >
                  <Link
                    to={currentSlide.ctaLink}
                    onClick={() =>
                      trackActivity("HERO_CTA_CLICKED", "/", {
                        cta: currentSlide.ctaText,
                        slide: activeSlide,
                      })
                    }
                    className="group inline-flex items-center gap-3 rounded-full bg-gold px-8 py-3.5 text-sm font-semibold tracking-wider text-ink transition-all duration-300 hover:bg-gold-soft hover:shadow-[0_0_30px_rgba(212,175,55,0.45)]"
                  >
                    <span>{currentSlide.ctaText}</span>
                    <svg
                      className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      />
                    </svg>
                  </Link>

                  <Link
                    to="/booking"
                    className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-ink/50 px-6 py-3.5 text-sm font-medium text-cream backdrop-blur-md transition-colors hover:border-gold hover:bg-ink/80"
                  >
                    BOOK SESSION
                  </Link>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* ZONE 3 (BOTTOM): Slide Counter, Progress Line & Manual Navigation */}
          <div className="flex flex-wrap items-center justify-between gap-6 border-t border-cream/15 pt-5">
            {/* Slide Counter & Progress Bar */}
            <div className="flex items-center gap-4">
              <span className="font-mono text-sm tracking-widest text-gold font-bold">
                {currentSlide.slideNum}
              </span>
              <div className="relative h-1 w-28 sm:w-40 overflow-hidden rounded-full bg-cream/20">
                <motion.div
                  key={`progress-${activeSlide}`}
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 6, ease: "linear" }}
                  className="h-full bg-gold"
                />
              </div>
              <span className="font-mono text-xs tracking-widest text-cream-dim/60">
                0{totalSlides}
              </span>
            </div>

            {/* Navigation Dots */}
            <div className="flex items-center gap-2">
              {HERO_SLIDES.map((slide, idx) => (
                <button
                  key={slide.id}
                  onClick={() => handleDotClick(idx)}
                  aria-label={`Go to slide ${idx + 1} - ${slide.category}`}
                  className={`h-2.5 transition-all duration-300 rounded-full ${
                    idx === activeSlide
                      ? "w-8 bg-gold"
                      : "w-2.5 bg-cream/30 hover:bg-cream/60"
                  }`}
                />
              ))}
            </div>

            {/* Prev / Next Manual Controls */}
            <div className="flex items-center gap-3">
              <button
                onClick={handlePrev}
                aria-label="Previous slide"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-cream/20 bg-ink/50 text-cream backdrop-blur-md transition-all duration-300 hover:border-gold hover:bg-gold hover:text-ink focus:outline-none focus:ring-2 focus:ring-gold"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={handleNext}
                aria-label="Next slide"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-cream/20 bg-ink/50 text-cream backdrop-blur-md transition-all duration-300 hover:border-gold hover:bg-gold hover:text-ink focus:outline-none focus:ring-2 focus:ring-gold"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 2. EDITORIAL INTRODUCTION SECTION */}
      {/* ============================================================ */}
      <section className="bg-panel-soft border-b border-line/40 py-24 md:py-32">
        <div className="mx-auto max-w-5xl px-6 text-center space-y-6">
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-xs font-semibold tracking-[0.3em] text-gold uppercase"
          >
            BROTHERS PHOTOGRAPHY STUDIO
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display text-3xl sm:text-5xl md:text-6xl text-cream leading-[1.12]"
          >
            "WE CAPTURE MOMENTS.
            <br />
            <span className="italic text-gold font-light">YOU KEEP THEM FOREVER."</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto max-w-2xl text-base sm:text-lg leading-relaxed text-cream-dim font-light"
          >
            {settings?.intro_text ||
              "Every celebration holds genuine emotion. We dedicate our artistic eye and personal attention to making sure your weddings, pre-wedding shoots, modeling portfolios, and house warming ceremonies are framed with warmth and timeless beauty."}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="pt-4"
          >
            <div className="mx-auto h-0.5 w-16 bg-gold/40" />
          </motion.div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 3. FEATURED PHOTOGRAPHY GALLERY PREVIEW */}
      {/* ============================================================ */}
      <section className="bg-panel/40 border-b border-line/40 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-gold font-semibold">
                Selected Portfolio
              </p>
              <h2 className="mt-2 font-display text-3xl sm:text-4xl text-cream">
                Featured Photography
              </h2>
            </div>
            <Link
              to="/gallery"
              className="group inline-flex items-center gap-2 text-sm font-semibold tracking-wider text-gold hover:text-gold-soft transition-colors"
            >
              <span>VIEW FULL GALLERY</span>
              <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {(featuredGallery.length > 0
              ? featuredGallery
              : [
                  {
                    id: 1,
                    title: "Royal Wedding Rituals",
                    category_display: "WEDDING",
                    image_url: heroWedding,
                  },
                  {
                    id: 2,
                    title: "Romantic Pre-Wedding Veil",
                    category_display: "PRE-WEDDING",
                    image_url: heroPreWedding,
                  },
                  {
                    id: 3,
                    title: "Studio Fashion & Suit Portrait",
                    category_display: "MODELLING",
                    image_url: heroModelling,
                  },
                  {
                    id: 4,
                    title: "Traditional Griha Pravesh & Kalash",
                    category_display: "HOUSE WARMING",
                    image_url: heroHouseWarming,
                  },
                ]
            ).map((photo, i) => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                onClick={() => setSelectedPhoto(photo as GalleryImage)}
                className={`group relative cursor-pointer overflow-hidden rounded-2xl border border-line/60 bg-panel shadow-lg transition-all duration-500 hover:border-gold/50 ${
                  i === 0 || i === 3 ? "lg:col-span-2 aspect-[16/10]" : "aspect-[4/5]"
                }`}
              >
                <img
                  src={photo.image_url}
                  alt={photo.title || photo.category_display}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex flex-col justify-end p-6">
                  <span className="text-xs font-semibold tracking-widest text-gold uppercase">
                    {photo.category_display || "PHOTOGRAPHY"}
                  </span>
                  <h3 className="mt-1 font-display text-xl text-cream font-medium">
                    {photo.title || "Brothers Photography Showcase"}
                  </h3>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link to="/gallery">
              <Button variant="outline" className="px-8 py-3">
                EXPLORE ALL GALLERY WORK →
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 4. SERVICES PREVIEW SHOWCASE */}
      {/* ============================================================ */}
      <section className="mx-auto max-w-6xl px-6 py-24 border-b border-line/40">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-gold font-semibold">
              Our Craft
            </p>
            <h2 className="mt-2 font-display text-3xl sm:text-4xl text-cream">
              Services & Specialties
            </h2>
          </div>
          <Link
            to="/services"
            className="group inline-flex items-center gap-2 text-sm font-semibold tracking-wider text-gold hover:text-gold-soft transition-colors"
          >
            <span>EXPLORE ALL SERVICES</span>
            <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {(featuredServices.length > 0
            ? featuredServices
            : [
                {
                  id: "1",
                  name: "Wedding Photography",
                  category: "wedding",
                  image_url: heroWedding,
                  highlights: ["Full-day coverage", "Two-photographer team", "Cinematic highlight reel"],
                },
                {
                  id: "2",
                  name: "Pre-Wedding Stories",
                  category: "pre_wedding",
                  image_url: heroPreWedding,
                  highlights: ["Outdoor & studio shoots", "Styling & pose guidance", "Preview gallery"],
                },
                {
                  id: "3",
                  name: "Modelling Photography",
                  category: "modeling",
                  image_url: heroModelling,
                  highlights: ["Portfolio-ready edits", "Concept & fashion themes", "Studio lighting guidance"],
                },
                {
                  id: "4",
                  name: "House Warming Ceremony",
                  category: "home_ceremony",
                  image_url: heroHouseWarming,
                  highlights: ["Ritual documentation", "Kalash & puja detail shots", "Family group portraits"],
                },
              ]
          ).map((service, i) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-line bg-panel transition-all duration-300 hover:border-gold/50 shadow-lg"
            >
              <div>
                {service.image_url && (
                  <div className="aspect-[4/3] overflow-hidden bg-panel-soft">
                    <img
                      src={service.image_url}
                      alt={service.name}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                )}
                <div className="p-6">
                  <h3 className="font-display text-xl text-cream font-medium">{service.name}</h3>
                  <ul className="mt-3 space-y-2">
                    {service.highlights.slice(0, 3).map((item) => (
                      <li key={item} className="flex items-start gap-2 text-xs text-cream-dim">
                        <span className="text-gold shrink-0 mt-0.5">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="p-6 pt-0">
                <button
                  onClick={() => navigate(`/booking?service=${service.id}`)}
                  className="w-full rounded-xl border border-gold/40 px-4 py-2.5 text-xs font-semibold text-gold transition-colors hover:bg-gold hover:text-ink"
                >
                  BOOK THIS SERVICE →
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ============================================================ */}
      {/* 5. BROTHERS / ABOUT STORY SECTION */}
      {/* ============================================================ */}
      <section className="bg-panel-soft py-24 border-b border-line/40">
        <div className="mx-auto max-w-6xl px-6 grid gap-12 md:grid-cols-12 items-center">
          <div className="md:col-span-6 space-y-6">
            <p className="text-xs uppercase tracking-[0.25em] text-gold font-semibold">
              The Photographers
            </p>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl text-cream leading-tight">
              Two Brothers, One Shared Vision.
            </h2>
            <p className="text-cream-dim leading-relaxed text-base font-light">
              Every shoot is handled personally by Brothers Photography — not passed off to a rotating crew. We combine technical mastery with a quiet, observant eye so you can relive every smile and every tear for years to come.
            </p>

            <div className="pt-2">
              <Link to="/about">
                <Button variant="outline" className="px-7 py-3">
                  OUR STORY →
                </Button>
              </Link>
            </div>
          </div>

          <div className="md:col-span-6 flex justify-center">
            <div className="relative overflow-hidden rounded-3xl border border-gold/40 bg-ink p-2 shadow-2xl max-w-md w-full">
              <img
                src={settings?.logo || officialLogo}
                alt="Brothers Photography Official Studio"
                className="w-full h-auto rounded-2xl object-contain"
              />
              <div className="absolute inset-0 rounded-3xl ring-1 ring-gold/20 pointer-events-none" />
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 6. FINAL CINEMATIC BOOKING CTA BANNER */}
      {/* ============================================================ */}
      <section className="relative overflow-hidden bg-ink py-28 text-center border-b border-line/40">
        <div className="absolute inset-0 -z-10 opacity-30">
          <img
            src={heroWedding}
            alt="Photography Background"
            className="h-full w-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-ink/90 via-ink/95 to-ink" />

        <div className="relative z-10 mx-auto max-w-4xl px-6 space-y-6">
          <p className="text-xs uppercase tracking-[0.3em] text-gold font-semibold">
            RESERVE YOUR SHOOT
          </p>

          <h2 className="font-display text-4xl sm:text-5xl md:text-6xl text-cream leading-tight">
            LET'S CREATE SOMETHING
            <br />
            <span className="italic text-gold">TIMELESS.</span>
          </h2>

          <p className="mx-auto max-w-xl text-base sm:text-lg text-cream-dim font-light">
            Check real-time slot availability or get in touch for custom inquiries. The date you lock in is guaranteed.
          </p>

          <div className="pt-4 flex flex-wrap justify-center items-center gap-4">
            <Link to="/booking">
              <Button className="px-8 py-3.5 text-base">
                BOOK YOUR SESSION
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="outline" className="px-8 py-3.5 text-base">
                CONTACT US
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedPhoto(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-ink/95 p-4 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-h-[90vh] max-w-4xl overflow-hidden rounded-2xl border border-gold/40 bg-panel shadow-2xl"
            >
              <button
                onClick={() => setSelectedPhoto(null)}
                aria-label="Close photo preview"
                className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-ink/70 text-cream transition-colors hover:bg-gold hover:text-ink"
              >
                ✕
              </button>

              <img
                src={selectedPhoto.image_url}
                alt={selectedPhoto.title || "Brothers Photography"}
                className="max-h-[75vh] w-full object-contain bg-black/40"
              />

              <div className="p-6 bg-panel">
                <span className="text-xs font-semibold tracking-widest text-gold uppercase">
                  {selectedPhoto.category_display || "GALLERY"}
                </span>
                <h3 className="mt-1 font-display text-2xl text-cream">
                  {selectedPhoto.title || "Brothers Photography Work"}
                </h3>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
}
