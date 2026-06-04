import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="border-t border-[var(--color-border)] bg-white/70">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10 text-sm text-[var(--color-ink-muted)] md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em]">EventFlow</p>
          <p className="text-base font-semibold text-[var(--color-ink)]">Ticketing and check-ins for modern events.</p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <Link href="/" className="transition hover:text-[var(--color-ink)]">
            Home
          </Link>
          <Link className="transition hover:text-[var(--color-ink)]" href="/events">
            Events
          </Link>
          <Link className="transition hover:text-[var(--color-ink)]" href="/tickets">
            Tickets
          </Link>

        </div>
      </div>
    </footer>
  );
}
