"use client";

import { SerwistProvider } from "@serwist/next/react";
import type { ReactNode } from "react";
import { TournamentProvider } from "@/context/TournamentContext";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <SerwistProvider swUrl="/sw.js">
      <TournamentProvider>{children}</TournamentProvider>
    </SerwistProvider>
  );
}
