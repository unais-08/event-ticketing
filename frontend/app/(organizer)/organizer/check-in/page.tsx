"use client";

import React from "react";
import Link from "next/link";
import { checkinByToken } from "@/app/_lib/api";
import { getApiErrorMessage } from "@/app/_lib/errors";
import { getRoleLabel, isOperationalRole } from "@/app/_lib/roles";
import { useAuthStore } from "@/app/_stores/auth-store";
import Card from "@/app/_components/ui/card";
import { Button } from "@/app/_components/ui/button";
import Input from "@/app/_components/ui/input";
import Label from "@/app/_components/ui/label";
import Pill from "@/app/_components/ui/pill";

function extractToken(value: string): string {
  const trimmed = value.trim();

  if (!trimmed) {
    return "";
  }

  const checkinIndex = trimmed.lastIndexOf("/api/checkin/");

  if (checkinIndex >= 0) {
    return decodeURIComponent(trimmed.slice(checkinIndex + "/api/checkin/".length));
  }

  return trimmed;
}

export default function CheckInPage() {
  const user = useAuthStore((state) => state.user);
  const status = useAuthStore((state) => state.status);
  const [tokenInput, setTokenInput] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState("");
  const [result, setResult] = React.useState<null | { alreadyCheckedIn: boolean; ticketId: string }>(null);

  const canAccess = isOperationalRole(user?.role);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setResult(null);

    try {
      const token = extractToken(tokenInput);
      const response = await checkinByToken(token);
      setResult(response.data ?? null);
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to process check-in."));
    } finally {
      setSubmitting(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="mx-auto max-w-4xl px-6 py-8">
        <Card className="h-72 animate-pulse bg-white/70" />
      </div>
    );
  }

  if (!canAccess) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-8">
        <Card className="space-y-4">
          <Pill>Access required</Pill>
          <h1 className="text-3xl font-semibold text-[var(--color-ink)]">Check-in is available to organizers, checkers, and admins.</h1>
          <p className="text-sm leading-6 text-[var(--color-ink-muted)]">
            You are signed in as {getRoleLabel(user?.role)}. Switch accounts to process QR tokens.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/login">
              <Button size="sm">Log in</Button>
            </Link>
            <Link href="/">
              <Button variant="outline" size="sm">
                Browse events
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-6 px-6 py-8 lg:grid-cols-[1.05fr_0.95fr]">
      <Card className="space-y-6">
        <div className="space-y-3">
          <Pill>Live check-in</Pill>
          <h1 className="text-4xl font-semibold text-[var(--color-ink)]">Scan or paste a QR token.</h1>
          <p className="max-w-2xl text-sm leading-6 text-[var(--color-ink-muted)]">
            Paste the token from a QR scan or the full check-in URL. The result appears immediately so the door team can keep moving.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="token">QR token or check-in URL</Label>
            <Input id="token" value={tokenInput} onChange={(event) => setTokenInput(event.target.value)} placeholder="Paste token or /api/checkin/... URL" required />
          </div>

          {error && <Card className="border border-red-200 bg-red-50 text-sm text-red-700">{error}</Card>}

          {result && (
            <Card className="border border-emerald-200 bg-emerald-50 text-emerald-800">
              <p className="text-xs font-semibold uppercase tracking-[0.28em]">Result</p>
              <p className="mt-2 text-lg font-semibold">{result.alreadyCheckedIn ? "Ticket was already checked in" : "Check-in completed"}</p>
              <p className="mt-1 text-sm">Ticket ID: {result.ticketId}</p>
            </Card>
          )}

          <div className="flex justify-end gap-3">
            <Button variant="outline" type="button" onClick={() => setTokenInput("")}>
              Clear
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Processing…" : "Process check-in"}
            </Button>
          </div>
        </form>
      </Card>

      <div className="grid gap-4">
        <Card>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-ink-muted)]">Best practice</p>
          <h2 className="mt-2 text-2xl font-semibold text-[var(--color-ink)]">Keep the token input visible at the gate.</h2>
          <p className="mt-3 text-sm leading-6 text-[var(--color-ink-muted)]">
            This page is built for fast manual entry and can be paired with barcode scanner input because it only needs the token string.
          </p>
        </Card>
        <Card>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-ink-muted)]">Your role</p>
          <h2 className="mt-2 text-2xl font-semibold text-[var(--color-ink)]">{getRoleLabel(user?.role)}</h2>
          <p className="mt-3 text-sm leading-6 text-[var(--color-ink-muted)]">
            Organizers, checkers, and admins can validate tickets here. Attendees stay in the discovery and ticket wallet views.
          </p>
        </Card>
      </div>
    </div>
  );
}
