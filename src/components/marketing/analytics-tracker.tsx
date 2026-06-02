"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const sessionKey = "grandvista_session_id";

export function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const query = searchParams.toString();
    trackEvent("page_view", query ? `${pathname}?${query}` : pathname);
  }, [pathname, searchParams]);

  return null;
}

export function trackCtaClick(targetPath: string, label: string) {
  trackEvent("cta_click", window.location.pathname + window.location.search, targetPath, { label });
}

function trackEvent(
  eventName: "page_view" | "cta_click",
  pagePath: string,
  targetPath?: string,
  metadata?: Record<string, unknown>,
) {
  const payload = JSON.stringify({
    event_name: eventName,
    page_path: pagePath,
    target_path: targetPath,
    session_id: getSessionId(),
    referrer: document.referrer || null,
    metadata,
  });

  if (navigator.sendBeacon) {
    navigator.sendBeacon("/api/analytics", new Blob([payload], { type: "application/json" }));
    return;
  }

  void fetch("/api/analytics", {
    body: payload,
    headers: { "Content-Type": "application/json" },
    keepalive: true,
    method: "POST",
  });
}

function getSessionId() {
  const existing = window.localStorage.getItem(sessionKey);

  if (existing) {
    return existing;
  }

  const next = crypto.randomUUID();
  window.localStorage.setItem(sessionKey, next);
  return next;
}
