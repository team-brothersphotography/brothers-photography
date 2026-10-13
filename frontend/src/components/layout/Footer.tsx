import { Link } from "react-router-dom";
import { useSiteSettings } from "../../hooks/useSiteSettings";
import { waLink, telLink } from "../../utils/contact";

export default function Footer() {
  const { settings } = useSiteSettings();

  return (
    <footer className="border-t border-line/60 bg-panel">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 md:grid-cols-3">
        <div>
          <p className="font-display text-2xl text-cream">
            {settings?.business_name || "Brothers Photography"}
          </p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-cream-dim">
            {settings?.tagline || "Capturing your moments, framing your memories."}
          </p>
        </div>

        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-gold">Explore</p>
          <ul className="mt-4 space-y-2 text-sm text-cream-dim">
            <li><Link to="/services" className="hover:text-cream">Services</Link></li>
            <li><Link to="/gallery" className="hover:text-cream">Gallery</Link></li>
            <li><Link to="/about" className="hover:text-cream">About us</Link></li>
            <li><Link to="/book" className="hover:text-cream">Book a shoot</Link></li>
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
