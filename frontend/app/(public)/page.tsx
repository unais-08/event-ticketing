
"use client";

import { useSyncExternalStore } from "react";
import EventsSection from "@/app/_components/marketing/events-section";
import FeatureStrip from "@/app/_components/marketing/feature-strip";
import Hero from "@/app/_components/marketing/hero";
import RoleWorkspace from "@/app/_components/dashboard/role-workspace";
import Card from "@/app/_components/ui/card";
import { useAuthStore } from "@/app/_stores/auth-store";

export default function Home() {
  const user = useAuthStore((state) => state.user);
  const status = useAuthStore((state) => state.status);

  const mounted = useSyncExternalStore(
    () => () => { },          // subscribe (noop)
    () => true,              // getSnapshot (client)
    () => false              // getServerSnapshot (SSR)
  );

  if (mounted && status === "loading") {
    return (
      <div className="mx-auto w-full max-w-6xl px-6 py-16">
        <Card className="h-48 animate-pulse bg-white/70" />
      </div>
    );
  }

  return (
    <div className="space-y-16 pb-16">
      {mounted && user ? <RoleWorkspace user={user} /> : <Hero />}
      <FeatureStrip />
      <EventsSection />
    </div>
  );
}
