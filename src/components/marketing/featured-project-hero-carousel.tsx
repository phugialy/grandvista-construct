"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { PublishedProject, ProjectMedia } from "@/lib/supabase/public-data";

export function FeaturedProjectHeroCarousel({ projects }: { projects: PublishedProject[] }) {
  const slides = useMemo(() => projects.filter((project) => project.slug), [projects]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const activeProject = slides[activeIndex] ?? slides[0];
  const activeMedia = getProjectHeroMedia(activeProject);

  useEffect(() => {
    if (paused || slides.length < 2) {
      return;
    }

    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, 8500);

    return () => window.clearInterval(interval);
  }, [paused, slides.length]);

  if (!activeProject) {
    return null;
  }

  function move(direction: -1 | 1) {
    setActiveIndex((current) => (current + direction + slides.length) % slides.length);
  }

  return (
    <section
      className="bg-ink text-white"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="section-shell grid gap-10 py-16 lg:grid-cols-[1.06fr_0.94fr] lg:items-center">
        <div>
          <p className="eyebrow">Featured Project Story</p>
          <h1 className="mt-5 max-w-5xl text-5xl font-black leading-[0.98] sm:text-6xl lg:text-7xl">
            {activeProject.title}
          </h1>
          <p className="mt-7 max-w-3xl text-lg leading-8 text-white/72">
            {getProjectSummary(activeProject) ??
              "See how project intent becomes usable built space through clear planning, field coordination, and accountable execution."}
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              className="inline-flex h-12 items-center justify-center gap-2 bg-brand-red px-6 text-sm font-black uppercase tracking-[0.08em] text-white transition hover:bg-white hover:text-ink"
              href={`/project-stories/${activeProject.slug}`}
            >
              View Story <ArrowUpRight size={18} />
            </Link>
            <Link
              className="inline-flex h-12 items-center justify-center border border-white/28 px-6 text-sm font-black uppercase tracking-[0.08em] text-white transition hover:border-white hover:bg-white hover:text-ink"
              href="/start-a-project"
            >
              Start a Similar Project
            </Link>
          </div>
          {slides.length > 1 ? (
            <div className="mt-7 flex flex-wrap gap-2">
              {slides.map((project, index) => (
                <button
                  className={`border px-3 py-2 text-left text-xs font-black uppercase tracking-[0.08em] transition ${
                    index === activeIndex
                      ? "border-brand-red bg-brand-red text-white"
                      : "border-white/18 text-white/72 hover:border-white hover:text-white"
                  }`}
                  key={project.id}
                  onClick={() => setActiveIndex(index)}
                  type="button"
                >
                  {project.title}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="relative min-h-[430px] overflow-hidden border border-white/14 bg-[#151925]">
          {activeMedia ? <ProjectHeroMedia media={activeMedia} title={activeProject.title} /> : <FallbackVisual />}
          <div className="absolute inset-0 bg-ink/32" />

          <div className="absolute inset-x-6 bottom-6 grid gap-3 sm:grid-cols-2">
            <HeroStat label="Project Type" value={activeProject.project_type ?? "Project Story"} />
            <HeroStat label="Location" value={activeProject.location ?? "Grandvista Project"} />
          </div>

          {slides.length > 1 ? (
            <div className="absolute left-6 right-6 top-6 flex items-center justify-between gap-4">
              <div className="flex gap-2">
                {slides.map((project, index) => (
                  <button
                    aria-label={`Show ${project.title}`}
                    className={`h-2.5 w-8 ${index === activeIndex ? "bg-brand-red" : "bg-white/34 hover:bg-white/70"}`}
                    key={project.id}
                    onClick={() => setActiveIndex(index)}
                    type="button"
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  aria-label="Previous featured story"
                  className="grid h-11 w-11 place-items-center border border-white/24 bg-ink/70 text-white hover:bg-white hover:text-ink"
                  onClick={() => move(-1)}
                  type="button"
                >
                  <ArrowLeft size={18} />
                </button>
                <button
                  aria-label="Next featured story"
                  className="grid h-11 w-11 place-items-center border border-white/24 bg-ink/70 text-white hover:bg-white hover:text-ink"
                  onClick={() => move(1)}
                  type="button"
                >
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function ProjectHeroMedia({ media, title }: { media: ProjectMedia; title: string }) {
  if (media.media_type === "video") {
    return <video className="absolute inset-0 h-full w-full object-cover" loop muted playsInline src={media.url} />;
  }

  return (
    <Image
      alt={media.alt ?? title}
      className="object-cover"
      fill
      priority
      sizes="(min-width: 1024px) 48vw, 100vw"
      src={media.url}
    />
  );
}

function FallbackVisual() {
  return (
    <>
      <div className="absolute inset-0 grid grid-cols-6 grid-rows-6 opacity-80">
        {Array.from({ length: 36 }).map((_, index) => (
          <div key={index} className="border border-white/[0.035]" />
        ))}
      </div>
      <div className="absolute left-8 right-12 top-16 h-32 bg-concrete/85" />
      <div className="absolute bottom-28 left-8 right-20 h-44 bg-white/10" />
      <div className="absolute bottom-8 left-24 right-8 h-24 bg-brand-red" />
    </>
  );
}

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-ink/88 p-5">
      <p className="text-xs font-black uppercase tracking-[0.14em] text-brand-red">{label}</p>
      <p className="mt-2 text-xl font-black">{value}</p>
    </div>
  );
}

function getProjectHeroMedia(project: PublishedProject) {
  return project.project_media?.find((media) => media.role === "hero") ?? project.project_media?.[0] ?? null;
}

function getProjectSummary(project: PublishedProject) {
  return project.summary ?? project.project_intent ?? project.stakes ?? project.built_outcome ?? null;
}
