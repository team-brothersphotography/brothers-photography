import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Layout from "../components/layout/Layout";
import Button from "../components/ui/Button";
import { listServices } from "../api/services";
import { listGallery } from "../api/gallery";
import { useSiteSettings } from "../hooks/useSiteSettings";
import { waLink, telLink } from "../utils/contact";
import type { GalleryImage, Service } from "../types";

const WHY_US = [
  {
    title: "Two brothers, one vision",
    body: "Every shoot is handled personally by Brothers Photography — not passed off to a rotating crew.",
  },
  {
    title: "A calendar you can trust",
    body: "Live slot availability means the date you book is the date you get. No double-bookings, no surprises.",
  },
  {
    title: "Every occasion, one studio",
    body: "From weddings to naming ceremonies, we shoot the milestones families actually ask us to return for.",
  },
];

function HeroSlider({ images }: { images: string[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (images.length < 2) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % images.length), 4500);
    return () => clearInterval(timer);
  }, [images.length]);

  if (images.length === 0) {
    return <div className="aspect-[4/5] rounded-[2rem] bg-panel-soft" />;
  }

  return (
    <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-gold/20">
      <AnimatePresence mode="sync">
        <motion.img
          key={images[index]}
          src={images[index]}
          alt=""
          initial={{ opacity: 0, scale: 1.06 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.1, ease: "easeInOut" }}
          className="absolute inset-0 h-full w-full object-cover"
        />
      </AnimatePresence>
      <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
    </div>
  );
}

export default function Home() {
  const { settings } = useSiteSettings();
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [showAllGallery, setShowAllGallery] = useState(false);

  useEffect(() => {
    listServices().then(setServices);
    listGallery({ featured: true }).then(setGallery);
  }, []);

  const visibleGallery = showAllGallery ? gallery : gallery.slice(0, 12);
  const heroImages = services.slice(0, 5).map((s) => s.image_url).filter((u): u is string => Boolean(u));

  function goBookService(serviceId: number) {
    navigate("/book", { state: { serviceId } });
  }

  return (
    <Layout>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-line/60">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-20 md:grid-cols-2 md:py-28">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="flex flex-col justify-center"
          >
            <p className="text-sm uppercase tracking-[0.3em] text-gold">
              {settings?.tagline || "Wedding · Portrait · Event Photography"}
            </p>
            <h1 className="mt-5 font-display text-5xl leading-[1.05] text-cream md:text-6xl">
              Moments worth
              <br />
              <span className="italic text-gold">keeping forever.</span>
            </h1>
            <p className="mt-6 max-w-md text-cream-dim">
              {settings?.intro_text ||
                "Brothers Photography turns your weddings, ceremonies and portraits into images your family will hold onto for generations."}
            </p>
            <div className="mt-9 flex flex-wrap gap-4">
              <Link to="/book">
                <Button>Book your date</Button>
              </Link>
              <a href="#services">
                <Button variant="outline">Explore services</Button>
              </a>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="relative hidden md:block"
          >
            <HeroSlider images={heroImages} />
          </motion.div>
        </div>
      </section>

      {/* Services — integrated directly into the home page, no separate page */}
      <section id="services" className="mx-auto max-w-6xl px-6 py-20">
        <p className="text-sm uppercase tracking-[0.2em] text-gold">Our services</p>
        <h2 className="mt-2 font-display text-3xl text-cream md:text-4xl">
          Photography, tailored to your occasion
        </h2>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, i) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.08 }}
              className="group overflow-hidden rounded-2xl border border-line bg-panel transition-colors hover:border-gold/50"
            >
              {service.image_url && (
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={service.image_url}
                    alt={service.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              )}
              <div className="p-6">
                <p className="font-display text-xl text-cream">{service.name}</p>
                <ul className="mt-3 space-y-1.5">
                  {service.highlights.map((point) => (
                    <li key={point} className="flex gap-2 text-sm text-cream-dim">
                      <span className="text-gold">•</span>
                      {point}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => goBookService(service.id)}
                  className="mt-4 text-sm text-gold hover:text-gold-soft"
                >
                  Book this service →
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Gallery preview */}
      {gallery.length > 0 && (
        <section className="border-t border-line/60 bg-panel/40">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <p className="text-sm uppercase tracking-[0.2em] text-gold">Selected work</p>
            <h2 className="mt-2 font-display text-3xl text-cream md:text-4xl">From recent shoots</h2>

            <div className="mt-10 columns-2 gap-4 sm:columns-3">
              {visibleGallery.map((photo) => (
                <div key={photo.id} className="mb-4 break-inside-avoid overflow-hidden rounded-xl bg-panel-soft">
                  <img
                    src={photo.image_url}
                    alt={photo.title || photo.category_display}
                    loading="lazy"
                    className="w-full object-cover"
                  />
                </div>
              ))}
            </div>

            {!showAllGallery && gallery.length > 12 && (
              <div className="mt-8 text-center">
                <Button variant="outline" onClick={() => setShowAllGallery(true)}>
                  View more photos
                </Button>
              </div>
            )}
            <div className="mt-6 text-center">
              <Link to="/gallery" className="text-sm text-gold hover:text-gold-soft">
                Browse the full gallery by category →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Why choose us */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <p className="text-sm uppercase tracking-[0.2em] text-gold">Why choose us</p>
        <div className="mt-8 grid gap-8 md:grid-cols-3">
          {WHY_US.map((item) => (
            <div key={item.title} className="border-t border-line pt-5">
              <p className="font-display text-xl text-cream">{item.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-cream-dim">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-line/60 bg-panel">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-6 py-16 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-display text-3xl text-cream md:text-4xl">Ready to lock in your date?</h2>
            <p className="mt-2 text-cream-dim">Check live availability and book online in a few minutes.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/book">
              <Button>Book now</Button>
            </Link>
            {settings?.whatsapp_number && (
              <a href={waLink(settings.whatsapp_number)} target="_blank" rel="noreferrer">
                <Button variant="outline">WhatsApp us</Button>
              </a>
            )}
            {settings?.phone_number && (
              <a href={telLink(settings.phone_number)}>
                <Button variant="ghost">Call {settings.phone_number}</Button>
              </a>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
}
