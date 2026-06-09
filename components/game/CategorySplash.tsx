"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";

type CategorySplashProps = {
  title: string;
  onContinue: () => void;
};

export function CategorySplash({ title, onContinue }: CategorySplashProps) {
  return (
    <motion.div
      key={title}
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.1 }}
      transition={{ duration: 0.5 }}
      className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center"
    >
      <p className="text-sm uppercase tracking-[0.5em] text-gold/60">
        Następna kategoria
      </p>
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="mt-4 font-display text-5xl leading-tight text-gold sm:text-7xl lg:text-8xl"
      >
        {title}
      </motion.h1>
      <Button
        size="lg"
        className="mt-14 px-16 py-6 text-2xl"
        onClick={onContinue}
      >
        START
      </Button>
    </motion.div>
  );
}
