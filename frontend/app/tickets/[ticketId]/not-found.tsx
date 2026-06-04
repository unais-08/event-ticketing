import Link from "next/link";
import Card from "@/app/_components/ui/card";
import { buttonStyles } from "@/app/_components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-3xl items-center justify-center px-6">
      <Card className="text-center">
        <h1 className="text-4xl font-semibold">
          Ticket Not Found
        </h1>

        <p className="mt-4 text-[var(--color-ink-muted)]">
          This ticket may have been deleted or you do not have
          permission to view it.
        </p>

        <Link
          href="/tickets"
          className={`${buttonStyles()} mt-6`}
        >
          Back To Tickets
        </Link>
      </Card>
    </div>
  );
}