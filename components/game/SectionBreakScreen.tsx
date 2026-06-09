"use client";

import { motion } from "framer-motion";
import { LeaderboardDisplay } from "@/components/scores/LeaderboardDisplay";
import { Button } from "@/components/ui/Button";
import type { Team } from "@/lib/types/scoreRoom";

type SectionBreakScreenProps = {
  teams: Record<string, Team>;
  sectionTitle: string;
  onContinue: () => void;
};

export function SectionBreakScreen({
  teams,
  sectionTitle,
  onContinue,
}: SectionBreakScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex flex-col bg-ink"
    >
      <div className="flex-1 overflow-auto">
        <LeaderboardDisplay
          teams={teams}
          title={`Punktacja po: ${sectionTitle}`}
        />
      </div>
      <div className="border-t border-white/10 p-6 text-center">
        <Button size="lg" onClick={onContinue} className="px-12">
          Kontynuuj show
        </Button>
      </div>
    </motion.div>
  );
}
