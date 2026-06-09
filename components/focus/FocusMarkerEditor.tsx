"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FocusMarkerOnImage } from "@/components/focus/FocusMarkerOverlay";
import { pointerToImageNormalized } from "@/lib/images/objectContain";
import {
  DEFAULT_FOCUS_MARKER,
  type FocusMarker,
} from "@/lib/types/tournament";

type FocusMarkerEditorProps = {
  imageSrc: string;
  marker: FocusMarker;
  onChange: (marker: FocusMarker) => void;
};

export function FocusMarkerEditor({
  imageSrc,
  marker,
  onChange,
}: FocusMarkerEditorProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const placeMarker = useCallback(
    (clientX: number, clientY: number) => {
      const img = imgRef.current;
      if (!img?.naturalWidth) return;

      const pos = pointerToImageNormalized(clientX, clientY, img);
      if (!pos) return;
      onChange({ ...marker, x: pos.x, y: pos.y });
    },
    [marker, onChange],
  );

  useEffect(() => {
    if (!isDragging) return;

    const onMove = (e: PointerEvent) => placeMarker(e.clientX, e.clientY);
    const onUp = () => setIsDragging(false);

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [isDragging, placeMarker]);

  return (
    <div className="flex flex-col gap-4">
      <div
        ref={overlayRef}
        className="relative mx-auto w-full max-w-2xl cursor-crosshair overflow-hidden rounded-2xl bg-black ring-1 ring-white/10"
        style={{ height: "min(50vh, 420px)" }}
        onPointerDown={(e) => {
          if (e.button !== 0) return;
          setIsDragging(true);
          placeMarker(e.clientX, e.clientY);
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={imgRef}
          src={imageSrc}
          alt="Zaznacz postać"
          className="block h-full w-full object-contain"
          draggable={false}
        />
        <FocusMarkerOnImage
          marker={marker}
          imageRef={imgRef}
          overlayRef={overlayRef}
        />
      </div>

      <div className="flex flex-col gap-2 px-1">
        <label className="text-sm text-cream/60">
          Rozmiar kółeczka — {Math.round(marker.radius * 100)}%
        </label>
        <input
          type="range"
          min={0.03}
          max={0.2}
          step={0.005}
          value={marker.radius}
          onChange={(e) =>
            onChange({ ...marker, radius: Number(e.target.value) })
          }
          className="w-full accent-gold"
        />
        <p className="text-xs text-cream/40">
          Kliknij lub przeciągnij na zdjęciu, aby ustawić marker. Pokaże widzom,
          gdzie szukać postaci.
        </p>
      </div>
    </div>
  );
}

export function createInitialMarker(
  existing: FocusMarker | null,
): FocusMarker {
  return existing ?? { ...DEFAULT_FOCUS_MARKER };
}
