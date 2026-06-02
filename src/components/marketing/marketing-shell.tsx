import { ReactNode, Suspense } from "react";
import { AnalyticsTracker } from "./analytics-tracker";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

export function MarketingShell({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-warm-white text-ink">
      <SiteHeader />
      <Suspense fallback={null}>
        <AnalyticsTracker />
      </Suspense>
      {children}
      <SiteFooter />
    </main>
  );
}
