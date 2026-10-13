import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import Layout from "../../components/layout/Layout";

const TABS = [
  { to: "/admin", label: "Overview", end: true },
  { to: "/admin/bookings", label: "Bookings" },
  { to: "/admin/slots", label: "Availability" },
  { to: "/admin/services", label: "Services" },
  { to: "/admin/gallery", label: "Gallery" },
  { to: "/admin/settings", label: "Contact Info" },
  { to: "/admin/change-password", label: "Change Password" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <Layout>
      <section className="mx-auto max-w-6xl px-6 py-12">
        <p className="text-sm uppercase tracking-[0.2em] text-gold">Owner dashboard</p>
        <h1 className="mt-2 font-display text-4xl text-cream">Manage your studio</h1>

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
