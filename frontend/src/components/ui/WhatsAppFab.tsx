import { useSiteSettings } from "../../hooks/useSiteSettings";
import { waLink } from "../../utils/contact";

export default function WhatsAppFab() {
  const { settings } = useSiteSettings();
  if (!settings?.whatsapp_number) return null;

  return (
    <a
      href={waLink(settings.whatsapp_number, "Hi Brothers Photography! I'd like to enquire about a shoot.")}
      target="_blank"
      rel="noreferrer"
      aria-label="Message us on WhatsApp"
      className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-moss text-cream shadow-lg shadow-black/40 transition-transform hover:scale-105"
    >
      <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.39 1.26 4.81L2 22l5.42-1.42a9.9 9.9 0 0 0 4.62 1.18h.01c5.46 0 9.9-4.45 9.9-9.91 0-2.64-1.03-5.13-2.9-7C17.17 3.03 14.68 2 12.04 2Zm0 18.06h-.01a8.2 8.2 0 0 1-4.18-1.14l-.3-.18-3.12.82.84-3.04-.2-.31a8.15 8.15 0 0 1-1.25-4.3c0-4.5 3.67-8.17 8.19-8.17 2.19 0 4.24.85 5.79 2.4a8.13 8.13 0 0 1 2.4 5.78c0 4.5-3.68 8.14-8.16 8.14Zm4.48-6.13c-.24-.12-1.44-.71-1.67-.79-.22-.08-.38-.12-.55.12-.16.24-.63.79-.77.95-.14.16-.28.18-.53.06-.24-.12-1.02-.38-1.95-1.2-.72-.64-1.2-1.44-1.35-1.68-.14-.24-.02-.37.11-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.55-1.32-.75-1.8-.2-.48-.4-.42-.55-.42h-.47c-.16 0-.42.06-.64.3-.22.24-.85.83-.85 2.02 0 1.19.87 2.34.99 2.5.12.16 1.71 2.6 4.14 3.65.58.25 1.03.4 1.38.51.58.18 1.11.16 1.53.1.47-.07 1.44-.59 1.64-1.16.2-.57.2-1.06.14-1.16-.06-.1-.22-.16-.46-.28Z" />
      </svg>
    </a>
  );
}
