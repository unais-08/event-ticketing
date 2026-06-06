"use client";

import Link from "next/link";
import type { Role, User } from "@/app/_lib/types";
import { buttonStyles } from "@/app/_components/ui/button";
import Card from "@/app/_components/ui/card";
import Pill from "@/app/_components/ui/pill";
import { getRoleHomePath, getRoleLabel } from "@/app/_lib/roles";

type WorkspaceAction = {
  label: string;
  href: string;
  description: string;
  variant?: "primary" | "outline" | "ghost";
};

const WORKSPACE_COPY: Record<Role, { eyebrow: string; title: string; description: string; actions: WorkspaceAction[] }> = {
  ADMIN: {
    eyebrow: "Administration",
    title: "Control the entire event operation from one place.",
    description: "Create operational users, supervise events, and jump straight to the tools that keep the platform running.",
    actions: [
      { label: "Manage checkers", href: "/admin/checkers", description: "Create and remove checker accounts.", variant: "primary" },
      { label: "Open organizer dashboard", href: "/organizer/dashboard", description: "Review events and ticketing activity.", variant: "outline" },
      { label: "Open check-in console", href: "/check-in", description: "Validate QR tokens at the door.", variant: "outline" },
    ],
  },
  ORGANIZER: {
    eyebrow: "Organizer workspace",
    title: "Build, manage, and review every event you own.",
    description: "Track capacity, update event details, inspect ticket holders, and move from creation to check-in without leaving the app.",
    actions: [
      { label: "View dashboard", href: "/organizer/dashboard", description: "See event totals and upcoming activity.", variant: "primary" },
      { label: "Create event", href: "/organizer/events/new", description: "Launch a new event from a polished editor.", variant: "outline" },
      { label: "Check-in guests", href: "/check-in", description: "Use a QR token to confirm entry.", variant: "outline" },
    ],
  },
  CHECKER: {
    eyebrow: "Check-in lane",
    title: "Process QR scans quickly and keep the queue moving.",
    description: "Use the token console to confirm tickets, inspect outcomes, and stay focused on the door instead of the backend.",
    actions: [
      { label: "Open check-in console", href: "/check-in", description: "Paste or scan a token to validate a ticket.", variant: "primary" },
      { label: "Browse events", href: "/", description: "Return to the public event catalog.", variant: "outline" },
      { label: "View tickets", href: "/tickets", description: "Inspect your own ticket wallet.", variant: "outline" },
    ],
  },
  ATTENDEE: {
    eyebrow: "Attendee view",
    title: "Browse events, manage tickets, and keep your QR ready.",
    description: "Your experience stays centered on discovery and ticket access while role-specific operations stay out of the way.",
    actions: [
      { label: "Browse events", href: "/events", description: "Find the next event to join.", variant: "primary" },
      { label: "My tickets", href: "/tickets", description: "Open your purchased tickets and QR codes.", variant: "outline" },
      { label: "Log in as organizer", href: "/login", description: "Switch into an organizer account if needed.", variant: "outline" },
    ],
  },
};

export default function RoleWorkspace({ user }: { user: User }) {
  const copy = WORKSPACE_COPY[user.role];
  const homePath = getRoleHomePath(user.role);

  return (
    <section className="mx-auto w-full max-w-6xl px-6 pt-10">
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-stretch">
        <Card className="relative overflow-hidden border-[rgba(17,17,19,0.08)] bg-[linear-gradient(135deg,rgba(255,255,255,0.95),rgba(247,240,226,0.94))]">
          <div className="absolute right-0 top-0 h-40 w-40 translate-x-1/3 -translate-y-1/3 rounded-full bg-[radial-gradient(circle,rgba(201,122,74,0.25),transparent_70%)] blur-3xl" />
          <div className="relative space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <Pill>{getRoleLabel(user.role)}</Pill>
              <Pill className="bg-white/80">{copy.eyebrow}</Pill>
            </div>
            <div className="space-y-3">
              <h1 className="max-w-2xl text-4xl font-semibold leading-tight text-[var(--color-ink)] md:text-5xl">{copy.title}</h1>
              <p className="max-w-2xl text-base leading-7 text-[var(--color-ink-muted)] md:text-lg">{copy.description}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              
              <Link className={buttonStyles({ size: "lg" })} href="/events">
                Browse Events
              </Link>
            </div>
          </div>
        </Card>

        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
          {copy.actions.map((action) => (
            <Card key={action.label} className="flex h-full flex-col justify-between gap-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-ink-muted)]">Action</p>
                <h2 className="mt-2 text-xl font-semibold text-[var(--color-ink)]">{action.label}</h2>
                <p className="mt-2 text-sm leading-6 text-[var(--color-ink-muted)]">{action.description}</p>
              </div>
              <Link className={buttonStyles({ variant: action.variant ?? "outline", size: "sm" })} href={action.href}>
                Open
              </Link>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
