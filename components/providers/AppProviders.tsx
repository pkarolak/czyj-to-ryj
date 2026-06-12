"use client";

import { SiteFooter } from "@/components/branding/SiteFooter";
import { SerwistProvider } from "@serwist/next/react";
import type { ReactNode } from "react";
import { TournamentProvider } from "@/context/TournamentContext";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <SerwistProvider swUrl="/sw.js">
      <TournamentProvider>
        <div className="flex min-h-dvh flex-col">
          <div className="flex min-h-0 flex-1 flex-col">{children}</div>
          <SiteFooter />
        </div>
      </TournamentProvider>
    </SerwistProvider>
  );
}
