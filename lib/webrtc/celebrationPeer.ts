import {
  pushIceCandidate,
  subscribeAnswer,
  subscribeOffer,
  subscribeRemoteIce,
  writeAnswer,
  writeOffer,
} from "@/lib/webrtc/celebrationSignaling";
import { createCelebrationPeerConnection } from "@/lib/webrtc/iceConfig";

export type CelebrationStreamStatus =
  | "idle"
  | "waiting"
  | "connecting"
  | "connected"
  | "error";

export type CelebrationPeerSession = {
  pc: RTCPeerConnection;
  unsubscribers: Array<() => void>;
  localStream: MediaStream | null;
};

export function stopMediaStream(stream: MediaStream | null): void {
  stream?.getTracks().forEach((track) => track.stop());
}

export function closeCelebrationPeerSession(
  session: CelebrationPeerSession | null,
): void {
  if (!session) return;
  session.unsubscribers.forEach((unsub) => unsub());
  stopMediaStream(session.localStream);
  session.pc.close();
}

function createIceQueue(pc: RTCPeerConnection) {
  const pending: RTCIceCandidateInit[] = [];

  return {
    async push(candidate: RTCIceCandidateInit) {
      if (!candidate.candidate) return;
      if (!pc.remoteDescription) {
        pending.push(candidate);
        return;
      }
      try {
        await pc.addIceCandidate(candidate);
      } catch {
        // Ignoruj duplikaty / przestarzałe kandydaty ICE.
      }
    },
    async flush() {
      const batch = pending.splice(0, pending.length);
      for (const candidate of batch) {
        try {
          await pc.addIceCandidate(candidate);
        } catch {
          // Ignoruj błędy pojedynczych kandydatów.
        }
      }
    },
  };
}

export async function startViewerSession(
  roomCode: string,
  onRemoteStream: (stream: MediaStream) => void,
  onStatus: (status: CelebrationStreamStatus) => void,
  onError: (message: string) => void,
): Promise<CelebrationPeerSession> {
  const pc = createCelebrationPeerConnection();
  const iceQueue = createIceQueue(pc);
  const unsubscribers: Array<() => void> = [];
  let answered = false;

  pc.ontrack = (event) => {
    const [stream] = event.streams;
    if (stream) {
      onRemoteStream(stream);
      onStatus("connected");
    }
  };

  pc.onconnectionstatechange = () => {
    if (pc.connectionState === "failed") {
      onStatus("error");
      onError("Połączenie nie powiodło się. Sprawdź sieć telefonu i rzutnika.");
    }
  };

  unsubscribers.push(
    subscribeOffer(roomCode, (offer) => {
      if (answered) return;
      answered = true;
      onStatus("connecting");

      void (async () => {
        try {
          await pc.setRemoteDescription(offer);
          await iceQueue.flush();
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          await writeAnswer(roomCode, answer);
        } catch {
          onStatus("error");
          onError("Nie udało się zestawić połączenia wideo.");
        }
      })();
    }),
  );

  unsubscribers.push(
    subscribeRemoteIce(roomCode, "callee", (candidate) => {
      void iceQueue.push(candidate);
    }),
  );

  pc.onicecandidate = (event) => {
    if (event.candidate) {
      void pushIceCandidate(roomCode, "callee", event.candidate.toJSON());
    }
  };

  onStatus("waiting");

  return { pc, unsubscribers, localStream: null };
}

export async function startPublisherSession(
  roomCode: string,
  onStatus: (status: CelebrationStreamStatus) => void,
  onError: (message: string) => void,
): Promise<CelebrationPeerSession> {
  let localStream: MediaStream;
  try {
    localStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: "environment" } },
      audio: false,
    });
  } catch {
    onStatus("error");
    onError("Brak dostępu do kamery. Zezwól na kamerę w ustawieniach przeglądarki.");
    throw new Error("camera_denied");
  }

  const pc = createCelebrationPeerConnection();
  const iceQueue = createIceQueue(pc);
  const unsubscribers: Array<() => void> = [];
  let answerApplied = false;

  for (const track of localStream.getTracks()) {
    pc.addTrack(track, localStream);
  }

  pc.onconnectionstatechange = () => {
    if (pc.connectionState === "connected") {
      onStatus("connected");
    }
    if (pc.connectionState === "failed") {
      onStatus("error");
      onError("Połączenie nie powiodło się. Upewnij się, że telefon i rzutnik są w tej samej sieci.");
    }
  };

  unsubscribers.push(
    subscribeAnswer(roomCode, (answer) => {
      if (answerApplied) return;
      answerApplied = true;
      void (async () => {
        try {
          await pc.setRemoteDescription(answer);
          await iceQueue.flush();
        } catch {
          onStatus("error");
          onError("Nie udało się połączyć ze rzutnikiem.");
        }
      })();
    }),
  );

  unsubscribers.push(
    subscribeRemoteIce(roomCode, "caller", (candidate) => {
      void iceQueue.push(candidate);
    }),
  );

  pc.onicecandidate = (event) => {
    if (event.candidate) {
      void pushIceCandidate(roomCode, "caller", event.candidate.toJSON());
    }
  };

  onStatus("connecting");

  try {
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    await writeOffer(roomCode, offer);
  } catch {
    stopMediaStream(localStream);
    pc.close();
    onStatus("error");
    onError("Nie udało się rozpocząć transmisji.");
    throw new Error("offer_failed");
  }

  return { pc, unsubscribers, localStream };
}
