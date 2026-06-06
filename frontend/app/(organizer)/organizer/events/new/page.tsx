"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createOrganizerEvent } from "@/app/_lib/api";
import { getApiErrorMessage } from "@/app/_lib/errors";
import { useAuthStore } from "@/app/_stores/auth-store";
import Input from "@/app/_components/ui/input";
import Label from "@/app/_components/ui/label";
import { Button } from "@/app/_components/ui/button";
import Card from "@/app/_components/ui/card";
import Textarea from "@/app/_components/ui/textarea";
import Pill from "@/app/_components/ui/pill";

export default function NewEventPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const status = useAuthStore((state) => state.status);
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [location, setLocation] = React.useState("");
  const [date, setDate] = React.useState("");
  const [capacity, setCapacity] = React.useState("100");
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState("");

  const canAccess = user?.role === "ADMIN" || user?.role === "ORGANIZER";


  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const payload = {
        title,
        description,
        location,
        date: new Date(date).toISOString(),
        capacity: Number(capacity),
      };
      const res = await createOrganizerEvent(payload);
      const eventId = res.data?.id;
      if (eventId) {
        router.push(`/organizer/events`);
      } else {
        router.push(`/organizer/dashboard`);
      }
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to create event."));
    } finally {
      setSubmitting(false);
    }
  }

  if (status === "loading") {
    return (
      <div className="mx-auto max-w-3xl px-6 py-8">
        <Card className="h-80 animate-pulse bg-white/70" />
      </div>
    );
  }

  if (!canAccess) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-8">
        <Card className="space-y-4">
          <Pill>Access required</Pill>
          <h1 className="text-3xl font-semibold text-[var(--color-ink)]">Organizers and admins can create events.</h1>
          <p className="text-sm leading-6 text-[var(--color-ink-muted)]">
            Log in with an organizer account to open the event builder.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <Card className="space-y-6">
        <div className="space-y-3">
          <Pill>New event</Pill>
          <h1 className="text-4xl font-semibold text-[var(--color-ink)]">Create a polished event record.</h1>
          <p className="max-w-3xl text-sm leading-6 text-[var(--color-ink-muted)]">
            Start with a clean title, dates, and capacity. Once the event exists you can open it to review tickets and run check-ins.
          </p>
        </div>

        {error && <Card className="border border-red-200 bg-red-50 text-sm text-red-700">{error}</Card>}

        <form onSubmit={handleSubmit} className="grid gap-5">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} required />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="date">Date & time</Label>
              <Input id="date" type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="capacity">Capacity</Label>
              <Input id="capacity" type="number" min={1} value={capacity} onChange={(e) => setCapacity(e.target.value)} required />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Link href="/organizer/dashboard">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button size="sm" type="submit" disabled={submitting}>
              {submitting ? "Creating…" : "Create event"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
