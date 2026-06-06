"use client";

import React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import {
  checkinByToken,
  deleteOrganizerEvent,
  getOrganizerEvent,
  getOrganizerEventTickets,
  updateOrganizerEvent,
} from "@/app/_lib/api";
import { getApiErrorMessage } from "@/app/_lib/errors";
import { formatDate, formatTime } from "@/app/_lib/format";
import { getRoleHomePath } from "@/app/_lib/roles";
import type {
  OrganizerEventDetails,
  OrganizerEventFormInput,
  OrganizerTicketItem,
} from "@/app/_lib/types";
import { useAuthStore } from "@/app/_stores/auth-store";

import Card from "@/app/_components/ui/card";
import { Button } from "@/app/_components/ui/button";
import Input from "@/app/_components/ui/input";
import Label from "@/app/_components/ui/label";
import Pill from "@/app/_components/ui/pill";

/* ─────────────────────────────── helpers ─────────────────────────────── */

function isOrganizerRole(role?: string | null) {
  return role === "ORGANIZER" || role === "ADMIN";
}

function toDatetimeLocalValue(isoDate: string) {
  const date = new Date(isoDate);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function extractToken(value: string) {
  return (
    value.trim().match(/\/api\/checkin\/([^/?#]+)/)?.[1] ?? value.trim()
  );
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/* ─────────────────────────────── sub-components ─────────────────────────────── */

function StatCard({
  label,
  value,
  description,
  progress,
}: {
  label: string;
  value: string | number;
  description: string;
  progress?: number;
}) {
  return (
    <div className="rounded-xl bg-[var(--color-surface,#f9f9f8)] p-4 flex flex-col gap-1">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--color-ink-muted)]">
        {label}
      </p>
      <p className="text-4xl font-semibold text-[var(--color-ink)] leading-none mt-1">
        {value}
      </p>
      <p className="text-xs text-[var(--color-ink-muted)] mt-1">{description}</p>
      {typeof progress === "number" && (
        <div className="mt-2 h-1 rounded-full bg-[var(--color-border,#e5e5e3)] overflow-hidden">
          <div
            className="h-full rounded-full bg-blue-500 transition-all duration-500"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      )}
    </div>
  );
}

function StatusBadge({ checkedIn }: { checkedIn: boolean }) {
  return checkedIn ? (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 border border-emerald-100">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block" />
      Checked in
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-surface,#f9f9f8)] px-2.5 py-1 text-[11px] font-semibold text-[var(--color-ink-muted)] border border-[var(--color-border,#e5e5e3)]">
      <span className="h-1.5 w-1.5 rounded-full bg-gray-300 inline-block" />
      Awaiting
    </span>
  );
}

function Avatar({ name }: { name: string }) {
  return (
    <div className="h-8 w-8 shrink-0 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-[11px] font-semibold text-blue-700 select-none">
      {getInitials(name)}
    </div>
  );
}

/* ─────────────────────────────── ticket table ─────────────────────────────── */

function TicketTable({ tickets }: { tickets: OrganizerTicketItem[] }) {
  if (tickets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-12 text-[var(--color-ink-muted)]">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8 opacity-30"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
          />
        </svg>
        <p className="text-sm">No tickets sold yet.</p>
      </div>
    );
  }

  return (
    /* Horizontal scroll wrapper for mobile */
    <div className="overflow-x-auto -mx-5 px-5">
      <table className="w-full min-w-[560px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-[var(--color-border,#e5e5e3)]">
            {["Guest", "Ticket ID", "Purchased", "Status", ""].map((h) => (
              <th
                key={h}
                className="pb-3 text-left text-[11px] font-semibold uppercase tracking-widest text-[var(--color-ink-muted)] px-3 first:pl-0 last:pr-0 last:text-right whitespace-nowrap"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--color-border,#e5e5e3)]">
          {tickets.map((ticket) => (
            <tr
              key={ticket.id}
              className="group hover:bg-[var(--color-surface,#f9f9f8)] transition-colors duration-100"
            >
              {/* Guest */}
              <td className="py-3 px-3 pl-0">
                <div className="flex items-center gap-2.5">
                  <Avatar name={ticket.userName} />
                  <div className="min-w-0">
                    <p className="font-semibold text-[var(--color-ink)] truncate leading-snug">
                      {ticket.userName}
                    </p>
                    <p className="text-xs text-[var(--color-ink-muted)] truncate leading-snug">
                      {ticket.userEmail}
                    </p>
                  </div>
                </div>
              </td>

              {/* Ticket ID */}
              <td className="py-3 px-3">
                <span className="font-mono text-xs text-[var(--color-ink-muted)] bg-[var(--color-surface,#f4f4f2)] px-2 py-1 rounded-md border border-[var(--color-border,#e5e5e3)]">
                  {String(ticket.id).slice(0, 8).toUpperCase()}
                </span>
              </td>

              {/* Purchased date */}
              <td className="py-3 px-3 text-xs text-[var(--color-ink-muted)] whitespace-nowrap">
                {formatDate(ticket.createdAt)}
              </td>

              {/* Status */}
              <td className="py-3 px-3">
                <StatusBadge checkedIn={ticket.checkedIn} />
              </td>

              {/* Action */}
              <td className="py-3 px-3 pr-0 text-right">
                {!ticket.checkedIn && (
                  <button className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-border,#e5e5e3)] bg-[var(--color-background,#fff)] px-3 py-1.5 text-xs font-medium text-[var(--color-ink)] hover:bg-[var(--color-surface,#f9f9f8)] transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Check in
                  </button>
                )}
                {ticket.checkedIn && (
                  <span className="text-xs text-[var(--color-ink-muted)]">
                    QR ready
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ─────────────────────────────── main page ─────────────────────────────── */

export default function OrganizerEventPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params?.eventId as string;

  const user = useAuthStore((state) => state.user);
  const status = useAuthStore((state) => state.status);

  const [event, setEvent] = React.useState<OrganizerEventDetails | null>(null);
  const [tickets, setTickets] = React.useState<OrganizerTicketItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const [refreshing, setRefreshing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [checkinToken, setCheckinToken] = React.useState("");
  const [checkinMessage, setCheckinMessage] = React.useState<string | null>(null);
  const [checkinError, setCheckinError] = React.useState<string | null>(null);
  const [form, setForm] = React.useState<OrganizerEventFormInput>({
    title: "",
    description: "",
    location: "",
    date: "",
    capacity: 100,
  });

  const canAccess = isOrganizerRole(user?.role ?? null);

  /* ── data load ── */
  React.useEffect(() => {
    if (!eventId || !canAccess) return;

    let mounted = true;

    const loadData = async () => {
      try {
        const [eventRes, ticketsRes] = await Promise.all([
          getOrganizerEvent(eventId),
          getOrganizerEventTickets(eventId),
        ]);

        if (!mounted) return;

        const loadedEvent = eventRes.data ?? null;
        setEvent(loadedEvent);

        if (loadedEvent) {
          setForm({
            title: loadedEvent.title,
            description: loadedEvent.description,
            location: loadedEvent.location,
            date: toDatetimeLocalValue(loadedEvent.date),
            capacity: loadedEvent.capacity,
          });
        }

        setTickets(ticketsRes.data ?? []);
      } catch (loadError) {
        if (mounted)
          setError(getApiErrorMessage(loadError, "Unable to load event details."));
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void loadData();
    return () => {
      mounted = false;
    };
  }, [canAccess, eventId]);

  /* ── actions ── */
  async function refreshTickets() {
    setRefreshing(true);
    try {
      const refreshed = await getOrganizerEventTickets(eventId);
      setTickets(refreshed.data ?? []);
    } catch (refreshError) {
      setError(getApiErrorMessage(refreshError, "Unable to refresh tickets."));
    } finally {
      setRefreshing(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const response = await updateOrganizerEvent(eventId, {
        ...form,
        date: new Date(form.date).toISOString(),
      });
      if (response.data) {
        setEvent(response.data);
        setForm({
          title: response.data.title,
          description: response.data.description,
          location: response.data.location,
          date: toDatetimeLocalValue(response.data.date),
          capacity: response.data.capacity,
        });
      }
    } catch (saveError) {
      setError(getApiErrorMessage(saveError, "Unable to update this event."));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      "Delete this event and all related tickets?"
    );
    if (!confirmed) return;

    setDeleting(true);
    setError(null);
    try {
      await deleteOrganizerEvent(eventId);
      router.push("/organizer/dashboard");
    } catch (deleteError) {
      setError(getApiErrorMessage(deleteError, "Unable to delete this event."));
      setDeleting(false);
    }
  }

  async function handleCheckin(e: React.FormEvent) {
    e.preventDefault();
    setCheckinMessage(null);
    setCheckinError(null);
    try {
      const response = await checkinByToken(extractToken(checkinToken));
      setCheckinMessage(
        response.data?.alreadyCheckedIn
          ? "Ticket was already checked in."
          : "Check-in completed successfully."
      );
      setCheckinToken("");
      await refreshTickets();
    } catch (checkinFailure) {
      setCheckinError(
        getApiErrorMessage(checkinFailure, "Unable to process this check-in.")
      );
    }
  }

  /* ── derived stats ── */
  const checkedInCount = tickets.filter((t) => t.checkedIn).length;
  const fillRate =
    event && event.capacity > 0
      ? Math.round((tickets.length / event.capacity) * 100)
      : 0;
  const remaining = event ? Math.max(0, event.capacity - tickets.length) : 0;

  /* ─────────────── loading skeleton ─────────────── */
  if (status === "loading" || loading) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 py-10 space-y-4">
        <div className="h-10 w-48 animate-pulse rounded-xl bg-gray-100" />
        <div className="h-8 w-72 animate-pulse rounded-xl bg-gray-100" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-gray-100" />
          ))}
        </div>
        <div className="h-64 animate-pulse rounded-2xl bg-gray-100 mt-4" />
      </div>
    );
  }

  /* ─────────────── unauthenticated ─────────────── */
  if (!user) {
    return (
      <div className="mx-auto flex w-full max-w-md flex-col gap-4 px-6 py-20">
        <Card className="space-y-4 p-6">
          <Pill>Sign in required</Pill>
          <h1 className="text-2xl font-semibold text-[var(--color-ink)]">
            Log in to manage events.
          </h1>
          <div className="flex flex-wrap gap-3">
            <Link href="/login">
              <Button>Log in</Button>
            </Link>
            <Link href="/">
              <Button variant="outline">Return home</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  /* ─────────────── access denied ─────────────── */
  if (!canAccess) {
    return (
      <div className="mx-auto flex w-full max-w-md flex-col gap-4 px-6 py-20">
        <Card className="space-y-4 p-6">
          <Pill>{user.role}</Pill>
          <h1 className="text-2xl font-semibold text-[var(--color-ink)]">
            Only organizers and admins can edit this event.
          </h1>
          <div className="flex flex-wrap gap-3">
            <Link href={getRoleHomePath(user.role)}>
              <Button>Open workspace</Button>
            </Link>
            <Link href="/check-in">
              <Button variant="outline">Check-in</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  /* ─────────────── main render ─────────────── */
  return (
    <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 py-8 sm:py-10">

      {/* ── Page header ── */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <Pill>{event ? formatDate(event.date) : "Event"}</Pill>
          <h1 className="text-3xl sm:text-4xl font-semibold text-[var(--color-ink)] leading-tight">
            {event?.title ?? "Event"}
          </h1>
          <p className="text-sm text-[var(--color-ink-muted)] leading-relaxed max-w-xl">
            Review the guest list, manage check-ins, and edit event details.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Link href="/organizer/dashboard">
            <Button variant="outline" size="sm">
              ← Dashboard
            </Button>
          </Link>




        </div>
      </div>

      {/* ── Error banner ── */}
      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* ── Stats ── */}
      <div className="mb-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          label="Tickets sold"
          value={tickets.length}
          description="Total guest records"
        />
        <StatCard
          label="Checked in"
          value={checkedInCount}
          description="Processed at gate"
        />
        <StatCard
          label="Fill rate"
          value={`${fillRate}%`}
          description={`Of ${event?.capacity ?? 0} capacity`}
          progress={fillRate}
        />
        <StatCard
          label="Remaining"
          value={remaining}
          description="Seats still open"
        />
      </div>



        {/* ── Event metadata ── */}
        <Card className="space-y-4 mb-5">
          <div className="flex items-start justify-between gap-2">
            <div>
              <Pill>Event metadata</Pill>
              <h2 className="mt-2 text-xl font-semibold text-[var(--color-ink)]">
                Details
              </h2>
            </div>
            {/* inline edit shortcut */}
            <Link
              href={`/organizer/events/edit/${eventId}`}
              className="mt-1 inline-flex items-center gap-1 rounded-lg border border-[var(--color-border,#e5e5e3)] px-2.5 py-1.5 text-xs font-medium text-[var(--color-ink-muted)] hover:bg-[var(--color-surface,#f9f9f8)] transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 012.828 2.828L11.828 15.828a4 4 0 01-1.414.94l-3 1 1-3a4 4 0 01.94-1.414z" />
              </svg>
              Edit
            </Link>
          </div>

          <dl className="divide-y divide-[var(--color-border,#e5e5e3)] text-sm">
            {[
              { key: "Location", value: event?.location },
              { key: "Date", value: event ? formatDate(event.date) : "—" },
              { key: "Time", value: event ? formatTime(event.date) : "—" },
              { key: "Capacity", value: event?.capacity ?? 0 },
            ].map(({ key, value }) => (
              <div key={key} className="flex justify-between gap-3 py-2.5">
                <dt className="text-[var(--color-ink-muted)]">{key}</dt>
                <dd className="font-semibold text-[var(--color-ink)] text-right">
                  {value}
                </dd>
              </div>
            ))}
          </dl>

          {/* Danger zone */}
          <div className="text-centre pt-2 border-t border-[var(--color-border,#e5e5e3)]">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              disabled={deleting}
              className=" border-red-200 text-red-600 hover:bg-red-50"
            >
              {deleting ? "Deleting…" : "Delete event"}
            </Button>
          </div>
        </Card>
      

      {/* ── Ticket table ── */}
      <Card className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Pill>Tickets</Pill>
            <h2 className="mt-2 text-xl font-semibold text-[var(--color-ink)]">
              Guest roster &amp; check-in status
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-[var(--color-ink-muted)]">
              {tickets.length} record{tickets.length !== 1 ? "s" : ""}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshTickets}
              disabled={refreshing}
            >
              {refreshing ? "Refreshing…" : "↺ Refresh"}
            </Button>
          </div>
        </div>

        <TicketTable tickets={tickets} />
      </Card>
    </div>
  );
}