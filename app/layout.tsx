import type { Metadata } from "next";
import { Geist, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

// Geist carries running prose; JetBrains Mono is the console voice —
// headlines, nav, labels, code, and the editor all share it.
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
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
      className={`${geistSans.variable} ${jetbrainsMono.variable} h-full antialiased`}
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
