"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

// GA4 fires its own page_view on the initial full load (with the full URL,
// including any ?template= query). App Router <Link> navigations are
// client-side, so we emit a page_view on each subsequent route change.
// The first run is skipped to avoid double-counting the landing.
// (usePathname only — useSearchParams would require a Suspense boundary.)
export function Analytics() {
  const pathname = usePathname();
  const firstRun = useRef(true);

  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    if (!window.gtag || !pathname) return;
    window.gtag("event", "page_view", { page_path: pathname });
  }, [pathname]);

  return null;
}
