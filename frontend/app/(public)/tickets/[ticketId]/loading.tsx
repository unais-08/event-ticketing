import Card from "@/app/_components/ui/card";

export default function Loading() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <Card className="h-[600px] animate-pulse" />
    </div>
  );
}