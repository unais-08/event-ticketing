"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthStore } from "@/app/_stores/auth-store";

interface RoleGuardProps {
    allowedRoles: string[];
    children: React.ReactNode;
}

export default function RoleGuard({
    allowedRoles,
    children,
}: RoleGuardProps) {
    const router = useRouter();

    const user = useAuthStore((state) => state.user);
    const status = useAuthStore((state) => state.status);

    useEffect(() => {
        if (status === "loading") return;

        if (!user || !allowedRoles.includes(user.role)) {
            router.replace("/");
        }
    }, [user, status, allowedRoles, router]);

    if (status === "loading") return null;

    if (!user || !allowedRoles.includes(user.role)) {
        return null;
    }

    return <>{children}</>;
}