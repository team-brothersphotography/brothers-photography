import { useEffect, useState } from "react";
import { getSiteSettings } from "../api/siteSettings";
import type { SiteSettings } from "../types";

let cached: SiteSettings | null = null;

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings | null>(cached);
  const [isLoading, setIsLoading] = useState(!cached);

  useEffect(() => {
    if (cached) return;
    getSiteSettings()
      .then((data) => {
        cached = data;
        setSettings(data);
      })
      .catch(() => {
        // Non-fatal: pages render sensible fallbacks when settings are unavailable.
      })
      .finally(() => setIsLoading(false));
  }, []);

  return { settings, isLoading };
}
