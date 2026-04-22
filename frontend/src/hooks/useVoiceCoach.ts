import { useEffect, useRef } from "react";
import type { SessionStatus } from "../utils/workout";

const SPEECH_COOLDOWN_MS = 3000;

type SpokenMessage = {
  text: string;
  at: number;
};

const createRepMessage = (count: number): string => {
  return count === 1 ? "1 rep" : `${count} reps`;
};

export const useVoiceCoach = (status: SessionStatus) => {
  const lastCounterRef = useRef(0);
  const lastMessageRef = useRef<SpokenMessage>({ text: "", at: 0 });

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return undefined;
    }

    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }

    if (!status.isRunning) {
      window.speechSynthesis.cancel();
      lastCounterRef.current = status.counter;
      return;
    }

    let nextMessage: string | null = null;

    if (status.counter > lastCounterRef.current) {
      nextMessage = createRepMessage(status.counter);
    } else if (!status.isCorrectForm && status.accuracy < 70 && status.feedback) {
      nextMessage = status.feedback;
    }

    lastCounterRef.current = status.counter;

    if (!nextMessage) {
      return;
    }

    const now = Date.now();
    const sameMessageTooSoon =
      lastMessageRef.current.text === nextMessage &&
      now - lastMessageRef.current.at < SPEECH_COOLDOWN_MS;

    if (sameMessageTooSoon) {
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(nextMessage);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;

    window.speechSynthesis.speak(utterance);
    lastMessageRef.current = { text: nextMessage, at: now };
  }, [
    status.accuracy,
    status.counter,
    status.feedback,
    status.isCorrectForm,
    status.isRunning,
  ]);
};
