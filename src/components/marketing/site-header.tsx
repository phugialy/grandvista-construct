"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "@/lib/site-content";
import { TrackedLink } from "./tracked-link";

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-ink/94 text-white backdrop-blur">
      <div className="section-shell flex min-h-20 items-center justify-between gap-6 py-3">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <Image
            src="/grandvista-mark-transparent.png"
            alt="Grandvista"
            width={58}
            height={58}
            className="h-12 w-12 shrink-0 object-contain"
            priority
          />
          <div className="min-w-0">
            <p className="gv-display text-2xl leading-none tracking-normal text-white">GRANDVISTA</p>
            <p className="text-[0.6rem] font-bold uppercase tracking-[0.16em] text-white/55">
              America&apos;s Commercial Builder
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-5 text-sm font-semibold text-white/70 xl:flex">
          {navItems.map((item) => {
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`border-b-2 py-2 transition ${
                  active
                    ? "border-brand-red text-brand-red"
                    : "border-transparent hover:border-brand-red hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <TrackedLink
          analyticsLabel="Header Start a Project"
          href="/start-a-project"
          className="hidden h-11 items-center justify-center bg-brand-red px-5 text-sm font-black uppercase tracking-[0.08em] text-white transition hover:bg-white hover:text-navy sm:inline-flex"
        >
          Start a Project
        </TrackedLink>
      </div>

      <div className="border-t border-white/10 xl:hidden">
        <nav className="section-shell flex gap-4 overflow-x-auto py-3 text-sm font-bold text-white/70">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={pathname === item.href ? "shrink-0 text-brand-red" : "shrink-0"}
            >
              {item.label}
            </Link>
          ))}
          <TrackedLink analyticsLabel="Mobile Header Start" href="/start-a-project" className="shrink-0 text-navy">
            Start
          </TrackedLink>
        </nav>
      </div>
    </header>
  );
}
