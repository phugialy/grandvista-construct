"use client";

import { useEffect } from "react";

type SoroBlogEmbedProps = {
  containerId: string;
  scriptUrl: string;
};

const SORO_EMBED_CACHE_VERSION = "20260625";

function withStableCacheVersion(scriptUrl: string) {
  try {
    const url = new URL(scriptUrl);
    url.searchParams.set("grandvista_embed_version", SORO_EMBED_CACHE_VERSION);
    return url.toString();
  } catch {
    const separator = scriptUrl.includes("?") ? "&" : "?";
    return `${scriptUrl}${separator}grandvista_embed_version=${SORO_EMBED_CACHE_VERSION}`;
  }
}

export function SoroBlogEmbed({ containerId, scriptUrl }: SoroBlogEmbedProps) {
  useEffect(() => {
    if (!containerId || !scriptUrl) {
      return;
    }

    const existing = document.querySelector<HTMLScriptElement>(
      `script[data-grandvista-soro-embed="${containerId}"]`,
    );

    if (existing) {
      return;
    }

    const script = document.createElement("script");
    script.dataset.grandvistaSoroEmbed = containerId;
    script.defer = true;
    script.src = withStableCacheVersion(scriptUrl);
    document.body.appendChild(script);

    return () => {
      script.remove();
    };
  }, [containerId, scriptUrl]);

  return <div id={containerId} />;
}
