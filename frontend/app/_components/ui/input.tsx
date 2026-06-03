import { cn } from "@/app/_lib/utils";

export default function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 text-sm text-[var(--color-ink)] shadow-[0_12px_30px_-24px_rgba(17,17,19,0.35)] transition focus:border-[var(--color-accent)] focus:outline-none",
        className,
      )}
      {...props}
    />
  );
}
