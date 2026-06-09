"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { isValidRoomCode } from "@/lib/types/scoreRoom";

type RoomCodeInputProps = {
  onSubmit: (code: string) => void;
  isLoading?: boolean;
  error?: string | null;
  initialCode?: string;
};

export function RoomCodeInput({
  onSubmit,
  isLoading,
  error,
  initialCode = "",
}: RoomCodeInputProps) {
  const [code, setCode] = useState(initialCode);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidRoomCode(code)) return;
    onSubmit(code);
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-xs flex-col gap-4">
      <label className="text-sm text-cream/60">4-cyfrowy kod pokoju</label>
      <input
        type="text"
        inputMode="numeric"
        pattern="\d{4}"
        maxLength={4}
        value={code}
        onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 4))}
        placeholder="1234"
        className="rounded-xl border border-white/10 bg-white/5 px-4 py-4 text-center font-display text-4xl tracking-[0.3em] text-gold outline-none focus:border-gold/50"
        autoComplete="off"
      />
      <Button
        type="submit"
        size="lg"
        disabled={!isValidRoomCode(code) || isLoading}
        className="w-full"
      >
        {isLoading ? "Łączenie…" : "Dołącz"}
      </Button>
      {error && (
        <p className="text-center text-sm text-red-400" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
