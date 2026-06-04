"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { getPublicEventDetails, purchaseTicket } from "@/app/_lib/api";
import { getApiErrorMessage } from "@/app/_lib/errors";

import type { PublicEventDetails } from "@/app/_lib/types";

import Card from "@/app/_components/ui/card";
import { Button } from "@/app/_components/ui/button";

export default function EventDetailsPage() {
  const params = useParams();
  const eventId = params.eventId as string;

  const [event, setEvent] = useState<PublicEventDetails | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function loadEvent() {
      try {
        setIsLoading(true);
        setError(null);

        const response = await getPublicEventDetails(eventId);

        if (!active) return;

        setEvent(response.data ?? null);
      } catch (err) {
        if (!active) return;

        setError(
          getApiErrorMessage(
            err,
            "Unable to load event details."
          )
        );
      } finally {
        if (!active) return;
        setIsLoading(false);
      }
    }

    if (eventId) {
      void loadEvent();
    }

    return () => {
      active = false;
    };
  }, [eventId]);

  async function handlePurchase() {
    try {
      setError(null);
      setSuccessMessage("");
      setIsPurchasing(true);

      await purchaseTicket(eventId);

      setSuccessMessage(
        "Ticket purchased successfully. Check your tickets page."
      );
    } catch (err) {
      const message = getApiErrorMessage(
        err,
        "Unable to purchase ticket."
      );

      if (
        message.toLowerCase().includes("already") ||
        message.toLowerCase().includes("exists")
      ) {
        setSuccessMessage(
          "You already have a ticket for this event."
        );
        return;
      }

      setError(message);
    } finally {
      setIsPurchasing(false);
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-12">
        <Card className="h-96 animate-pulse bg-white/70" />
      </div>
    );
  }

  if (error && !event) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-12">
        <Card className="border border-red-200 bg-red-50 text-red-700">
          {error}
        </Card>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-12">
        <Card>
          <h1 className="text-2xl font-semibold">
            Event not found
          </h1>

          <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
            The event may have been removed or does not exist.
          </p>
        </Card>
      </div>
    );
  }

  const availableTickets =
    event.capacity - event.ticketCount;

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
        <Card className="space-y-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-ink-muted)]">
              Event
            </p>

            <h1 className="mt-3 text-4xl font-semibold">
              {event.title}
            </h1>
          </div>

          <p className="leading-8 text-[var(--color-ink-muted)]">
            {event.description}
          </p>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-wide text-[var(--color-ink-muted)]">
                Location
              </p>

              <p className="mt-1 font-medium">
                {event.location}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-[var(--color-ink-muted)]">
                Date
              </p>

              <p className="mt-1 font-medium">
                {new Date(event.date).toLocaleString()}
              </p>
            </div>
          </div>
        </Card>

        <div className="space-y-6">
          <Card>
            <h2 className="text-xl font-semibold">
              Ticket Information
            </h2>

            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span>Capacity</span>
                <span>{event.capacity}</span>
              </div>

              <div className="flex justify-between">
                <span>Tickets Sold</span>
                <span>{event.ticketCount}</span>
              </div>

              <div className="flex justify-between">
                <span>Remaining</span>
                <span>{availableTickets}</span>
              </div>
            </div>

            <Button
              className="mt-6 w-full"
              onClick={handlePurchase}
              disabled={
                isPurchasing ||
                availableTickets <= 0
              }
            >
              {isPurchasing
                ? "Purchasing..."
                : availableTickets <= 0
                  ? "Sold Out"
                  : "Purchase Ticket"}
            </Button>

            {successMessage && (
              <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-3">
                <p className="text-sm text-green-700">
                  {successMessage}
                </p>
              </div>
            )}

            {error && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3">
                <p className="text-sm text-red-700">
                  {error}
                </p>
              </div>
            )}
          </Card>

          <Card>
            <h2 className="text-xl font-semibold">
              Organizer
            </h2>

            <div className="mt-4 space-y-2">
              <p className="font-medium">
                {event.organizer.name}
              </p>

              <p className="text-sm text-[var(--color-ink-muted)]">
                {event.organizer.email}
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}