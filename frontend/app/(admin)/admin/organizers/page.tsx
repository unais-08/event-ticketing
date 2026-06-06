"use client";

import React from "react";
import Link from "next/link";
import { deleteOrganizerAccount, getAdminUsers } from "@/app/_lib/api";
import { getApiErrorMessage } from "@/app/_lib/errors";
import { formatDate } from "@/app/_lib/format";
import type { AdminUserListItem } from "@/app/_lib/types";
import { useAuthStore } from "@/app/_stores/auth-store";
import Card from "@/app/_components/ui/card";
import { Button } from "@/app/_components/ui/button";
import Pill from "@/app/_components/ui/pill";

export default function AdminOrganizersPage() {
  const user = useAuthStore((state) => state.user);
  const status = useAuthStore((state) => state.status);

  const [organizers, setOrganizers] = React.useState<AdminUserListItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [fetchTick, setFetchTick] = React.useState(0);

  const canAccess = user?.role === "ADMIN";
  const refresh = () => setFetchTick((t) => t + 1);

  React.useEffect(() => {
    if (status === "loading" || !canAccess) return;

    let cancelled = false;

    async function run() {
      if (!cancelled) setLoading(true);
      try {
        const response = await getAdminUsers({ page: 1, limit: 100, role: "ORGANIZER" });
        if (!cancelled) setOrganizers(response.data?.users ?? []);
      } catch (err) {
        if (!cancelled) setError(getApiErrorMessage(err, "Unable to load organizers."));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void run();
    return () => { cancelled = true; };
  }, [canAccess, status, fetchTick]);


  const handleDelete = (organizer: AdminUserListItem) => {
    if (!window.confirm(`Delete ${organizer.name}?`)) return;
    void deleteOrganizerAccount(organizer.id);
    setOrganizers((prev) => prev.filter((o) => o.id !== organizer.id));
  };

  const totalTickets = organizers.reduce((sum, organizer) => sum + organizer.ticketCount, 0);
  const totalEvents = organizers.reduce((sum, organizer) => sum + organizer.organizedEventCount, 0);




  if (status === "loading") {
    return (
      <div className="mx-auto max-w-6xl px-6 py-8">
        <Card className="h-72 animate-pulse bg-white/70" />
      </div>
    );
  }

  if (!canAccess) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-8">
        <Card className="space-y-4">
          <Pill>Admin only</Pill>
          <h1 className="text-3xl font-semibold text-[var(--color-ink)]">
            Organizer management belongs to admin accounts.
          </h1>
          <p className="text-sm leading-6 text-[var(--color-ink-muted)]">
            Sign in with an admin role to create or manage organizer users.
          </p>
          <Link href="/login">
            <Button size="sm">Log in</Button>
          </Link>
        </Card>
      </div>
    );
  }
  return (
    <div className="mx-auto max-w-7xl px-3 py-4 sm:px-6">
      <div className="space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Pill>Admin Workspace</Pill>
            <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">Organizer Management</h1>
            <p className="mt-1 text-sm text-[var(--color-ink-muted)]">Manage organizer accounts and permissions.</p>
          </div>
          <Link href="/admin/organizers/create" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto">Create Organizer</Button>
          </Link>
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        <Card>
          <p className="text-sm text-[var(--color-ink-muted)]">Total Organizers</p>
          <h2 className="mt-2 text-3xl font-bold text-[var(--color-ink)] sm:text-4xl">{organizers.length}</h2>
        </Card>
        <Card>
          <p className="text-sm text-[var(--color-ink-muted)]">Tickets Processed</p>
          <h2 className="mt-2 text-3xl font-bold text-[var(--color-ink)] sm:text-4xl">{totalTickets}</h2>
        </Card>
        <Card>
          <p className="text-sm text-[var(--color-ink-muted)]">Event Activity</p>
          <h2 className="mt-2 text-3xl font-bold text-[var(--color-ink)] sm:text-4xl">{totalEvents}</h2>
        </Card>
      </div>

      <div className="mt-6 grid gap-6">
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-ink-muted)]">
                Organizer Directory
              </p>
              <h2 className="mt-2 text-xl font-semibold text-[var(--color-ink)] sm:text-2xl">
                {organizers.length} Organizers
              </h2>
            </div>
            <Button variant="outline" size="sm" onClick={refresh} className="w-full sm:w-auto">
              Refresh
            </Button>
          </div>

          {error ? (
            <Card className="flex flex-col gap-2 p-4">
              <Pill>Admin error</Pill>
              <p className="text-sm text-[var(--color-ink-muted)]">{error}</p>
            </Card>
          ) : null}

          {loading ? (
            <Card className="h-64 animate-pulse bg-white/70" />
          ) : organizers.length === 0 ? (
            <Card className="flex flex-col items-center justify-center py-16 text-center sm:py-20">
              <h3 className="text-lg font-semibold text-[var(--color-ink)] sm:text-xl">No Organizer Accounts</h3>
              <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
                Create an organizer account to start managing events.
              </p>
            </Card>
          ) : (
            <Card className="overflow-hidden p-0">
              <div className="w-full overflow-x-auto rounded-2xl">
                <table className="min-w-[900px] w-full">
                  <thead>
                    <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
                      <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[var(--color-ink-muted)] sm:px-6">Organizer</th>
                      <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[var(--color-ink-muted)] sm:px-6">Role</th>
                      <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[var(--color-ink-muted)] sm:px-6">Tickets</th>
                      <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[var(--color-ink-muted)] sm:px-6">Events</th>
                      <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[var(--color-ink-muted)] sm:px-6">Created</th>
                      <th className="px-4 py-4 text-right text-xs font-semibold uppercase tracking-wider text-[var(--color-ink-muted)] sm:px-6">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {organizers.map((organizer) => (
                      <tr
                        key={organizer.id}
                        className="border-b border-[var(--color-border)] transition hover:bg-[var(--color-surface)]"
                      >
                        <td className="px-4 py-4 sm:px-6">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-accent)] text-sm font-bold text-white sm:h-10 sm:w-10">
                              {organizer.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-[var(--color-ink)]">{organizer.name}</p>
                              <p className="text-sm text-[var(--color-ink-muted)]">{organizer.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 sm:px-6"><Pill>{organizer.role}</Pill></td>
                        <td className="px-4 py-4 font-medium text-[var(--color-ink)] sm:px-6">{organizer.ticketCount}</td>
                        <td className="px-4 py-4 font-medium text-[var(--color-ink)] sm:px-6">{organizer.organizedEventCount}</td>
                        <td className="px-4 py-4 text-sm text-[var(--color-ink-muted)] sm:px-6">{formatDate(organizer.createdAt)}</td>
                        <td className="px-4 py-4 text-right sm:px-6">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(organizer)}
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

