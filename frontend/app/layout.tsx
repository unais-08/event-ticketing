import "./globals.css";
import type { Metadata } from "next";
import { Fraunces, Space_Grotesk } from "next/font/google";
import AuthProvider from "@/app/_components/auth/auth-provider";
import SiteFooter from "@/app/_components/layout/site-footer";
import SiteHeader from "@/app/_components/layout/site-header";

const displayFont = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
});

const sansFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "EventFlow | Tickets, Check-ins, Moments",
  description: "Ticketing and check-in experience for modern live events.",
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${displayFont.variable} ${sansFont.variable}`}>
      <body>
        <AuthProvider>
          <div className="relative min-h-screen overflow-hidden">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -top-24 right-[-10%] h-80 w-80 rounded-full bg-[radial-gradient(circle,#f0c9b8,transparent_65%)] opacity-80 blur-3xl" />
              <div className="absolute bottom-[-20%] left-[-10%] h-96 w-96 rounded-full bg-[radial-gradient(circle,#f3d7a8,transparent_65%)] opacity-70 blur-3xl" />
            </div>
            <div className="relative flex min-h-screen flex-col">
              <SiteHeader />
              <main className="flex-1">{children}</main>
              <SiteFooter />
            </div>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
