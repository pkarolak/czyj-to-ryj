"use client";

import { motion } from "framer-motion";
import { Clapperboard, Settings } from "lucide-react";
import Link from "next/link";
import { BeanHeadReveal } from "@/components/home/BeanHeadReveal";
import { Button } from "@/components/ui/Button";

const HIGHLIGHTS = [
  "nie rozpoznasz ziomka, którego znasz od lat",
  "zawstydzisz Roberta Janowskiego odgadując utwór po jednej nutce",
  "popiszesz się wiedzą, którą w sumie nie warto się chwalić",
] as const;

export default function HomePage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-5 py-10 sm:px-6 sm:py-14">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex w-full max-w-4xl flex-col"
      >
        <header className="flex w-full items-center justify-between gap-5 overflow-visible sm:gap-8">
          <div className="min-w-0 text-left">
            <p className="text-xs uppercase tracking-[0.3em] text-gold/80 sm:text-sm sm:tracking-[0.35em]">
              Teleturniej społecznościowo-satyryczny
            </p>
            <h1 className="mt-2 font-display text-6xl leading-[0.9] text-gold sm:mt-3 sm:text-7xl lg:text-8xl">
              Czyj to ryj?
            </h1>
          </div>
          <BeanHeadReveal className="relative z-10 h-40 w-40 shrink-0 translate-y-4 sm:h-52 sm:w-52 sm:translate-y-5 lg:h-60 lg:w-60 lg:translate-y-6" />
        </header>

        <div className="relative z-0 mt-5 w-full text-left sm:mt-6">
          <p className="text-lg font-medium leading-snug text-cream sm:text-xl">
            Najnowsza gra imprezowa, w której:
          </p>
          <ul className="mt-5 space-y-4 sm:space-y-5">
            {HIGHLIGHTS.map((line) => (
              <li key={line} className="flex gap-3 sm:gap-4">
                <span
                  aria-hidden
                  className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-gold shadow-[0_0_10px_rgba(245,197,66,0.4)]"
                />
                <span className="text-base leading-relaxed text-cream/90 sm:text-lg">
                  {line}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-9 flex w-full flex-row flex-wrap items-center gap-3 sm:mt-11 sm:gap-4">
          <Link href="/game">
            <Button size="lg">
              <Clapperboard className="h-5 w-5" />
              Zaczynamy
            </Button>
          </Link>
          <Link href="/prepare">
            <Button variant="ghost" size="lg">
              <Settings className="h-5 w-5" />
              Konfiguruj rozgrywkę
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
