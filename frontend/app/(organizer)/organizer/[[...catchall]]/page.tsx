import { notFound } from 'next/navigation';

export default function OrganizerCatchAllPage() {
  // This programmatically triggers the closest organizer/not-found.tsx UI
  notFound();
}