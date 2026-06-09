"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

function MysterySilhouette() {
  return (
    <svg viewBox="0 0 200 240" className="h-full w-full" aria-hidden>
      <ellipse
        cx="100"
        cy="118"
        rx="72"
        ry="88"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        className="text-gold/75"
      />
      <ellipse
        cx="100"
        cy="108"
        rx="58"
        ry="70"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeDasharray="6 8"
        className="text-gold/30"
      />
      <text
        x="100"
        y="136"
        textAnchor="middle"
        className="fill-gold font-display text-[76px] font-bold"
      >
        ?
      </text>
    </svg>
  );
}

type BeanHeadRevealProps = {
  photoSrc?: string;
  className?: string;
};

export function BeanHeadReveal({
  photoSrc = "/bean-head.png",
  className = "h-32 w-32 sm:h-40 sm:w-40",
}: BeanHeadRevealProps) {
  const reduceMotion = useReducedMotion();
  const [revealed, setRevealed] = useState(reduceMotion === true);

  useEffect(() => {
    if (reduceMotion) return;

    const revealTimer = window.setTimeout(() => setRevealed(true), 2400);
    return () => window.clearTimeout(revealTimer);
  }, [reduceMotion]);

  return (
    <div
      className={`relative shrink-0 ${className}`}
      aria-hidden
    >
      <div className="absolute inset-0 rounded-full bg-gold/5 ring-2 ring-gold/30 shadow-[0_16px_48px_rgba(0,0,0,0.45),0_0_40px_rgba(245,197,66,0.2)]" />

      <div className="relative h-full w-full" style={{ perspective: 900 }}>
        <motion.div
          className="relative h-full w-full"
          style={{ transformStyle: "preserve-3d" }}
          initial={{ rotateY: 0 }}
          animate={{ rotateY: revealed ? 180 : 0 }}
          transition={{
            duration: reduceMotion ? 0 : 1,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <div
            className="absolute inset-0 flex items-center justify-center rounded-full bg-ink/90 p-6 sm:p-7"
            style={{ backfaceVisibility: "hidden" }}
          >
            <MysterySilhouette />
          </div>

          <div
            className="absolute inset-0 overflow-hidden rounded-full ring-2 ring-gold/40"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photoSrc}
              alt=""
              className="h-full w-full object-cover"
            />
          </div>
        </motion.div>
      </div>

      {!revealed && !reduceMotion && (
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-full ring-2 ring-gold/50"
          animate={{ opacity: [0.3, 0.9, 0.3] }}
          transition={{ repeat: Infinity, duration: 1.8 }}
        />
      )}
    </div>
  );
}
