
import EventsSection from "@/app/_components/marketing/events-section";
import FeatureStrip from "@/app/_components/marketing/feature-strip";
import Hero from "@/app/_components/marketing/hero";

export default function Home() {
  return (
    <div className="space-y-16 pb-16">
      <Hero />
      <FeatureStrip />
      <EventsSection />
    </div>
  );
}
