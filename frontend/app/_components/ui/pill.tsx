import { cn } from "@/app/_lib/utils";

export default function Pill({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-ink-muted)]",
        className,
      )}
      {...props}
    />
  );
}
