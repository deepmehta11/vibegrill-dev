"use client";

import { NeonAuthUIProvider } from "@neondatabase/auth-ui";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth/client";

export function Providers({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  return (
    <NeonAuthUIProvider
      authClient={authClient}
      navigate={router.push}
      Link={Link}
      // VibeGrill ships dark only; force Neon Auth's components (UserButton
      // dropdown, AuthView) dark so they match instead of following the OS.
      defaultTheme="dark"
    >
      {children}
    </NeonAuthUIProvider>
  );
}
