"use client";

import { motion } from "framer-motion";
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
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={onDrop}
      onClick={() => inputRef.current?.click()}
      className={`flex cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed px-8 py-12 transition-colors ${
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
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gold/15 text-gold">
        {isDragging ? (
          <Upload className="h-8 w-8" />
        ) : (
          <ImagePlus className="h-8 w-8" />
        )}
      </div>
      <div className="text-center">
        <p className="font-display text-xl text-cream">
          {isUploading ? "Wczytywanie zdjęć…" : "Przeciągnij zdjęcia lub kliknij"}
        </p>
        <p className="mt-1 text-sm text-cream/50">
          JPG, PNG, WEBP — wiele plików naraz
        </p>
      </div>
    </motion.div>
  );
}
