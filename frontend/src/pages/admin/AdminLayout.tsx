import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import { useSiteSettings } from "../../hooks/useSiteSettings";
import officialLogo from "../../assets/branding/brothers-photography-logo.jpg";

const TABS = [
  { to: "/admin", label: "Overview", end: true },
  { to: "/admin/bookings", label: "Bookings" },
  { to: "/admin/slots", label: "Availability" },
  { to: "/admin/services", label: "Services" },
  { to: "/admin/gallery", label: "Gallery" },
  { to: "/admin/settings", label: "Contact Info" },
  { to: "/admin/activity", label: "Activity Log" },
  { to: "/admin/change-password", label: "Change Password" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { settings } = useSiteSettings();

  return (
    <Layout>
      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full border border-gold/50 p-0.5 bg-ink shadow-md">
            <img
              src={settings?.logo || officialLogo}
              alt="Brothers Photography"
              className="h-full w-full rounded-full object-cover"
            />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-gold">Owner dashboard</p>
            <h1 className="font-display text-3xl md:text-4xl text-cream">Manage your studio</h1>
          </div>
        </div>

        <nav className="mt-8 flex flex-wrap gap-2 border-b border-line/60 pb-4">
          {TABS.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.end}
              className={({ isActive }) =>
                `rounded-full px-4 py-1.5 text-sm transition-colors ${
                  isActive ? "bg-gold text-ink" : "text-cream-dim hover:text-cream"
                }`
              }
            >
              {tab.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-8">{children}</div>
      </section>
    </Layout>
  );
}
