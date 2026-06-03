import Card from "@/app/_components/ui/card";

const features = [
  {
    title: "Smart capacity tracking",
    description: "See ticket velocity and remaining capacity in real time.",
  },
  {
    title: "Fast QR validation",
    description: "Scan, validate, and resolve issues without breaking flow.",
  },
  {
    title: "Organizer-grade visibility",
    description: "Understand attendance, access, and ticket status instantly.",
  },
];

export default function FeatureStrip() {
  return (
    <section className="mx-auto w-full max-w-6xl px-6">
      <div className="grid gap-4 md:grid-cols-3">
        {features.map((feature) => (
          <Card key={feature.title} className="space-y-3">
            <h3 className="text-lg font-semibold">{feature.title}</h3>
            <p className="text-sm text-[var(--color-ink-muted)]">{feature.description}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}
