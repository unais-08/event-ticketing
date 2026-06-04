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
        const response = await getPublicEvents({
          page,
          limit: 6,
        });

        if (!active) return;

        setEvents(response.data?.events ?? []);
        setMeta(response.data?.meta ?? null);
      } catch (err) {
        if (!active) return;

        setError(
          getApiErrorMessage(
            err,
            "Unable to load events at the moment."
          )
        );
      } finally {
        if (!active) return;
        setIsLoading(false);
      }
    }

    void loadEvents();

    return () => {
      active = false;
    };
  }, [page]);

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-12">
      <div className="mb-10">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-ink-muted)]">
          Discover
        </p>

        <h1 className="mt-2 text-4xl font-semibold">
          Explore Upcoming Events
        </h1>

        <p className="mt-4 max-w-2xl text-[var(--color-ink-muted)]">
          Browse public events, reserve tickets, and keep your
          QR code ready for check-in.
        </p>
      </div>

      {error && (
        <Card className="mb-6 border border-red-200 bg-red-50 text-red-700">
          {error}
        </Card>
      )}

      {!isLoading && events.length > 0 && (
        <div className="mb-6 text-sm text-[var(--color-ink-muted)]">
          Showing {events.length} event
          {events.length !== 1 ? "s" : ""}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading
          ? Array.from({ length: 9 }).map((_, index) => (
              <Card
                key={index}
                className="h-64 animate-pulse bg-white/70"
              />
            ))
          : events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
              />
            ))}
      </div>

      {!isLoading && events.length === 0 && (
        <Card className="mt-6 py-12 text-center">
          <h2 className="text-xl font-semibold">
            No events found
          </h2>

          <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
            Check back later for newly published events.
          </p>
        </Card>
      )}

      {meta && meta.totalPages > 1 && (
        <div className="mt-10 flex items-center justify-center gap-3">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="rounded-xl border px-4 py-2 disabled:opacity-50"
          >
            Previous
          </button>

          <span className="text-sm">
            Page {meta.page} of {meta.totalPages}
          </span>

          <button
            disabled={page === meta.totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-xl border px-4 py-2 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}