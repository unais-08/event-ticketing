import { cn } from "@/app/_lib/utils";

export default function Divider({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("h-px w-full bg-[var(--color-border)]", className)} {...props} />;
}
