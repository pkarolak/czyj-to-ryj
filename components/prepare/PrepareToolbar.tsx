"use client";

import Link from "next/link";
import { Download, Gamepad2, RotateCcw, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { useTournament } from "@/context/TournamentContext";
import { downloadTournament } from "@/lib/io/exportTournament";
import { parseTournamentFile } from "@/lib/io/importTournament";
import { buildShowQueue } from "@/lib/types/tournament";

export function PrepareToolbar() {
  const {
    tournament,
    isSaving,
    showReady,
    setName,
    resetTournament,
    replaceTournament,
  } = useTournament();
  const importRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const queueLength = buildShowQueue(tournament).length;
  const hasContent =
    tournament.faceRounds.length > 0 ||
    tournament.harmonyRounds.length > 0 ||
    tournament.triviaRounds.length > 0;

  const showMessage = (text: string) => {
    setMessage(text);
    setTimeout(() => setMessage(null), 4000);
  };

  const handleExport = async () => {
    if (!hasContent) {
      showMessage("Dodaj przynajmniej jedną rundę przed eksportem.");
      return;
    }
    setIsExporting(true);
    try {
      await downloadTournament(tournament);
      showMessage("Teleturniej wyeksportowany.");
    } catch {
      showMessage("Eksport nie powiódł się.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    try {
      const imported = await parseTournamentFile(file);
      replaceTournament(imported);
      showMessage("Teleturniej zaimportowany.");
    } catch (err) {
      showMessage(err instanceof Error ? err.message : "Import nie powiódł się.");
    }
    if (importRef.current) importRef.current.value = "";
  };

  const handleReset = async () => {
    if (!confirm("Na pewno wyczyścić cały teleturniej? Tej operacji nie można cofnąć."))
      return;
    await resetTournament();
    showMessage("Teleturniej wyczyszczony.");
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="text"
          value={tournament.name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nazwa teleturnieju"
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-display text-xl text-cream outline-none focus:border-gold/50 sm:max-w-md"
        />
        <span className="text-sm text-cream/40">
          {isSaving ? "Zapisywanie…" : "Zapisano lokalnie"}
          {queueLength > 0 && ` · ${queueLength} rund w show`}
        </span>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button variant="secondary" onClick={handleExport} disabled={isExporting}>
          <Download className="h-4 w-4" />
          {isExporting ? "Eksportowanie…" : "Eksportuj teleturniej"}
        </Button>

        <Button variant="secondary" onClick={() => importRef.current?.click()}>
          <Upload className="h-4 w-4" />
          Importuj teleturniej
        </Button>
        <input
          ref={importRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => handleImport(e.target.files)}
        />

        <Button variant="danger" onClick={handleReset}>
          <RotateCcw className="h-4 w-4" />
          Wyczyść wszystko
        </Button>

        {showReady ? (
          <Link href="/game">
            <Button size="lg">
              <Gamepad2 className="h-5 w-5" />
              Przejdź do gry
            </Button>
          </Link>
        ) : (
          <Button
            size="lg"
            disabled
            title="Przygotuj przynajmniej jedną gotową rundę w dowolnej sekcji"
          >
            <Gamepad2 className="h-5 w-5" />
            Przejdź do gry
          </Button>
        )}
      </div>

      {message && (
        <p className="text-sm text-gold/80" role="status">
          {message}
        </p>
      )}
    </div>
  );
}
