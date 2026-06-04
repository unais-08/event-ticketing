import Card from "@/app/_components/ui/card";

export default function Loading() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
        <Card className="space-y-6">
          <div className="h-4 w-24 animate-pulse rounded-full bg-[var(--color-surface-strong)]" />

          <div className="h-10 w-3/4 animate-pulse rounded-full bg-[var(--color-surface-strong)]" />

          <div className="space-y-3">
            <div className="h-4 animate-pulse rounded-full bg-[var(--color-surface-strong)]" />
            <div className="h-4 animate-pulse rounded-full bg-[var(--color-surface-strong)]" />
            <div className="h-4 w-2/3 animate-pulse rounded-full bg-[var(--color-surface-strong)]" />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="h-20 animate-pulse rounded-2xl bg-[var(--color-surface-strong)]" />
            <div className="h-20 animate-pulse rounded-2xl bg-[var(--color-surface-strong)]" />
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="h-64 animate-pulse" />
          <Card className="h-40 animate-pulse" />
        </div>
      </div>
    </div>
  );
}