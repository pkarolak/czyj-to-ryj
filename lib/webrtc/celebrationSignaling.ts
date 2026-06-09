import {
  onChildAdded,
  onValue,
  push,
  ref,
  set,
  type Unsubscribe,
} from "firebase/database";
import { getFirebaseDatabase } from "@/lib/firebase/client";
import { isValidRoomCode } from "@/lib/types/scoreRoom";

export type SessionDescriptionPayload = {
  type: RTCSdpType;
  sdp: string;
};

export type IceCandidatePayload = {
  candidate: string;
  sdpMid: string | null;
  sdpMLineIndex: number | null;
};

function offerRef(roomCode: string) {
  return ref(getFirebaseDatabase(), `rooms/${roomCode}/webrtc/celebration/offer`);
}

function answerRef(roomCode: string) {
  return ref(getFirebaseDatabase(), `rooms/${roomCode}/webrtc/celebration/answer`);
}

function callerIceRef(roomCode: string) {
  return ref(
    getFirebaseDatabase(),
    `rooms/${roomCode}/webrtc/celebration/callerIce`,
  );
}

function calleeIceRef(roomCode: string) {
  return ref(
    getFirebaseDatabase(),
    `rooms/${roomCode}/webrtc/celebration/calleeIce`,
  );
}

export async function writeOffer(
  roomCode: string,
  description: RTCSessionDescriptionInit,
): Promise<void> {
  if (!isValidRoomCode(roomCode) || !description.sdp || !description.type) return;
  await set(offerRef(roomCode), {
    type: description.type,
    sdp: description.sdp,
  } satisfies SessionDescriptionPayload);
}

export async function writeAnswer(
  roomCode: string,
  description: RTCSessionDescriptionInit,
): Promise<void> {
  if (!isValidRoomCode(roomCode) || !description.sdp || !description.type) return;
  await set(answerRef(roomCode), {
    type: description.type,
    sdp: description.sdp,
  } satisfies SessionDescriptionPayload);
}

export async function pushIceCandidate(
  roomCode: string,
  role: "caller" | "callee",
  candidate: RTCIceCandidateInit,
): Promise<void> {
  if (!isValidRoomCode(roomCode) || !candidate.candidate) return;
  const target = role === "caller" ? callerIceRef(roomCode) : calleeIceRef(roomCode);
  await push(target, {
    candidate: candidate.candidate,
    sdpMid: candidate.sdpMid ?? null,
    sdpMLineIndex:
      typeof candidate.sdpMLineIndex === "number"
        ? candidate.sdpMLineIndex
        : null,
  } satisfies IceCandidatePayload);
}

export function subscribeOffer(
  roomCode: string,
  onOffer: (description: RTCSessionDescriptionInit) => void,
): Unsubscribe {
  if (!isValidRoomCode(roomCode)) return () => {};

  return onValue(offerRef(roomCode), (snapshot) => {
    const value = snapshot.val() as SessionDescriptionPayload | null;
    if (!value?.sdp || !value.type) return;
    onOffer({ type: value.type, sdp: value.sdp });
  });
}

export function subscribeAnswer(
  roomCode: string,
  onAnswer: (description: RTCSessionDescriptionInit) => void,
): Unsubscribe {
  if (!isValidRoomCode(roomCode)) return () => {};

  return onValue(answerRef(roomCode), (snapshot) => {
    const value = snapshot.val() as SessionDescriptionPayload | null;
    if (!value?.sdp || !value.type) return;
    onAnswer({ type: value.type, sdp: value.sdp });
  });
}

export function subscribeRemoteIce(
  roomCode: string,
  role: "caller" | "callee",
  onCandidate: (candidate: RTCIceCandidateInit) => void,
): Unsubscribe {
  if (!isValidRoomCode(roomCode)) return () => {};

  const source = role === "caller" ? calleeIceRef(roomCode) : callerIceRef(roomCode);

  return onChildAdded(source, (snapshot) => {
    const value = snapshot.val() as IceCandidatePayload | null;
    if (!value?.candidate) return;
    onCandidate({
      candidate: value.candidate,
      sdpMid: value.sdpMid,
      sdpMLineIndex: value.sdpMLineIndex,
    });
  });
}
