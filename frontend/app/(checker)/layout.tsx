"use client";

import React from "react";

import RoleGuard from "@/app/_components/auth/role-guard";
import CheckerHeader from "@/app/_components/layout/checker/checker-header";

export default function CheckerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard allowedRoles={["CHECKER"]}>
      <div className="min-h-screen">
        <CheckerHeader />
        {children}
      </div>
    </RoleGuard>
  );
}

