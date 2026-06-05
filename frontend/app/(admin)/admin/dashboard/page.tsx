"use client";

import Link from "next/link";

import Card from "@/app/_components/ui/card";
import Pill from "@/app/_components/ui/pill";
import { Button } from "@/app/_components/ui/button";

export default function AdminDashboardPage() {
    return (
        <div className="space-y-8">
            {/* Header */}
            <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                    <Pill>Admin Control Center</Pill>

                    <h1 className="mt-3 text-4xl font-semibold text-[var(--color-ink)]">
                        Dashboard
                    </h1>

                    <p className="mt-2 max-w-2xl text-sm text-[var(--color-ink-muted)]">
                        Manage users, organizers, events, tickets, and platform operations
                        from one place.
                    </p>
                </div>

                <div className="flex flex-wrap gap-3">
                    <Link href="/admin/users">
                        <Button variant="outline">Manage Users</Button>
                    </Link>

                    <Link href="/admin/events">
                        <Button>Manage Events</Button>
                    </Link>
                </div>
            </section>

            {/* Stats */}
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <Card>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-ink-muted)]">
                        Total Users
                    </p>

                    <h2 className="mt-4 text-4xl font-bold">245</h2>

                    <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
                        Registered platform users
                    </p>
                </Card>

                <Card>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-ink-muted)]">
                        Organizers
                    </p>

                    <h2 className="mt-4 text-4xl font-bold">18</h2>

                    <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
                        Active event organizers
                    </p>
                </Card>

                <Card>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-ink-muted)]">
                        Events
                    </p>

                    <h2 className="mt-4 text-4xl font-bold">42</h2>

                    <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
                        Published events
                    </p>
                </Card>

                <Card>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-ink-muted)]">
                        Tickets Sold
                    </p>

                    <h2 className="mt-4 text-4xl font-bold">1,248</h2>

                    <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
                        Total purchased tickets
                    </p>
                </Card>
            </section>

            {/* Quick Actions */}
            <section>
                <h2 className="mb-4 text-xl font-semibold text-[var(--color-ink)]">
                    Quick Actions
                </h2>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <Link href="/admin/users">
                        <Card className="transition hover:-translate-y-1 hover:shadow-lg">
                            <h3 className="font-semibold">Users</h3>

                            <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
                                View, edit, disable and manage user accounts.
                            </p>
                        </Card>
                    </Link>

                    <Link href="/admin/organizers">
                        <Card className="transition hover:-translate-y-1 hover:shadow-lg">
                            <h3 className="font-semibold">Organizers</h3>

                            <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
                                Approve, suspend and review organizers.
                            </p>
                        </Card>
                    </Link>

                    <Link href="/admin/events">
                        <Card className="transition hover:-translate-y-1 hover:shadow-lg">
                            <h3 className="font-semibold">Events</h3>

                            <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
                                Monitor and manage platform events.
                            </p>
                        </Card>
                    </Link>

                    <Link href="/admin/tickets">
                        <Card className="transition hover:-translate-y-1 hover:shadow-lg">
                            <h3 className="font-semibold">Tickets</h3>

                            <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
                                Review ticket purchases and attendance.
                            </p>
                        </Card>
                    </Link>
                </div>
            </section>

            {/* Recent Activity */}
            <section>
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-[var(--color-ink)]">
                        Recent Activity
                    </h2>

                    <Link href="/admin/activity">
                        <Button variant="outline" size="sm">
                            View All
                        </Button>
                    </Link>
                </div>

                <Card>
                    <div className="space-y-4">
                        <div className="flex items-start justify-between gap-4 border-b border-[var(--color-border)] pb-4">
                            <div>
                                <p className="font-medium">
                                    New organizer account approved
                                </p>

                                <p className="text-sm text-[var(--color-ink-muted)]">
                                    Tech Events Inc.
                                </p>
                            </div>

                            <span className="text-xs text-[var(--color-ink-muted)]">
                                5 mins ago
                            </span>
                        </div>

                        <div className="flex items-start justify-between gap-4 border-b border-[var(--color-border)] pb-4">
                            <div>
                                <p className="font-medium">
                                    Event published
                                </p>

                                <p className="text-sm text-[var(--color-ink-muted)]">
                                    React Mumbai Meetup
                                </p>
                            </div>

                            <span className="text-xs text-[var(--color-ink-muted)]">
                                20 mins ago
                            </span>
                        </div>

                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="font-medium">
                                    Ticket purchase completed
                                </p>

                                <p className="text-sm text-[var(--color-ink-muted)]">
                                    3 tickets purchased
                                </p>
                            </div>

                            <span className="text-xs text-[var(--color-ink-muted)]">
                                45 mins ago
                            </span>
                        </div>
                    </div>
                </Card>
            </section>

            {/* System Overview */}
            <section>
                <h2 className="mb-4 text-xl font-semibold text-[var(--color-ink)]">
                    Platform Overview
                </h2>

                <div className="grid gap-4 lg:grid-cols-2">
                    <Card>
                        <h3 className="font-semibold">Top Event</h3>

                        <p className="mt-4 text-2xl font-bold">
                            React Mumbai Summit
                        </p>

                        <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
                            312 tickets sold
                        </p>
                    </Card>

                    <Card>
                        <h3 className="font-semibold">Most Active Organizer</h3>

                        <p className="mt-4 text-2xl font-bold">
                            Dev Community India
                        </p>

                        <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
                            8 active events
                        </p>
                    </Card>
                </div>
            </section>
        </div>
    );
}