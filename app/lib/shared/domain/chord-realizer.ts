import {
  MAJOR_DIATONIC_QUALITIES,
  TONICS,
  normalizeBassDegree,
  normalizeDegree,
  normalizeStep,
  type ChordStep,
  type Tonic,
} from "@/app/lib/shared/catalog/chord-catalog";

const TONIC_PITCHES: Record<Tonic, number> = {
  C: 0,
  Db: 1,
  D: 2,
  Eb: 3,
  E: 4,
  F: 5,
  Gb: 6,
  G: 7,
  Ab: 8,
  A: 9,
  Bb: 10,
  B: 11,
};

const FLAT_NOTE_NAMES = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
const DEGREE_PITCHES: Record<string, number> = {
  I: 0,
  II: 2,
  III: 4,
  IV: 5,
  V: 7,
  VI: 9,
  VII: 11,
};

function assertTonic(tonic: string): asserts tonic is Tonic {
  if (!TONICS.includes(tonic as Tonic)) {
    throw new Error(`Unsupported tonic: ${tonic}`);
  }
}

function parseDegree(degree: string): { accidental: number; roman: string } {
  const normalized = normalizeDegree(degree);
  const match = normalized.match(/^([b#]?)(I|II|III|IV|V|VI|VII)$/);
  if (!match) throw new Error(`Unsupported normalized degree: ${degree}`);
  return {
    accidental: match[1] === "b" ? -1 : match[1] === "#" ? 1 : 0,
    roman: match[2],
  };
}

function pitchForDegree(tonic: Tonic, degree: string): number {
  const parsed = parseDegree(degree);
  return (TONIC_PITCHES[tonic] + DEGREE_PITCHES[parsed.roman] + parsed.accidental + 12) % 12;
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
