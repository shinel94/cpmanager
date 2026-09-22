import {
  MAJOR_DIATONIC_QUALITIES,
  TONICS,
  normalizeBassDegree,
  normalizeStep,
  type ChordStep,
  type Tonic,
} from "@/app/lib/shared/catalog/chord-catalog";
import { pitchForDegree } from "@/app/lib/shared/domain/harmonic-math";

const FLAT_NOTE_NAMES = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];

function assertTonic(tonic: string): asserts tonic is Tonic {
  if (!TONICS.includes(tonic as Tonic)) {
    throw new Error(`Unsupported tonic: ${tonic}`);
  }
}

function suffixForChord(step: ChordStep): string {
  if (step.quality === "diminished") return "dim";
  if (step.quality === "half-diminished") return "m7b5";
  if (step.quality === "minor") {
    if (step.extension === null) return "m";
    if (step.extension === "7") return "m7";
    if (step.extension === "9") return "m9";
  }
  if (step.quality === "dominant") return step.extension ?? "";
  if (step.quality === "major") return step.extension ?? "";
  throw new Error(`Unsupported chord step: ${JSON.stringify(step)}`);
}

export function realizeChord(tonic: string, input: ChordStep): string {
  assertTonic(tonic);
  const step = normalizeStep(input);
  const root = FLAT_NOTE_NAMES[pitchForDegree(tonic, step.degree)];
  const suffix = suffixForChord(step);
  const bass = step.bass_degree ? FLAT_NOTE_NAMES[pitchForDegree(tonic, step.bass_degree)] : null;
  return `${root}${suffix}${bass ? `/${bass}` : ""}`;
}

export function realizeChords(tonic: string, steps: ChordStep[]): string[] {
  return steps.map((step) => realizeChord(tonic, step));
}

export function getMajorDiatonicChords(tonic: string): Array<ChordStep & { displayName: string }> {
  assertTonic(tonic);
  return Object.entries(MAJOR_DIATONIC_QUALITIES).map(([degree, quality]) => {
    const step = normalizeStep({ degree, quality, extension: null, bass_degree: null });
    return { ...step, displayName: realizeChord(tonic, step) };
  });
}

export function getBassNote(tonic: string, bassDegree: string): string {
  assertTonic(tonic);
  const normalized = normalizeBassDegree(bassDegree);
  if (!normalized) throw new Error("bass degree is required");
  return FLAT_NOTE_NAMES[pitchForDegree(tonic, normalized)];
}
