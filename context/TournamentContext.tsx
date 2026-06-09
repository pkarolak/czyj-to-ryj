"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createRoundFromFile, withCroppedPreview } from "@/lib/images/createRoundFromFile";
import { isImageFile, normalizeImageBlob, blobToDataUrl } from "@/lib/images/fileToBlob";
import { clearTournament, loadTournament, saveTournament } from "@/lib/storage/tournamentStore";
import {
  allRoundsCropped,
  allRoundsReady,
  createEmptyTournament,
  isShowReady,
  type CompetitionId,
  type CropMeta,
  type FocusMarker,
  type HarmonyRound,
  type TriviaRound,
  type TournamentState,
} from "@/lib/types/tournament";

type TournamentContextValue = {
  tournament: TournamentState;
  isLoading: boolean;
  isSaving: boolean;
  isReady: boolean;
  allCropped: boolean;
  allReady: boolean;
  showReady: boolean;
  setName: (name: string) => void;
  setShowOrder: (order: CompetitionId[]) => void;
  setTimerSeconds: (category: CompetitionId, seconds: number) => void;
  addPhotos: (files: File[]) => Promise<void>;
  removeFaceRound: (id: string) => void;
  updateRoundCrop: (
    id: string,
    croppedImageBlob: Blob,
    cropCoordinates: CropMeta,
  ) => Promise<void>;
  updateRoundDetails: (
    id: string,
    details: { personName: string; focusMarker: FocusMarker },
  ) => void;
  addHarmonyRound: (round: Omit<HarmonyRound, "id">) => void;
  updateHarmonyRound: (id: string, round: Omit<HarmonyRound, "id">) => void;
  removeHarmonyRound: (id: string) => void;
  addTriviaRound: (round: Omit<TriviaRound, "id" | "imageBlob" | "imagePreviewUrl">, image?: File | null) => Promise<void>;
  updateTriviaRound: (
    id: string,
    round: Omit<TriviaRound, "id" | "imageBlob" | "imagePreviewUrl">,
    image?: File | null,
    removeImage?: boolean,
  ) => Promise<void>;
  removeTriviaRound: (id: string) => void;
  resetTournament: () => Promise<void>;
  replaceTournament: (state: TournamentState) => void;
};

const TournamentContext = createContext<TournamentContextValue | null>(null);

const SAVE_DEBOUNCE_MS = 500;

function hasAnyContent(state: TournamentState): boolean {
  return (
    state.faceRounds.length > 0 ||
    state.harmonyRounds.length > 0 ||
    state.triviaRounds.length > 0
  );
}

