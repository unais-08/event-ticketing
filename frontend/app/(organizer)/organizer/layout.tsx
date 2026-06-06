import React from "react";

import RoleGuard from "@/app/_components/auth/role-guard";
import OrganizerHeader from "@/app/_components/layout/organizer/orgranizer-header";

export default function OrganizerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard allowedRoles={["ORGANIZER"]}>
      <div className="min-h-screen">
        <OrganizerHeader />
        {children}
      </div>
    </RoleGuard>
  );
}

