"use client";

import { AnimatePresence, motion } from "framer-motion";
import { LeaderboardDisplay } from "@/components/scores/LeaderboardDisplay";
import type { ScoreRoom } from "@/lib/types/scoreRoom";

type ScoresOverlayProps = {
  room: ScoreRoom | null;
};

export function ScoresOverlay({ room }: ScoresOverlayProps) {
  return (
    <AnimatePresence>
      {room?.showScores && (
        <motion.div
          key="scores-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          className="fixed inset-0 z-50 bg-ink"
        >
          <LeaderboardDisplay teams={room.teams} compact />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
