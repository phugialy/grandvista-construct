"use client";

import { useEffect } from "react";

export function SupabaseRecoveryRedirect() {
  useEffect(() => {
    const hash = window.location.hash;

    if (!hash || window.location.pathname === "/admin/reset-password") {
      return;
    }

    const params = new URLSearchParams(hash.replace(/^#/, ""));

    if (params.get("type") !== "recovery" || !params.get("access_token")) {
      return;
    }

    window.location.replace(`/admin/reset-password${hash}`);
  }, []);

  return null;
}
