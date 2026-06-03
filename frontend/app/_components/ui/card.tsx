import { cn } from "@/app/_lib/utils";

export default function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-[var(--color-border)] bg-white/80 p-6 shadow-[var(--shadow-soft)] backdrop-blur",
        className,
      )}
      {...props}
    />
  );
}
