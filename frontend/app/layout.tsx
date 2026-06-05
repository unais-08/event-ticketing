// app/layout.tsx

import "./globals.css";
import type { Metadata } from "next";
import { Fraunces, Space_Grotesk } from "next/font/google";
import AuthProvider from "@/app/_components/auth/auth-provider";

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
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${displayFont.variable} ${sansFont.variable}`}>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}