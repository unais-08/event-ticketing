"use client";

import { usePathname } from "next/navigation";
import SiteHeader from "./site-header";

export default function LayoutWrapper({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    const hidePublicHeader =
        pathname.startsWith("/admin") ||
        pathname.startsWith("/organizer")
    return (
        <>
            {!hidePublicHeader && <SiteHeader />}
            {children}
        </>
    );
}