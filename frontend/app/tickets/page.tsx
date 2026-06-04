"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { getMyTickets } from "@/app/_lib/api";
import { getApiErrorMessage } from "@/app/_lib/errors";

import type {
  PaginationMeta,
  TicketListItem,
} from "@/app/_lib/types";

import Card from "@/app/_components/ui/card";
import { Button, buttonStyles } from "@/app/_components/ui/button";
import { useAuthStore } from "../_stores/auth-store";
import ProtectedRoute from "../_components/auth/protected-route";

export default function TicketsPage() {
  const [tickets, setTickets] = useState<TicketListItem[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(
    null
  );

  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadTickets() {
      try {
        setLoading(true);
        setError(null);

        const response = await getMyTickets({
          page,
          limit: 10,
        });

        if (!active) return;

        setTickets(response.data?.tickets ?? []);
        setMeta(response.data?.meta ?? null);
      } catch (err) {
        if (!active) return;

        setError(
          getApiErrorMessage(
            err,
            "Unable to load tickets."
          )
        );
      } finally {
        if (!active) return;

        setLoading(false);
      }
    }

    void loadTickets();

    return () => {
      active = false;
    };
  }, [page]);

 
  return (
    <ProtectedRoute>
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-ink-muted)]">
            Ticket Wallet
          </p>

          <h1 className="mt-2 text-4xl font-semibold">
            My Tickets
          </h1>

          <p className="mt-3 text-[var(--color-ink-muted)]">
            Access your purchased tickets and QR codes.
          </p>
        </div>

        {error && (
          <Card className="border border-red-200 bg-red-50 text-red-700">
            {error}
          </Card>
        )}

        {loading ? (
          <div className="grid gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <Card
                key={index}
                className="h-36 animate-pulse"
              />
            ))}
          </div>
        ) : tickets.length === 0 ? (
          <Card className="py-12 text-center">
            <h2 className="text-2xl font-semibold">
              No Tickets Yet
            </h2>

            <p className="mt-3 text-[var(--color-ink-muted)]">
              Purchase a ticket to see it here.
            </p>

            <Link
              href="/events"
              className={`${buttonStyles()} mt-6`}
            >
              Browse Events
            </Link>
          </Card>
        ) : (
          <>
            <div className="grid gap-6">
              {tickets.map((ticket) => (
                <Card
                  key={ticket.id}
                  className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-muted)]">
                      Event
                    </p>

                    <h2 className="mt-1 text-xl font-semibold">
                      {ticket.eventTitle}
                    </h2>

                    <p className="mt-3 text-sm text-[var(--color-ink-muted)]">
                      Purchased{" "}
                      {new Date(
                        ticket.createdAt
                      ).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <span
                      className={`rounded-full px-4 py-2 text-sm font-medium ${ticket.checkedIn
                        ? "bg-green-100 text-green-700"
                        : "bg-amber-100 text-amber-700"
                        }`}
                    >
                      {ticket.checkedIn
                        ? "Checked In"
                        : "Active"}
                    </span>

                    <Link
                      href={`/tickets/${ticket.id}`}
                      className={buttonStyles({
                        variant: "outline",
                      })}
                    >
                      View Ticket
                    </Link>
                  </div>
                </Card>
              ))}
            </div>

            {meta && meta.totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-4">
                <button
                  onClick={() =>
                    setPage((prev) => prev - 1)
                  }
                  disabled={page === 1}
                  className="rounded-xl border px-4 py-2 disabled:opacity-50"
                >
                  Previous
                </button>

                <span>
                  Page {meta.page} of {meta.totalPages}
                </span>

                <button
                  onClick={() =>
                    setPage((prev) => prev + 1)
                  }
                  disabled={
                    page === meta.totalPages
                  }
                  className="rounded-xl border px-4 py-2 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </ProtectedRoute>
  );
}