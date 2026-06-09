"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  clearCelebrationSignaling,
  clearCelebrationState,
  requestCelebration,
  setCelebrationActive,
} from "@/lib/scores/roomService";
import {
  acquireCameraStream,
  getCameraErrorMessage,
} from "@/lib/webrtc/camera";
import {
  closeCelebrationPeerSession,
  startPublisherSession,
  startViewerSession,
  stopMediaStream,
  type CelebrationPeerSession,
  type CelebrationStreamStatus,
} from "@/lib/webrtc/celebrationPeer";
import {
  resetPublisherSignaling,
  resetViewerSignaling,
} from "@/lib/webrtc/celebrationSignaling";

export type UseCelebrationViewerResult = {
  status: CelebrationStreamStatus;
  error: string | null;
  remoteStream: MediaStream | null;
  isOpen: boolean;
  openStream: () => Promise<void>;
  closeStream: () => Promise<void>;
};

export function useCelebrationViewer(
  roomCode: string | null,
): UseCelebrationViewerResult {
  const [status, setStatus] = useState<CelebrationStreamStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const sessionRef = useRef<CelebrationPeerSession | null>(null);

  const closeStream = useCallback(async () => {
    closeCelebrationPeerSession(sessionRef.current);
    sessionRef.current = null;
    setRemoteStream(null);
    setStatus("idle");
    setError(null);
    setIsOpen(false);

    if (roomCode) {
      await clearCelebrationSignaling(roomCode);
      await clearCelebrationState(roomCode);
    }
  }, [roomCode]);

  const openStream = useCallback(async () => {
    if (!roomCode) {
      setError("Brak kodu sesji punktacji.");
      setStatus("error");
      return;
    }

    setIsOpen(true);
    setError(null);
    setStatus("waiting");

    await resetViewerSignaling(roomCode);
    await requestCelebration(roomCode);

    try {
      sessionRef.current = await startViewerSession(
        roomCode,
        (stream) => setRemoteStream(stream),
        setStatus,
        (message) => {
          setError(message);
          setStatus("error");
        },
      );
    } catch {
      setStatus("error");
      setError("Nie udało się uruchomić odbioru wideo.");
    }
  }, [roomCode]);

  useEffect(() => {
    return () => {
      if (sessionRef.current && roomCode) {
        void clearCelebrationSignaling(roomCode);
        void clearCelebrationState(roomCode);
      }
      closeCelebrationPeerSession(sessionRef.current);
      sessionRef.current = null;
    };
  }, [roomCode]);

  return {
    status,
    error,
    remoteStream,
    isOpen,
    openStream,
    closeStream,
  };
}

export type UseCelebrationPublisherResult = {
  status: CelebrationStreamStatus;
  error: string | null;
  localStream: MediaStream | null;
  isPublishing: boolean;
  startPublishing: () => Promise<void>;
  stopPublishing: () => Promise<void>;
};

export function useCelebrationPublisher(
  roomCode: string | null,
): UseCelebrationPublisherResult {
  const [status, setStatus] = useState<CelebrationStreamStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const sessionRef = useRef<CelebrationPeerSession | null>(null);

  const stopPublishing = useCallback(async () => {
    closeCelebrationPeerSession(sessionRef.current);
    sessionRef.current = null;
    setLocalStream(null);
    setIsPublishing(false);
    setStatus("idle");
    setError(null);

    if (roomCode) {
      await clearCelebrationSignaling(roomCode);
      await clearCelebrationState(roomCode);
    }
  }, [roomCode]);

  const startPublishing = useCallback(async () => {
    if (!roomCode) {
      setError("Brak kodu sesji.");
      setStatus("error");
      return;
    }

    if (sessionRef.current) return;

    setError(null);

    // iOS wymaga getUserMedia bezpośrednio z gestu użytkownika — przed await do Firebase.
    let stream: MediaStream;
    try {
      stream = await acquireCameraStream();
    } catch (err) {
      setError(getCameraErrorMessage(err));
      setStatus("error");
      return;
    }

    setLocalStream(stream);
    setIsPublishing(true);

    try {
      await resetPublisherSignaling(roomCode);
      await setCelebrationActive(roomCode, true);

      const session = await startPublisherSession(
        roomCode,
        setStatus,
        (message) => {
          setError(message);
          setStatus("error");
        },
        stream,
      );
      sessionRef.current = session;
    } catch {
      stopMediaStream(stream);
      setLocalStream(null);
      setIsPublishing(false);
      await clearCelebrationState(roomCode);
    }
  }, [roomCode]);

  useEffect(() => {
    return () => {
      if (sessionRef.current && roomCode) {
        void clearCelebrationSignaling(roomCode);
        void clearCelebrationState(roomCode);
      }
      closeCelebrationPeerSession(sessionRef.current);
      sessionRef.current = null;
    };
  }, [roomCode]);

  return {
    status,
    error,
    localStream,
    isPublishing,
    startPublishing,
    stopPublishing,
  };
}
