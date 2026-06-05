"use client";

import React from "react";
import Link from "next/link";
import { createCheckerAccount, deleteCheckerAccount, getAdminUsers } from "@/app/_lib/api";
import { getApiErrorMessage } from "@/app/_lib/errors";
import { formatDate } from "@/app/_lib/format";
import type { AdminUserListItem } from "@/app/_lib/types";
import { useAuthStore } from "@/app/_stores/auth-store";
import Card from "@/app/_components/ui/card";
import { Button } from "@/app/_components/ui/button";
import Input from "@/app/_components/ui/input";
import Label from "@/app/_components/ui/label";
import Pill from "@/app/_components/ui/pill";
import { UserPlus } from "lucide-react";

export default function AdminCheckersPage() {
  const user = useAuthStore((state) => state.user);
  const status = useAuthStore((state) => state.status);
  const [checkers, setCheckers] = React.useState<AdminUserListItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [removingId, setRemovingId] = React.useState<string | null>(null);
  const [error, setError] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [form, setForm] = React.useState({ name: "", email: "", password: "" });

  const canAccess = user?.role === "ADMIN";

  const loadCheckers = React.useCallback(async () => {
    if (!canAccess) {
      setLoading(false);
      return;
    }

    try {
      const response = await getAdminUsers({ page: 1, limit: 100, role: "CHECKER" });
      setCheckers(response.data?.users ?? []);
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to load checkers."));
    } finally {
      setLoading(false);
    }
  }, [canAccess]);

  React.useEffect(() => {
    if (status === "loading") {
      return;
    }

    void loadCheckers();
  }, [loadCheckers, status]);

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      await createCheckerAccount(form);
      setForm({ name: "", email: "", password: "" });
      setMessage("Checker account created successfully.");
      await loadCheckers();
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to create checker account."));
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (checkerId: string) => {
    const confirm = window.confirm("Delete this checker account?");

    if (!confirm) {
      return;
    }

    setRemovingId(checkerId);
    setError("");
    setMessage("");

    try {
      await deleteCheckerAccount(checkerId);
      setMessage("Checker account deleted.");
      await loadCheckers();
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to delete checker account."));
    } finally {
      setRemovingId(null);
    }
  };
  const totalTickets = checkers.reduce(
    (sum, checker) => sum + checker.ticketCount,
    0
  );

  const totalEvents = checkers.reduce(
    (sum, checker) => sum + checker.organizedEventCount,
    0
  );
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
          <h1 className="text-3xl font-semibold text-[var(--color-ink)]">Checker management belongs to admin accounts.</h1>
          <p className="text-sm leading-6 text-[var(--color-ink-muted)]">Sign in with an admin role to create or remove checker users.</p>
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

            <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">
              Checker Management
            </h1>

            <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
              Manage checker accounts and permissions.
            </p>
          </div>

          <Link href="/admin/checkers/create" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto">Create Checker</Button>
          </Link>
        </div>
      </div>

      {/* cards */}
      <div className="mt-5 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        <Card>
          <p className="text-sm text-[var(--color-ink-muted)]">Total Checkers</p>
          <h2 className="mt-2 text-3xl font-bold text-[var(--color-ink)] sm:text-4xl">
            {checkers.length}
          </h2>
        </Card>

        <Card>
          <p className="text-sm text-[var(--color-ink-muted)]">Tickets Processed</p>
          <h2 className="mt-2 text-3xl font-bold text-[var(--color-ink)] sm:text-4xl">
            {totalTickets}
          </h2>
        </Card>

        <Card>
          <p className="text-sm text-[var(--color-ink-muted)]">Event Activity</p>
          <h2 className="mt-2 text-3xl font-bold text-[var(--color-ink)] sm:text-4xl">
            {totalEvents}
          </h2>
        </Card>
      </div>

      {/* table */}
      <div className="mt-6 grid gap-6">
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-ink-muted)]">
                Checker Directory
              </p>

              <h2 className="mt-2 text-xl font-semibold text-[var(--color-ink)] sm:text-2xl">
                {checkers.length} Checkers
              </h2>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => void loadCheckers()}
              className="w-full sm:w-auto"
            >
              Refresh
            </Button>
          </div>

          {loading ? (
            <Card className="h-64 animate-pulse bg-white/70" />
          ) : checkers.length === 0 ? (
            <Card className="flex flex-col items-center justify-center py-16 text-center sm:py-20">
              <h3 className="text-lg font-semibold text-[var(--color-ink)] sm:text-xl">
                No Checker Accounts
              </h3>

              <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
                Create your first checker account to begin validating tickets.
              </p>
            </Card>
          ) : (
            <Card className="overflow-hidden p-0">
              <div className="w-full overflow-x-auto rounded-2xl">
                <table className="min-w-[900px] w-full">
                  <thead>
                    <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
                      <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[var(--color-ink-muted)] sm:px-6">
                        Checker
                      </th>

                      <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[var(--color-ink-muted)] sm:px-6">
                        Role
                      </th>

                      <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[var(--color-ink-muted)] sm:px-6">
                        Tickets
                      </th>

                      <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[var(--color-ink-muted)] sm:px-6">
                        Events
                      </th>

                      <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[var(--color-ink-muted)] sm:px-6">
                        Created
                      </th>

                      <th className="px-4 py-4 text-right text-xs font-semibold uppercase tracking-wider text-[var(--color-ink-muted)] sm:px-6">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {checkers.map((checker) => (
                      <tr
                        key={checker.id}
                        className="border-b border-[var(--color-border)] transition hover:bg-[var(--color-surface)]"
                      >
                        <td className="px-4 py-4 sm:px-6">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-accent)] text-sm font-bold text-white sm:h-10 sm:w-10">
                              {checker.name.charAt(0).toUpperCase()}
                            </div>

                            <div>
                              <p className="font-medium text-[var(--color-ink)]">
                                {checker.name}
                              </p>

                              <p className="text-sm text-[var(--color-ink-muted)]">
                                {checker.email}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-4 sm:px-6">
                          <Pill>{checker.role}</Pill>
                        </td>

                        <td className="px-4 py-4 font-medium text-[var(--color-ink)] sm:px-6">
                          {checker.ticketCount}
                        </td>

                        <td className="px-4 py-4 font-medium text-[var(--color-ink)] sm:px-6">
                          {checker.organizedEventCount}
                        </td>

                        <td className="px-4 py-4 text-sm text-[var(--color-ink-muted)] sm:px-6">
                          {formatDate(checker.createdAt)}
                        </td>

                        <td className="px-4 py-4 text-right sm:px-6">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => void handleRemove(checker.id)}
                            disabled={removingId === checker.id}
                          >
                            {removingId === checker.id
                              ? "Removing..."
                              : "Delete"}
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
