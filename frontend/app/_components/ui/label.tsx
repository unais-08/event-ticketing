import { cn } from "@/app/_lib/utils";

export default function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-ink-muted)]", className)} {...props} />;
}
