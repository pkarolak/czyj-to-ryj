"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { PhotoEditor } from "@/components/prepare/PhotoEditor";
import { PhotoList } from "@/components/prepare/PhotoList";
import { PhotoUpload } from "@/components/prepare/PhotoUpload";
import { PrepareToolbar } from "@/components/prepare/PrepareToolbar";
import { useTournament } from "@/context/TournamentContext";

export default function PreparePage() {
  const { isLoading } = useTournament();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center text-cream/50">
        Ładowanie teleturnieju…
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-dvh max-w-6xl px-4 py-8 sm:px-6">
      <header className="mb-8 flex items-center gap-4">
        <Link
          href="/"
          className="rounded-full p-2 text-cream/50 transition-colors hover:bg-white/5 hover:text-cream"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="font-display text-3xl text-gold sm:text-4xl">
            Tryb prowadzącego
          </h1>
          <p className="text-sm text-cream/50">
            Dodaj zdjęcia i wybierz detale do zgadywania
          </p>
        </div>
      </header>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col gap-8"
      >
        <PrepareToolbar />
        <PhotoUpload />

        {selectedId ? (
          <PhotoEditor roundId={selectedId} onDone={() => setSelectedId(null)} />
        ) : (
          <PhotoList selectedId={selectedId} onSelect={setSelectedId} />
        )}
      </motion.div>
    </div>
  );
}
