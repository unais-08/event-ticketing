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

export default function OrganizerManageEventsPage() {
    const status = useAuthStore((state) => state.status);

    const [events, setEvents] = React.useState<OrganizerEventListItem[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [deletingId, setDeletingId] = React.useState<string | null>(null);

    async function handleDeleteEventById(eventId: string) {
        const confirmed = window.confirm("Delete this event and all related tickets?");
        if (!confirmed) return;

        setDeletingId(eventId);
        setError(null);

        try {
            await deleteOrganizerEvent(eventId);
            setEvents((prev) => prev.filter((e) => e.id !== eventId));
        } catch (deleteError) {
            setError(getApiErrorMessage(deleteError, "Unable to delete this event."));
        } finally {
            setDeletingId(null);
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
                setError(null);
            } catch (err) {
                if (!mounted) return;
                setError(getApiErrorMessage(err, "Failed to load events."));
            } finally {
                if (mounted) setLoading(false);
            }
        };

        void loadEvents();
        return () => { mounted = false; };
    }, [status]);

    if (status === "loading") {
        return (
            <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8">
                <div className="h-72 animate-pulse rounded-2xl bg-gray-100" />
            </div>
        );
    }

    return (
        <RoleGuard allowedRoles={["ORGANIZER"]}>
            <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 py-8">

                {/* ── Header ── */}
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1.5">
                        <Pill>Organizer events</Pill>
                        <h1 className="text-2xl sm:text-3xl font-semibold leading-tight text-[var(--color-ink)]">
                            Manage your events
                        </h1>
                        <p className="text-sm leading-relaxed text-[var(--color-ink-muted)] max-w-lg">
                            Review events at a glance. Open any event to edit details or process check-ins.
                        </p>
                    </div>

                    <div className="flex gap-2 shrink-0">
                        <Link href="/organizer/events/new">
                            <Button size="sm">+ Create</Button>
                        </Link>
                        <Link href="/organizer/check-in">
                            <Button variant="outline" size="sm">Check-in</Button>
                        </Link>
                    </div>
                </div>

                {/* ── Error ── */}
                {error && (
                    <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                {/* ── Loading skeleton ── */}
                {loading ? (
                    <div className="grid gap-3 sm:grid-cols-2">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-44 animate-pulse rounded-2xl bg-gray-100" />
                        ))}
                    </div>
                ) : events.length === 0 ? (

                    /* ── Empty state ── */
                    <Card className="flex flex-col items-start gap-4 p-6">
                        <div className="space-y-1.5">
                            <Pill>No events yet</Pill>
                            <h2 className="text-xl font-semibold text-[var(--color-ink)]">Create your first event</h2>
                            <p className="text-sm text-[var(--color-ink-muted)]">
                                Once created, your events will appear here.
                            </p>
                        </div>
                        <Link href="/organizer/events/new">
                            <Button>Create event</Button>
                        </Link>
                    </Card>

                ) : (

                    /* ── Event grid ── */
                    <div className="grid gap-3 sm:grid-cols-2">
                        {events.map((event) => {
                            const fillPct = event.capacity > 0
                                ? Math.round((event.ticketCount / event.capacity) * 100)
                                : 0;

                            return (
                                <Card key={event.id} className="flex flex-col gap-3 p-4 sm:p-5">

                                    {/* Title row */}
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <h2 className="truncate text-base font-semibold text-[var(--color-ink)]">
                                                {event.title}
                                            </h2>
                                            <p className="mt-0.5 line-clamp-2 text-xs text-[var(--color-ink-muted)] leading-relaxed">
                                                {event.description}
                                            </p>
                                        </div>
                                        <Pill className="shrink-0 text-xs">{formatDate(event.date)}</Pill>
                                    </div>

                                    {/* Meta rows */}
                                    <div className="divide-y divide-[var(--color-border,#e5e5e3)] text-sm">
                                        <div className="flex items-center justify-between gap-2 py-1.5">
                                            <span className="text-[var(--color-ink-muted)]">Location</span>
                                            <span className="font-medium text-[var(--color-ink)] text-right truncate max-w-[60%]">
                                                {event.location}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between gap-2 py-1.5">
                                            <span className="text-[var(--color-ink-muted)]">Tickets</span>
                                            <span className="font-medium text-[var(--color-ink)]">
                                                {event.ticketCount} / {event.capacity}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Fill rate bar */}
                                    <div>
                                        <div className="h-1 rounded-full bg-[var(--color-border,#e5e5e3)] overflow-hidden">
                                            <div
                                                className="h-full rounded-full bg-blue-500 transition-all duration-500"
                                                style={{ width: `${Math.min(fillPct, 100)}%` }}
                                            />
                                        </div>
                                        <p className="mt-1 text-[11px] text-[var(--color-ink-muted)]">
                                            {fillPct}% filled
                                        </p>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 pt-1">
                                        <Link href={`/organizer/events/${event.id}`} className="flex-1">
                                            <Button size="sm" className="w-full">Detail Info</Button>
                                        </Link>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={deletingId === event.id}
                                            className="border-red-200 text-red-600 hover:bg-red-50"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                void handleDeleteEventById(event.id);
                                            }}
                                        >
                                            {deletingId === event.id ? "…" : "Delete"}
                                        </Button>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </RoleGuard>
    );
}