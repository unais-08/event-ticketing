"use client";

import { useEffect, useState } from "react";
import { getPublicEvents } from "@/app/_lib/api";
import { getApiErrorMessage } from "@/app/_lib/errors";
import type { PublicEventListItem, PaginationMeta } from "@/app/_lib/types";

import EventCard from "@/app/_components/marketing/event-card";
import Card from "@/app/_components/ui/card";

export default function EventsPage() {
  const [events, setEvents] = useState<PublicEventListItem[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadEvents() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await getPublicEvents({ page, limit: 6 });
        if (!active) return;
        setEvents(response.data?.events ?? []);
        setMeta(response.data?.meta ?? null);
      } catch (err) {
        if (!active) return;
        setError(getApiErrorMessage(err, "Unable to load events at the moment."));
      } finally {
        if (active) setIsLoading(false);
      }
    }

    void loadEvents();
    return () => { active = false; };
  }, [page]);

  const handlePageChange = (next: number) => {
    setPage(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-8 sm:py-12">

      {/* ── Header ── */}
      <div className="mb-8 sm:mb-10">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-ink-muted)]">
          Discover
        </p>
        <h1 className="mt-2 text-3xl sm:text-4xl font-semibold text-[var(--color-ink)] leading-tight">
          Explore Upcoming Events
        </h1>
        <p className="mt-3 max-w-xl text-sm sm:text-base leading-relaxed text-[var(--color-ink-muted)]">
          Browse public events, reserve tickets, and keep your QR code ready for check-in.
        </p>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* ── Count label ── */}
      {!isLoading && events.length > 0 && (
        <p className="mb-4 text-xs text-[var(--color-ink-muted)]">
          Showing {events.length} event{events.length !== 1 ? "s" : ""}
          {meta ? ` · Page ${meta.page} of ${meta.totalPages}` : ""}
        </p>
      )}

      {/* ── Grid ── */}
      <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-56 animate-pulse rounded-2xl bg-gray-100" />
          ))
          : events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
      </div>

      {/* ── Empty state ── */}
      {!isLoading && events.length === 0 && (
        <Card className="mt-6 flex flex-col items-center py-14 text-center px-6">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-surface,#f4f4f2)] text-2xl">
            🎟️
          </div>
          <h2 className="text-lg font-semibold text-[var(--color-ink)]">No events found</h2>
          <p className="mt-1.5 text-sm text-[var(--color-ink-muted)] max-w-xs">
            Check back later for newly published events.
          </p>
        </Card>
      )}

      {/* ── Pagination ── */}
      {meta && meta.totalPages > 1 && (
        <div className="mt-10 flex items-center justify-center gap-2">
          <button
            disabled={page === 1 || isLoading}
            onClick={() => handlePageChange(page - 1)}
            className="rounded-xl border border-[var(--color-border,#e5e5e3)] bg-white px-4 py-2 text-sm font-medium text-[var(--color-ink)] transition hover:bg-[var(--color-surface,#f9f9f8)] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ← Prev
          </button>

          {/* Page number pills */}
          <div className="hidden sm:flex items-center gap-1">
            {Array.from({ length: meta.totalPages }).map((_, i) => {
              const p = i + 1;
              const isCurrent = p === page;
              const isNear = Math.abs(p - page) <= 1 || p === 1 || p === meta.totalPages;

              if (!isNear) {
                if (p === page - 2 || p === page + 2) {
                  return <span key={p} className="px-1 text-[var(--color-ink-muted)] text-sm">…</span>;
                }
                return null;
              }

              return (
                <button
                  key={p}
                  onClick={() => handlePageChange(p)}
                  disabled={isLoading}
                  className={`h-9 w-9 rounded-xl text-sm font-medium transition ${isCurrent
                      ? "bg-[var(--color-ink)] text-white"
                      : "border border-[var(--color-border,#e5e5e3)] bg-white text-[var(--color-ink)] hover:bg-[var(--color-surface,#f9f9f8)]"
                    } disabled:opacity-40`}
                >
                  {p}
                </button>
              );
            })}
          </div>

          {/* Mobile: just current/total */}
          <span className="sm:hidden text-sm text-[var(--color-ink-muted)] px-2">
            {meta.page} / {meta.totalPages}
          </span>

          <button
            disabled={page === meta.totalPages || isLoading}
            onClick={() => handlePageChange(page + 1)}
            className="rounded-xl border border-[var(--color-border,#e5e5e3)] bg-white px-4 py-2 text-sm font-medium text-[var(--color-ink)] transition hover:bg-[var(--color-surface,#f9f9f8)] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}