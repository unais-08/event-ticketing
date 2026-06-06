"use client";

import React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import Card from "@/app/_components/ui/card";
import { Button } from "@/app/_components/ui/button";
import Input from "@/app/_components/ui/input";
import Label from "@/app/_components/ui/label";
import Pill from "@/app/_components/ui/pill";

import { deleteOrganizerEvent, getOrganizerEvent, updateOrganizerEvent } from "@/app/_lib/api";
import { getApiErrorMessage } from "@/app/_lib/errors";
import { getRoleHomePath } from "@/app/_lib/roles";
import type { OrganizerEventDetails, OrganizerEventFormInput } from "@/app/_lib/types";
import { useAuthStore } from "@/app/_stores/auth-store";

function toDatetimeLocalValue(isoDate: string) {
  const date = new Date(isoDate);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function isOrganizerRole(role?: string | null) {
  return role === "ORGANIZER" || role === "ADMIN";
}

export default function EditEventPageByOrganizer() {
  const params = useParams();
  const router = useRouter();
  const eventId = params?.eventId as string;

  const user = useAuthStore((state) => state.user);
  const status = useAuthStore((state) => state.status);

  const canAccess = isOrganizerRole(user?.role ?? null);

  const [event, setEvent] = React.useState<OrganizerEventDetails | null>(null);
  const [deleting, setDeleting] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [form, setForm] = React.useState<OrganizerEventFormInput>({
    title: "",
    description: "",
    location: "",
    date: "",
    capacity: 100,
  });

  React.useEffect(() => {
    if (!eventId) return;
    if (status === "loading") return;
    if (!canAccess) return;

    let mounted = true;

    const loadData = async () => {
      try {
        const loaded = await getOrganizerEvent(eventId);
        if (!mounted) return;

        const loadedEvent = loaded.data ?? null;
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
      } catch (loadError) {
        if (!mounted) return;
        setError(getApiErrorMessage(loadError, "Unable to load event details."));
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };

    void loadData();

    return () => {
      mounted = false;
    };
  }, [canAccess, eventId, status]);

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
        router.push(`/organizer/events/${eventId}`);
      }
    } catch (saveError) {
      setError(getApiErrorMessage(saveError, "Unable to update this event."));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm("Delete this event and all related tickets?");
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

  if (status === "loading" || loading) {
    return (
      <div className="mx-auto w-full max-w-3xl px-6 py-10">
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

  if (!canAccess) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-6 py-12">
        <Card className="space-y-3">
          <Pill>{user.role}</Pill>
          <h1 className="text-3xl font-semibold text-[var(--color-ink)]">Only organizers and admins can edit this event.</h1>
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

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10">
      {error ? <Card className="mb-6 border border-red-200 bg-red-50 text-sm text-red-700">{error}</Card> : null}

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
            <Input
              id="description"
              value={form.description}
              onChange={(e) => setForm((current) => ({ ...current, description: e.target.value }))}
              required
            />
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
            <Input
              id="capacity"
              type="number"
              min={1}
              value={String(form.capacity)}
              onChange={(e) => setForm((current) => ({ ...current, capacity: Number(e.target.value) }))}
              required
            />
          </div>

          <div className="flex flex-wrap justify-end gap-3 pt-2">
            <Link href={`/organizer/events/${eventId}`}>
              <Button variant="outline" type="button">
                Reset
              </Button>
            </Link>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

