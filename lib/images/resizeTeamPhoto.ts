/** Maks. rozmiar pliku z telefonu przed kompresją. */
export const TEAM_PHOTO_MAX_INPUT_BYTES = 15 * 1024 * 1024;

/** Docelowy dłuższy bok po skalowaniu (wystarczy na awatar drużyny). */
const TEAM_PHOTO_MAX_DIMENSION = 800;

const TEAM_PHOTO_JPEG_QUALITY = 0.82;

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Nie udało się wczytać zdjęcia."));
    };
    img.src = url;
  });
}

/**
 * Skaluje i kompresuje zdjęcie drużyny do data URL (JPEG).
 * Akceptuje duże pliki z telefonu, zapisuje lekką wersję do Firebase.
 */
export async function resizeTeamPhotoToDataUrl(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Wybierz plik graficzny.");
  }
  if (file.size > TEAM_PHOTO_MAX_INPUT_BYTES) {
    throw new Error(
      `Zdjęcie jest za duże (max ${Math.round(TEAM_PHOTO_MAX_INPUT_BYTES / 1024 / 1024)} MB).`,
    );
  }

  const img = await loadImageFromFile(file);
  const { naturalWidth: w, naturalHeight: h } = img;
  if (!w || !h) throw new Error("Nieprawidłowe wymiary zdjęcia.");

  const scale = Math.min(1, TEAM_PHOTO_MAX_DIMENSION / Math.max(w, h));
  const outW = Math.max(1, Math.round(w * scale));
  const outH = Math.max(1, Math.round(h * scale));

  const canvas = document.createElement("canvas");
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Nie udało się przetworzyć zdjęcia.");

  ctx.drawImage(img, 0, 0, outW, outH);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => {
        if (result) resolve(result);
        else reject(new Error("Kompresja zdjęcia nie powiodła się."));
      },
      "image/jpeg",
      TEAM_PHOTO_JPEG_QUALITY,
    );
  });

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("Nie udało się odczytać zdjęcia."));
    };
    reader.onerror = () =>
      reject(reader.error ?? new Error("Nie udało się odczytać zdjęcia."));
    reader.readAsDataURL(blob);
  });
}
