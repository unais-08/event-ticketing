"use client";

import React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import { checkinByToken, deleteOrganizerEvent, getOrganizerEvent, getOrganizerEventTickets, updateOrganizerEvent } from "@/app/_lib/api";
import { getApiErrorMessage } from "@/app/_lib/errors";
import { formatDate, formatTime } from "@/app/_lib/format";
import { getRoleHomePath } from "@/app/_lib/roles";
import type { OrganizerEventDetails, OrganizerEventFormInput, OrganizerTicketItem } from "@/app/_lib/types";
import { useAuthStore } from "@/app/_stores/auth-store";

import Card from "@/app/_components/ui/card";
import { Button } from "@/app/_components/ui/button";
import Input from "@/app/_components/ui/input";
import Label from "@/app/_components/ui/label";
import Pill from "@/app/_components/ui/pill";

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
  return value.trim().match(/\/api\/checkin\/([^/?#]+)/)?.[1] ?? value.trim();
}

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

  React.useEffect(() => {
    if (!eventId || !canAccess) return; // ← no setState, just bail

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
        if (mounted) setError(getApiErrorMessage(loadError, "Unable to load event details."));
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void loadData();
    return () => { mounted = false; };
  }, [canAccess, eventId]);

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
    const confirmed = window.confirm("Delete this event and all related tickets?");

    if (!confirmed) {
      return;
    }

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
      setCheckinMessage(response.data?.alreadyCheckedIn ? "Ticket was already checked in." : "Check-in completed successfully.");
      setCheckinToken("");
      await refreshTickets();
    } catch (checkinFailure) {
      setCheckinError(getApiErrorMessage(checkinFailure, "Unable to process this check-in."));
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="mx-auto w-full max-w-6xl px-6 py-10">
        <Card className="h-96 animate-pulse bg-white/75" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-6 py-12">
        <Card className="space-y-3">
          <Pill>Sign in required</Pill>
          <h1 className="text-3xl font-semibold text-[var(--color-ink)]">Log in to manage events.</h1>
          <div className="flex flex-wrap gap-3">
            <Link href="/login"><Button>Log in</Button></Link>
            <Link href="/"><Button variant="outline">Return home</Button></Link>
          </div>
        </Card>
      </div>
    );
  }

  if (!canAccess) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-6 py-12">
        <Card className="space-y-3">
          <Pill>{user.role}</Pill>
          <h1 className="text-3xl font-semibold text-[var(--color-ink)]">Only organizers and admins can edit this event.</h1>
          <div className="flex flex-wrap gap-3">
            <Link href={getRoleHomePath(user.role)}><Button>Open workspace</Button></Link>
            <Link href="/check-in"><Button variant="outline">Check-in</Button></Link>
          </div>
        </Card>
      </div>
    );
  }

  const checkedInCount = tickets.filter((ticket) => ticket.checkedIn).length;
  const fillRate = event && event.capacity > 0 ? Math.round((tickets.length / event.capacity) * 100) : 0;

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          <Pill>{event ? formatDate(event.date) : "Event"}</Pill>
          <h1 className="text-4xl font-semibold text-[var(--color-ink)] md:text-5xl">{event?.title ?? "Event"}</h1>
          <p className="max-w-3xl text-sm leading-6 text-[var(--color-ink-muted)]">Edit the event, review the guest list, and process QR check-ins from the same screen.</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link href="/organizer/dashboard"><Button variant="outline">Back to dashboard</Button></Link>
          <Link href="/check-in"><Button>Open check-in</Button></Link>
        </div>
      </div>

      {error ? <Card className="mb-6 border border-red-200 bg-red-50 text-sm text-red-700">{error}</Card> : null}

      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <Card>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-ink-muted)]">Tickets</p>
          <p className="mt-3 text-4xl font-semibold text-[var(--color-ink)]">{tickets.length}</p>
          <p className="mt-2 text-sm text-[var(--color-ink-muted)]">Guest records attached to the event.</p>
        </Card>
        <Card>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-ink-muted)]">Checked in</p>
          <p className="mt-3 text-4xl font-semibold text-[var(--color-ink)]">{checkedInCount}</p>
          <p className="mt-2 text-sm text-[var(--color-ink-muted)]">Tickets already processed at the gate.</p>
        </Card>
        <Card>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-ink-muted)]">Fill rate</p>
          <p className="mt-3 text-4xl font-semibold text-[var(--color-ink)]">{fillRate}%</p>
          <p className="mt-2 text-sm text-[var(--color-ink-muted)]">Tickets sold against event capacity.</p>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Card>
          <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
            <div>
              <Pill>Event editor</Pill>
              <h2 className="mt-3 text-2xl font-semibold text-[var(--color-ink)]">Update the live event details.</h2>
            </div>
            <Button variant="outline" onClick={handleDelete} disabled={deleting} type="button">
              {deleting ? "Deleting…" : "Delete event"}
            </Button>
          </div>

          <form onSubmit={handleSave} className="grid gap-5">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" value={form.title} onChange={(e) => setForm((current) => ({ ...current, title: e.target.value }))} required />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Input id="description" value={form.description} onChange={(e) => setForm((current) => ({ ...current, description: e.target.value }))} required />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" value={form.location} onChange={(e) => setForm((current) => ({ ...current, location: e.target.value }))} required />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="date">Date &amp; time</Label>
              <Input id="date" type="datetime-local" value={form.date} onChange={(e) => setForm((current) => ({ ...current, date: e.target.value }))} required />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="capacity">Capacity</Label>
              <Input id="capacity" type="number" min={1} value={String(form.capacity)} onChange={(e) => setForm((current) => ({ ...current, capacity: Number(e.target.value) }))} required />
            </div>

            <div className="flex flex-wrap justify-end gap-3 pt-2">
              <Link href={`/organizer/events/${eventId}`}><Button variant="outline" type="button">Reset</Button></Link>
              <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save changes"}</Button>
            </div>
          </form>
        </Card>

        <div className="space-y-6">
          <Card>
            <Pill>Quick check-in</Pill>
            <h2 className="mt-3 text-2xl font-semibold text-[var(--color-ink)]">Process a QR token.</h2>
            <form className="mt-5 grid gap-4" onSubmit={handleCheckin}>
              <div className="grid gap-2">
                <Label htmlFor="token">QR token or URL</Label>
                <Input id="token" value={checkinToken} onChange={(e) => setCheckinToken(e.target.value)} placeholder="Paste the token or QR URL here" />
              </div>
              {checkinMessage ? <Card className="border border-emerald-200 bg-emerald-50 text-sm text-emerald-800">{checkinMessage}</Card> : null}
              {checkinError ? <Card className="border border-red-200 bg-red-50 text-sm text-red-700">{checkinError}</Card> : null}
              <Button type="submit">Check in ticket</Button>
            </form>
          </Card>

          <Card>
            <div className="flex items-center justify-between gap-3">
              <div>
                <Pill>Event metadata</Pill>
                <h2 className="mt-3 text-2xl font-semibold text-[var(--color-ink)]">Current status</h2>
              </div>
              {refreshing ? <span className="text-sm text-[var(--color-ink-muted)]">Refreshing tickets…</span> : null}
            </div>
            <div className="mt-5 space-y-3 text-sm text-[var(--color-ink-muted)]">
              <div className="flex items-center justify-between gap-3"><span>Location</span><span className="font-semibold text-[var(--color-ink)]">{event?.location}</span></div>
              <div className="flex items-center justify-between gap-3"><span>Date</span><span className="font-semibold text-[var(--color-ink)]">{event ? formatDate(event.date) : "-"}</span></div>
              <div className="flex items-center justify-between gap-3"><span>Time</span><span className="font-semibold text-[var(--color-ink)]">{event ? formatTime(event.date) : "-"}</span></div>
              <div className="flex items-center justify-between gap-3"><span>Capacity</span><span className="font-semibold text-[var(--color-ink)]">{event?.capacity ?? 0}</span></div>
            </div>
          </Card>
        </div>
      </div>

      <Card className="mt-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Pill>Tickets</Pill>
            <h2 className="mt-3 text-2xl font-semibold text-[var(--color-ink)]">Guest roster and check-in state.</h2>
          </div>
          <span className="text-sm text-[var(--color-ink-muted)]">{tickets.length} record{tickets.length === 1 ? "" : "s"}</span>
        </div>

        <div className="mt-6 grid gap-4">
          {tickets.length === 0 ? (
            <Card className="border-dashed text-sm text-[var(--color-ink-muted)]">No tickets sold yet.</Card>
          ) : (
            tickets.map((ticket) => (
              <Card key={ticket.id} className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-base font-semibold text-[var(--color-ink)]">{ticket.userName}</p>
                  <p className="text-sm text-[var(--color-ink-muted)]">{ticket.userEmail}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.24em] text-[var(--color-ink-muted)]">{ticket.checkedIn ? "Checked in" : "Awaiting check-in"}</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <Pill>{formatDate(ticket.createdAt)}</Pill>
                  <span className="text-sm text-[var(--color-ink-muted)]">QR ready</span>
                </div>
              </Card>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
