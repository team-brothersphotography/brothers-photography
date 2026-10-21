import { useState } from "react";
import { motion } from "framer-motion";
import Layout from "../components/layout/Layout";
import Button from "../components/ui/Button";
import GlassCard from "../components/ui/GlassCard";
import { FieldWrapper, Input, TextArea } from "../components/ui/Field";
import { useSiteSettings } from "../hooks/useSiteSettings";
import { waLink, telLink, mapsLink } from "../utils/contact";

export default function Contact() {
  const { settings } = useSiteSettings();

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    eventType: "Wedding",
    eventDate: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = `Hi Brothers Photography!\n\nName: ${formData.name}\nPhone: ${formData.phone}\nEmail: ${formData.email}\nEvent: ${formData.eventType}\nDate: ${formData.eventDate || "TBD"}\nMessage: ${formData.message}`;
    const whatsappUrl = waLink(settings?.whatsapp_number || "919000000000", text);
    window.open(whatsappUrl, "_blank");
    setSubmitted(true);
  }

  return (
    <Layout>
      <section className="mx-auto max-w-6xl px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-sm uppercase tracking-[0.25em] text-gold font-medium">Get in Touch</p>
          <h1 className="mt-2 font-display text-4xl text-cream md:text-5xl">Contact Brothers Photography</h1>
          <p className="mt-4 max-w-2xl text-cream-dim leading-relaxed">
            Have questions about date availability, packages, or custom coverage? Reach out directly or fill out the form below.
          </p>
        </motion.div>

        <div className="mt-12 grid gap-10 lg:grid-cols-12">
          {/* Info Side */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-2xl border border-line bg-panel p-8 space-y-6">
              <h2 className="font-display text-2xl text-cream">Studio Details</h2>

              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-xs uppercase tracking-wider text-gold">Primary Phone</p>
                  <a
                    href={telLink(settings?.phone_number || "")}
                    className="mt-1 block font-medium text-cream hover:text-gold transition-colors text-base"
                  >
                    {settings?.phone_number || "Loading phone..."}
                  </a>
                </div>

                {settings?.alternate_phone_number && (
                  <div>
                    <p className="text-xs uppercase tracking-wider text-gold">Alternate Phone</p>
                    <a
                      href={telLink(settings.alternate_phone_number)}
                      className="mt-1 block text-cream hover:text-gold transition-colors"
                    >
                      {settings.alternate_phone_number}
                    </a>
                  </div>
                )}

                <div>
                  <p className="text-xs uppercase tracking-wider text-gold">Email</p>
                  <a
                    href={`mailto:${settings?.email || "contact@brothersphotography.com"}`}
                    className="mt-1 block text-cream hover:text-gold transition-colors"
                  >
                    {settings?.email || "contact@brothersphotography.com"}
                  </a>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wider text-gold">Studio Address</p>
                  <p className="mt-1 text-cream-dim leading-relaxed">
                    {settings?.address || "Brothers Photography Studio"}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-line/60 flex flex-wrap gap-3">
                {settings?.whatsapp_number && (
                  <a
                    href={waLink(settings.whatsapp_number, "Hi Brothers Photography, I have an inquiry.")}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full"
                  >
                    <Button variant="outline" className="w-full justify-center">
                      Chat on WhatsApp
                    </Button>
                  </a>
                )}
                {settings?.address && (
                  <a
                    href={mapsLink(settings.google_maps_url, settings.address)}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full"
                  >
                    <Button variant="ghost" className="w-full justify-center">
                      Open in Google Maps ↗
                    </Button>
                  </a>
                )}
              </div>
            </div>

            {/* Map Placeholder Card */}
            <div className="overflow-hidden rounded-2xl border border-line bg-panel-soft p-6">
              <p className="font-display text-xl text-cream mb-2">Visit Our Studio</p>
              <p className="text-xs text-cream-dim mb-4">
                We invite clients for in-person consultation and album previews by appointment.
              </p>
              <div className="relative aspect-[16/9] overflow-hidden rounded-xl border border-line/60 bg-panel flex items-center justify-center text-center p-4">
                <div className="space-y-2">
                  <span className="text-2xl text-gold">📍</span>
                  <p className="text-xs text-cream font-medium">Brothers Photography Location</p>
                  <p className="text-[11px] text-cream-dim">Click button above to launch map navigation</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form Side */}
          <div className="lg:col-span-7">
            <GlassCard>
              <h2 className="font-display text-2xl text-cream">Send an Inquiry</h2>
              <p className="mt-1 text-sm text-cream-dim">
                Fill out your event details and we'll reply promptly on WhatsApp or Phone.
              </p>

              {submitted ? (
                <div className="mt-8 rounded-xl border border-gold/30 bg-gold/10 p-6 text-center">
                  <p className="font-display text-xl text-gold">Inquiry Sent!</p>
                  <p className="mt-2 text-sm text-cream-dim">
                    Thank you, {formData.name}. We have prepared your WhatsApp message inquiry. You can also call us directly.
                  </p>
                  <Button
                    onClick={() => setSubmitted(false)}
                    variant="outline"
                    className="mt-6"
                  >
                    Send another inquiry
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FieldWrapper label="Your Name">
                      <Input
                        required
                        value={formData.name}
                        onChange={(e) => setFormData((d) => ({ ...d, name: e.target.value }))}
                        placeholder="Full name"
                      />
                    </FieldWrapper>
                    <FieldWrapper label="Phone Number">
                      <Input
                        required
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData((d) => ({ ...d, phone: e.target.value }))}
                        placeholder="+91 90000 00000"
                      />
                    </FieldWrapper>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FieldWrapper label="Email Address">
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData((d) => ({ ...d, email: e.target.value }))}
                        placeholder="you@example.com"
                      />
                    </FieldWrapper>
                    <FieldWrapper label="Approximate Date">
                      <Input
                        type="date"
                        value={formData.eventDate}
                        onChange={(e) => setFormData((d) => ({ ...d, eventDate: e.target.value }))}
                      />
                    </FieldWrapper>
                  </div>

                  <FieldWrapper label="Message / Requirements">
                    <TextArea
                      required
                      value={formData.message}
                      onChange={(e) => setFormData((d) => ({ ...d, message: e.target.value }))}
                      placeholder="Tell us about your event, location, and specific services you are looking for..."
                    />
                  </FieldWrapper>

                  <Button type="submit" className="w-full justify-center mt-2">
                    Submit Inquiry via WhatsApp →
                  </Button>
                </form>
              )}
            </GlassCard>
          </div>
        </div>
      </section>
    </Layout>
  );
}
