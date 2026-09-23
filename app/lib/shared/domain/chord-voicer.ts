import {
  type ChordStep,
  type Extension,
  type Quality,
  type Tonic,
  normalizeStep,
} from "@/app/lib/shared/catalog/chord-catalog";
import { pitchForDegree } from "@/app/lib/shared/domain/harmonic-math";

/**
 * 표준 12음계 플랫 표기 배열 (피치 클래스 0~11)
 */
export const NOTE_NAMES = [
  "C",
  "Db",
  "D",
  "Eb",
  "E",
  "F",
  "Gb",
  "G",
  "Ab",
  "A",
  "Bb",
  "B",
] as const;

/**
 * 코드 품질(Quality)별 기본 3화음 반음 인터벌
 */
export const QUALITY_INTERVALS: Record<Quality, readonly number[]> = {
  major: [0, 4, 7],
  minor: [0, 3, 7],
  diminished: [0, 3, 6],
  dominant: [0, 4, 7, 10],
  "half-diminished": [0, 3, 6, 10],
};

/**
 * 익스텐션(Extension)별 추가 인터벌
 */
export const EXTENSION_INTERVALS: Record<NonNullable<Extension>, readonly number[]> = {
  "7": [10],
  "maj7": [11],
  "m7": [10],
  "m7b5": [10],
  "9": [10, 14],
  "sus4": [5, 7],
};

/**
 * 보이싱 기준 옥타브 및 레인지 기본값
 */
export const VOICING_DEFAULTS = {
  BASS_OCTAVE: 2, // 베이스 음역대: C2 (36) ~ B2 (47)
  CHORD_OCTAVE_LOW: 3, // 높은 피치 루트(F#~B)의 기본 옥타브 (C3 기준: 48)
  CHORD_OCTAVE_HIGH: 4, // 낮은 피치 루트(C~F)의 기본 옥타브 (C4 기준: 60)
};

export type VoicedChord = {
  bassNote: string;
  bassMidi: number;
  chordNotes: string[];
  chordMidis: number[];
  allNotes: string[];
  allMidis: number[];
};

export type VoicingOptions = {
  bassOctave?: number;
  preferSmoothRange?: boolean;
};

/**
 * MIDI 노트 번호(0~127)를 표준 음이름(예: "C4", "Eb2")으로 변환합니다.
 */
export function midiToNoteName(midi: number): string {
  const pitchClass = ((midi % 12) + 12) % 12;
  const octave = Math.floor(midi / 12) - 1;
  return `${NOTE_NAMES[pitchClass]}${octave}`;
}

/**
 * 표준 음이름(예: "C4", "F#3", "Bb2")을 MIDI 노트 번호로 변환합니다.
 */
export function noteNameToMidi(noteName: string): number {
  const match = noteName.match(/^([A-G][b#]?)(-?\d+)$/);
  if (!match) {
    throw new Error(`Invalid note name: ${noteName}`);
  }
  const note = match[1];
  const octave = parseInt(match[2], 10);
  const pitchClass = NOTE_NAMES.indexOf(note as (typeof NOTE_NAMES)[number]);
  if (pitchClass === -1) {
    // Sharp notation fallback
    const sharpMap: Record<string, number> = {
      "C#": 1,
      "D#": 3,
      "F#": 6,
      "G#": 8,
      "A#": 10,
    };
    if (note in sharpMap) {
      return (octave + 1) * 12 + sharpMap[note];
    }
    throw new Error(`Unsupported note pitch: ${note}`);
  }
  return (octave + 1) * 12 + pitchClass;
}

/**
 * 피치 클래스와 옥타브를 결합하여 음이름을 생성합니다.
 */
export function pitchClassToNoteName(pitchClass: number, octave: number): string {
  const normalized = ((pitchClass % 12) + 12) % 12;
  return `${NOTE_NAMES[normalized]}${octave}`;
}

/**
 * Quality와 Extension에 따른 화음 구성 반음 인터벌 목록을 계산합니다.
 */
export function getChordIntervals(quality: Quality, extension: Extension): number[] {
  let intervals = [...QUALITY_INTERVALS[quality]];

  if (extension === "sus4") {
    // sus4는 3도(3 또는 4)를 제거하고 완전4도(5)로 대체
    intervals = intervals.filter((i) => i !== 3 && i !== 4);
    if (!intervals.includes(5)) intervals.push(5);
    if (!intervals.includes(7)) intervals.push(7);
  } else if (extension !== null && extension in EXTENSION_INTERVALS) {
    const extIntervals = EXTENSION_INTERVALS[extension];
    for (const interval of extIntervals) {
      if (!intervals.includes(interval)) {
        intervals.push(interval);
      }
    }
  }

  // 인터벌 오름차순 정렬
  return intervals.sort((a, b) => a - b);
}

export type ChordVoicingInput = {
  degree: string;
  quality: Quality;
  extension?: Extension;
  bass_degree?: string | null;
};

/**
 * Tonic과 ChordStep(또는 ChordVoicingInput)을 받아 오디오 재생 및 MIDI 생성에 필요한 실제 음표들을 산출합니다.
 */
export function chordToVoicedNotes(
  tonic: Tonic,
  stepInput: ChordVoicingInput,
  options?: VoicingOptions
): VoicedChord {
  const step = normalizeStep(stepInput);
  const rootPitch = pitchForDegree(tonic, step.degree);

  // 1. 베이스 음 계산 (슬래시 코드가 있으면 우선 적용, 없으면 루트 음)
  const bassPitch = step.bass_degree
    ? pitchForDegree(tonic, step.bass_degree)
    : rootPitch;
  const bassOctave = options?.bassOctave ?? VOICING_DEFAULTS.BASS_OCTAVE;
  const bassMidi = (bassOctave + 1) * 12 + bassPitch;
  const bassNote = pitchClassToNoteName(bassPitch, bassOctave);

  // 2. 화음 음역대 분산 (F# 이상의 루트는 C3~B3 옥타브로 낮추어 음역대 균형 유지)
  const preferSmooth = options?.preferSmoothRange ?? true;
  let chordRootMidi: number;
  if (preferSmooth) {
    // F#(6) 이상은 옥타브 3(MIDI 48+pitch), F(5) 이하는 옥타브 4(MIDI 60+pitch)
    const baseOctave =
      rootPitch >= 6
        ? VOICING_DEFAULTS.CHORD_OCTAVE_LOW
        : VOICING_DEFAULTS.CHORD_OCTAVE_HIGH;
    chordRootMidi = (baseOctave + 1) * 12 + rootPitch;
  } else {
    chordRootMidi = (VOICING_DEFAULTS.CHORD_OCTAVE_HIGH + 1) * 12 + rootPitch;
  }

  // 3. 구성음 인터벌 계산 및 MIDI 번호 산출
  const intervals = getChordIntervals(step.quality, step.extension);
  const chordMidis = intervals
    .map((interval) => chordRootMidi + interval)
    .sort((a, b) => a - b);
  const chordNotes = chordMidis.map(midiToNoteName);

  return {
    bassNote,
    bassMidi,
    chordNotes,
    chordMidis,
    allNotes: [bassNote, ...chordNotes],
    allMidis: [bassMidi, ...chordMidis],
  };
}
