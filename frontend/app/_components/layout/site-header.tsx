"use client";

import Link from "next/link";
import { useAuthStore } from "@/app/_stores/auth-store";
import { buttonStyles } from "@/app/_components/ui/button";
import Pill from "@/app/_components/ui/pill";
import React from "react";

export default function SiteHeader() {
  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--color-border)] bg-white/70 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-6 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--color-accent)] text-white shadow-[var(--shadow-soft)]">
            <span className="text-lg font-semibold">EF</span>
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[var(--color-ink-muted)]">EventFlow</p>
            <p className="text-base font-semibold">Ticketing Intelligence</p>
          </div>
        </div>

        <nav className="hidden items-center gap-6 text-sm font-semibold text-[var(--color-ink-muted)] md:flex">
          <Link className="transition hover:text-[var(--color-ink)]" href="/">
            Events
          </Link>
          <Link className="transition hover:text-[var(--color-ink)]" href="/tickets">
            Tickets
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {mounted && user ? (
            <>
              <Pill className="hidden sm:inline-flex">{user.role}</Pill>
              <span className="hidden text-sm font-semibold text-[var(--color-ink)] sm:inline">{user.name}</span>
              <button className={buttonStyles({ variant: "ghost", size: "sm" })} onClick={clearSession} type="button">
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link className={buttonStyles({ variant: "ghost", size: "sm" })} href="/login">
                Log in
              </Link>
              <Link className={buttonStyles({ size: "sm" })} href="/register">
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
