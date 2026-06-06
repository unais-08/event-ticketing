"use client";

import React from "react";
import Link from "next/link";

import { useAuthStore } from "@/app/_stores/auth-store";
import { getRoleLabel } from "@/app/_lib/roles";

import Pill from "@/app/_components/ui/pill";
import { buttonStyles } from "../../ui/button";
import { useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";

export default function OrganizerHeader() {
  const user = useAuthStore((state) => state.user);
  const router = useRouter();
  const clearSession = useAuthStore((state) => state.clearSession);

  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const handleSignOut = () => {
    clearSession();
    setMobileMenuOpen(false);
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--color-border)] bg-white/70 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--color-accent)] text-white shadow-[var(--shadow-soft)] sm:h-11 sm:w-11">
            <span className="text-base font-semibold sm:text-lg">EF</span>
          </div>

          <div className="min-w-0">
            <p className="truncate text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-ink-muted)] sm:text-sm sm:tracking-[0.28em]">
              Organizer
            </p>
            <p className="truncate text-sm font-semibold sm:text-base">Workspace</p>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-6 text-sm font-semibold text-[var(--color-ink-muted)] md:flex">
          <Link className="transition hover:text-[var(--color-ink)]" href="/organizer/dashboard">
            Dashboard
          </Link>
          <Link className="transition hover:text-[var(--color-ink)]" href="/organizer/events">
            Manage Events
          </Link>
          <Link className="transition hover:text-[var(--color-ink)]" href="/organizer/check-in">
            Check-in
          </Link>
        </nav>

        {/* Desktop Right Side */}
        <div className="hidden items-center gap-3 md:flex">
          <Pill>{getRoleLabel(user?.role ?? "ORGANIZER")}</Pill>

          <button
            className={buttonStyles({
              variant: "ghost",
              size: "sm",
            })}
            onClick={handleSignOut}
          >
            Sign out
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--color-border)] bg-white md:hidden"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-[var(--color-border)] bg-white md:hidden">
          <div className="mx-auto flex max-w-6xl flex-col px-4 py-4">
            <div className="mb-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
              <div className="flex flex-col gap-2">
                <span className="font-semibold text-[var(--color-ink)]">{user?.name ?? "Organizer"}</span>
                <Pill>{getRoleLabel(user?.role ?? "ORGANIZER")}</Pill>
              </div>
            </div>

            <nav className="flex flex-col gap-2">
              <Link
                href="/organizer/dashboard"
                onClick={closeMobileMenu}
                className="rounded-xl px-3 py-3 text-sm font-semibold transition hover:bg-[var(--color-surface)]"
              >
                Dashboard
              </Link>
              <Link
                href="/organizer/events"
                onClick={closeMobileMenu}
                className="rounded-xl px-3 py-3 text-sm font-semibold transition hover:bg-[var(--color-surface)]"
              >
                Manage Events
              </Link>
              <Link
                href="/organizer/check-in"
                onClick={closeMobileMenu}
                className="rounded-xl px-3 py-3 text-sm font-semibold transition hover:bg-[var(--color-surface)]"
              >
                Check-in
              </Link>
            </nav>

            <div className="mt-4 border-t border-[var(--color-border)] pt-4">
              <button
                className={`${buttonStyles({
                  variant: "ghost",
                  size: "sm",
                })} w-full justify-center`}
                onClick={handleSignOut}
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}


