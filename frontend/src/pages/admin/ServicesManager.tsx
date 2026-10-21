import { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import Button from "../../components/ui/Button";
import { FieldWrapper, Input } from "../../components/ui/Field";
import { listAllServices, createService, updateService, deleteService } from "../../api/services";
import { extractErrorMessage } from "../../api/client";
import { CATEGORIES } from "../../utils/categories";
import type { Service, ServiceCategory } from "../../types";

const emptyForm = {
  name: "",
  category: "wedding" as ServiceCategory,
  highlights: ["", "", ""] as string[],
  image: null as File | null,
};

export default function ServicesManager() {
  const [services, setServices] = useState<Service[] | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function refresh() {
    listAllServices().then(setServices);
  }

  useEffect(refresh, []);

  function startEdit(service: Service) {
    setEditingId(service.id);
    const highlights = [...service.highlights];
    while (highlights.length < 3) highlights.push("");
    setForm({ name: service.name, category: service.category, highlights, image: null });
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
  }

  function setHighlight(index: number, value: string) {
    setForm((f) => {
      const highlights = [...f.highlights];
      highlights[index] = value;
      return { ...f, highlights };
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const payload = {
        name: form.name,
        category: form.category,
        highlights: form.highlights.filter((h) => h.trim()),
        is_active: true,
        image: form.image,
      };
      if (editingId) {
        await updateService(editingId, payload);
      } else {
        await createService(payload);
      }
      resetForm();
      refresh();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function toggleActive(service: Service) {
    await updateService(service.id, { is_active: !service.is_active });
    refresh();
  }

  async function handleDelete(service: Service) {
    if (!confirm(`Remove "${service.name}"? This can't be undone.`)) return;
    await deleteService(service.id);
    refresh();
  }

  return (
    <AdminLayout>
      <div className="grid gap-8 lg:grid-cols-[1fr_1.3fr]">
        <form onSubmit={handleSubmit} className="rounded-xl border border-line bg-panel p-6">
          <p className="font-display text-xl text-cream">
            {editingId ? "Edit service" : "Add a new service"}
          </p>
          <p className="mt-1 text-xs text-cream-dim">
            No pricing here — pricing is discussed directly with customers.
          </p>

          <div className="mt-5 flex flex-col gap-4">
            <FieldWrapper label="Name">
              <Input
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </FieldWrapper>
            <FieldWrapper label="Category">
              <select
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as ServiceCategory }))}
                className="w-full rounded-lg border border-line bg-panel px-4 py-2.5 text-cream focus:border-gold"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </FieldWrapper>
            <FieldWrapper label="Highlight 1">
              <Input value={form.highlights[0]} onChange={(e) => setHighlight(0, e.target.value)} />
            </FieldWrapper>
            <FieldWrapper label="Highlight 2">
              <Input value={form.highlights[1]} onChange={(e) => setHighlight(1, e.target.value)} />
            </FieldWrapper>
            <FieldWrapper label="Highlight 3">
              <Input value={form.highlights[2]} onChange={(e) => setHighlight(2, e.target.value)} />
            </FieldWrapper>
            <FieldWrapper label="Cover image (optional)">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setForm((f) => ({ ...f, image: e.target.files?.[0] || null }))}
                className="w-full rounded-lg border border-line bg-panel px-4 py-2.5 text-sm text-cream-dim file:mr-3 file:rounded-full file:border-0 file:bg-gold file:px-3 file:py-1 file:text-xs file:text-ink"
              />
            </FieldWrapper>

            {error && <p className="text-sm text-clay">{error}</p>}

            <div className="flex gap-3">
              <Button type="submit" isLoading={isSubmitting}>
                {editingId ? "Save changes" : "Add service"}
              </Button>
              {editingId && (
                <Button type="button" variant="ghost" onClick={resetForm}>
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </form>

        <div className="space-y-3">
          {services === null ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-xl bg-panel" />
            ))
          ) : services.length === 0 ? (
            <p className="text-cream-dim">No services yet — add your first one.</p>
          ) : (
            services.map((service) => (
              <div
                key={service.id}
                className={`rounded-xl border p-4 ${
                  service.is_active ? "border-line bg-panel" : "border-line/50 bg-panel/50 opacity-70"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-cream">{service.name}</p>
                    <p className="text-xs text-cream-dim">{service.category_display}</p>
                    {service.highlights.length > 0 && (
                      <ul className="mt-1 text-xs text-cream-dim/80">
                        {service.highlights.map((h) => (
                          <li key={h}>• {h}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => toggleActive(service)}
                      className="rounded-full border border-line px-3 py-1 text-xs text-cream-dim hover:border-gold/50 hover:text-cream"
                    >
                      {service.is_active ? "Deactivate" : "Activate"}
                    </button>
                    <button
                      onClick={() => startEdit(service)}
                      className="rounded-full border border-line px-3 py-1 text-xs text-cream-dim hover:border-gold/50 hover:text-cream"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(service)}
                      className="rounded-full border border-clay/50 px-3 py-1 text-xs text-clay hover:bg-clay hover:text-cream"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
