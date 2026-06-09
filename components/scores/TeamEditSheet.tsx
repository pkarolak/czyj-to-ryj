"use client";

import { TeamForm } from "@/components/scores/TeamForm";
import type { Team, TeamWithId } from "@/lib/types/scoreRoom";

type TeamEditSheetProps = {
  team: TeamWithId;
  onSave: (team: Team) => Promise<void>;
  onDelete: () => void;
  onClose: () => void;
};

export function TeamEditSheet({
  team,
  onSave,
  onDelete,
  onClose,
}: TeamEditSheetProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="w-full max-w-lg max-h-[85dvh] overflow-y-auto rounded-t-2xl border border-white/10 bg-ink p-4 pb-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="team-edit-title"
      >
        <TeamForm
          initialTeam={team}
          onSubmit={onSave}
          onCancel={onClose}
          onDelete={onDelete}
        />
      </div>
    </div>
  );
}
