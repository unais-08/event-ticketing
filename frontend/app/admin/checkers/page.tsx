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
    <div className="mx-auto grid w-full max-w-6xl gap-6 px-6 py-8 lg:grid-cols-[0.95fr_1.05fr]">
      <Card className="space-y-6">
        <div className="space-y-3">
          <Pill>Admin workspace</Pill>
          <h1 className="text-4xl font-semibold text-[var(--color-ink)]">Checker accounts</h1>
          <p className="text-sm leading-6 text-[var(--color-ink-muted)]">
            Create checker users for the gate and remove them when a shift ends. The admin API keeps the list in sync with the backend.
          </p>
        </div>

        {error && <Card className="border border-red-200 bg-red-50 text-sm text-red-700">{error}</Card>}
        {message && <Card className="border border-emerald-200 bg-emerald-50 text-sm text-emerald-800">{message}</Card>}

        <form onSubmit={handleCreate} className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} required />
          </div>
          <Button type="submit" disabled={saving}>{saving ? "Creating…" : "Create checker"}</Button>
        </form>
      </Card>

      <Card className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-ink-muted)]">Current checkers</p>
            <h2 className="mt-2 text-2xl font-semibold text-[var(--color-ink)]">{checkers.length} accounts</h2>
          </div>
          <Button variant="outline" size="sm" onClick={() => void loadCheckers()}>
            Refresh
          </Button>
        </div>

        {loading ? (
          <Card className="h-64 animate-pulse bg-white/70" />
        ) : checkers.length === 0 ? (
          <Card className="text-sm text-[var(--color-ink-muted)]">No checker accounts exist yet.</Card>
        ) : (
          <div className="grid gap-4">
            {checkers.map((checker) => (
              <Card key={checker.id} className="space-y-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-[var(--color-ink)]">{checker.name}</h3>
                    <p className="text-sm text-[var(--color-ink-muted)]">{checker.email}</p>
                  </div>
                  <Pill>{checker.role}</Pill>
                </div>

                <div className="grid gap-3 text-sm text-[var(--color-ink-muted)] sm:grid-cols-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em]">Created</p>
                    <p className="mt-1 text-[var(--color-ink)]">{formatDate(checker.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em]">Tickets</p>
                    <p className="mt-1 text-[var(--color-ink)]">{checker.ticketCount}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em]">Activity</p>
                    <p className="mt-1 text-[var(--color-ink)]">{checker.organizedEventCount} events</p>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button variant="ghost" size="sm" onClick={() => void handleRemove(checker.id)} disabled={removingId === checker.id}>
                    {removingId === checker.id ? "Removing…" : "Delete checker"}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
