export type SignalType =
  | "Corporate Moves"
  | "Industrial Growth"
  | "Retail / Experience"
  | "Civic / Cultural"
  | "Capital Movement"
  | "Market Development";

export type CommunitySignal = {
  area: string;
  assetClass: string;
  impact: string;
  signalType: SignalType;
};

export const AREA_OPTIONS = [
  "Plano",
  "Dallas",
  "Fort Worth",
  "Arlington",
  "Irving",
  "McKinney",
  "Frisco",
  "North Texas",
  "DFW",
];

/**
 * Computed once when an article comes in (see the soro webhook) and stored on
 * blog_posts as signal_area/signal_type/signal_asset_class, so the community page
 * can filter and search server-side instead of re-deriving this from raw text on
 * every render for every post.
 */
export function deriveCommunitySignal(article: {
  title: string;
  excerpt?: string | null;
  tags?: string[] | null;
}): CommunitySignal {
  const text = [article.title, article.excerpt, ...(article.tags ?? [])].filter(Boolean).join(" ").toLowerCase();
  const area = deriveArea(text);
  const signalType = deriveSignalType(text);
  const assetClass = deriveAssetClass(text);

  return {
    area,
    assetClass,
    signalType,
    impact: buildImpactSentence(signalType, area, assetClass),
  };
}

function deriveArea(text: string) {
  const match = AREA_OPTIONS.filter((area) => area !== "DFW").find((area) => text.includes(area.toLowerCase()));
  return match ?? "DFW";
}

function deriveSignalType(text: string): SignalType {
  if (hasAny(text, ["manufacturing", "industrial", "logistics", "semiconductor", "data center", "factory"])) {
    return "Industrial Growth";
  }

  if (hasAny(text, ["headquarters", "hq", "corporate", "relocation", "campus"])) {
    return "Corporate Moves";
  }

  if (hasAny(text, ["retail", "restaurant", "entertainment", "experience", "lifestyle"])) {
    return "Retail / Experience";
  }

  if (hasAny(text, ["museum", "cultural", "municipal", "city hall", "festival", "stadium", "community"])) {
    return "Civic / Cultural";
  }

  if (hasAny(text, ["investment", "acquisition", "funds", "pace", "capital", "billion"])) {
    return "Capital Movement";
  }

  return "Market Development";
}

function deriveAssetClass(text: string) {
  if (hasAny(text, ["data center", "colocation"])) return "Data Center";
  if (hasAny(text, ["manufacturing", "industrial", "logistics", "factory"])) return "Industrial";
  if (hasAny(text, ["apartment", "multifamily", "residential"])) return "Multifamily";
  if (hasAny(text, ["retail", "restaurant", "entertainment", "lifestyle"])) return "Retail";
  if (hasAny(text, ["office", "headquarters", "hq", "campus"])) return "Office";
  if (hasAny(text, ["museum", "cultural", "festival", "stadium"])) return "Cultural";
  if (hasAny(text, ["municipal", "city hall", "emergency services"])) return "Civic";

  return "Commercial Market";
}

export function buildImpactSentence(signalType: SignalType, area: string, assetClass: string) {
  const areaText = area === "DFW" ? "the DFW market" : area;

  switch (signalType) {
    case "Corporate Moves":
      return `Corporate movement in ${areaText} can reshape demand for office, interiors, support space, and nearby commercial services.`;
    case "Industrial Growth":
      return `Industrial activity in ${areaText} points to stronger demand for technical planning, site readiness, utilities, and operational space.`;
    case "Retail / Experience":
      return `Retail and experience-driven projects in ${areaText} show how customer-facing spaces are being repositioned for modern use.`;
    case "Civic / Cultural":
      return `Civic and cultural activity in ${areaText} can influence traffic patterns, community anchors, and surrounding commercial opportunity.`;
    case "Capital Movement":
      return `Capital movement around ${assetClass.toLowerCase()} assets signals where owners and operators may be preparing for future project activity.`;
    default:
      return `This ${assetClass.toLowerCase()} signal helps frame where commercial construction demand and owner decisions may be moving.`;
  }
}

function hasAny(text: string, terms: string[]) {
  return terms.some((term) => text.includes(term));
}
