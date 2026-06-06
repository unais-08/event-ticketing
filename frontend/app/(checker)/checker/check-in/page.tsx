"use client";

import React from "react";
import Link from "next/link";

import { checkinByToken } from "@/app/_lib/api";
import { getApiErrorMessage } from "@/app/_lib/errors";
import { getRoleLabel } from "@/app/_lib/roles";
import { useAuthStore } from "@/app/_stores/auth-store";

import Card from "@/app/_components/ui/card";
import { Button } from "@/app/_components/ui/button";
import Input from "@/app/_components/ui/input";
import Label from "@/app/_components/ui/label";
import Pill from "@/app/_components/ui/pill";

function extractToken(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";

  // Supports both raw token and full /api/checkin/... URL
  const checkinIndex = trimmed.lastIndexOf("/api/checkin/");
  if (checkinIndex >= 0) {
    return decodeURIComponent(
      trimmed.slice(checkinIndex + "/api/checkin/".length)
    );
  }

  return trimmed;
}

export default function CheckerCheckInPage() {
  const user = useAuthStore((state) => state.user);
  const status = useAuthStore((state) => state.status);

  const [tokenInput, setTokenInput] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState("");
  const [result, setResult] = React.useState<
    null | { alreadyCheckedIn: boolean; ticketId: string }
  >(null);

  const [scanMode, setScanMode] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const canShowCheckerUI = user?.role === "CHECKER";

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

  const handlePickQrFile = () => {
    setScanMode(true);
    fileInputRef.current?.click();
  };

  const handleQrFile = async (file?: File | null) => {
    setScanMode(false);
    if (!file) return;

    setError("");
    // Minimal QR scan option without extra dependencies:
    // We only support "manual scan" workflows where the scanner app pastes token.
    // If you want true camera QR scanning, add a QR library (e.g. html5-qrcode).
    // For now, we read file name as a hint (optional) and instruct user.
    setError(
      "Camera QR scanning requires adding a QR library. Use your scanner to paste the QR token into the input."
    );
  };

  if (status === "loading") {
    return (
      <div className="mx-auto max-w-3xl px-6 py-8">
        <Card className="h-72 animate-pulse bg-white/70" />
      </div>
    );
  }

  if (!canShowCheckerUI) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-10">
        <Card className="space-y-4">
          <Pill>Access required</Pill>
          <h1 className="text-3xl font-semibold text-[var(--color-ink)]">
            Checker check-in
          </h1>
          <p className="text-sm leading-6 text-[var(--color-ink-muted)]">
            You are signed in as {getRoleLabel(user?.role ?? null)}.
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
    <div className="mx-auto w-full max-w-3xl px-6 py-8">
      <div className="space-y-4">
        <div className="space-y-2">
          <Pill>Gate check-in</Pill>
          <h1 className="text-4xl font-semibold text-[var(--color-ink)]">
            Scan or paste a QR token
          </h1>
          <p className="text-sm leading-6 text-[var(--color-ink-muted)]">
            On mobile, use your QR scanner to copy the token, then paste it here.
            If you paste the full URL, this page extracts the token automatically.
          </p>
        </div>

        <Card className="space-y-5 p-5 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="token" className="text-sm">
                QR token
              </Label>
              <Input
                id="token"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="Paste token or /api/checkin/... URL"
                inputMode="text"
                autoComplete="off"
              />
            </div>

            {error ? (
              <Card className="border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </Card>
            ) : null}

            {result ? (
              <Card className="border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-ink-muted)]">
                  Result
                </p>
                <p className="mt-2 text-lg font-semibold">
                  {result.alreadyCheckedIn
                    ? "Ticket was already checked in"
                    : "Check-in completed"}
                </p>
                <p className="mt-1 text-sm">Ticket ID: {result.ticketId}</p>
              </Card>
            ) : null}

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button
                variant="outline"
                type="button"
                onClick={() => setTokenInput("")}
              >
                Clear
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Processing…" : "Process check-in"}
              </Button>
            </div>
          </form>

          <div className="border-t border-[var(--color-border)] pt-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-ink-muted)]">
                  QR scan option
                </p>
                <p className="text-sm text-[var(--color-ink-muted)]">
                  Minimal option: paste token or URL (fastest and most reliable).
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  type="button"
                  onClick={handlePickQrFile}
                >
                  Scan QR
                </Button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleQrFile(e.target.files?.[0])}
                />
              </div>
            </div>

            {scanMode ? (
              <p className="mt-3 text-xs text-[var(--color-ink-muted)]">
                Choose a QR image file (camera scanning not enabled).
              </p>
            ) : null}
          </div>
        </Card>

        <Card className="space-y-2 p-5 sm:p-6">
          <Pill>Tip</Pill>
          <p className="text-sm leading-6 text-[var(--color-ink-muted)]">
            Use a dedicated gate device for speed. This UI is mobile-first with large touch targets.
          </p>
        </Card>
      </div>
    </div>
  );
}

