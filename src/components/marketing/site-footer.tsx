import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { navItems } from "@/lib/site-content";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-ink text-white">
      <section className="section-shell grid gap-10 py-14 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <div className="flex items-center gap-4">
            <Image
              src="/grandvista-logo.jpg"
              alt="Grandvista"
              width={74}
              height={74}
              className="h-16 w-16 bg-white object-contain p-1"
            />
            <div>
              <p className="text-2xl font-black tracking-[0.18em]">GRANDVISTA</p>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/58">
                America&apos;s Commercial Builder
              </p>
            </div>
          </div>
          <p className="mt-8 max-w-2xl text-3xl font-black leading-tight">
            Important projects deserve a builder with direction.
          </p>
          <p className="mt-5 max-w-2xl leading-8 text-white/68">
            Clear planning. Field coordination. Accountable commercial construction for owners,
            operators, and businesses preparing for what comes next.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.14em] text-brand-red">Explore</p>
            <div className="mt-5 grid gap-3 text-sm font-bold text-white/76">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href} className="hover:text-white">
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-black uppercase tracking-[0.14em] text-brand-red">
              Next Step
            </p>
            <Link
              href="/start-a-project"
              className="mt-5 inline-flex items-center gap-2 bg-brand-red px-5 py-4 text-sm font-black uppercase tracking-[0.08em] text-white transition hover:bg-white hover:text-ink"
            >
              Start a Project <ArrowUpRight size={18} />
            </Link>
          </div>
        </div>
      </section>
      <div className="border-t border-white/10 py-5">
        <div className="section-shell text-sm font-semibold text-white/46">
          Built for today&apos;s commercial projects. Structured for tomorrow&apos;s growth.
        </div>
      </div>
    </footer>
  );
}
