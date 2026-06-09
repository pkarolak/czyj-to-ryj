"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { computeMarkerLayout } from "@/lib/images/objectContain";
import type { FocusMarker } from "@/lib/types/tournament";

type FocusMarkerOnImageProps = {
  marker: FocusMarker;
  imageRef: React.RefObject<HTMLImageElement | null>;
  overlayRef: React.RefObject<HTMLElement | null>;
  animate?: boolean;
  pulse?: boolean;
  /** Zmiana wymusza ponowne przeliczenie (np. po animacji layout). */
  recalcToken?: number;
};

export function FocusMarkerOnImage({
  marker,
  imageRef,
  overlayRef,
  animate = false,
  pulse = false,
  recalcToken = 0,
}: FocusMarkerOnImageProps) {
  const [layout, setLayout] = useState<{
    cx: number;
    cy: number;
    r: number;
  } | null>(null);

  useEffect(() => {
    const update = () => {
      const img = imageRef.current;
      const overlay = overlayRef.current;
      if (!img || !overlay) return;

      const next = computeMarkerLayout(marker, img, overlay);
      if (next) setLayout(next);
    };

    update();

    const img = imageRef.current;
    img?.addEventListener("load", update);
    window.addEventListener("resize", update);

    const observer = new ResizeObserver(update);
    if (img) observer.observe(img);
    if (overlayRef.current) observer.observe(overlayRef.current);

    // Po animacji layout (Framer Motion) wymiary mogą się zmienić bez resize.
    const raf = requestAnimationFrame(update);
    const t1 = window.setTimeout(update, 100);
    const t2 = window.setTimeout(update, 500);
    const t3 = window.setTimeout(update, 2600);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
      img?.removeEventListener("load", update);
      window.removeEventListener("resize", update);
      observer.disconnect();
    };
  }, [marker, imageRef, overlayRef, recalcToken]);

  if (!layout) return null;

  return (
    <motion.div
      initial={animate ? { scale: 0, opacity: 0 } : false}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className="pointer-events-none absolute rounded-full border-[3px] border-gold shadow-[0_0_20px_rgba(245,197,66,0.5)]"
      style={{
        left: layout.cx - layout.r,
        top: layout.cy - layout.r,
        width: layout.r * 2,
        height: layout.r * 2,
        animation: pulse ? "marker-pulse 1.5s ease-in-out infinite" : undefined,
      }}
    />
  );
}
