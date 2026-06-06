import Link from "next/link";
import { buttonStyles } from "@/app/_components/ui/button";
import Pill from "@/app/_components/ui/pill";

export default function Hero() {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 pt-8">
      <div className="grid gap-10 md:grid-cols-[1.1fr_0.9fr] md:items-center">
        <div className="space-y-6">
          <Pill>Live operations</Pill>
          <div className="space-y-4">
            <h1 className="text-4xl font-semibold leading-tight text-[var(--color-ink)] md:text-6xl">
              Seamless ticketing,
              <span className="text-[var(--color-accent)]"> confident check-ins</span>,
              and calm event crews.
            </h1>
            <p className="max-w-xl text-base text-[var(--color-ink-muted)] md:text-lg">
              EventFlow aligns ticket sales, attendee access, and organizer operations in one place.
              Plan faster, check in smarter, and keep every seat accounted for.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link className={buttonStyles({ size: "lg" })} href="/register">
              Start as attendee
            </Link>
            <Link className={buttonStyles({ variant: "outline", size: "lg" })} href="/login">
              Organizer login
            </Link>
          </div>
        </div>
        <div className="relative">
          <div className="absolute -top-6 right-6 hidden h-24 w-24 rounded-3xl bg-[var(--color-accent)] opacity-80 blur-2xl md:block" />
          <div className="relative space-y-4 rounded-3xl border border-[var(--color-border)] bg-white/90 p-6 shadow-[var(--shadow-soft)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-ink-muted)]">Tonight</p>
                <p className="text-xl font-semibold">City Lights Festival</p>
              </div>
              <span className="rounded-full bg-[var(--color-surface-strong)] px-3 py-1 text-xs font-semibold text-[var(--color-ink)]">
                86% full
              </span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm text-[var(--color-ink-muted)]">
                <span>Doors open</span>
                <span className="font-semibold text-[var(--color-ink)]">6:00 PM</span>
              </div>
              <div className="flex items-center justify-between text-sm text-[var(--color-ink-muted)]">
                <span>Check-in lanes</span>
                <span className="font-semibold text-[var(--color-ink)]">4 active</span>
              </div>
              <div className="h-2 rounded-full bg-[var(--color-surface-strong)]">
                <div className="h-2 w-4/5 rounded-full bg-[var(--color-accent)]" />
              </div>
            </div>
          </div>
          <div className="mt-4 rounded-2xl border border-[var(--color-border)] bg-white/80 p-4 text-sm text-[var(--color-ink-muted)] shadow-[var(--shadow-soft)] animate-[float-slow_8s_ease-in-out_infinite]">
            Check-in just flows. No stress, no bottlenecks.- Venue lead
          </div>
        </div>
      </div>
    </section>
  );
}
