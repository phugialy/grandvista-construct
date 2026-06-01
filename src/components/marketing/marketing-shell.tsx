import { ReactNode } from "react";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

export function MarketingShell({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-warm-white text-ink">
      <SiteHeader />
      {children}
      <SiteFooter />
    </main>
  );
}
