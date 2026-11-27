import type { Metadata, Viewport } from "next";
import { Fraunces, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { Providers } from "@/app/providers";
import { MobileTabBar } from "@/components/mobile-tab-bar";
import { SiteHeader } from "@/components/site-header";
import { getMyProfile } from "@/db/dal";
import { getCachedSession } from "@/lib/auth";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Variable font: `weight` is intentionally omitted so font-semibold/font-bold resolve to
// real cuts on the wght axis rather than synthetic bolding.
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Oper",
  description: "Oper — give things away to your neighbors.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getCachedSession();
  const profile = session?.user?.id ? await getMyProfile(session.user.id) : undefined;

  return (
    <html
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} h-full antialiased`}
      lang="en"
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <Providers>
          <SiteHeader displayName={profile?.displayName} session={session} />
          {children}
          <MobileTabBar isSignedIn={session !== null} />
          <div aria-hidden className="h-20 shrink-0 sm:hidden" />
        </Providers>
      </body>
    </html>
  );
}
