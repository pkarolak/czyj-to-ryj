"use client";

import { ImagePlus, Upload } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { useTournament } from "@/context/TournamentContext";

export function PhotoUpload() {
  const { addPhotos } = useTournament();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files?.length) return;
      setIsUploading(true);
      try {
        await addPhotos(Array.from(files));
      } finally {
        setIsUploading(false);
        if (inputRef.current) inputRef.current.value = "";
      }
    },
    [addPhotos],
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles],
  );

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={onDrop}
      onClick={() => inputRef.current?.click()}
      className={`flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed p-3 transition-colors ${
        isDragging
          ? "border-gold bg-gold/10"
          : "border-white/15 bg-white/[0.02] hover:border-gold/50 hover:bg-white/[0.04]"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <div className="flex h-[72px] w-[72px] items-center justify-center rounded-lg bg-gold/10 text-gold">
        {isDragging || isUploading ? (
          <Upload className="h-7 w-7" />
        ) : (
          <ImagePlus className="h-7 w-7" />
        )}
      </div>
      <span className="text-center text-xs text-cream/60">
        {isUploading ? "Wczytywanie…" : "Dodaj zdjęcia"}
      </span>
      <span className="text-center text-xs text-cream/40">Przeciągnij lub kliknij</span>
    </div>
  );
}
