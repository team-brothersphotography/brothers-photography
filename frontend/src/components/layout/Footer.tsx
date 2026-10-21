import { Link } from "react-router-dom";
import officialLogo from "../../assets/branding/brothers-photography-logo.jpg";
import { useSiteSettings } from "../../hooks/useSiteSettings";
import { waLink, telLink } from "../../utils/contact";

export default function Footer() {
  const { settings } = useSiteSettings();

  return (
    <footer className="border-t border-line/60 bg-panel">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 md:grid-cols-3">
        <div className="flex flex-col items-start">
          <Link to="/" className="flex items-center group mb-3 focus:outline-none focus:ring-2 focus:ring-gold/50 rounded-lg p-1">
            <img
              src={settings?.logo || officialLogo}
              alt="Brothers Photography"
              className="h-14 sm:h-16 w-auto max-h-16 object-contain transition-transform group-hover:scale-105"
            />
          </Link>
          <p className="mt-1 max-w-xs text-sm leading-relaxed text-cream-dim">
            {settings?.tagline || "Capturing your moments, framing your memories."}
          </p>
        </div>

        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-gold">Explore</p>
          <ul className="mt-4 space-y-2 text-sm text-cream-dim">
            <li><Link to="/services" className="hover:text-cream">Services</Link></li>
            <li><Link to="/gallery" className="hover:text-cream">Gallery</Link></li>
            <li><Link to="/about" className="hover:text-cream">About us</Link></li>
            <li><Link to="/contact" className="hover:text-cream">Contact</Link></li>
            <li><Link to="/booking" className="hover:text-cream">Book a shoot</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-gold">Reach us</p>
          <ul className="mt-4 space-y-2 text-sm text-cream-dim">
            {settings?.phone_number && (
              <li>
                <a href={telLink(settings.phone_number)} className="hover:text-cream">
                  Call {settings.phone_number}
                </a>
              </li>
            )}
            {settings?.alternate_phone_number && (
              <li>
                <a href={telLink(settings.alternate_phone_number)} className="hover:text-cream">
                  Call {settings.alternate_phone_number}
                </a>
              </li>
            )}
            {settings?.whatsapp_number && (
              <li>
                <a
                  href={waLink(settings.whatsapp_number, "Hi Brothers Photography, I'd like to know more about your services.")}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-cream"
                >
                  WhatsApp us
                </a>
              </li>
            )}
            {settings?.address && <li>{settings.address}</li>}
          </ul>
        </div>
      </div>
      <div className="border-t border-line/60 px-6 py-5 text-center text-xs text-cream-dim/70">
        © {new Date().getFullYear()} {settings?.business_name || "Brothers Photography"}. All rights reserved.
      </div>
    </footer>
  );
}
