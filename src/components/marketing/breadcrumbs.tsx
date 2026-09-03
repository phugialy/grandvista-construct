import Link from "next/link";
import { ChevronRight } from "lucide-react";

export type BreadcrumbItem = {
  name: string;
  href: string;
};

/**
 * Visual trail only — pass the same items to breadcrumbJsonLd() so the
 * structured data and what's on screen can't drift apart.
 */
export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="border-b border-ink/10 bg-warm-white">
      <div className="section-shell flex flex-wrap items-center gap-2 py-3 text-xs font-black uppercase tracking-[0.08em] text-steel">
        {items.map((item, index) => (
          <span className="flex items-center gap-2" key={item.href}>
            {index > 0 ? <ChevronRight aria-hidden className="text-steel/40" size={12} /> : null}
            {index === items.length - 1 ? (
              <span className="text-navy">{item.name}</span>
            ) : (
              <Link className="hover:text-brand-red" href={item.href}>
                {item.name}
              </Link>
            )}
          </span>
        ))}
      </div>
    </nav>
  );
}
