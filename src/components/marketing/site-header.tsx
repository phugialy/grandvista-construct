"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "@/lib/site-content";

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-warm-white/94 backdrop-blur">
      <div className="section-shell flex min-h-20 items-center justify-between gap-6 py-3">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <Image
            src="/grandvista-logo.jpg"
            alt="Grandvista"
            width={58}
            height={58}
            className="h-12 w-12 shrink-0 object-contain"
            priority
          />
          <div className="min-w-0">
            <p className="text-lg font-black tracking-[0.18em] text-navy">GRANDVISTA</p>
            <p className="text-[0.63rem] font-bold uppercase tracking-[0.16em] text-steel">
              America&apos;s Commercial Builder
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-5 text-sm font-semibold text-ink/78 xl:flex">
          {navItems.map((item) => {
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`border-b-2 py-2 transition ${
                  active
                    ? "border-brand-red text-brand-red"
                    : "border-transparent hover:border-navy hover:text-navy"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <Link
          href="/start-a-project"
          className="hidden h-11 items-center justify-center bg-navy px-5 text-sm font-black text-white transition hover:bg-brand-red sm:inline-flex"
        >
          Start a Project
        </Link>
      </div>

      <div className="border-t border-ink/8 xl:hidden">
        <nav className="section-shell flex gap-4 overflow-x-auto py-3 text-sm font-bold text-ink/76">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={pathname === item.href ? "shrink-0 text-brand-red" : "shrink-0"}
            >
              {item.label}
            </Link>
          ))}
          <Link href="/start-a-project" className="shrink-0 text-navy">
            Start
          </Link>
        </nav>
      </div>
    </header>
  );
}
