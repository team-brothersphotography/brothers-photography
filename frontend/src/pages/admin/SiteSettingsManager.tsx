import { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import Button from "../../components/ui/Button";
import { FieldWrapper, Input, TextArea } from "../../components/ui/Field";
import { getSiteSettings, updateSiteSettings } from "../../api/siteSettings";
import { extractErrorMessage } from "../../api/client";
import type { SiteSettings } from "../../types";

export default function SiteSettingsManager() {
  const [form, setForm] = useState<Partial<SiteSettings>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    getSiteSettings()
      .then(setForm)
      .finally(() => setIsLoading(false));
  }, []);

  function set<K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);
    try {
      const updated = await updateSiteSettings(form);
      setForm(updated);
      setSuccess("Contact info updated.");
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="h-96 animate-pulse rounded-xl bg-panel" />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <form onSubmit={handleSubmit} className="max-w-2xl rounded-xl border border-line bg-panel p-6">
        <p className="font-display text-xl text-cream">Studio & contact info</p>
        <p className="mt-1 text-sm text-cream-dim">
          Shown on the About page, footer, and WhatsApp/Call buttons across the site.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <FieldWrapper label="Business name">
            <Input value={form.business_name || ""} onChange={(e) => set("business_name", e.target.value)} />
          </FieldWrapper>
          <FieldWrapper label="Tagline">
            <Input value={form.tagline || ""} onChange={(e) => set("tagline", e.target.value)} />
          </FieldWrapper>
        </div>

        <div className="mt-4">
          <FieldWrapper label="Intro text">
            <TextArea value={form.intro_text || ""} onChange={(e) => set("intro_text", e.target.value)} />
          </FieldWrapper>
        </div>

        <p className="mt-6 font-display text-lg text-cream">Brother One</p>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <FieldWrapper label="Name">
            <Input value={form.brother_one_name || ""} onChange={(e) => set("brother_one_name", e.target.value)} />
          </FieldWrapper>
          <FieldWrapper label="Role">
            <Input value={form.brother_one_role || ""} onChange={(e) => set("brother_one_role", e.target.value)} />
          </FieldWrapper>
        </div>
        <div className="mt-4">
          <FieldWrapper label="Bio">
            <TextArea value={form.brother_one_bio || ""} onChange={(e) => set("brother_one_bio", e.target.value)} />
          </FieldWrapper>
        </div>

        <p className="mt-6 font-display text-lg text-cream">Brother Two</p>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <FieldWrapper label="Name">
            <Input value={form.brother_two_name || ""} onChange={(e) => set("brother_two_name", e.target.value)} />
          </FieldWrapper>
          <FieldWrapper label="Role">
            <Input value={form.brother_two_role || ""} onChange={(e) => set("brother_two_role", e.target.value)} />
          </FieldWrapper>
        </div>
        <div className="mt-4">
          <FieldWrapper label="Bio">
            <TextArea value={form.brother_two_bio || ""} onChange={(e) => set("brother_two_bio", e.target.value)} />
          </FieldWrapper>
        </div>

        <p className="mt-6 font-display text-lg text-cream">Contact</p>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <FieldWrapper label="Primary phone">
            <Input value={form.phone_number || ""} onChange={(e) => set("phone_number", e.target.value)} />
          </FieldWrapper>
          <FieldWrapper label="Alternate phone">
            <Input value={form.alternate_phone_number || ""} onChange={(e) => set("alternate_phone_number", e.target.value)} />
          </FieldWrapper>
          <FieldWrapper label="WhatsApp number">
            <Input value={form.whatsapp_number || ""} onChange={(e) => set("whatsapp_number", e.target.value)} />
          </FieldWrapper>
          <FieldWrapper label="Email">
            <Input value={form.email || ""} onChange={(e) => set("email", e.target.value)} />
          </FieldWrapper>
          <FieldWrapper label="Google Maps link">
            <Input value={form.google_maps_url || ""} onChange={(e) => set("google_maps_url", e.target.value)} />
          </FieldWrapper>
        </div>
        <div className="mt-4">
          <FieldWrapper label="Address">
            <TextArea value={form.address || ""} onChange={(e) => set("address", e.target.value)} />
          </FieldWrapper>
        </div>

        {error && <p className="mt-4 text-sm text-clay">{error}</p>}
        {success && <p className="mt-4 text-sm text-gold">{success}</p>}

        <Button type="submit" isLoading={isSubmitting} className="mt-6">
          Save changes
        </Button>
      </form>
    </AdminLayout>
  );
}
