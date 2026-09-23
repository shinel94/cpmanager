"use client";

import { useState, useEffect } from "react";

export type AudioPreferences = {
  volume: number; // 0.0 ~ 1.0
  metronome: boolean;
  loop: boolean;
  playScope: "all" | "section";
};

const STORAGE_KEY = "cpmanager_audio_prefs";

const DEFAULT_PREFERENCES: AudioPreferences = {
  volume: 0.8,
  metronome: false,
  loop: false,
  playScope: "all",
};

export function useAudioPreferences() {
  const [preferences, setPreferences] = useState<AudioPreferences>(DEFAULT_PREFERENCES);
  const [isLoaded, setIsLoaded] = useState(false);

  // 로컬 스토리지에서 설정 불러오기
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setPreferences({
          volume: typeof parsed.volume === "number" ? Math.max(0, Math.min(1, parsed.volume)) : DEFAULT_PREFERENCES.volume,
          metronome: typeof parsed.metronome === "boolean" ? parsed.metronome : DEFAULT_PREFERENCES.metronome,
          loop: typeof parsed.loop === "boolean" ? parsed.loop : DEFAULT_PREFERENCES.loop,
          playScope: parsed.playScope === "section" ? "section" : "all",
        });
      }
    } catch (e) {
      console.warn("Failed to load audio preferences from localStorage:", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // 설정 저장
  const updatePreference = <K extends keyof AudioPreferences>(
    key: K,
    value: AudioPreferences[K]
  ) => {
    setPreferences((prev) => {
      const updated = { ...prev, [key]: value };
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch (e) {
          console.warn("Failed to save audio preferences to localStorage:", e);
        }
      }
      return updated;
    });
  };

  return {
    preferences,
    updatePreference,
    isLoaded,
  };
}
