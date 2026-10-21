import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useSiteSettings } from "../../hooks/useSiteSettings";
import ThemeToggle from "../ui/ThemeToggle";
import officialLogo from "../../assets/branding/brothers-photography-logo.jpg";

const publicLinks = [
  { to: "/", label: "Home" },
  { to: "/services", label: "Services" },
  { to: "/gallery", label: "Gallery" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, logout } = useAuth();
  const { settings } = useSiteSettings();
  const navigate = useNavigate();
  const location = useLocation();

  const isHome = location.pathname === "/";

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 40);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  async function handleLogout() {
    await logout();
    setOpen(false);
    navigate("/");
  }

  const isTransparent = isHome && !scrolled && !open;

  return (
    <header
      className={`z-50 transition-all duration-300 ${
        isHome ? "fixed top-0 left-0 right-0" : "sticky top-0"
      } ${
        isTransparent
          ? "bg-transparent border-b border-transparent text-cream"
          : "border-b border-line/60 bg-ink/90 dark:bg-ink/90 light:bg-panel/90 backdrop-blur-md shadow-lg text-cream"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-2.5">
        {/* Brand Logo - Complete Uncropped Official Image */}
        <Link
          to="/"
          className="flex shrink-0 items-center focus:outline-none focus:ring-2 focus:ring-gold/50 rounded-lg p-0.5 transition-transform hover:scale-[1.02]"
          onClick={() => setOpen(false)}
        >
          <img
            src={settings?.logo || officialLogo}
            alt="Brothers Photography"
            className="h-10 sm:h-12 md:h-14 w-auto max-h-14 object-contain drop-shadow-md"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-7 md:flex">
          {publicLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `text-sm tracking-wide transition-colors ${
                  isActive ? "text-gold font-medium" : "text-cream-dim hover:text-cream"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Right Actions (Auth & Theme) */}
        <div className="hidden items-center gap-4 md:flex">
          <ThemeToggle />

          {user ? (
            <div className="flex items-center gap-4 border-l border-line/60 pl-4">
              {user.is_owner ? (
                <Link
                  to="/admin"
                  className="text-sm tracking-wide text-gold hover:text-gold-soft font-medium"
                >
                  Admin Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/booking"
                    className="text-sm tracking-wide text-cream-dim transition-colors hover:text-cream"
                  >
                    Booking
                  </Link>
                  <Link
                    to="/my-bookings"
                    className="text-sm tracking-wide text-cream-dim transition-colors hover:text-cream"
                  >
                    My Bookings
                  </Link>
                  <Link
                    to="/profile"
                    className="text-sm tracking-wide text-cream-dim transition-colors hover:text-cream"
                  >
                    Profile
                  </Link>
                </>
              )}
              <button
                onClick={handleLogout}
                className="rounded-full border border-gold/60 px-4 py-1.5 text-sm text-gold transition-colors hover:bg-gold hover:text-ink font-medium"
              >
                Log out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="text-sm tracking-wide text-cream-dim transition-colors hover:text-cream"
              >
                Log in
              </Link>
              <Link
                to="/booking"
                className="rounded-full bg-gold px-5 py-1.5 text-sm font-semibold text-ink transition-all hover:bg-gold-soft hover:shadow-[0_0_15px_rgba(212,175,55,0.4)]"
              >
                BOOK NOW
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Toggle Button */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            className="flex h-9 w-9 items-center justify-center text-cream"
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
      </div>

      {/* Mobile Drawer */}
      {open && (
        <div className="border-t border-line/60 bg-ink px-6 py-4 md:hidden">
          <nav className="flex flex-col gap-3">
            {publicLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `text-base ${isActive ? "text-gold font-medium" : "text-cream-dim"}`
                }
              >
                {link.label}
              </NavLink>
            ))}

            <div className="mt-3 flex flex-col gap-3 border-t border-line/60 pt-4">
              {user ? (
                <>
                  {user.is_owner ? (
                    <Link
                      to="/admin"
                      onClick={() => setOpen(false)}
                      className="text-base text-gold font-medium"
                    >
                      Admin Dashboard
                    </Link>
                  ) : (
                    <>
                      <Link
                        to="/booking"
                        onClick={() => setOpen(false)}
                        className="text-base text-cream-dim"
                      >
                        Book a Shoot
                      </Link>
                      <Link
                        to="/my-bookings"
                        onClick={() => setOpen(false)}
                        className="text-base text-cream-dim"
                      >
                        My Bookings
                      </Link>
                      <Link
                        to="/profile"
                        onClick={() => setOpen(false)}
                        className="text-base text-cream-dim"
                      >
                        Profile & Settings
                      </Link>
                    </>
                  )}
                  <button onClick={handleLogout} className="text-left text-base text-gold font-medium">
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setOpen(false)} className="text-base text-cream-dim">
                    Log in
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setOpen(false)}
                    className="text-base text-cream-dim"
                  >
                    Register Account
                  </Link>
                  <Link
                    to="/booking"
                    onClick={() => setOpen(false)}
                    className="w-fit rounded-full bg-gold px-5 py-2 text-base font-semibold text-ink mt-1"
                  >
                    BOOK NOW
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
