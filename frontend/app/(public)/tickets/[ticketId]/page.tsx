"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { getTicketQr } from "@/app/_lib/api";
import { getApiErrorMessage } from "@/app/_lib/errors";

import Card from "@/app/_components/ui/card";
import Image from "next/image";

type TicketQrResponse = {
  token: string;
  dataUrl: string;
};

export default function TicketPage() {
  const params = useParams();
  const ticketId = params.ticketId as string;

  const [ticket, setTicket] =
    useState<TicketQrResponse | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadTicket() {
      try {
        setLoading(true);

        const response = await getTicketQr(ticketId);

        if (!active) return;

        setTicket(response.data ?? null);
      } catch (err) {
        if (!active) return;

        setError(
          getApiErrorMessage(
            err,
            "Unable to load ticket."
          )
        );
      } finally {
        if (!active) return;

        setLoading(false);
      }
    }

    if (ticketId) {
      void loadTicket();
    }

    return () => {
      active = false;
    };
  }, [ticketId]);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-12">
        <Card className="h-96 animate-pulse" />
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-12">
        <Card className="border border-red-200 bg-red-50 text-red-700">
          {error ?? "Ticket not found"}
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <Card className="overflow-hidden">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-ink-muted)]">
            Admission Ticket
          </p>

          <h1 className="mt-2 text-4xl font-semibold">
            Event Access Pass
          </h1>

        </div>

        <div className="mt-0 flex justify-center">
          <div className="rounded-3xl bg-white p-4 shadow-lg">
            <Image
              src={ticket.dataUrl}
              alt="Ticket QR Code"
              width={250}
              height={250}
              className="h-60 w-60"
              unoptimized
            />
          </div>
        </div>

        <div className="mt-8 border-t pt-6">
          <p className="text-sm text-[var(--color-ink-muted)]">
            Ticket Token
          </p>

          <p className="mt-2 break-all rounded-xl bg-[var(--color-surface)] p-3 font-mono text-xs">
            {ticket.token}
          </p>
        </div>
      </Card>
    </div>
  );
}