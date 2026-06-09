"use client";

type CropPreviewProps = {
  previewUrl: string | null;
  size?: number;
  className?: string;
};

export function CropPreview({
  previewUrl,
  size = 64,
  className = "",
}: CropPreviewProps) {
  if (!previewUrl?.startsWith("data:image/")) {
    return (
      <div
        className={`flex items-center justify-center rounded-full bg-white/5 text-cream/30 ${className}`}
        style={{ width: size, height: size }}
      >
        ?
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- data URL preview
    <img
      src={previewUrl}
      alt="Podgląd detalu"
      width={size}
      height={size}
      className={`rounded-full object-cover ring-2 ring-gold/30 ${className}`}
    />
  );
}
