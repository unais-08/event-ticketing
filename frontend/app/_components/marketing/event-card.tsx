import Link from "next/link";
import type { PublicEventListItem } from "@/app/_lib/types";
import { formatDate } from "@/app/_lib/format";

export default function EventCard({ event }: { event: PublicEventListItem }) {
  const capacityUsed = event.capacity > 0 ? Math.round((event.ticketCount / event.capacity) * 100) : 0;
  const clamped = Math.min(100, Math.max(0, capacityUsed));

  return (
    <Link
      href={`/events/${event.id}`}
      className="group flex h-full flex-col rounded-3xl border border-[var(--color-border)] bg-white/90 p-5 shadow-[var(--shadow-soft)] transition hover:-translate-y-1 hover:border-[var(--color-accent)]"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-ink-muted)]">{formatDate(event.date)}</p>
          <h3 className="text-xl font-semibold text-[var(--color-ink)] group-hover:text-[var(--color-accent)]">
            {event.title}
          </h3>
        </div>
        <span className="rounded-full bg-[var(--color-surface-strong)] px-3 py-1 text-xs font-semibold text-[var(--color-ink)]">
          {clamped}% full
        </span>
      </div>
      <p className="mt-3 line-clamp-2 text-sm text-[var(--color-ink-muted)]">{event.description}</p>
      <div className="mt-5 space-y-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-[var(--color-ink-muted)]">Location</span>
          <span className="font-semibold text-[var(--color-ink)]">{event.location}</span>
        </div>
        <div className="h-2 rounded-full bg-[var(--color-surface-strong)]">
          <div className="h-2 rounded-full bg-[var(--color-accent)]" style={{ width: `${clamped}%` }} />
        </div>
        <div className="flex items-center justify-between text-xs text-[var(--color-ink-muted)]">
          <span>{event.ticketCount} tickets</span>
          <span>{event.capacity} capacity</span>
        </div>
      </div>
    </Link>
  );
}
