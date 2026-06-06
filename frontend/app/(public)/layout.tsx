import SiteFooter from "@/app/_components/layout/site-footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 right-[-10%] h-80 w-80 rounded-full bg-[radial-gradient(circle,#f0c9b8,transparent_65%)] opacity-80 blur-3xl" />
        <div className="absolute bottom-[-20%] left-[-10%] h-96 w-96 rounded-full bg-[radial-gradient(circle,#f3d7a8,transparent_65%)] opacity-70 blur-3xl" />
      </div>

      <div className="relative flex min-h-screen flex-col">
        {/* <SiteHeader /> */}
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </div>
    </div>
  );
}