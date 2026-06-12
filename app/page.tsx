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
    <div className="flex w-full flex-1 flex-col items-center justify-center px-5 py-6 sm:px-6 lg:px-8 lg:py-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex w-full max-w-4xl flex-col lg:max-w-5xl"
      >
        <header className="flex w-full items-center justify-between gap-4 overflow-visible sm:gap-6 lg:gap-10">
          <div className="min-w-0 text-left">
            <p className="text-xs uppercase tracking-[0.3em] text-gold/80 sm:text-sm sm:tracking-[0.35em] lg:text-base lg:tracking-[0.38em]">
              Teleturniej społecznościowo-satyryczny
            </p>
            <h1 className="mt-1.5 font-display text-5xl leading-[0.9] text-gold sm:mt-2 sm:text-6xl lg:mt-3 lg:text-8xl">
              Czyj to ryj?
            </h1>
          </div>
          <BeanHeadReveal className="relative z-10 h-32 w-32 shrink-0 translate-y-3 sm:h-44 sm:w-44 sm:translate-y-4 lg:h-56 lg:w-56 lg:translate-y-4 xl:h-60 xl:w-60" />
        </header>

        <div className="relative z-0 mt-4 w-full text-left sm:mt-5 lg:mt-6">
          <p className="text-base font-medium leading-snug text-cream sm:text-lg lg:text-xl">
            Najnowsza gra imprezowa, w której:
          </p>
          <ul className="mt-3 space-y-2.5 sm:mt-4 sm:space-y-3 lg:mt-4 lg:space-y-3">
            {HIGHLIGHTS.map((line) => (
              <li key={line} className="flex gap-2.5 sm:gap-3 lg:gap-3.5">
                <span
                  aria-hidden
                  className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-gold shadow-[0_0_10px_rgba(245,197,66,0.4)] sm:mt-2 sm:h-2.5 sm:w-2.5 lg:mt-2.5 lg:h-3 lg:w-3"
                />
                <span className="text-sm leading-snug text-cream/90 sm:text-base lg:text-lg lg:leading-snug">
                  {line}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6 flex w-full flex-row flex-wrap items-center gap-3 sm:mt-8 lg:mt-7 lg:gap-4">
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
