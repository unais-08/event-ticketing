"use client";

import React from "react";
import { useParams } from "next/navigation";

import {
  getOrganizerEvent,
  getOrganizerEventTickets,
  checkinByToken,
} from "@/app/_lib/api";

import Card from "@/app/_components/ui/card";
import { Button } from "@/app/_components/ui/button";

export default function OrganizerEventPage() {
  const params = useParams();
  const eventId = params?.eventId as string;

  const [event, setEvent] = React.useState<any | null>(null);
  const [tickets, setTickets] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [processing, setProcessing] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!eventId) return;

    let mounted = true;

    const loadData = async () => {
      try {
        const [eventRes, ticketsRes] = await Promise.all([
          getOrganizerEvent(eventId),
          getOrganizerEventTickets(eventId),
        ]);

        if (!mounted) return;
        
        setEvent(eventRes.data);
        setTickets(ticketsRes.data ?? []);
      } catch (error) {
        console.error("Failed to load event data:", error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, [eventId]);

  const handleCheckin = async (ticketId: string) => {
    try {
      setProcessing(ticketId);

      // If your API expects a QR token instead of ticketId,
      // replace this call accordingly.
      await checkinByToken(ticketId);

      const refreshed = await getOrganizerEventTickets(eventId);
      setTickets(refreshed.data ?? []);
    } catch (error: any) {
      console.error(error);

      alert(
        "Check-in failed: " +
          (error?.response?.data?.message ||
            error?.message ||
            "Unknown error")
      );
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <div className="px-6 py-8">
        Loading...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <h1 className="text-2xl font-semibold">
        {event?.title ?? "Event"}
      </h1>

      <p className="text-sm text-[var(--color-ink-muted)]">
        {event?.description}
      </p>

      <div className="mt-6 grid gap-3">
        {tickets.length === 0 ? (
          <Card>
            No tickets sold yet.
          </Card>
        ) : (
          tickets.map((ticket) => (
            <Card
              key={ticket.id}
              className="flex items-center justify-between"
            >
              <div>
                <div className="text-sm font-semibold">
                  {ticket.userName} ({ticket.userEmail})
                </div>

                <div className="text-xs text-[var(--color-ink-muted)]">
                  {new Date(ticket.createdAt).toLocaleString()}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="text-sm">
                  {ticket.checkedIn
                    ? "Checked in"
                    : "Not checked in"}
                </div>

                {!ticket.checkedIn && (
                  <Button
                    size="sm"
                    onClick={() => handleCheckin(ticket.id)}
                    disabled={processing === ticket.id}
                  >
                    {processing === ticket.id
                      ? "Checking..."
                      : "Check in"}
                  </Button>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}