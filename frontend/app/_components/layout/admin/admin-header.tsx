"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useAuthStore } from "@/app/_stores/auth-store";
import Pill from "@/app/_components/ui/pill";
import { Button } from "@/app/_components/ui/button";
import { Menu } from "lucide-react";

export default function AdminHeader() {
    const router = useRouter();
    const [mounted, setMounted] = React.useState(false);
    React.useEffect(() => {
        setMounted(true);
    }, []);
    const user = useAuthStore((state) => state.user);
    const clearSession = useAuthStore((state) => state.clearSession);

    const handleSignOut = () => {
        clearSession();
        router.push("/");
    };

    return (
        <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-white">
            <div className="flex h-16 items-center justify-between px-6">
                {/* Left */}
                <div className="flex items-center gap-8">
                    <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-accent)] text-white shadow-[var(--shadow-soft)] sm:h-11 sm:w-11">
                            <span className="text-base font-semibold sm:text-lg">EF</span>
                        </div>
                        <Button
                            variant="ghost"
                            size="md"
                            className="lg:hidden"
                        >
                            <Menu size={20} />
                        </Button>
                        <Link href="/" className="min-w-0">
                            <p className="truncate text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-ink-muted)] sm:text-sm sm:tracking-[0.28em]">
                                EventFlow
                            </p>
                            <p className="truncate text-sm font-semibold sm:text-base">
                                Ticketing Intelligence
                            </p>
                        </Link>
                    </div>

                    <nav className="hidden items-center gap-6 md:flex">
                        <Link
                            href="/admin/dashboard"
                            className="text-sm font-medium text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
                        >
                            Dashboard
                        </Link>

                        <Link
                            href="/admin/users"
                            className="text-sm font-medium text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
                        >
                            Users
                        </Link>

                        <Link
                            href="/admin/organizers"
                            className="text-sm font-medium text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
                        >
                            Organizers
                        </Link>

                        <Link
                            href="/admin/events"
                            className="text-sm font-medium text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
                        >
                            Events
                        </Link>
                    </nav>
                </div>

                {/* Right */}
                <div className="flex items-center gap-3">
                    <Pill>ADMIN</Pill>

                    <span className="hidden text-sm font-medium text-[var(--color-ink)] sm:inline">
                        {mounted ? user?.name : ""}
                    </span>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push("/")}
                    >
                        Website
                    </Button>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleSignOut}
                    >
                        Logout
                    </Button>
                </div>
            </div>
        </header>
    );
}