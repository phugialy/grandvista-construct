import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Handshake } from "lucide-react";
import { Breadcrumbs } from "@/components/marketing/breadcrumbs";
import { FinalCta } from "@/components/marketing/final-cta";
import { JsonLd } from "@/components/marketing/json-ld";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { PageHero } from "@/components/marketing/page-hero";
import { breadcrumbJsonLd } from "@/lib/schema";
import { getPublishedPartners } from "@/lib/supabase/public-data";

const breadcrumbTrail = [
  { name: "Home", href: "/" },
  { name: "Company", href: "/company" },
  { name: "Partners", href: "/partners" },
];

export const metadata: Metadata = {
  title: "Partners | Grandvista Construction",
  description:
    "The vendors, suppliers, and trade partners Grandvista Construction works with across DFW commercial and industrial projects.",
  alternates: {
    canonical: "/partners",
  },
  openGraph: {
    title: "Partners | Grandvista Construction",
    description:
      "The vendors, suppliers, and trade partners Grandvista Construction works with across DFW commercial and industrial projects.",
    url: "https://grandvista-construction.com/partners",
    siteName: "Grandvista Construction",
    type: "website",
  },
};

export default async function PartnersPage() {
  const partners = await getPublishedPartners();

  return (
    <MarketingShell>
      <JsonLd
        data={[
          breadcrumbJsonLd(
            breadcrumbTrail.map((item) => ({
              name: item.name,
              url: `https://grandvista-construction.com${item.href === "/" ? "" : item.href}`,
            })),
          ) as Record<string, unknown>,
        ]}
      />

      <Breadcrumbs items={breadcrumbTrail} />

      <PageHero
        copy="Every project runs on real relationships — the suppliers, subcontractors, and trade partners who show up, deliver, and hold the same standard we do."
        eyebrow="Partners"
        primaryHref="/company"
        primaryLabel="About Grandvista"
        secondaryHref="/project-stories"
        secondaryLabel="See the Work"
        stats={[
          { label: "Focus", value: "Trade & supply partners" },
          { label: "Standard", value: "Trust, held both ways" },
        ]}
        title="Who we build with"
        visualMedia={null}
      />

      <section className="section-shell py-20">
        {partners.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {partners.map((partner) => (
              <article className="flex flex-col gap-4 border border-ink/12 bg-white p-6" key={partner.id}>
                {partner.logo_url ? (
                  <div className="relative h-16 w-full">
                    <Image
                      alt={partner.name}
                      className="object-contain object-left"
                      fill
                      sizes="240px"
                      src={partner.logo_url}
                    />
                  </div>
                ) : null}
                {partner.trade_category ? (
                  <span className="w-fit border border-ink/12 px-3 py-1 text-[0.62rem] font-black uppercase tracking-[0.1em] text-navy">
                    {partner.trade_category}
                  </span>
                ) : null}
                <h2 className="text-2xl font-black leading-tight">{partner.name}</h2>
                {partner.blurb ? <p className="flex-1 leading-7 text-steel">{partner.blurb}</p> : null}
                {partner.website_url ? (
                  <Link
                    className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.1em] text-brand-red hover:text-navy"
                    href={partner.website_url}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    Visit Site <ArrowUpRight size={16} />
                  </Link>
                ) : null}
              </article>
            ))}
          </div>
        ) : (
          <div className="border border-ink/12 bg-white p-8">
            <Handshake className="text-brand-red" size={28} />
            <p className="mt-4 text-sm font-black uppercase tracking-[0.14em] text-brand-red">Building the list</p>
            <h2 className="mt-3 text-3xl font-black leading-tight">Partner directory coming soon.</h2>
            <p className="mt-4 max-w-2xl leading-8 text-steel">
              We work with real vendors and trade partners across every project — this page is being
              built out to introduce them.
            </p>
          </div>
        )}
      </section>

      <FinalCta
        copy="If you're a supplier or trade partner interested in working with Grandvista, reach out through our company page."
        primaryHref="/company"
        primaryLabel="Get In Touch"
        secondaryHref="/project-stories"
        secondaryLabel="See the Work"
        title="Building something together?"
      />
    </MarketingShell>
  );
}
