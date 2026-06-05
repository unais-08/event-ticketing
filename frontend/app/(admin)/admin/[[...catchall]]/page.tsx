import { notFound } from 'next/navigation';

export default function AdminCatchAllPage() {
  // This programmatically triggers the closest admin/not-found.tsx UI
  notFound(); 
}