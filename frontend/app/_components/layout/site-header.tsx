"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";

import { useAuthStore } from "@/app/_stores/auth-store";
import { buttonStyles } from "@/app/_components/ui/button";
import Pill from "@/app/_components/ui/pill";
import {
  getRoleHomePath,
  getRoleLabel,
  isOperationalRole,
} from "@/app/_lib/roles";

export default function SiteHeader() {
  const router = useRouter();

  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);

  const [mounted, setMounted] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

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
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-accent)] text-white shadow-[var(--shadow-soft)] sm:h-11 sm:w-11">
            <span className="text-base font-semibold sm:text-lg">EF</span>
          </div>

          <Link href="/" className="min-w-0" onClick={closeMobileMenu}>
            <p className="truncate text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-ink-muted)] sm:text-sm sm:tracking-[0.28em]">
              EventFlow
            </p>
            <p className="truncate text-sm font-semibold sm:text-base">
              Ticketing Intelligence
            </p>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-6 text-sm font-semibold text-[var(--color-ink-muted)] md:flex">
          <Link
            className="transition hover:text-[var(--color-ink)]"
            href="/events"
          >
            Events
          </Link>

          {mounted && user && (
            <Link
              className="transition hover:text-[var(--color-ink)]"
              href="/tickets"
            >
              Tickets
            </Link>
          )}

          {mounted && user && isOperationalRole(user.role) && (
            <>
              <Link
                className="transition hover:text-[var(--color-ink)]"
                href={getRoleHomePath(user.role)}
              >
                Workspace
              </Link>

              <Link
                className="transition hover:text-[var(--color-ink)]"
                href="/check-in"
              >
                Check-in
              </Link>
            </>
          )}

          {mounted && user?.role === "ADMIN" && (
            <Link
              className="transition hover:text-[var(--color-ink)]"
              href="/admin/checkers"
            >
              Admin
            </Link>
          )}
        </nav>

        {/* Desktop Right Side */}
        <div className="hidden items-center gap-3 md:flex">
          {mounted && user ? (
            <>
              <Pill>{getRoleLabel(user.role)}</Pill>

              <span className="max-w-[140px] truncate text-sm font-semibold text-[var(--color-ink)]">
                {user.name}
              </span>

              <button
                className={buttonStyles({
                  variant: "ghost",
                  size: "sm",
                })}
                onClick={handleSignOut}
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                className={buttonStyles({
                  variant: "ghost",
                  size: "sm",
                })}
                href="/login"
              >
                Log in
              </Link>

              <Link
                className={buttonStyles({
                  size: "sm",
                })}
                href="/register"
              >
                Get started
              </Link>
            </>
          )}
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
            {mounted && user && (
              <div className="mb-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
                <div className="flex flex-col gap-2">
                  <span className="font-semibold text-[var(--color-ink)]">
                    {user.name}
                  </span>
                  <div>
                    <Pill>{getRoleLabel(user.role)}</Pill>
                  </div>
                </div>
              </div>
            )}

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
                  className="transition hover:text-[var(--color-ink)]"
                  href="/tickets"
                >
                  Tickets
                </Link>
              )}

              {mounted && user && isOperationalRole(user.role) && (
                <>
                  <Link
                    href={getRoleHomePath(user.role)}
                    onClick={closeMobileMenu}
                    className="rounded-xl px-3 py-3 text-sm font-semibold transition hover:bg-[var(--color-surface)]"
                  >
                    Workspace
                  </Link>

                  <Link
                    href="/check-in"
                    onClick={closeMobileMenu}
                    className="rounded-xl px-3 py-3 text-sm font-semibold transition hover:bg-[var(--color-surface)]"
                  >
                    Check-in
                  </Link>
                </>
              )}

              {mounted && user?.role === "ADMIN" && (
                <Link
                  href="/admin/checkers"
                  onClick={closeMobileMenu}
                  className="rounded-xl px-3 py-3 text-sm font-semibold transition hover:bg-[var(--color-surface)]"
                >
                  Admin
                </Link>
              )}
            </nav>

            <div className="mt-4 border-t border-[var(--color-border)] pt-4">
              {mounted && user ? (
                <button
                  className={`${buttonStyles({
                    variant: "ghost",
                    size: "sm",
                  })} w-full justify-center`}
                  onClick={handleSignOut}
                >
                  Sign out
                </button>
              ) : (
                <div className="flex flex-col gap-3">
                  <Link
                    href="/login"
                    onClick={closeMobileMenu}
                    className={`${buttonStyles({
                      variant: "ghost",
                      size: "sm",
                    })} w-full justify-center`}
                  >
                    Log in
                  </Link>

                  <Link
                    href="/register"
                    onClick={closeMobileMenu}
                    className={`${buttonStyles({
                      size: "sm",
                    })} w-full justify-center`}
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