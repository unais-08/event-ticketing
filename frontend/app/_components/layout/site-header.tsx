"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useSyncExternalStore } from "react";

import { useAuthStore } from "@/app/_stores/auth-store";
import { buttonStyles } from "@/app/_components/ui/button";
import Pill from "@/app/_components/ui/pill";

export default function SiteHeader() {
  const router = useRouter();

  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);

  const mounted = useSyncExternalStore(
    () => () => { },
    () => true,
    () => false
  );

  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleSignOut = () => {
    clearSession();
    setMobileMenuOpen(false);
    router.push("/");
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--color-border)] bg-white/70 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-2 px-4 py-3 sm:gap-4 sm:px-6 sm:py-4">

        {/* Logo */}
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--color-accent)] text-white sm:h-10 sm:w-10">
            <span className="text-sm font-semibold sm:text-base">EF</span>
          </div>
          <Link href="/" className="min-w-0" onClick={closeMobileMenu}>
            <p className="truncate text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--color-ink-muted)] sm:text-xs sm:tracking-[0.28em]">
              EventFlow
            </p>
            <p className="truncate text-sm font-semibold sm:text-base">
              Ticketing Intelligence
            </p>
          </Link>
        </div>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 text-sm font-semibold text-[var(--color-ink-muted)] md:flex">
          <Link className="transition hover:text-[var(--color-ink)]" href="/events">
            Events
          </Link>
          {mounted && user && (
            <Link className="transition hover:text-[var(--color-ink)]" href="/tickets">
              My tickets
            </Link>
          )}
        </nav>

        {/* Desktop right */}
        <div className="hidden items-center gap-3 md:flex">
          {mounted && user ? (
            <>
              <Pill>Attendee</Pill>
              <span className="max-w-[140px] truncate text-sm font-semibold text-[var(--color-ink)]">
                {user.name}
              </span>
              <button
                className={buttonStyles({ variant: "ghost", size: "sm" })}
                onClick={handleSignOut}
              >
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

        {/* Mobile hamburger */}
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--color-border)] bg-white md:hidden"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="border-t border-[var(--color-border)] bg-white md:hidden">
          <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3">

            {/* User info */}
            {mounted && user && (
              <div className="mb-2 flex items-center justify-between rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-[var(--color-ink)]">{user.name}</p>
                  <p className="text-xs text-[var(--color-ink-muted)]">{user.email}</p>
                </div>
                <Pill>Attendee</Pill>
              </div>
            )}

            {/* Nav links */}
            <nav className="flex flex-col">
              <Link
                href="/events"
                onClick={closeMobileMenu}
                className="rounded-xl px-3 py-3 text-sm font-semibold transition hover:bg-[var(--color-surface)]"
              >
                Events
              </Link>
              {mounted && user && (
                <Link
                  href="/tickets"
                  onClick={closeMobileMenu}
                  className="rounded-xl px-3 py-3 text-sm font-semibold transition hover:bg-[var(--color-surface)]"
                >
                  My tickets
                </Link>
              )}
            </nav>

            {/* Auth actions */}
            <div className="mt-2 border-t border-[var(--color-border)] pt-3">
              {mounted && user ? (
                <button
                  className={`${buttonStyles({ variant: "ghost", size: "sm" })} w-full justify-center`}
                  onClick={handleSignOut}
                >
                  Sign out
                </button>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link
                    href="/login"
                    onClick={closeMobileMenu}
                    className={`${buttonStyles({ variant: "ghost", size: "sm" })} w-full justify-center`}
                  >
                    Log in
                  </Link>
                  <Link
                    href="/register"
                    onClick={closeMobileMenu}
                    className={`${buttonStyles({ size: "sm" })} w-full justify-center`}
                  >
                    Get started
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}