import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { trackActivity } from "../services/activityTracker";

export function useActivityTracker(): void {
  const location = useLocation();
  const isSessionStarted = useRef(false);
  const prevPathname = useRef<string | null>(null);

  useEffect(() => {
    // Record SESSION_START on initial session mount
    if (!isSessionStarted.current) {
      isSessionStarted.current = true;
      trackActivity("SESSION_START", location.pathname);
    }
  }, [location.pathname]);

  useEffect(() => {
    // Record PAGE_VIEW when route changes
    if (prevPathname.current !== location.pathname) {
      prevPathname.current = location.pathname;
      trackActivity("PAGE_VIEW", location.pathname);
    }
  }, [location.pathname]);
}
