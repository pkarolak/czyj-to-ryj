const EXT_MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  heic: "image/heic",
  heif: "image/heif",
};

export function guessImageMime(name: string): string {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  return EXT_MIME[ext] ?? "image/jpeg";
}

function normalizeMimeType(type: string, name: string): string {
  const mime = type.toLowerCase().trim();
  if (mime === "image/jpg" || mime === "image/pjpeg") return "image/jpeg";
  if (mime.startsWith("image/")) return mime;
  return guessImageMime(name);
}

export function detectMimeFromBytes(bytes: Uint8Array): string | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  ) {
    return "image/png";
  }
  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return "image/webp";
  }
  if (bytes.length >= 6 && bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) {
    return "image/gif";
  }
  return null;
}

export function isImageFile(file: File): boolean {
  if (file.type.startsWith("image/")) return true;
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  return ext in EXT_MIME;
}

export async function normalizeImageBlob(
  blob: Blob,
  fileName = "image.jpg",
): Promise<Blob> {
  const buffer = await blob.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  if (bytes.length === 0) {
    throw new Error("Pusty plik obrazu.");
  }

  const detected = detectMimeFromBytes(bytes);
  const type = detected ?? normalizeMimeType(blob.type, fileName);
  return new Blob([buffer], { type });
}

export async function fileToImageBlob(file: File): Promise<Blob> {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  const detected = detectMimeFromBytes(bytes);
  const type =
    detected ?? normalizeMimeType(file.type, file.name);

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!detected && !file.type.startsWith("image/") && !(ext in EXT_MIME)) {
    throw new Error("Nieobsługiwany format pliku.");
  }

  return new Blob([buffer], { type });
}

export function isValidImageBlob(blob: unknown): blob is Blob {
  return blob instanceof Blob && blob.size > 0;
}

async function blobToDataUrlNode(blob: Blob): Promise<string> {
  const buffer = await blob.arrayBuffer();
  const mime = blob.type || "application/octet-stream";
  const base64 = Buffer.from(buffer).toString("base64");
  return `data:${mime};base64,${base64}`;
}

export function blobToDataUrl(blob: Blob): Promise<string> {
  if (typeof FileReader === "undefined") {
    return blobToDataUrlNode(blob);
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error ?? new Error("Nie udało się odczytać obrazu."));
    reader.readAsDataURL(blob);
  });
}

export async function verifyImageBlob(blob: Blob): Promise<boolean> {
  if (!isValidImageBlob(blob)) return false;
  try {
    if (typeof createImageBitmap === "function") {
      const bitmap = await createImageBitmap(blob);
      const ok = bitmap.width > 0 && bitmap.height > 0;
      bitmap.close();
      return ok;
    }
    return await new Promise((resolve) => {
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve(img.naturalWidth > 0 && img.naturalHeight > 0);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(false);
      };
      img.src = url;
    });
  } catch {
    return false;
  }
}
