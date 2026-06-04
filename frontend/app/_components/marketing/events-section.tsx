"use client";

import { useEffect, useState } from "react";
import { getPublicEvents } from "@/app/_lib/api";
import { getApiErrorMessage } from "@/app/_lib/errors";
import type { PublicEventListItem } from "@/app/_lib/types";
import EventCard from "./event-card";
import Card from "@/app/_components/ui/card";

export default function EventsSection() {
  const [events, setEvents] = useState<PublicEventListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    const loadEvents = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await getPublicEvents({ page: 1, limit: 6 });
        if (!isActive) return;
        setEvents(response.data?.events ?? []);
        console.log(response.data?.events);
      } catch (err) {
        if (!isActive) return;
        setError(getApiErrorMessage(err, "Unable to load events right now."));
      } finally {
        if (!isActive) return;
        setIsLoading(false);
      }
    };

    void loadEvents();

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <section className="mx-auto w-full max-w-6xl px-6">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-ink-muted)]">Upcoming</p>
          <h2 className="text-3xl font-semibold">Events you can join now</h2>
        </div>
      </div>

      {error && (
        <Card className="border border-red-200 bg-red-50 text-sm text-red-700">{error}</Card>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading
          ? Array.from({ length: 6 }).map((_, index) => (
              <div
                key={`skeleton-${index}`}
                className="h-64 rounded-3xl border border-[var(--color-border)] bg-white/70 p-6 shadow-[var(--shadow-soft)]"
              >
                <div className="h-4 w-24 animate-pulse rounded-full bg-[var(--color-surface-strong)]" />
                <div className="mt-4 h-6 w-3/4 animate-pulse rounded-full bg-[var(--color-surface-strong)]" />
                <div className="mt-3 h-4 w-full animate-pulse rounded-full bg-[var(--color-surface-strong)]" />
                <div className="mt-2 h-4 w-2/3 animate-pulse rounded-full bg-[var(--color-surface-strong)]" />
                <div className="mt-8 h-2 w-full animate-pulse rounded-full bg-[var(--color-surface-strong)]" />
              </div>
            ))
          : events.map((event) => <EventCard key={event.id} event={event} />)}
      </div>
    </section>
  );
}
