import type { Metadata } from "next";
import { Geist, Geist_Mono, Bricolage_Grotesque } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "VibeGrill — practice AI-assisted coding interviews",
  description:
    "Practice realistic coding tasks with an AI pair, then get scored on how well you drove the AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${bricolage.variable} h-full antialiased`}
    >
      {/* `dark` lives on <body>, not <html>: the Neon Auth UI provider uses
          next-themes, which rewrites the <html> class from the system theme and
          would strip a `dark` class there. next-themes leaves <body> alone. */}
      <body className="dark min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
