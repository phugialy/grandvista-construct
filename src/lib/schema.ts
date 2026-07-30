import { buildCategories, processPillars } from "@/lib/site-content";
import { companyDescription, companyName, serviceAreas, siteUrl, socialProfileLinks } from "@/lib/site-entity";

type JsonLdValue = Record<string, unknown> | Array<Record<string, unknown>>;

export function organizationJsonLd(): JsonLdValue {
  const organization = {
    "@context": "https://schema.org",
    "@type": ["Organization", "LocalBusiness"],
    "@id": `${siteUrl}/#organization`,
    name: companyName,
    url: siteUrl,
    logo: `${siteUrl}/icon.png`,
    image: `${siteUrl}/opengraph-image.png`,
    description: companyDescription,
    areaServed: serviceAreas.map((name) => ({
      "@type": "Place",
      name,
    })),
    sameAs: socialProfileLinks,
  };

  return socialProfileLinks.length > 0 ? organization : withoutEmptySameAs(organization);
}

export function websiteJsonLd(): JsonLdValue {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    name: companyName,
    url: siteUrl,
    publisher: {
      "@id": `${siteUrl}/#organization`,
    },
  };
}

export function breadcrumbJsonLd(items: Array<{ name: string; url: string }>): JsonLdValue {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function serviceListJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Grandvista construction categories",
    itemListElement: buildCategories.map((category, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Service",
        name: category.title,
        description: category.text,
        provider: {
          "@id": `${siteUrl}/#organization`,
        },
        areaServed: serviceAreas.map((name) => ({
          "@type": "Place",
          name,
        })),
      },
    })),
  };
}

export function processListJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Grandvista construction delivery process",
    itemListElement: processPillars.map((pillar, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: pillar,
    })),
  };
}

function withoutEmptySameAs<T extends { sameAs?: string[] }>(value: T) {
  const rest = { ...value };
  delete rest.sameAs;
  return rest;
}
