import { AudioEngine } from "./audio-engine";
import { chordToVoicedNotes, type ChordVoicingInput } from "@/app/lib/shared/domain/chord-voicer";
import type { Tonic } from "@/app/lib/shared/catalog/chord-catalog";

let activeSequenceTimeouts: ReturnType<typeof setTimeout>[] = [];

/**
 * 단일 화음 청음 (Audition)
 */
export async function playAuditionChord(
  chord: ChordVoicingInput,
  tonic: Tonic,
  durationSeconds = 0.8
): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    const engine = AudioEngine.getInstance();
    const voiced = chordToVoicedNotes(tonic, chord);
    if (voiced.allNotes.length > 0) {
      await engine.playAuditionChord(voiced.allNotes, durationSeconds);
    }
  } catch (err) {
    console.warn("Audition error:", err);
  }
}

/**
 * 복수 화음(진행) 순차 미리듣기
 */
export function playProgressionPreview(
  chords: ChordVoicingInput[],
  tonic: Tonic,
  secondsPerChord = 0.65
): void {
  if (typeof window === "undefined" || chords.length === 0) return;

  // 기존 진행 타이머 취소
  stopProgressionPreview();

  const engine = AudioEngine.getInstance();

  chords.forEach((chord, idx) => {
    const voiced = chordToVoicedNotes(tonic, chord);
    const timer = setTimeout(async () => {
      if (voiced.allNotes.length > 0) {
        await engine.playAuditionChord(voiced.allNotes, secondsPerChord * 0.9);
      }
    }, idx * secondsPerChord * 1000);
    activeSequenceTimeouts.push(timer);
  });
}

/**
 * 진행 미리듣기 중단
 */
export function stopProgressionPreview(): void {
  activeSequenceTimeouts.forEach((t) => clearTimeout(t));
  activeSequenceTimeouts = [];
}
