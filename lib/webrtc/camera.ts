export async function acquireCameraStream(): Promise<MediaStream> {
  if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
    throw new Error("unsupported");
  }

  try {
    return await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: "environment" } },
      audio: false,
    });
  } catch {
    return await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false,
    });
  }
}

export function getCameraErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message === "unsupported") {
    return "Przeglądarka nie obsługuje kamery. Użyj Safari lub Chrome na HTTPS.";
  }
  return "Brak dostępu do kamery. Zezwól na kamerę w ustawieniach przeglądarki.";
}
