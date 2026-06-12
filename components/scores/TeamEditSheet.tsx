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
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="w-full max-w-lg max-h-[90dvh] overflow-y-auto rounded-t-2xl border border-white/10 bg-ink p-4 pb-[max(2rem,env(safe-area-inset-bottom))] shadow-2xl sm:max-h-[85dvh] sm:rounded-2xl sm:pb-6"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="team-edit-title"
      >
        <TeamForm
          key={team.id}
          initialTeam={team}
          onSubmit={onSave}
          onCancel={onClose}
          onDelete={onDelete}
        />
      </div>
    </div>
  );
}
