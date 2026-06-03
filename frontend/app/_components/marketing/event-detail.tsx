"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getPublicEventDetails, purchaseTicket } from "@/app/_lib/api";
import { getApiErrorMessage } from "@/app/_lib/errors";
import { formatDate, formatTime } from "@/app/_lib/format";
import type { PublicEventDetails } from "@/app/_lib/types";
import { useAuthStore } from "@/app/_stores/auth-store";
import { Button } from "@/app/_components/ui/button";
import Card from "@/app/_components/ui/card";
import Divider from "@/app/_components/ui/divider";

export default function EventDetail({ eventId }: { eventId: string }) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [event, setEvent] = useState<PublicEventDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [purchaseState, setPurchaseState] = useState<{ isLoading: boolean; error: string | null }>({
    isLoading: false,
    error: null,
  });

  useEffect(() => {
    let isActive = true;

    const loadEvent = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await getPublicEventDetails(eventId);
        if (!isActive) return;
        setEvent(response.data ?? null);
      } catch (err) {
        if (!isActive) return;
        setError(getApiErrorMessage(err, "Unable to load event details."));
      } finally {
        if (!isActive) return;
        setIsLoading(false);
      }
    };

    void loadEvent();

    return () => {
      isActive = false;
    };
  }, [eventId]);

  const handlePurchase = async () => {
    if (!user) {
      router.push(`/login?next=/events/${eventId}`);
      return;
    }

    setPurchaseState({ isLoading: true, error: null });

    try {
      await purchaseTicket(eventId);
      router.push("/tickets");
    } catch (err) {
      setPurchaseState({
        isLoading: false,
        error: getApiErrorMessage(err, "Unable to complete purchase."),
      });
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-4xl px-6 py-16">
        <div className="h-8 w-1/2 animate-pulse rounded-full bg-[var(--color-surface-strong)]" />
        <div className="mt-4 h-4 w-1/3 animate-pulse rounded-full bg-[var(--color-surface-strong)]" />
        <div className="mt-8 h-48 w-full animate-pulse rounded-3xl bg-[var(--color-surface-strong)]" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="mx-auto w-full max-w-4xl px-6 py-16">
        <Card className="border border-red-200 bg-red-50 text-sm text-red-700">{error ?? "Event not found."}</Card>
      </div>
    );
  }

  const capacityUsed = event.capacity > 0 ? Math.round((event.ticketCount / event.capacity) * 100) : 0;
  const clamped = Math.min(100, Math.max(0, capacityUsed));

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-16">
      <div className="space-y-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-ink-muted)]">
            {formatDate(event.date)} at {formatTime(event.date)}
          </p>
          <h1 className="mt-2 text-4xl font-semibold text-[var(--color-ink)] md:text-5xl">{event.title}</h1>
        </div>
        <p className="text-base text-[var(--color-ink-muted)] md:text-lg">{event.description}</p>
        <Card className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-[var(--color-ink-muted)]">Location</p>
              <p className="text-base font-semibold text-[var(--color-ink)]">{event.location}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-[var(--color-ink-muted)]">Organizer</p>
              <p className="text-base font-semibold text-[var(--color-ink)]">{event.organizer.name}</p>
            </div>
          </div>
          <Divider />
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-[var(--color-ink-muted)]">
              <span>Tickets sold</span>
              <span className="font-semibold text-[var(--color-ink)]">
                {event.ticketCount} / {event.capacity}
              </span>
            </div>
            <div className="h-2 rounded-full bg-[var(--color-surface-strong)]">
              <div className="h-2 rounded-full bg-[var(--color-accent)]" style={{ width: `${clamped}%` }} />
            </div>
          </div>
        </Card>
        {purchaseState.error && (
          <Card className="border border-red-200 bg-red-50 text-sm text-red-700">{purchaseState.error}</Card>
        )}
        <div className="flex flex-wrap items-center gap-4">
          <Button onClick={handlePurchase} disabled={purchaseState.isLoading}>
            {purchaseState.isLoading ? "Processing..." : user ? "Purchase ticket" : "Log in to purchase"}
          </Button>
          <p className="text-sm text-[var(--color-ink-muted)]">Tickets are secured instantly after purchase.</p>
        </div>
      </div>
    </div>
  );
}
