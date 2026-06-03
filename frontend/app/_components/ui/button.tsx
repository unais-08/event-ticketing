import { cn } from "@/app/_lib/utils";

export type ButtonVariant = "primary" | "outline" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

const baseStyles =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-strong)] focus-visible:outline-[var(--color-accent)]",
  outline:
    "border border-[var(--color-border)] bg-white text-[var(--color-ink)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent-strong)] focus-visible:outline-[var(--color-accent)]",
  ghost: "text-[var(--color-ink)] hover:bg-[rgba(17,17,19,0.06)] focus-visible:outline-[var(--color-accent)]",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-6 text-sm",
  lg: "h-12 px-7 text-base",
};

export function buttonStyles(options?: { variant?: ButtonVariant; size?: ButtonSize; className?: string }) {
  const { variant = "primary", size = "md", className } = options ?? {};
  return cn(baseStyles, variants[variant], sizes[size], className);
}

export function Button({
  variant,
  size,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
}) {
  return <button className={buttonStyles({ variant, size, className })} {...props} />;
}
