"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type RecoveryState = "checking" | "ready" | "saving" | "success" | "invalid";

export function CandidateResetPasswordForm() {
  const [message, setMessage] = useState("Checking the reset link...");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [state, setState] = useState<RecoveryState>("checking");

  useEffect(() => {
    let active = true;
    const supabase = getSupabaseBrowserClient();

    const prepareRecoverySession = async () => {
      const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const query = new URLSearchParams(window.location.search);
      const accessToken = hash.get("access_token");
      const refreshToken = hash.get("refresh_token");
      const code = query.get("code");

      if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (error) {
          throw error;
        }

        window.history.replaceState(null, "", window.location.pathname);
      } else if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
          throw error;
        }

        window.history.replaceState(null, "", window.location.pathname);
      }

      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error || !session) {
        throw error ?? new Error("The reset link is expired or invalid.");
      }

      if (!active) {
        return;
      }

      setState("ready");
      setMessage("Enter a new password for your account.");
    };

    prepareRecoverySession().catch((error: unknown) => {
      if (!active) {
        return;
      }

      console.error("Candidate password recovery failed", error);
      setState("invalid");
      setMessage("This reset link is expired, invalid, or already used. Request a new one.");
    });

    return () => {
      active = false;
    };
  }, []);

  async function submitPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (state !== "ready") {
      return;
    }

    if (password.length < 8) {
      setMessage("Use at least 8 characters for the new password.");
      return;
    }

    if (password !== passwordConfirmation) {
      setMessage("The password confirmation does not match.");
      return;
    }

    setState("saving");
    setMessage("Updating password...");

    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setState("ready");
      setMessage(error.message || "The password could not be updated. Try a new reset link.");
      return;
    }

    await supabase.auth.signOut({ scope: "local" });
    setState("success");
    setPassword("");
    setPasswordConfirmation("");
    setMessage("Password updated. Sign in with your new password.");
  }

  const canSubmit = state === "ready";

  return (
    <div className="w-full max-w-md border border-ink/12 bg-white p-8">
      <p className="eyebrow">Reset Password</p>
      <h1 className="mt-4 text-3xl font-black leading-tight">Choose a new password</h1>
      <p className="mt-4 leading-7 text-steel">This page works only from the reset link we emailed you.</p>
      <p
        className={`mt-5 border p-4 text-sm font-bold ${
          state === "success"
            ? "border-navy/20 bg-navy/5 text-navy"
            : state === "invalid"
              ? "border-brand-red/30 bg-brand-red/8 text-brand-red"
              : "border-ink/12 bg-warm-white text-steel"
        }`}
      >
        {message}
      </p>

      {state !== "success" ? (
        <form className="mt-6 grid gap-4" onSubmit={submitPassword}>
          <label className="grid gap-2 font-bold">
            New password
            <input
              autoComplete="new-password"
              className="min-h-12 border border-ink/14 bg-white p-4 text-base text-ink outline-none focus:border-navy disabled:bg-warm-white"
              disabled={!canSubmit}
              minLength={8}
              onChange={(event) => setPassword(event.target.value)}
              required
              type="password"
              value={password}
            />
          </label>
          <label className="grid gap-2 font-bold">
            Confirm new password
            <input
              autoComplete="new-password"
              className="min-h-12 border border-ink/14 bg-white p-4 text-base text-ink outline-none focus:border-navy disabled:bg-warm-white"
              disabled={!canSubmit}
              minLength={8}
              onChange={(event) => setPasswordConfirmation(event.target.value)}
              required
              type="password"
              value={passwordConfirmation}
            />
          </label>
          <button
            className="mt-2 bg-navy px-6 py-4 text-sm font-black uppercase tracking-[0.08em] text-white hover:bg-brand-red disabled:cursor-not-allowed disabled:bg-ink/45"
            disabled={!canSubmit}
            type="submit"
          >
            {state === "saving" ? "Updating..." : "Update Password"}
          </button>
        </form>
      ) : null}

      <Link
        className="mt-5 block text-center text-sm font-black uppercase tracking-[0.08em] text-navy hover:text-brand-red"
        href="/careers/login"
      >
        Back to Sign In
      </Link>
    </div>
  );
}
