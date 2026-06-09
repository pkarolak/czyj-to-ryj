"use client";

import { motion } from "framer-motion";
import { Clapperboard, Settings } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function HomePage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 py-16">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex max-w-lg flex-col items-center text-center"
      >
        <p className="mb-2 text-sm uppercase tracking-[0.3em] text-gold/70">
          Teleturniej społecznościowo-satyryczny
        </p>
        <h1 className="font-display text-6xl leading-none text-gold sm:text-7xl">
          Czyj to ryj?
        </h1>
        <p className="mt-6 text-lg text-cream/60">
          Trzy konkurencje w jednym show: zgadnij twarz na zdjęciu, rozpoznaj
          utwór po dźwiękach i odpowiedz na pytania trivia. Przygotuj rundę jako
          prowadzący, a potem rozpocznij grę na żywo.
        </p>

        <div className="mt-12 flex w-full flex-col items-center gap-4">
          <Link href="/game">
            <Button size="lg" className="w-full sm:min-w-[240px]">
              <Clapperboard className="h-5 w-5" />
              Zacznij grę
            </Button>
          </Link>
          <Link href="/prepare">
            <Button variant="ghost" size="lg" className="w-full sm:min-w-[240px]">
              <Settings className="h-5 w-5" />
              Tryb prowadzącego
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
