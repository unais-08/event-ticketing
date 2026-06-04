import Link from "next/link";
import { Button } from "./_components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="max-w-lg text-center">
        <div className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-[var(--color-accent)]">
          Error 404
        </div>

        <h1 className="mb-4 text-6xl font-bold">
          Page not found
        </h1>

        <p className="mb-8 text-lg text-[var(--color-ink-muted)]">
          The page you're looking for doesn't exist or may have been moved.
        </p>

        <div className="flex justify-center gap-4">
          <Link
            href="/"
          >
            <Button size="md" variant="primary">Go Home</Button>
          </Link>

          <Link
            href="/events"
          >
            <Button size="md" variant="outline">Browse Event</Button>

          </Link>
        </div>
      </div>
    </main>
  );
}