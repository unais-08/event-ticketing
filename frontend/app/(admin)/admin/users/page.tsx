"use client";

import React from "react";
import { getAdminUsers, deleteAttendeeAccount } from "@/app/_lib/api";
import { getApiErrorMessage } from "@/app/_lib/errors";
import { formatDate } from "@/app/_lib/format";
import type { AdminUserListItem } from "@/app/_lib/types";
import { useAuthStore } from "@/app/_stores/auth-store";
import Card from "@/app/_components/ui/card";
import { Button } from "@/app/_components/ui/button";
import Pill from "@/app/_components/ui/pill";

const LIMIT = 20;

export default function AdminUsersPage() {
  const user = useAuthStore((state) => state.user);
  const status = useAuthStore((state) => state.status);

  const [users, setUsers] = React.useState<AdminUserListItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [totalUsers, setTotalUsers] = React.useState(0);

  const canAccess = user?.role === "ADMIN";

  const loadUsers = React.useCallback(async (p = page) => {
    if (!canAccess) { setLoading(false); return; }
    try {
      setLoading(true);
      const response = await getAdminUsers({ page: p, limit: LIMIT, role: "ATTENDEE" });
      setUsers(response.data?.users ?? []);
      setTotalPages(response.data?.meta?.totalPages ?? 1);
      setTotalUsers(response.data?.meta?.total ?? 0);
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to load users."));
    } finally {
      setLoading(false);
    }
  }, [canAccess, page]);

  React.useEffect(() => {
    if (status === "loading") return;
    void loadUsers(page);
  }, [status, page]);

  const handleDelete = async (u: AdminUserListItem) => {
    if (!window.confirm(`Delete ${u.name}?`)) return;
    await deleteAttendeeAccount(u.id);
    setUsers((prev) => prev.filter((x) => x.id !== u.id));
  };

  const totalTickets = users.reduce((sum, u) => sum + u.ticketCount, 0);
  const totalEvents = users.reduce((sum, u) => sum + u.organizedEventCount, 0);

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
          <h1 className="text-3xl font-semibold text-[var(--color-ink)]">User management belongs to admin accounts.</h1>
          <p className="text-sm leading-6 text-[var(--color-ink-muted)]">Sign in with an admin role to manage users.</p>
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
            <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">User Management</h1>
            <p className="mt-1 text-sm text-[var(--color-ink-muted)]">View and manage attendee accounts.</p>
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        <Card>
          <p className="text-sm text-[var(--color-ink-muted)]">Total Attendees</p>
          <h2 className="mt-2 text-3xl font-bold text-[var(--color-ink)] sm:text-4xl">{totalUsers}</h2>
        </Card>
        <Card>
          <p className="text-sm text-[var(--color-ink-muted)]">Tickets Purchased</p>
          <h2 className="mt-2 text-3xl font-bold text-[var(--color-ink)] sm:text-4xl">{totalTickets}</h2>
        </Card>
        <Card>
          <p className="text-sm text-[var(--color-ink-muted)]">Event Activity</p>
          <h2 className="mt-2 text-3xl font-bold text-[var(--color-ink)] sm:text-4xl">{totalEvents}</h2>
        </Card>
      </div>

      <div className="mt-6 space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-ink-muted)]">Attendee Directory</p>
            <h2 className="mt-2 text-xl font-semibold text-[var(--color-ink)] sm:text-2xl">{users.length} Attendees</h2>
          </div>
          <Button variant="outline" size="sm" onClick={() => void loadUsers(page)} className="w-full sm:w-auto">
            Refresh
          </Button>
        </div>

        {error && (
          <Card className="flex flex-col gap-2 p-4">
            <Pill>Admin error</Pill>
            <p className="text-sm text-[var(--color-ink-muted)]">{error}</p>
          </Card>
        )}

        {loading ? (
          <Card className="h-64 animate-pulse bg-white/70" />
        ) : users.length === 0 ? (
          <Card className="flex flex-col items-center justify-center py-16 text-center sm:py-20">
            <h3 className="text-lg font-semibold text-[var(--color-ink)] sm:text-xl">No Attendee Accounts</h3>
            <p className="mt-2 text-sm text-[var(--color-ink-muted)]">No attendees have registered yet.</p>
          </Card>
        ) : (
          <>
            <Card className="overflow-hidden p-0">
              <div className="w-full overflow-x-auto rounded-2xl">
                <table className="min-w-[900px] w-full">
                  <thead>
                    <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
                      <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[var(--color-ink-muted)] sm:px-6">User</th>
                      <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[var(--color-ink-muted)] sm:px-6">Role</th>
                      <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[var(--color-ink-muted)] sm:px-6">Tickets</th>
                      <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[var(--color-ink-muted)] sm:px-6">Events</th>
                      <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[var(--color-ink-muted)] sm:px-6">Created</th>
                      <th className="px-4 py-4 text-right text-xs font-semibold uppercase tracking-wider text-[var(--color-ink-muted)] sm:px-6">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className="border-b border-[var(--color-border)] transition hover:bg-[var(--color-surface)]">
                        <td className="px-4 py-4 sm:px-6">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-accent)] text-sm font-bold text-white sm:h-10 sm:w-10">
                              {u.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-[var(--color-ink)]">{u.name}</p>
                              <p className="text-sm text-[var(--color-ink-muted)]">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 sm:px-6"><Pill>{u.role}</Pill></td>
                        <td className="px-4 py-4 font-medium text-[var(--color-ink)] sm:px-6">{u.ticketCount}</td>
                        <td className="px-4 py-4 font-medium text-[var(--color-ink)] sm:px-6">{u.organizedEventCount}</td>
                        <td className="px-4 py-4 text-sm text-[var(--color-ink-muted)] sm:px-6">{formatDate(u.createdAt)}</td>
                        <td className="px-4 py-4 text-right sm:px-6">
                          <Button variant="ghost" size="sm" onClick={() => void handleDelete(u)}>
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3">
                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                  Previous
                </Button>
                <span className="text-sm font-medium text-[var(--color-ink-muted)]">
                  Page {page} of {totalPages}
                </span>
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}