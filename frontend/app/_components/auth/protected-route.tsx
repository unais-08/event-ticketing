"use client";

import { ReactNode } from "react";
import Link from "next/link";

import { useAuthStore } from "@/app/_stores/auth-store";
import Card from "@/app/_components/ui/card";
import { Button } from "@/app/_components/ui/button";

interface ProtectedRouteProps {
    children: ReactNode;
}

export default function ProtectedRoute({
    children,
}: ProtectedRouteProps) {
    const user = useAuthStore((state) => state.user);
    const status = useAuthStore((state) => state.status);

    if (status === "loading") {
        return <div>Loading...</div>;
    }

    if (!user) {
        return (
            <div className="mx-auto max-w-3xl px-6 py-12">
                <Card className="space-y-4">
                    <h1 className="text-2xl font-semibold">
                        Please log in first
                    </h1>

                    <Link href="/login">
                        <Button>Log in</Button>
                    </Link>
                </Card>
            </div>
        );
    }

    return <>{children}</>;
}