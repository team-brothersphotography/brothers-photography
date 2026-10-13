import { useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useSiteSettings } from "../../hooks/useSiteSettings";
import fallbackLogo from "../../assets/logo.jpg";

const links: { to: string; label: string; anchor?: boolean }[] = [
  { to: "/", label: "Home" },
  { to: "/#services", label: "Services", anchor: true },
  { to: "/gallery", label: "Gallery" },
  { to: "/about", label: "About" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const { settings } = useSiteSettings();
  const navigate = useNavigate();
  const location = useLocation();

  async function handleLogout() {
    await logout();
    setOpen(false);
    navigate("/");
  }

  function handleAnchorClick(e: React.MouseEvent<HTMLAnchorElement>, href: string) {
    const [path, hash] = href.split("#");
    if ((path === "" || path === "/") && location.pathname === "/") {
      e.preventDefault();
      document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" });
      setOpen(false);
    }
    // otherwise let the browser navigate to "/" and land on the anchor
  }

  return (
    <header className="sticky top-0 z-40 border-b border-line/60 bg-ink/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <img
            src={settings?.logo || fallbackLogo}
            alt="Brothers Photography"
            className="h-10 w-10 rounded-full border border-gold/40 object-cover"
          />
          <span className="flex items-baseline gap-2">
            <span className="font-display text-2xl tracking-wide text-cream">Brothers</span>
            <span className="font-display text-2xl italic text-gold">Photography</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((link) =>
            link.anchor ? (
              <a
                key={link.to}
                href={link.to}
                onClick={(e) => handleAnchorClick(e, link.to)}
                className="text-sm tracking-wide text-cream-dim transition-colors hover:text-cream"
              >
                {link.label}
              </a>
            ) : (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `text-sm tracking-wide transition-colors ${
                    isActive ? "text-gold" : "text-cream-dim hover:text-cream"
                  }`
                }
              >
                {link.label}
              </NavLink>
            )
          )}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          {user ? (
            <>
              <Link
                to={user.is_owner ? "/admin" : "/dashboard"}
                className="text-sm tracking-wide text-cream-dim transition-colors hover:text-cream"
              >
                {user.is_owner ? "Owner dashboard" : "My bookings"}
              </Link>
              <button
                onClick={handleLogout}
                className="rounded-full border border-gold/60 px-4 py-1.5 text-sm text-gold transition-colors hover:bg-gold hover:text-ink"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm tracking-wide text-cream-dim transition-colors hover:text-cream"
              >
                Log in
              </Link>
              <Link
                to="/book"
                className="rounded-full bg-gold px-5 py-1.5 text-sm font-medium text-ink transition-colors hover:bg-gold-soft"
              >
                Book now
              </Link>
            </>
          )}
        </div>

        <button
          className="flex h-9 w-9 items-center justify-center text-cream md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            {open ? (
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            ) : (
              <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <div className="border-t border-line/60 bg-ink px-6 py-4 md:hidden">
          <nav className="flex flex-col gap-4">
            {links.map((link) =>
              link.anchor ? (
                <a
                  key={link.to}
                  href={link.to}
                  onClick={(e) => handleAnchorClick(e, link.to)}
                  className="text-base text-cream-dim"
                >
                  {link.label}
                </a>
              ) : (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `text-base ${isActive ? "text-gold" : "text-cream-dim"}`
                  }
                >
                  {link.label}
                </NavLink>
              )
            )}
            <div className="mt-2 flex flex-col gap-3 border-t border-line/60 pt-4">
              {user ? (
                <>
                  <Link
                    to={user.is_owner ? "/admin" : "/dashboard"}
                    onClick={() => setOpen(false)}
                    className="text-base text-cream-dim"
                  >
                    {user.is_owner ? "Owner dashboard" : "My bookings"}
                  </Link>
                  <button onClick={handleLogout} className="text-left text-base text-gold">
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setOpen(false)} className="text-base text-cream-dim">
                    Log in
                  </Link>
                  <Link
                    to="/book"
                    onClick={() => setOpen(false)}
                    className="w-fit rounded-full bg-gold px-5 py-2 text-base font-medium text-ink"
                  >
                    Book now
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
