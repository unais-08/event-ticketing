"use client";

import React from "react";
import Link from "next/link";

import { deleteOrganizerEvent, getOrganizerEvents } from "@/app/_lib/api";

import { getApiErrorMessage } from "@/app/_lib/errors";
import { formatDate } from "@/app/_lib/format";
import type { OrganizerEventListItem } from "@/app/_lib/types";
import { useAuthStore } from "@/app/_stores/auth-store";

import Card from "@/app/_components/ui/card";
import { Button } from "@/app/_components/ui/button";
import Pill from "@/app/_components/ui/pill";
import RoleGuard from "@/app/_components/auth/role-guard";



export default function OrganizerDashboardPage() {
    const status = useAuthStore((state) => state.status);

    const [events, setEvents] = React.useState<OrganizerEventListItem[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    const [deleting, setDeleting] = React.useState(false);

    async function handleDeleteEventById(eventId: string) {
        const confirmed = window.confirm("Delete this event and all related tickets?");

        if (!confirmed) {
            return;
        }

        setDeleting(true);
        setError("");

        try {
            await deleteOrganizerEvent(eventId);
            setEvents((prev) => prev.filter((e) => e.id !== eventId));
        } catch (deleteError) {
            setError(getApiErrorMessage(deleteError, "Unable to delete this event."));
            setDeleting(false);
        }
    }

    React.useEffect(() => {
        if (status === "loading") return;

        let mounted = true;

        const loadEvents = async () => {
            try {
                const res = await getOrganizerEvents({ page: 1, limit: 24 });
                if (!mounted) return;

                setEvents(res?.data?.events ?? []);
                setError("");
            } catch (err) {
                if (!mounted) return;
                setError(getApiErrorMessage(err, "Failed to load events."));
            } finally {
                if (!mounted) return;
                setLoading(false);
            }
        };

        void loadEvents();

        return () => {
            mounted = false;
        };
    }, [status]);

    if (status === "loading") {
        return (
            <div className="mx-auto max-w-6xl px-6 py-8">
                <Card className="h-72 animate-pulse bg-white/70" />
            </div>
        );
    }

    return (
        <RoleGuard allowedRoles={["ORGANIZER"]}>
            <div className="mx-auto w-full max-w-6xl px-6 py-10">
                <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                    <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-3">
                            <Pill>Organizer events</Pill>
                        </div>
                        <h1 className="text-4xl font-semibold leading-tight text-[var(--color-ink)]">
                            Manage your events, tickets, and capacity.
                        </h1>
                        <p className="max-w-2xl text-base leading-7 text-[var(--color-ink-muted)]">
                            Review your events at a glance and open any event to edit details or process QR check-ins.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <Link href="/organizer/events/new">
                            <Button size="sm">Create event</Button>
                        </Link>
                        <Link href="/organizer/check-in">
                            <Button variant="outline" size="sm">
                                Open check-in
                            </Button>
                        </Link>
                    </div>
                </div>

                {error ? (
                    <Card className="mb-6 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</Card>
                ) : null}

                {loading ? (
                    <Card className="h-64 animate-pulse bg-white/70" />
                ) : events.length === 0 ? (
                    <Card className="flex flex-col items-start justify-between gap-4 p-6">
                        <div className="space-y-2">
                            <Pill>No events yet</Pill>
                            <h2 className="text-2xl font-semibold text-[var(--color-ink)]">Create your first event</h2>
                            <p className="text-sm text-[var(--color-ink-muted)]">Once created, your events will appear here.</p>
                        </div>
                        <Link href="/organizer/events/new">
                            <Button>Create event</Button>
                        </Link>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                        {events.map((event) => (
                            <Card key={event.id} className="flex flex-col gap-4 p-5">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">

                                        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-ink-muted)]">Event</p>
                                        <h2 className="mt-2 truncate text-xl font-semibold text-[var(--color-ink)]">{event.title}</h2>
                                        <p className="mt-1 line-clamp-2 text-sm text-[var(--color-ink-muted)]">{event.description}</p>
                                    </div>
                                    <Pill>{formatDate(event.date)}</Pill>
                                </div>

                                <div className="grid gap-2 text-sm text-[var(--color-ink-muted)]">
                                    <div className="flex items-center justify-between gap-3">
                                        <span>Location</span>
                                        <span className="font-semibold text-[var(--color-ink)]">{event.location}</span>
                                    </div>
                                    <div className="flex items-center justify-between gap-3">
                                        <span>Tickets</span>
                                        <span className="font-semibold text-[var(--color-ink)]">{event.ticketCount}</span>
                                    </div>
                                    <div className="flex items-center justify-between gap-3">
                                        <span>Capacity</span>
                                        <span className="font-semibold text-[var(--color-ink)]">{event.capacity}</span>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-3 justify-end">
                                    <Link href={`/organizer/events/${event.id}`}>
                                        <Button size="sm">Open event</Button>
                                    </Link>

                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-red-600 hover:text-red-700"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            void handleDeleteEventById(event.id);
                                        }}
                                    >
                                        Delete
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </RoleGuard>
    );
}

