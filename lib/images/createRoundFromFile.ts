import {
  blobToDataUrl,
  fileToImageBlob,
  normalizeImageBlob,
} from "@/lib/images/fileToBlob";
import type { RoundEntry } from "@/lib/types/tournament";

export async function createRoundFromFile(file: File): Promise<RoundEntry> {
  const blob = await fileToImageBlob(file);
  const originalPreviewUrl = await blobToDataUrl(blob);

  return {
    id: crypto.randomUUID(),
    originalImageBlob: blob,
    originalPreviewUrl,
    croppedImageBlob: null,
    croppedPreviewUrl: null,
    cropCoordinates: null,
  };
}

export async function createRoundFromBlob(
  blob: Blob,
  id: string,
  fileName: string,
): Promise<RoundEntry> {
  const normalized = await normalizeImageBlob(blob, fileName);
  const originalPreviewUrl = await blobToDataUrl(normalized);

  return {
    id,
    originalImageBlob: normalized,
    originalPreviewUrl,
    croppedImageBlob: null,
    croppedPreviewUrl: null,
    cropCoordinates: null,
  };
}

export async function withCroppedPreview(croppedImageBlob: Blob): Promise<{
  croppedImageBlob: Blob;
  croppedPreviewUrl: string;
}> {
  const croppedPreviewUrl = await blobToDataUrl(croppedImageBlob);
  return { croppedImageBlob, croppedPreviewUrl };
}
