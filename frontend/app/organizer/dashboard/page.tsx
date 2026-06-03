"use client";

import React from "react";
import Link from "next/link";

import { getOrganizerEvents } from "@/app/_lib/api";

import Card from "@/app/_components/ui/card";
import { Button } from "@/app/_components/ui/button";

interface OrganizerEvent {
  id: string;
  title: string;
  date: string;
  ticketCount?: number;
}

export default function OrganizerDashboardPage() {
  const [events, setEvents] = React.useState<OrganizerEvent[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    let mounted = true;

    const loadEvents = async () => {
      try {
        const res = await getOrganizerEvents();

        if (!mounted) return;

        setEvents(res?.data?.events ?? []);
      } catch (err: any) {
        console.error("Failed to load organizer events:", err);

        if (mounted) {
          setError(
            err?.response?.data?.message ||
              err?.message ||
              "Failed to load events"
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadEvents();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">
          Organizer Dashboard
        </h1>

        <Link href="/organizer/events/new">
          <Button size="sm">
            Create Event
          </Button>
        </Link>
      </div>

      {loading ? (
        <p>Loading events...</p>
      ) : error ? (
        <Card>
          <p className="text-red-500">{error}</p>
        </Card>
      ) : events.length === 0 ? (
        <Card>
          No events yet. Create your first event.
        </Card>
      ) : (
        <div className="grid gap-4">
          {events.map((event) => (
            <Card
              key={event.id}
              className="flex items-center justify-between"
            >
              <div>
                <h3 className="text-lg font-semibold">
                  {event.title}
                </h3>

                <p className="text-sm text-[var(--color-ink-muted)]">
                  {new Date(event.date).toLocaleString()}
                </p>

                <p className="text-sm text-[var(--color-ink-muted)]">
                  {event.ticketCount ?? 0} tickets sold
                </p>
              </div>

              <Link href={`/organizer/events/${event.id}`}>
                <Button size="sm">
                  View
                </Button>
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}