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
import { isImageFile } from "@/lib/images/fileToBlob";
import { clearTournament, loadTournament, saveTournament } from "@/lib/storage/tournamentStore";
import {
  allRoundsCropped,
  allRoundsReady,
  createEmptyTournament,
  type CropMeta,
  type FocusMarker,
  type TournamentState,
} from "@/lib/types/tournament";

type TournamentContextValue = {
  tournament: TournamentState;
  isLoading: boolean;
  isSaving: boolean;
  isReady: boolean;
  allCropped: boolean;
  allReady: boolean;
  setName: (name: string) => void;
  addPhotos: (files: File[]) => Promise<void>;
  removeRound: (id: string) => void;
  updateRoundCrop: (
    id: string,
    croppedImageBlob: Blob,
    cropCoordinates: CropMeta,
  ) => Promise<void>;
  updateRoundDetails: (
    id: string,
    details: { personName: string; focusMarker: FocusMarker },
  ) => void;
  resetTournament: () => Promise<void>;
  replaceTournament: (state: TournamentState) => void;
};

const TournamentContext = createContext<TournamentContextValue | null>(null);

const SAVE_DEBOUNCE_MS = 500;

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
          prev.rounds.length > 0 ? prev : stored,
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

  const addPhotos = useCallback(async (files: File[]) => {
    const imageFiles = files.filter(isImageFile);
    if (!imageFiles.length) return;

    const newRounds = await Promise.all(
      imageFiles.map((file) => createRoundFromFile(file)),
    );

    setTournament((prev) => ({
      ...prev,
      rounds: [...prev.rounds, ...newRounds],
    }));
  }, []);

  const removeRound = useCallback((id: string) => {
    setTournament((prev) => ({
      ...prev,
      rounds: prev.rounds.filter((r) => r.id !== id),
    }));
  }, []);

  const updateRoundCrop = useCallback(
    async (id: string, croppedImageBlob: Blob, cropCoordinates: CropMeta) => {
      const cropped = await withCroppedPreview(croppedImageBlob);

      setTournament((prev) => ({
        ...prev,
        rounds: prev.rounds.map((round) =>
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
        rounds: prev.rounds.map((round) =>
          round.id === id ? { ...round, ...details } : round,
        ),
      }));
    },
    [],
  );

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
      allCropped: allRoundsCropped(tournament.rounds),
      allReady: allRoundsReady(tournament.rounds),
      setName,
      addPhotos,
      removeRound,
      updateRoundCrop,
      updateRoundDetails,
      resetTournament,
      replaceTournament,
    }),
    [
      tournament,
      isLoading,
      isSaving,
      isReady,
      setName,
      addPhotos,
      removeRound,
      updateRoundCrop,
      updateRoundDetails,
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
