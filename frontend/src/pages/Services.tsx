import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Layout from "../components/layout/Layout";
import Button from "../components/ui/Button";
import { listServices } from "../api/services";
import { CATEGORIES } from "../utils/categories";
import type { Service, ServiceCategory } from "../types";

export default function Services() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<ServiceCategory | "all">("all");
  const [services, setServices] = useState<Service[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setServices(null);
    setError("");
    listServices(activeCategory === "all" ? undefined : activeCategory)
      .then(setServices)
      .catch(() => setError("Failed to load services. Please check backend connection."));
  }, [activeCategory]);

  function handleBookService(serviceId: number) {
    navigate(`/booking?service=${serviceId}`, { state: { serviceId } });
  }

  return (
    <Layout>
      <section className="mx-auto max-w-6xl px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-sm uppercase tracking-[0.25em] text-gold font-medium">What We Do</p>
          <h1 className="mt-2 font-display text-4xl text-cream md:text-5xl">Our Photography Services</h1>
          <p className="mt-4 max-w-2xl text-cream-dim leading-relaxed">
            From intimate candid portraits to grand wedding celebrations, Brothers Photography delivers timeless imagery tailored to your milestone.
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
            All Services
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

        {/* State Indicators */}
        {error && (
          <div className="mt-10 rounded-xl border border-clay/40 bg-clay/10 p-6 text-center text-clay">
            {error}
          </div>
        )}

        {services === null && !error && (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-80 animate-pulse rounded-2xl bg-panel" />
            ))}
          </div>
        )}

        {services !== null && services.length === 0 && !error && (
          <div className="mt-12 rounded-2xl border border-line bg-panel p-10 text-center text-cream-dim">
            No services found in this category.
          </div>
        )}

        {/* Services Grid */}
        {services !== null && services.length > 0 && (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service, i) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: (i % 3) * 0.08 }}
                className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-line bg-panel transition-all duration-300 hover:border-gold/60 hover:shadow-lg hover:shadow-gold/5"
              >
                <div>
                  {service.image_url ? (
                    <div className="aspect-[16/10] overflow-hidden bg-panel-soft">
                      <img
                        src={service.image_url}
                        alt={service.name}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  ) : (
                    <div className="aspect-[16/10] flex items-center justify-center bg-panel-soft text-cream-dim/40 font-display italic text-lg">
                      Brothers Photography
                    </div>
                  )}

                  <div className="p-6">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs uppercase tracking-wider text-gold-soft font-medium">
                        {service.category_display}
                      </span>
                    </div>

                    <h2 className="mt-2 font-display text-2xl text-cream">{service.name}</h2>

                    {service.highlights && service.highlights.length > 0 && (
                      <ul className="mt-4 space-y-2">
                        {service.highlights.map((point) => (
                          <li key={point} className="flex items-start gap-2.5 text-sm text-cream-dim">
                            <span className="mt-1 text-gold text-xs">◆</span>
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                <div className="border-t border-line/60 p-6 pt-4">
                  <Button
                    onClick={() => handleBookService(service.id)}
                    className="w-full justify-center"
                  >
                    Book this service →
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </Layout>
  );
}