export function TournamentProvider({ children }: { children: ReactNode }) {
  const [tournament, setTournament] = useState<TournamentState>(
    createEmptyTournament(),
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipSave = useRef(true);

  useEffect(() => {
    loadTournament()
      .then((stored) => {
        if (!stored) return;
        setTournament((prev) =>
          hasAnyContent(prev) ? prev : stored,
        );
      })
      .finally(() => {
        setIsLoading(false);
        setIsReady(true);
        skipSave.current = false;
      });
  }, []);

  useEffect(() => {
    if (!isReady || skipSave.current) return;

    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      setIsSaving(true);
      const next = { ...tournament, updatedAt: new Date().toISOString() };
      saveTournament(next)
        .catch(console.error)
        .finally(() => setIsSaving(false));
    }, SAVE_DEBOUNCE_MS);

    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [tournament, isReady]);

  const setName = useCallback((name: string) => {
    setTournament((prev) => ({ ...prev, name }));
  }, []);

  const setShowOrder = useCallback((order: CompetitionId[]) => {
    setTournament((prev) => ({ ...prev, showOrder: order }));
  }, []);

  const setTimerSeconds = useCallback(
    (category: CompetitionId, seconds: number) => {
      setTournament((prev) => ({
        ...prev,
        timerSeconds: {
          ...prev.timerSeconds,
          [category]: seconds,
        },
      }));
    },
    [],
  );

  const addPhotos = useCallback(async (files: File[]) => {
    const imageFiles = files.filter(isImageFile);
    if (!imageFiles.length) return;

    const newRounds = await Promise.all(
      imageFiles.map((file) => createRoundFromFile(file)),
    );

    setTournament((prev) => ({
      ...prev,
      faceRounds: [...prev.faceRounds, ...newRounds],
    }));
  }, []);

  const removeFaceRound = useCallback((id: string) => {
    setTournament((prev) => ({
      ...prev,
      faceRounds: prev.faceRounds.filter((r) => r.id !== id),
    }));
  }, []);

  const updateRoundCrop = useCallback(
    async (id: string, croppedImageBlob: Blob, cropCoordinates: CropMeta) => {
      const cropped = await withCroppedPreview(croppedImageBlob);

      setTournament((prev) => ({
        ...prev,
        faceRounds: prev.faceRounds.map((round) =>
          round.id === id
            ? {
                ...round,
                ...cropped,
                cropCoordinates,
                focusMarker: null,
              }
            : round,
        ),
      }));
    },
    [],
  );

  const updateRoundDetails = useCallback(
    (id: string, details: { personName: string; focusMarker: FocusMarker }) => {
      setTournament((prev) => ({
        ...prev,
        faceRounds: prev.faceRounds.map((round) =>
          round.id === id ? { ...round, ...details } : round,
        ),
      }));
    },
    [],
  );

  const addHarmonyRound = useCallback((round: Omit<HarmonyRound, "id">) => {
    setTournament((prev) => ({
      ...prev,
      harmonyRounds: [
        ...prev.harmonyRounds,
        { ...round, id: crypto.randomUUID() },
      ],
    }));
  }, []);

  const updateHarmonyRound = useCallback(
    (id: string, round: Omit<HarmonyRound, "id">) => {
      setTournament((prev) => ({
        ...prev,
        harmonyRounds: prev.harmonyRounds.map((r) =>
          r.id === id ? { ...round, id } : r,
        ),
      }));
    },
    [],
  );

  const removeHarmonyRound = useCallback((id: string) => {
    setTournament((prev) => ({
      ...prev,
      harmonyRounds: prev.harmonyRounds.filter((r) => r.id !== id),
    }));
  }, []);

  const processTriviaImage = async (
    image?: File | null,
    removeImage?: boolean,
    existing?: TriviaRound,
  ): Promise<{ imageBlob: Blob | null; imagePreviewUrl: string | null }> => {
    if (removeImage) return { imageBlob: null, imagePreviewUrl: null };
    if (!image) {
      return {
        imageBlob: existing?.imageBlob ?? null,
        imagePreviewUrl: existing?.imagePreviewUrl ?? null,
      };
    }
    const blob = await normalizeImageBlob(image, image.name);
    return {
      imageBlob: blob,
      imagePreviewUrl: await blobToDataUrl(blob),
    };
  };

  const addTriviaRound = useCallback(
    async (
      round: Omit<TriviaRound, "id" | "imageBlob" | "imagePreviewUrl">,
      image?: File | null,
    ) => {
      const { imageBlob, imagePreviewUrl } = await processTriviaImage(image);
      setTournament((prev) => ({
        ...prev,
        triviaRounds: [
          ...prev.triviaRounds,
          { ...round, id: crypto.randomUUID(), imageBlob, imagePreviewUrl },
        ],
      }));
    },
    [],
  );

  const updateTriviaRound = useCallback(
    async (
      id: string,
      round: Omit<TriviaRound, "id" | "imageBlob" | "imagePreviewUrl">,
      image?: File | null,
      removeImage?: boolean,
    ) => {
      let existing: TriviaRound | undefined;
      setTournament((prev) => {
        existing = prev.triviaRounds.find((r) => r.id === id);
        return prev;
      });
      const { imageBlob, imagePreviewUrl } = await processTriviaImage(
        image,
        removeImage,
        existing,
      );
      setTournament((prev) => ({
        ...prev,
        triviaRounds: prev.triviaRounds.map((r) =>
          r.id === id
            ? { ...round, id, imageBlob, imagePreviewUrl }
            : r,
        ),
      }));
    },
    [],
  );

  const removeTriviaRound = useCallback((id: string) => {
    setTournament((prev) => ({
      ...prev,
      triviaRounds: prev.triviaRounds.filter((r) => r.id !== id),
    }));
  }, []);

  const resetTournament = useCallback(async () => {
    skipSave.current = true;
    await clearTournament();
    setTournament(createEmptyTournament());
    skipSave.current = false;
  }, []);

  const replaceTournament = useCallback((state: TournamentState) => {
    setTournament(state);
  }, []);

  const value = useMemo<TournamentContextValue>(
    () => ({
      tournament,
      isLoading,
      isSaving,
      isReady,
      allCropped: allRoundsCropped(tournament.faceRounds),
      allReady: allRoundsReady(tournament.faceRounds),
      showReady: isShowReady(tournament),
      setName,
      setShowOrder,
      setTimerSeconds,
      addPhotos,
      removeFaceRound,
      updateRoundCrop,
      updateRoundDetails,
      addHarmonyRound,
      updateHarmonyRound,
      removeHarmonyRound,
      addTriviaRound,
      updateTriviaRound,
      removeTriviaRound,
      resetTournament,
      replaceTournament,
    }),
    [
      tournament,
      isLoading,
      isSaving,
      isReady,
      setName,
      setShowOrder,
      setTimerSeconds,
      addPhotos,
      removeFaceRound,
      updateRoundCrop,
      updateRoundDetails,
      addHarmonyRound,
      updateHarmonyRound,
      removeHarmonyRound,
      addTriviaRound,
      updateTriviaRound,
      removeTriviaRound,
      resetTournament,
      replaceTournament,
    ],
  );

  return (
    <TournamentContext.Provider value={value}>
      {children}
    </TournamentContext.Provider>
  );
}

export function useTournament() {
  const ctx = useContext(TournamentContext);
  if (!ctx) {
    throw new Error("useTournament must be used within TournamentProvider");
  }
  return ctx;
}
