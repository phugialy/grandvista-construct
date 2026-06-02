"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { trackCtaClick } from "./analytics-tracker";

type TrackedLinkProps = ComponentProps<typeof Link> & {
  analyticsLabel: string;
};

export function TrackedLink({ analyticsLabel, href, onClick, ...props }: TrackedLinkProps) {
  return (
    <Link
      href={href}
      onClick={(event) => {
        trackCtaClick(typeof href === "string" ? href : href.toString(), analyticsLabel);
        onClick?.(event);
      }}
      {...props}
    />
  );
}
