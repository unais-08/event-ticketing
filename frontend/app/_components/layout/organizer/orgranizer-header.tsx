"use client";

import Link from "next/link";

import { useAuthStore } from "@/app/_stores/auth-store";
import { getRoleLabel } from "@/app/_lib/roles";

import Pill from "@/app/_components/ui/pill";
import { buttonStyles } from "../../ui/button";
import { useRouter } from "next/navigation";

export default function OrganizerHeader() {
  const user = useAuthStore((state) => state.user);
  const router = useRouter();
  const clearSession = useAuthStore((state) => state.clearSession);

  const handleSignOut = () => {
    clearSession();
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

        <div className="flex items-center gap-3">
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
      </div>
    </header>
  );
}

