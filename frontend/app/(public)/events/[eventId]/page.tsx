"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

import { getPublicEventDetails, purchaseTicket } from "@/app/_lib/api";
import { getApiErrorMessage } from "@/app/_lib/errors";
import { formatDate, formatTime } from "@/app/_lib/format";
import type { PublicEventDetails } from "@/app/_lib/types";

import Card from "@/app/_components/ui/card";
import { Button } from "@/app/_components/ui/button";
import Pill from "@/app/_components/ui/pill";
import { useAuthStore } from "@/app/_stores/auth-store";

export default function EventDetailsPage() {
  const params = useParams();
  const eventId = params.eventId as string;
  const user = useAuthStore((state) => state.user);

  const [event, setEvent] = useState<PublicEventDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function loadEvent() {
      setIsLoading(true);
      setError(null);
      try {
        const response = await getPublicEventDetails(eventId);
        if (!active) return;
        setEvent(response.data ?? null);
      } catch (err) {
        if (!active) return;
        setError(getApiErrorMessage(err, "Unable to load event details."));
      } finally {
        if (active) setIsLoading(false);
      }
    }

    if (eventId) void loadEvent();
    return () => { active = false; };
  }, [eventId]);

  async function handlePurchase() {
    setError(null);
    setSuccessMessage("");
    setIsPurchasing(true);
    try {
      await purchaseTicket(eventId);
      setSuccessMessage("Ticket purchased! Check your tickets page.");
    } catch (err) {
      const message = getApiErrorMessage(err, "Unable to purchase ticket.");
      if (message.toLowerCase().includes("already") || message.toLowerCase().includes("exists")) {
        setSuccessMessage("You already have a ticket for this event.");
        return;
      }
      setError(message);
    } finally {
      setIsPurchasing(false);
    }
  }

  /* ── Loading ── */
  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid gap-5 lg:grid-cols-[2fr_1fr]">
          <div className="h-80 animate-pulse rounded-2xl bg-gray-100" />
          <div className="space-y-4">
            <div className="h-48 animate-pulse rounded-2xl bg-gray-100" />
            <div className="h-28 animate-pulse rounded-2xl bg-gray-100" />
          </div>
        </div>
      </div>
    );
  }

  /* ── Error / not found ── */
  if (error && !event) {
    return (
      <div className="mx-auto max-w-xl px-4 sm:px-6 py-12">
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="mx-auto max-w-xl px-4 sm:px-6 py-12">
        <Card className="space-y-2 p-6">
          <h1 className="text-xl font-semibold text-[var(--color-ink)]">Event not found</h1>
          <p className="text-sm text-[var(--color-ink-muted)]">
            The event may have been removed or does not exist.
          </p>
          <Link href="/events">
            <Button variant="outline" size="sm" className="mt-2">← Back to events</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const availableTickets = event.capacity - event.ticketCount;
  const fillPct = event.capacity > 0 ? Math.round((event.ticketCount / event.capacity) * 100) : 0;
  const isSoldOut = availableTickets <= 0;

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 sm:py-12">

      {/* Back link */}
      <Link
        href="/events"
        className="mb-6 inline-flex items-center gap-1.5 text-xs font-medium text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors"
      >
        ← All events
      </Link>

      <div className="grid gap-5 lg:grid-cols-[2fr_1fr]">

        {/* ── Left: event details ── */}
        <Card className="space-y-5 p-5 sm:p-6">
          <div>
            <Pill>Event</Pill>
            <h1 className="mt-3 text-2xl sm:text-3xl font-semibold text-[var(--color-ink)] leading-snug">
              {event.title}
            </h1>
          </div>

          <p className="text-sm sm:text-base leading-relaxed text-[var(--color-ink-muted)]">
            {event.description}
          </p>

          {/* Meta grid */}
          <div className="grid gap-3 sm:grid-cols-2 border-t border-[var(--color-border,#e5e5e3)] pt-5">
            <div className="space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--color-ink-muted)]">
                Location
              </p>
              <p className="text-sm font-medium text-[var(--color-ink)]">{event.location}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--color-ink-muted)]">
                Date
              </p>
              <p className="text-sm font-medium text-[var(--color-ink)]">{formatDate(event.date)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--color-ink-muted)]">
                Time
              </p>
              <p className="text-sm font-medium text-[var(--color-ink)]">{formatTime(event.date)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--color-ink-muted)]">
                Availability
              </p>
              <p className={`text-sm font-medium ${isSoldOut ? "text-red-600" : "text-emerald-600"}`}>
                {isSoldOut ? "Sold out" : `${availableTickets} seats left`}
              </p>
            </div>
          </div>
        </Card>

        {/* ── Right: ticket + organizer ── */}
        <div className="flex flex-col gap-4">

          {/* Ticket card */}
          <Card className="space-y-4 p-5">
            <div>
              <Pill>Tickets</Pill>
              <h2 className="mt-2 text-lg font-semibold text-[var(--color-ink)]">Reserve your seat</h2>
            </div>

            {/* Capacity rows */}
            <div className="divide-y divide-[var(--color-border,#e5e5e3)] text-sm">
              {[
                { label: "Capacity", value: event.capacity },
                { label: "Tickets sold", value: event.ticketCount },
                { label: "Remaining", value: availableTickets },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between py-2">
                  <span className="text-[var(--color-ink-muted)]">{label}</span>
                  <span className="font-medium text-[var(--color-ink)]">{value}</span>
                </div>
              ))}
            </div>

            {/* Fill bar */}
            <div>
              <div className="h-1.5 overflow-hidden rounded-full bg-[var(--color-border,#e5e5e3)]">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${fillPct >= 90 ? "bg-red-500" : fillPct >= 70 ? "bg-amber-500" : "bg-emerald-500"}`}
                  style={{ width: `${Math.min(fillPct, 100)}%` }}
                />
              </div>
              <p className="mt-1 text-[11px] text-[var(--color-ink-muted)]">{fillPct}% filled</p>
            </div>

            {/* CTA */}
            {user ? (
              <Button
                className="w-full"
                onClick={handlePurchase}
                disabled={isPurchasing || isSoldOut}
              >
                {isPurchasing ? "Purchasing…" : isSoldOut ? "Sold Out" : "Purchase Ticket"}
              </Button>
            ) : (
              <div className="rounded-xl border border-[var(--color-border,#e5e5e3)] bg-[var(--color-surface,#f9f9f8)] px-4 py-3 text-center">
                <p className="text-xs text-[var(--color-ink-muted)]">
                  You need an account to buy tickets.
                </p>
                <div className="mt-2.5 flex gap-2 justify-center">
                  <Link href="/login"><Button size="sm">Log in</Button></Link>
                  <Link href="/register"><Button variant="outline" size="sm">Register</Button></Link>
                </div>
              </div>
            )}

            {/* Feedback messages */}
            {successMessage && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5">
                <p className="text-xs text-emerald-700">✓ {successMessage}</p>
              </div>
            )}
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5">
                <p className="text-xs text-red-700">{error}</p>
              </div>
            )}
          </Card>

          {/* Organizer card */}
          <Card className="space-y-3 p-5">
            <Pill>Organizer</Pill>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-surface,#f4f4f2)] border border-[var(--color-border,#e5e5e3)] text-xs font-semibold text-[var(--color-ink)]">
                {event.organizer.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[var(--color-ink)]">
                  {event.organizer.name}
                </p>
                <p className="truncate text-xs text-[var(--color-ink-muted)]">
                  {event.organizer.email}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}