"use client";

import { useEffect } from "react";

type SoroBlogEmbedProps = {
  containerId: string;
  scriptUrl: string;
};

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
    script.src = scriptUrl;
    document.body.appendChild(script);

    return () => {
      script.remove();
    };
  }, [containerId, scriptUrl]);

  return <div id={containerId} />;
}
