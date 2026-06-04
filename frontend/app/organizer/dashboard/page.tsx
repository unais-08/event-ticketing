"use client";

import React from "react";
import Link from "next/link";

import { getOrganizerEvents } from "@/app/_lib/api";
import { getApiErrorMessage } from "@/app/_lib/errors";
import { formatDate } from "@/app/_lib/format";
import type { OrganizerEventListItem } from "@/app/_lib/types";
import { useAuthStore } from "@/app/_stores/auth-store";

import Card from "@/app/_components/ui/card";
import { Button } from "@/app/_components/ui/button";
import Pill from "@/app/_components/ui/pill";

export default function OrganizerDashboardPage() {
  const user = useAuthStore((state) => state.user);
  const status = useAuthStore((state) => state.status);
  const [events, setEvents] = React.useState<OrganizerEventListItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    if (status === "loading") {
      return;
    }

    const canAccess = user?.role === "ADMIN" || user?.role === "ORGANIZER";

    if (!canAccess) {
      setLoading(false);
      return;
    }

    let mounted = true;

    const loadEvents = async () => {
      try {
        const res = await getOrganizerEvents({ page: 1, limit: 24 });

        if (!mounted) return;

        setEvents(res?.data?.events ?? []);
      } catch (err: any) {
        if (mounted) {
          setError(getApiErrorMessage(err, "Failed to load events."));
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
  }, [status, user]);

  if (status === "loading") {
    return (
      <div className="mx-auto max-w-6xl px-6 py-8">
        <Card className="h-72 animate-pulse bg-white/70" />
      </div>
    );
  }

  const canAccess = user?.role === "ADMIN" || user?.role === "ORGANIZER";
  const totalTickets = events.reduce((sum, event) => sum + (event.ticketCount ?? 0), 0);
  const totalCapacity = events.reduce((sum, event) => sum + (event.capacity ?? 0), 0);
  const occupancy = totalCapacity > 0 ? Math.round((totalTickets / totalCapacity) * 100) : 0;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-8">
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="space-y-5">
          <div className="flex flex-wrap items-center gap-3">
            <Pill>Organizer dashboard</Pill>
            <Pill>{user?.role ?? "Guest"}</Pill>
          </div>
          <div className="space-y-3">
            <h1 className="text-4xl font-semibold leading-tight text-[var(--color-ink)]">Events, tickets, and live capacity in one dashboard.</h1>
            <p className="max-w-2xl text-base leading-7 text-[var(--color-ink-muted)]">
              Review every event you manage, jump into a detail screen, and keep check-ins moving without switching context.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/organizer/events/new">
              <Button size="sm">Create event</Button>
            </Link>
            <Link href="/check-in">
              <Button variant="outline" size="sm">
                Open check-in
              </Button>
            </Link>
          </div>
        </Card>

        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
          <Card>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-ink-muted)]">Events</p>
            <p className="mt-3 text-4xl font-semibold text-[var(--color-ink)]">{events.length}</p>
          </Card>
          <Card>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-ink-muted)]">Tickets sold</p>
            <p className="mt-3 text-4xl font-semibold text-[var(--color-ink)]">{totalTickets}</p>
          </Card>
          <Card>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-ink-muted)]">Capacity used</p>
            <p className="mt-3 text-4xl font-semibold text-[var(--color-ink)]">{occupancy}%</p>
          </Card>
        </div>
      </div>

      {loading ? (
        <Card className="h-64 animate-pulse bg-white/70" />
      ) : error ? (
        <Card className="border border-red-200 bg-red-50 text-red-700">{error}</Card>
      ) : !canAccess ? (
        <Card className="space-y-3">
          <Pill>Access required</Pill>
          <h2 className="text-2xl font-semibold text-[var(--color-ink)]">This workspace is for organizers and admins.</h2>
          <p className="text-sm leading-6 text-[var(--color-ink-muted)]">
            Switch to an organizer account to manage events, or use the attendee view to browse public events and your tickets.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/login">
              <Button size="sm">Log in</Button>
            </Link>
            <Link href="/">
              <Button variant="outline" size="sm">
                Browse events
              </Button>
            </Link>
          </div>
        </Card>
      ) : events.length === 0 ? (
        <Card className="space-y-4 text-center">
          <Pill>No events yet</Pill>
          <h2 className="text-2xl font-semibold text-[var(--color-ink)]">Create your first event</h2>
          <p className="mx-auto max-w-xl text-sm leading-6 text-[var(--color-ink-muted)]">
            Start with a clean event record, then open the detail page to update it, review tickets, and run check-ins.
          </p>
          <div className="flex justify-center">
            <Link href="/organizer/events/new">
              <Button size="sm">Create event</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4">
          {events.map((event) => {
            const occupancyRatio = event.capacity > 0 ? Math.min(100, Math.round(((event.ticketCount ?? 0) / event.capacity) * 100)) : 0;

            return (
              <Card key={event.id} className="space-y-4">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <Pill>{formatDate(event.date)}</Pill>
                      <span className="text-sm font-semibold text-[var(--color-ink-muted)]">{event.location}</span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-semibold text-[var(--color-ink)]">{event.title}</h3>
                      <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--color-ink-muted)]">{event.description}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Link href={`/organizer/events/${event.id}`}>
                      <Button size="sm">Open event</Button>
                    </Link>
                    <Link href={`/organizer/events/${event.id}`}>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </Link>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  <div className="rounded-2xl bg-[var(--color-surface)] px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.24em] text-[var(--color-ink-muted)]">Tickets sold</p>
                    <p className="mt-1 text-xl font-semibold text-[var(--color-ink)]">{event.ticketCount ?? 0}</p>
                  </div>
                  <div className="rounded-2xl bg-[var(--color-surface)] px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.24em] text-[var(--color-ink-muted)]">Capacity</p>
                    <p className="mt-1 text-xl font-semibold text-[var(--color-ink)]">{event.capacity}</p>
                  </div>
                  <div className="rounded-2xl bg-[var(--color-surface)] px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.24em] text-[var(--color-ink-muted)]">Occupancy</p>
                    <p className="mt-1 text-xl font-semibold text-[var(--color-ink)]">{occupancyRatio}%</p>
                  </div>
                </div>

                <div className="h-2 rounded-full bg-[var(--color-surface-strong)]">
                  <div className="h-2 rounded-full bg-[var(--color-accent)]" style={{ width: `${occupancyRatio}%` }} />
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}