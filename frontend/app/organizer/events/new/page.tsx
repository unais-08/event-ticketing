"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { createOrganizerEvent } from "@/app/_lib/api";
import Input from "@/app/_components/ui/input";
import Label from "@/app/_components/ui/label";
import { Button } from "@/app/_components/ui/button";
import Card from "@/app/_components/ui/card";

export default function NewEventPage() {
  const router = useRouter();
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [location, setLocation] = React.useState("");
  const [date, setDate] = React.useState("");
  const [capacity, setCapacity] = React.useState(100);
  const [submitting, setSubmitting] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = { title, description, location, date: new Date(date).toISOString(), capacity };
      const res = await createOrganizerEvent(payload);
      const eventId = res.data?.id ?? res.data?.id;
      if (eventId) {
        router.push(`/organizer/events/${eventId}`);
      } else {
        router.push(`/organizer/dashboard`);
      }
    } catch (err: any) {
      console.error(err);
      alert("Unable to create event: " + (err?.message ?? "unknown"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      <h1 className="text-2xl font-semibold mb-4">Create New Event</h1>

      <Card>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div>
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>

          <div>
            <Label>Description</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} required />
          </div>

          <div>
            <Label>Location</Label>
            <Input value={location} onChange={(e) => setLocation(e.target.value)} required />
          </div>

          <div>
            <Label>Date & time</Label>
            <Input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>

          <div>
            <Label>Capacity</Label>
            <Input type="number" value={String(capacity)} onChange={(e) => setCapacity(Number(e.target.value))} required />
          </div>

          <div className="flex justify-end">
            <Button size="sm" type="submit" disabled={submitting}>{submitting ? "Creating…" : "Create event"}</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
