"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    UserCog,
    ShieldCheck,
    CalendarDays,
    ArrowLeft,
} from "lucide-react";

const sections = [
    {
        title: "Overview",
        items: [
            {
                label: "Dashboard",
                href: "/admin/dashboard",
                icon: LayoutDashboard,
            },
        ],
    },
    {
        title: "User Management",
        items: [
            {
                label: "Users",
                href: "/admin/users",
                icon: Users,
            },
            {
                label: "Organizers",
                href: "/admin/organizers",
                icon: UserCog,
            },
            {
                label: "Checkers",
                href: "/admin/checkers",
                icon: ShieldCheck,
            },
        ],
    },
    {
        title: "Event Management",
        items: [
            {
                label: "Events",
                href: "/admin/events",
                icon: CalendarDays,
            },

        ],
    },


];

export default function AdminSidebar() {
    const pathname = usePathname();

    return (
        <aside
            className="
    fixed
    left-0
    top-16
    hidden
    h-[calc(100vh-64px)]
    w-72
    border-r
    border-[var(--color-border)]
    bg-white
    lg:block
  "
        >
            <div className="flex h-full flex-col">
                <div className="flex-1 overflow-y-auto p-4">
                    {sections.map((section) => (
                        <div key={section.title} className="mb-8">
                            <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-ink-muted)]">
                                {section.title}
                            </p>

                            <div className="space-y-1">
                                {section.items.map((item) => {
                                    const Icon = item.icon;

                                    const active =
                                        pathname === item.href ||
                                        pathname.startsWith(`${item.href}/`);

                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${active
                                                ? "bg-[var(--color-accent)] text-white"
                                                : "text-[var(--color-ink-muted)] hover:bg-[var(--color-surface)] hover:text-[var(--color-ink)]"
                                                }`}
                                        >
                                            <Icon size={18} />
                                            <span>{item.label}</span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="border-t border-[var(--color-border)] p-4">
                    <Link
                        href="/"
                        className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-[var(--color-ink-muted)] transition hover:bg-[var(--color-surface)] hover:text-[var(--color-ink)]"
                    >
                        <ArrowLeft size={18} />
                        <span>Back to Website</span>
                    </Link>
                </div>
            </div>
        </aside>
    );
}