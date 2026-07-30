"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowUpRight, ChevronLeft, ChevronRight, LayoutGrid, LayoutList, MapPin, Search } from "lucide-react";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import type { PublishedBlogPost } from "@/lib/supabase/public-data";

type SignalType =
  | "All"
  | "Corporate Moves"
  | "Industrial Growth"
  | "Retail / Experience"
  | "Civic / Cultural"
  | "Capital Movement"
  | "Market Development";

type CommunitySignal = {
  area: string;
  assetClass: string;
  impact: string;
  signalType: Exclude<SignalType, "All">;
};

type ViewMode = "editorial" | "compact";
type AreaFilter = "All Markets" | string;

const watchItems = [
  "Growth corridors and market shifts",
  "Adaptive reuse and repositioning",
  "Industrial and data infrastructure",
  "Commercial environments and tenant demand",
  "Civic, cultural, and community anchors",
];

const pageSizeByView: Record<ViewMode, number> = {
  editorial: 4,
  compact: 8,
};

export function CommunityIntelligencePage({ posts }: { posts: PublishedBlogPost[] }) {
  const [activeArea, setActiveArea] = useState<AreaFilter>("All Markets");
  const [query, setQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("compact");
  const [page, setPage] = useState(1);

  const signals = useMemo(
    () =>
      posts.map((post) => ({
        post,
        signal: deriveCommunitySignal(post),
      })),
    [posts],
  );
  const areaFilters = useMemo(() => buildAreaFilters(signals), [signals]);

  const featured = signals.find(({ post }) => post.featured) ?? signals[0] ?? null;
  const filteredSignals = signals.filter(({ post, signal }) => {
    const searchText = [post.title, post.excerpt, ...(post.tags ?? []), signal.area, signal.assetClass, signal.signalType]
      .join(" ")
      .toLowerCase();
    const matchesFilter = activeArea === "All Markets" || signal.area === activeArea;
    const matchesQuery = !query.trim() || searchText.includes(query.trim().toLowerCase());

    return matchesFilter && matchesQuery;
  });
  const boardSignals = filteredSignals.filter(({ post }) => post.id !== featured?.post.id);
  const pageSize = pageSizeByView[viewMode];
  const totalPages = Math.max(1, Math.ceil(boardSignals.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const visibleSignals = boardSignals.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <MarketingShell>
      <section className="border-b border-ink/10 bg-warm-white">
        <div className="section-shell py-14 sm:py-16">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_0.42fr] lg:items-end">
            <div className="max-w-4xl">
              <p className="eyebrow">Our Community</p>
              <h1 className="gv-display mt-4 max-w-4xl text-5xl leading-[0.92] text-navy sm:text-6xl lg:text-7xl">
                Market signals Grandvista is watching
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-8 text-steel sm:text-lg">
                Project movement, development activity, and local construction context across DFW,
                organized so owners, operators, and business teams can scan what matters.
              </p>
            </div>
            <div className="grid grid-cols-3 border border-ink/12 bg-white">
              <Metric label="Signals" value={String(posts.length).padStart(2, "0")} />
              <Metric label="Markets" value={String(countMarkets(signals)).padStart(2, "0")} />
              <Metric label="Focus" value="DFW" />
            </div>
          </div>
        </div>
      </section>

      {featured ? (
        <section className="bg-ink text-white">
          <div className="section-shell grid gap-8 py-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-stretch">
            <div className="flex flex-col justify-between border border-white/12 bg-white/[0.03] p-7">
              <div>
                <p className="eyebrow">Featured Signal</p>
                <p className="mt-5 text-sm font-black uppercase tracking-[0.14em] text-white/50">
                  {featured.signal.signalType} / {featured.signal.area}
                </p>
                <h2 className="mt-4 text-3xl font-black leading-tight sm:text-5xl">
                  {featured.post.title}
                </h2>
                <p className="mt-5 max-w-2xl leading-8 text-white/70">
                  {featured.post.excerpt ?? featured.signal.impact}
                </p>
              </div>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Link
                  className="inline-flex h-13 items-center justify-center gap-2 bg-brand-red px-6 text-sm font-black uppercase tracking-[0.1em] text-white hover:bg-white hover:text-navy"
                  href={`/community/${featured.post.slug}`}
                >
                  Read Context <ArrowUpRight size={16} />
                </Link>
                <Link
                  className="inline-flex h-13 items-center justify-center border border-white/18 px-6 text-sm font-black uppercase tracking-[0.1em] text-white/80 hover:border-brand-red hover:text-brand-red"
                  href="/start-a-project"
                >
                  Talk Through a Project
                </Link>
              </div>
            </div>
            <SignalMedia post={featured.post} />
          </div>
        </section>
      ) : null}

      <section className="border-y border-ink/10 bg-white">
        <div className="section-shell grid gap-8 py-10 lg:grid-cols-[0.46fr_0.54fr] lg:items-end">
          <div>
            <p className="eyebrow">Why Keep Reading</p>
            <h2 className="mt-4 text-4xl font-black leading-tight sm:text-5xl">
              Local movement becomes project context.
            </h2>
          </div>
          <p className="max-w-3xl border-l-4 border-brand-red bg-warm-white p-6 text-lg leading-8 text-steel">
            One market update can point to where owners are investing, where operators may need
            space, and where construction demand is forming.
          </p>
        </div>
      </section>

      <section className="py-14">
        <div className="section-shell grid gap-8 xl:grid-cols-[0.3fr_0.7fr]">
          <aside className="h-fit xl:sticky xl:top-28">
            <div className="border border-ink/12 bg-white p-5">
              <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-brand-red">
                <MapPin size={15} /> Explore by market
              </p>
              <p className="mt-2 text-sm leading-6 text-steel">
                Start with the place. Then scan what kind of activity is moving around that market.
              </p>
              <label className="mt-5 flex h-12 min-w-0 items-center gap-3 border border-ink/12 bg-warm-white px-4">
                <Search className="shrink-0 text-steel" size={17} />
                <input
                  className="min-w-0 flex-1 bg-transparent text-sm font-bold outline-none placeholder:text-steel/70"
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setPage(1);
                  }}
                  placeholder="Search market notes"
                  type="search"
                  value={query}
                />
              </label>

              <div className="mt-5 grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
                {areaFilters.map((filter) => (
                  <button
                    className={`border px-4 py-3 text-left text-xs font-black uppercase tracking-[0.1em] transition ${
                      activeArea === filter
                        ? "border-navy bg-navy text-white"
                        : "border-ink/12 bg-white text-navy hover:border-brand-red hover:text-brand-red"
                    }`}
                    key={filter}
                    onClick={() => {
                      setActiveArea(filter);
                      setPage(1);
                    }}
                    type="button"
                  >
                    {filter}
                  </button>
                ))}
              </div>

              <div className="mt-5 border-t border-ink/10 pt-5">
                <p className="text-sm font-bold text-steel">
                  Showing {boardSignals.length === 0 ? "0" : `${(currentPage - 1) * pageSize + 1}-${Math.min(currentPage * pageSize, boardSignals.length)}`} of{" "}
                  {boardSignals.length} signals
                </p>
                <div className="mt-4 flex w-fit border border-ink/12 bg-warm-white p-1">
                  <ViewModeButton
                    active={viewMode === "editorial"}
                    icon={<LayoutList size={16} />}
                    label="Editorial"
                    onClick={() => {
                      setViewMode("editorial");
                      setPage(1);
                    }}
                  />
                  <ViewModeButton
                    active={viewMode === "compact"}
                    icon={<LayoutGrid size={16} />}
                    label="Compact"
                    onClick={() => {
                      setViewMode("compact");
                      setPage(1);
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-5 border border-ink/12 bg-ink p-6 text-white">
              <p className="eyebrow">Grandvista Watches</p>
              <h2 className="mt-4 text-2xl font-black leading-tight">
                Not every market update matters equally.
              </h2>
              <div className="mt-5 grid gap-3">
                {watchItems.slice(0, 4).map((item, index) => (
                  <div className="border border-white/12 bg-white/[0.03] p-4" key={item}>
                    <span className="gv-display text-2xl text-brand-red">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <p className="mt-1 text-sm font-black leading-5 text-white/82">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          <div>
            <div className={viewMode === "compact" ? "grid gap-6 lg:grid-cols-2" : "grid gap-7"}>
              {visibleSignals.length > 0 ? (
                visibleSignals.map(({ post, signal }) =>
                  viewMode === "compact" ? (
                    <CompactSignalCard key={post.id} post={post} signal={signal} />
                  ) : (
                    <SignalCard key={post.id} post={post} signal={signal} />
                  ),
                )
              ) : (
                <div className={viewMode === "compact" ? "border border-ink/12 bg-white p-8 lg:col-span-2" : "border border-ink/12 bg-white p-8"}>
                  <p className="eyebrow">No matching signals</p>
                  <h2 className="mt-4 text-3xl font-black">Try another filter or search term.</h2>
                </div>
              )}
            </div>

            {boardSignals.length > pageSize ? (
              <PaginationControls
                currentPage={currentPage}
                onNext={() => setPage((value) => Math.min(totalPages, value + 1))}
                onPrevious={() => setPage((value) => Math.max(1, value - 1))}
                totalPages={totalPages}
              />
            ) : null}
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}

function ViewModeButton({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className={`inline-flex h-10 items-center gap-2 px-4 text-xs font-black uppercase tracking-[0.1em] transition ${
        active ? "bg-navy text-white" : "text-navy hover:bg-white"
      }`}
      onClick={onClick}
      type="button"
    >
      {icon}
      {label}
    </button>
  );
}

function SignalCard({ post, signal }: { post: PublishedBlogPost; signal: CommunitySignal }) {
  return (
    <article className="group grid overflow-hidden border border-ink/12 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl lg:grid-cols-[0.48fr_0.52fr]">
      <div className="relative min-h-80 overflow-hidden bg-ink sm:min-h-96 lg:min-h-[420px]">
        {post.hero_image_url ? (
          <Image
            alt={post.hero_image_alt ?? post.title}
            className="object-cover opacity-78 transition duration-500 group-hover:scale-105 group-hover:opacity-88"
            fill
            sizes="(min-width: 1024px) 48vw, 100vw"
            src={post.hero_image_url}
          />
        ) : (
          <div className="absolute inset-0 gv-grid-dark opacity-70" />
        )}
        <div className="absolute bottom-3 left-3 bg-navy px-3 py-2 text-[0.58rem] font-black uppercase tracking-[0.14em] text-white">
          {signal.signalType}
        </div>
      </div>
      <div className="flex min-w-0 flex-col justify-center p-6 sm:p-8 lg:p-10">
        <div className="flex flex-wrap gap-2 text-[0.62rem] font-black uppercase tracking-[0.12em] text-steel">
          <span className="inline-flex items-center gap-1">
            <MapPin size={12} /> {signal.area}
          </span>
          <span>/ {signal.assetClass}</span>
        </div>
        <h3 className="mt-4 max-w-2xl text-3xl font-black leading-tight text-ink sm:text-4xl">
          {post.title}
        </h3>
        <p className="mt-5 max-w-2xl text-base leading-8 text-steel">
          {post.excerpt ?? signal.impact}
        </p>
        <div className="mt-7 max-w-2xl border-l-4 border-brand-red bg-warm-white p-5">
          <p className="text-xs font-black uppercase tracking-[0.12em] text-navy">What this signals</p>
          <p className="mt-2 text-sm leading-6 text-steel">{signal.impact}</p>
        </div>
        <Link
          className="mt-5 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-brand-red hover:text-navy"
          href={`/community/${post.slug}`}
        >
          Read Context <ArrowUpRight size={14} />
        </Link>
      </div>
    </article>
  );
}

function CompactSignalCard({ post, signal }: { post: PublishedBlogPost; signal: CommunitySignal }) {
  return (
    <article className="group overflow-hidden border border-ink/12 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <div className="relative aspect-[16/10] overflow-hidden bg-ink">
        {post.hero_image_url ? (
          <Image
            alt={post.hero_image_alt ?? post.title}
            className="object-cover opacity-80 transition duration-500 group-hover:scale-105 group-hover:opacity-90"
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            src={post.hero_image_url}
          />
        ) : (
          <div className="absolute inset-0 gv-grid-dark opacity-70" />
        )}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink via-ink/68 to-transparent p-5 pt-16">
          <div className="flex flex-wrap gap-2">
            <span className="bg-navy px-3 py-2 text-[0.58rem] font-black uppercase tracking-[0.14em] text-white">
              {signal.signalType}
            </span>
            <span className="bg-white/90 px-3 py-2 text-[0.58rem] font-black uppercase tracking-[0.14em] text-navy">
              {signal.area}
            </span>
          </div>
        </div>
      </div>
      <div className="p-6">
        <p className="text-[0.62rem] font-black uppercase tracking-[0.14em] text-steel">
          {signal.assetClass}
        </p>
        <h3 className="mt-3 text-2xl font-black leading-tight text-ink">{post.title}</h3>
        <p className="mt-4 line-clamp-3 text-sm leading-6 text-steel">
          {post.excerpt ?? signal.impact}
        </p>
        <Link
          className="mt-6 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-brand-red hover:text-navy"
          href={`/community/${post.slug}`}
        >
          Read Context <ArrowUpRight size={14} />
        </Link>
      </div>
    </article>
  );
}

function PaginationControls({
  currentPage,
  onNext,
  onPrevious,
  totalPages,
}: {
  currentPage: number;
  onNext: () => void;
  onPrevious: () => void;
  totalPages: number;
}) {
  return (
    <div className="mt-10 flex flex-col justify-between gap-4 border-t border-ink/10 pt-6 sm:flex-row sm:items-center">
      <p className="text-sm font-black uppercase tracking-[0.12em] text-steel">
        Page {currentPage} of {totalPages}
      </p>
      <div className="flex gap-3">
        <button
          className="inline-flex h-12 items-center gap-2 border border-ink/12 bg-white px-5 text-xs font-black uppercase tracking-[0.1em] text-navy transition hover:border-brand-red hover:text-brand-red disabled:cursor-not-allowed disabled:opacity-40"
          disabled={currentPage <= 1}
          onClick={onPrevious}
          type="button"
        >
          <ChevronLeft size={16} /> Previous
        </button>
        <button
          className="inline-flex h-12 items-center gap-2 bg-navy px-5 text-xs font-black uppercase tracking-[0.1em] text-white transition hover:bg-brand-red disabled:cursor-not-allowed disabled:opacity-40"
          disabled={currentPage >= totalPages}
          onClick={onNext}
          type="button"
        >
          Next <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

function SignalMedia({ post }: { post: PublishedBlogPost }) {
  return (
    <div className="relative min-h-80 overflow-hidden border border-white/12 bg-[#151925]">
      {post.hero_image_url ? (
        <Image
          alt={post.hero_image_alt ?? post.title}
          className="object-cover opacity-82"
          fill
          priority
          sizes="(min-width: 1024px) 52vw, 100vw"
          src={post.hero_image_url}
        />
      ) : (
        <div className="absolute inset-0 gv-grid-dark opacity-80" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-ink/48 to-transparent" />
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-r border-ink/12 p-5 last:border-r-0">
      <p className="gv-display text-4xl leading-none text-brand-red">{value}</p>
      <p className="mt-1 text-[0.62rem] font-black uppercase tracking-[0.14em] text-steel">
        {label}
      </p>
    </div>
  );
}

function deriveCommunitySignal(post: PublishedBlogPost): CommunitySignal {
  const text = [post.title, post.excerpt, ...(post.tags ?? [])].join(" ").toLowerCase();
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
  const areas = ["Plano", "Dallas", "Fort Worth", "Arlington", "Irving", "McKinney", "Frisco", "North Texas"];
  const match = areas.find((area) => text.includes(area.toLowerCase()));

  return match ?? "DFW";
}

function deriveSignalType(text: string): CommunitySignal["signalType"] {
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

function buildImpactSentence(signalType: CommunitySignal["signalType"], area: string, assetClass: string) {
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

function countMarkets(signals: Array<{ signal: CommunitySignal }>) {
  return new Set(signals.map(({ signal }) => signal.area)).size;
}

function buildAreaFilters(signals: Array<{ signal: CommunitySignal }>) {
  const preferredOrder = [
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
  const areas = new Set(signals.map(({ signal }) => signal.area));
  const sorted = preferredOrder.filter((area) => areas.has(area));
  const remaining = Array.from(areas)
    .filter((area) => !preferredOrder.includes(area))
    .sort((a, b) => a.localeCompare(b));

  return ["All Markets", ...sorted, ...remaining];
}
