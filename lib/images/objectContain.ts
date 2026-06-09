import type { FocusMarker } from "@/lib/types/tournament";

export type ObjectContainRect = {
  displayW: number;
  displayH: number;
  offsetX: number;
  offsetY: number;
};

export function getObjectContainRect(
  containerW: number,
  containerH: number,
  naturalW: number,
  naturalH: number,
): ObjectContainRect {
  if (naturalW <= 0 || naturalH <= 0) {
    return { displayW: containerW, displayH: containerH, offsetX: 0, offsetY: 0 };
  }

  const imageAspect = naturalW / naturalH;
  const containerAspect = containerW / containerH;

  if (imageAspect > containerAspect) {
    const displayW = containerW;
    const displayH = containerW / imageAspect;
    return {
      displayW,
      displayH,
      offsetX: 0,
      offsetY: (containerH - displayH) / 2,
    };
  }

  const displayH = containerH;
  const displayW = containerH * imageAspect;
  return {
    displayW,
    displayH,
    offsetX: (containerW - displayW) / 2,
    offsetY: 0,
  };
}

/** Współrzędne kliknięcia → pozycja na zdjęciu (0–1), wg faktycznego renderu img. */
export function pointerToImageNormalized(
  clientX: number,
  clientY: number,
  img: HTMLImageElement,
): { x: number; y: number } | null {
  if (!img.naturalWidth || !img.naturalHeight) return null;

  const imgRect = img.getBoundingClientRect();
  const localX = clientX - imgRect.left;
  const localY = clientY - imgRect.top;
  const { displayW, displayH, offsetX, offsetY } = getObjectContainRect(
    imgRect.width,
    imgRect.height,
    img.naturalWidth,
    img.naturalHeight,
  );

  const x = (localX - offsetX) / displayW;
  const y = (localY - offsetY) / displayH;

  if (x < 0 || x > 1 || y < 0 || y > 1) return null;
  return { x, y };
}

export type MarkerLayout = {
  cx: number;
  cy: number;
  r: number;
};

/** Pozycja markera względem elementu overlay (absolute inset-0). */
export function computeMarkerLayout(
  marker: FocusMarker,
  img: HTMLImageElement,
  overlayEl: HTMLElement,
): MarkerLayout | null {
  if (!img.naturalWidth || !img.naturalHeight) return null;

  const overlayRect = overlayEl.getBoundingClientRect();
  const imgRect = img.getBoundingClientRect();
  const { displayW, displayH, offsetX, offsetY } = getObjectContainRect(
    imgRect.width,
    imgRect.height,
    img.naturalWidth,
    img.naturalHeight,
  );

  const imgLeft = imgRect.left - overlayRect.left;
  const imgTop = imgRect.top - overlayRect.top;

  return {
    cx: imgLeft + offsetX + marker.x * displayW,
    cy: imgTop + offsetY + marker.y * displayH,
    r: marker.radius * Math.min(displayW, displayH),
  };
}
