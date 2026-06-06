"use client";

import React, { useSyncExternalStore, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useAuthStore } from "@/app/_stores/auth-store";
import Pill from "@/app/_components/ui/pill";
import { Button } from "@/app/_components/ui/button";
import { Menu, X } from "lucide-react";

export default function AdminHeader() {
    const router = useRouter();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const mounted = useSyncExternalStore(
        () => () => { },
        () => true,
        () => false
    );

    const user = useAuthStore((state) => state.user);
    const clearSession = useAuthStore((state) => state.clearSession);

    const handleSignOut = () => {
        clearSession();
        router.push("/");
    };

    const navLinks = [
        { href: "/admin/dashboard", label: "Dashboard" },
        { href: "/admin/users", label: "Attendees" },
        { href: "/admin/organizers", label: "Organizers" },
        { href: "/admin/checkers", label: "Checkers" },
    ];

    return (
        <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-white">
            <div className="flex h-16 items-center justify-between px-4 sm:px-6">
                {/* Left */}
                <div className="flex items-center gap-3 sm:gap-8">
                    <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-accent)] text-white shadow-[var(--shadow-soft)] sm:h-11 sm:w-11">
                            <span className="text-sm font-semibold sm:text-lg">EF</span>
                        </div>
                        <Link href="/" className="min-w-0">
                            <p className="truncate text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--color-ink-muted)] sm:text-sm sm:tracking-[0.28em]">
                                EventFlow
                            </p>
                            <p className="truncate text-xs font-semibold sm:text-base">
                                Ticketing Intelligence
                            </p>
                        </Link>
                    </div>

                    {/* Desktop nav */}
                    <nav className="hidden items-center gap-6 md:flex">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="text-sm font-medium text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>
                </div>

                {/* Right */}
                <div className="flex items-center gap-2 sm:gap-3">

                    <span className="hidden sm:inline-flex">
                        <Pill>ADMIN</Pill>
                    </span>
                    <span className="hidden text-sm font-medium text-[var(--color-ink)] sm:inline">
                        {mounted ? user?.name : ""}
                    </span>
                    <span  className="hidden sm:inline-flex">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleSignOut}
                            className="hidden sm:inline-flex"
                        >
                            Logout
                        </Button>
                        </span>

                    {/* Mobile menu toggle */}
                    <Button
                        variant="ghost"
                        size="sm"
                        className="md:hidden"
                        onClick={() => setMobileMenuOpen((prev) => !prev)}
                        aria-label="Toggle menu"
                    >
                        {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                    </Button>
                </div>
            </div>

            {/* Mobile dropdown menu */}
            {mobileMenuOpen && (
                <div className="border-t border-[var(--color-border)] bg-white px-4 pb-4 md:hidden">
                    {/* User info row */}
                    {mounted && user?.name && (
                        <p className="py-3 text-sm font-medium text-[var(--color-ink-muted)]">
                            Signed in as{" "}
                            <span className="text-[var(--color-ink)]">{user.name}</span>
                        </p>
                    )}

                    <nav className="flex flex-col gap-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className="rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--color-ink-muted)] hover:bg-[var(--color-surface)] hover:text-[var(--color-ink)]"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>

                    <div className="mt-3 border-t border-[var(--color-border)] pt-3">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleSignOut}
                            className="w-full justify-start"
                        >
                            Logout
                        </Button>
                    </div>
                </div>
            )}
        </header>
    );
}