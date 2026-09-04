"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUpRight, ChevronLeft, ChevronRight, FileText } from "lucide-react";
import type { ProjectMedia, PublishedProject } from "@/lib/supabase/public-data";

const PAGE_SIZE = 6;

const statusBadge: Record<PublishedProject["project_status"], { label: string; className: string }> = {
  announced: { label: "Coming Soon", className: "bg-navy text-white" },
  in_progress: { label: "Under Construction", className: "bg-brand-red text-white" },
  completed: { label: "Completed", className: "bg-white text-ink" },
};

const statusOptions: Array<{ value: string; label: string }> = [
  { value: "All", label: "All" },
  { value: "announced", label: "Coming Soon" },
  { value: "in_progress", label: "Under Construction" },
  { value: "completed", label: "Completed" },
];

export function ProjectStoriesGrid({
  featuredProjects,
  initialProjects,
  totalCount,
  projectTypes,
}: {
  featuredProjects: PublishedProject[];
  initialProjects: PublishedProject[];
  totalCount: number;
  projectTypes: string[];
}) {
  const [type, setType] = useState("All Types");
  const [status, setStatus] = useState("All");
  const [page, setPage] = useState(1);
  const [searchResult, setSearchResult] = useState<{
    key: string;
    projects: PublishedProject[];
    totalCount: number;
  } | null>(null);

  const excludeIds = featuredProjects.map((project) => project.id).join(",");
  const isDefaultView = type === "All Types" && status === "All" && page === 1;
  const requestKey = JSON.stringify({ type, status, page });

  useEffect(() => {
    if (isDefaultView) {
      return;
    }

    let cancelled = false;
    const params = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) });
    if (type !== "All Types") params.set("type", type);
    if (status !== "All") params.set("status", status);
    if (excludeIds) params.set("excludeIds", excludeIds);

    fetch(`/api/project-stories/search?${params.toString()}`)
      .then((response) => response.json())
      .then((data: { projects: PublishedProject[]; totalCount: number }) => {
        if (!cancelled) setSearchResult({ key: requestKey, ...data });
      })
      .catch((error: unknown) => console.error("Failed to search project stories", error));

    return () => {
      cancelled = true;
    };
  }, [isDefaultView, requestKey, type, status, page, excludeIds]);

  const loading = !isDefaultView && searchResult?.key !== requestKey;
  const projects = isDefaultView ? initialProjects : (searchResult?.projects ?? []);
  const boardTotal = isDefaultView ? totalCount : (searchResult?.totalCount ?? 0);
  const totalPages = Math.max(1, Math.ceil(boardTotal / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const rangeStart = boardTotal === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(currentPage * PAGE_SIZE, boardTotal);

  const feature = featuredProjects[0] ?? null;
  const sideFeatured = featuredProjects.slice(1, 3);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[0.62rem] font-black uppercase tracking-[0.1em] text-steel">Filter</span>
        <FilterChip
          active={type === "All Types"}
          label="All Types"
          onClick={() => {
            setType("All Types");
            setPage(1);
          }}
        />
        {projectTypes.map((option) => (
          <FilterChip
            active={type === option}
            key={option}
            label={option}
            onClick={() => {
              setType(option);
              setPage(1);
            }}
          />
        ))}
        <span className="mx-1 h-5 w-px bg-ink/12" />
        {statusOptions.map((option) => (
          <FilterChip
            active={status === option.value}
            key={option.value}
            label={option.label}
            onClick={() => {
              setStatus(option.value);
              setPage(1);
            }}
          />
        ))}
      </div>

      {feature ? (
        <div className="mt-7 grid gap-6 lg:grid-cols-3 lg:grid-rows-2">
          <ProjectCard className="lg:col-span-2 lg:row-span-2" project={feature} variant="feature" />
          {sideFeatured.map((project) => (
            <ProjectCard key={project.id} project={project} variant="side" />
          ))}
        </div>
      ) : null}

      <div className="mt-12 flex items-baseline justify-between">
        <h3 className="text-xs font-black uppercase tracking-[0.1em] text-steel">More Stories</h3>
      </div>

      <div
        aria-busy={loading}
        className={`mt-5 grid gap-6 transition-opacity sm:grid-cols-2 lg:grid-cols-3 ${loading ? "opacity-60" : "opacity-100"}`}
      >
        {projects.length > 0 ? (
          projects.map((project) => <ProjectCard key={project.id} project={project} variant="standard" />)
        ) : (
          <div className="border border-ink/12 bg-white p-8 sm:col-span-2 lg:col-span-3">
            <p className="eyebrow">No matching stories</p>
            <h3 className="mt-4 text-2xl font-black">Try a different type or status.</h3>
          </div>
        )}
      </div>

      {totalPages > 1 ? (
        <div className="mt-10 flex flex-col justify-between gap-4 border-t border-ink/10 pt-6 sm:flex-row sm:items-center">
          <p className="text-sm font-black uppercase tracking-[0.1em] text-steel">
            Showing {rangeStart}&ndash;{rangeEnd} of {boardTotal} stories
          </p>
          <div className="flex gap-3">
            <button
              className="inline-flex h-12 items-center gap-2 border border-ink/12 bg-white px-5 text-xs font-black uppercase tracking-[0.1em] text-navy transition hover:border-brand-red hover:text-brand-red disabled:cursor-not-allowed disabled:opacity-40"
              disabled={currentPage <= 1}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              type="button"
            >
              <ChevronLeft size={16} /> Previous
            </button>
            <button
              className="inline-flex h-12 items-center gap-2 bg-navy px-5 text-xs font-black uppercase tracking-[0.1em] text-white transition hover:bg-brand-red disabled:cursor-not-allowed disabled:opacity-40"
              disabled={currentPage >= totalPages}
              onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
              type="button"
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function FilterChip({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      className={`border px-3.5 py-2 text-xs font-black transition ${
        active
          ? "border-navy bg-navy text-white"
          : "border-ink/14 bg-white text-ink hover:border-brand-red hover:text-brand-red"
      }`}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}

function getCardImages(project: PublishedProject) {
  const media = project.project_media ?? [];
  const hero = media.find((item) => item.role === "hero") ?? null;
  const previewPool = media.filter((item) => item.id !== hero?.id && item.media_type === "image");
  const curated = previewPool.filter((item) => item.is_card_preview);
  const secondary = (curated.length > 0 ? curated : previewPool).slice(0, 2);
  return { hero, secondary };
}

function ProjectCard({
  project,
  variant,
  className = "",
}: {
  project: PublishedProject;
  variant: "feature" | "side" | "standard";
  className?: string;
}) {
  const { hero, secondary } = getCardImages(project);
  const badge = statusBadge[project.project_status];
  const excerpt = project.intention ?? project.summary ?? project.project_intent ?? project.built_outcome;
  const kicker = [project.project_type, project.location].filter(Boolean).join(" · ");
  const showMosaic = variant === "feature" && secondary.length > 0;

  return (
    <article
      className={`group flex overflow-hidden border border-ink/12 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl ${
        variant === "side" ? "flex-row" : "flex-col"
      } ${className}`}
    >
      <div
        className={`relative shrink-0 overflow-hidden bg-ink ${
          variant === "feature" ? "min-h-72 flex-1" : variant === "side" ? "w-2/5" : "aspect-[4/3]"
        } ${showMosaic ? "grid grid-cols-[1.4fr_1fr] gap-px" : ""}`}
      >
        <HeroFill hero={hero} title={project.title} />
        {showMosaic ? (
          <div className="grid grid-rows-2 gap-px">
            {secondary.map((media) => (
              <div className="relative overflow-hidden bg-ink" key={media.id}>
                <Image alt={media.alt ?? project.title} className="object-cover opacity-80" fill sizes="180px" src={media.url} />
              </div>
            ))}
          </div>
        ) : null}
        <span className={`absolute left-2.5 top-2.5 px-2.5 py-1.5 text-[0.58rem] font-black uppercase tracking-[0.08em] ${badge.className}`}>
          {badge.label}
        </span>
      </div>
      <div className={`flex min-w-0 flex-1 flex-col gap-2 ${variant === "side" ? "p-4" : "p-6"}`}>
        <p className="text-[0.6rem] font-black uppercase tracking-[0.08em] text-steel">
          {variant === "feature" ? "Featured Story · " : ""}
          {kicker}
        </p>
        <h3 className={`font-black leading-tight ${variant === "feature" ? "text-3xl" : variant === "side" ? "text-base" : "text-2xl"}`}>
          {project.title}
        </h3>
        {variant !== "side" && excerpt ? (
          <p className="line-clamp-2 flex-1 text-sm leading-6 text-steel">{excerpt}</p>
        ) : null}
        <Link
          className="mt-1 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.1em] text-brand-red hover:text-navy"
          href={`/project-stories/${project.slug}`}
        >
          Read the Story <ArrowUpRight size={14} />
        </Link>
      </div>
    </article>
  );
}

function HeroFill({ hero, title }: { hero: ProjectMedia | null; title: string }) {
  if (hero?.url && hero.media_type === "image") {
    return <Image alt={hero.alt ?? title} className="object-cover opacity-90 transition duration-500 group-hover:scale-105" fill sizes="(min-width: 1024px) 40vw, 100vw" src={hero.url} />;
  }

  if (hero?.url && hero.media_type === "video") {
    return <video autoPlay className="absolute inset-0 h-full w-full object-cover opacity-85" loop muted playsInline src={hero.url} />;
  }

  return (
    <div className="absolute inset-0 grid place-items-center bg-ink">
      <FileText className="text-white/30" size={28} />
    </div>
  );
}
