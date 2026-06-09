"use client";

import { useCallback, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { Button } from "@/components/ui/Button";
import { getCroppedImage } from "@/lib/crop/getCroppedImage";
import type { CropMeta } from "@/lib/types/tournament";

const MIN_ZOOM = 1;
const MAX_ZOOM = 15;

type CircularCropperProps = {
  imageSrc: string;
  onConfirm: (blob: Blob, meta: CropMeta) => void;
  onCancel: () => void;
};

export function CircularCropper({
  imageSrc,
  onConfirm,
  onCancel,
}: CircularCropperProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const handleConfirm = async () => {
    if (!croppedAreaPixels) return;
    setIsProcessing(true);
    try {
      const blob = await getCroppedImage(imageSrc, croppedAreaPixels);
      const meta: CropMeta = {
        crop: {
          x: croppedAreaPixels.x,
          y: croppedAreaPixels.y,
          width: croppedAreaPixels.width,
          height: croppedAreaPixels.height,
        },
        zoom,
        aspect: 1,
      };
      onConfirm(blob, meta);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div
        className="relative w-full overflow-hidden rounded-2xl bg-black"
        style={{ height: "min(60vh, 480px)" }}
      >
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={1}
          cropShape="round"
          showGrid={false}
          objectFit="contain"
          minZoom={MIN_ZOOM}
          maxZoom={MAX_ZOOM}
          zoomWithScroll
          zoomSpeed={0.08}
          disableAutomaticStylesInjection
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropComplete}
          style={{
            containerStyle: {
              width: "100%",
              height: "100%",
              position: "relative",
            },
          }}
        />
      </div>

      <div className="flex flex-col gap-3 px-2">
        <label className="text-sm text-cream/60">Powiększenie</label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={MIN_ZOOM}
            max={MAX_ZOOM}
            step={0.05}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full accent-gold"
          />
          <span className="w-12 shrink-0 text-right text-sm tabular-nums text-cream/50">
            {zoom.toFixed(1)}×
          </span>
        </div>
      </div>

      <div className="flex flex-wrap justify-end gap-3">
        <Button variant="ghost" onClick={onCancel}>
          Anuluj
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={!croppedAreaPixels || isProcessing}
        >
          {isProcessing ? "Zapisywanie…" : "Zatwierdź kadr"}
        </Button>
      </div>
    </div>
  );
}
