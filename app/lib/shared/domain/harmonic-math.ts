import { normalizeDegree, type Tonic } from "@/app/lib/shared/catalog/chord-catalog";

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

const DEGREE_PITCHES: Record<string, number> = {
  I: 0,
  II: 2,
  III: 4,
  IV: 5,
  V: 7,
  VI: 9,
  VII: 11,
};

function parseDegree(degree: string): { accidental: number; roman: string } {
  const normalized = normalizeDegree(degree);
  const match = normalized.match(/^([b#]?)(I|II|III|IV|V|VI|VII)$/);
  if (!match) throw new Error(`Unsupported normalized degree: ${degree}`);
  return {
    accidental: match[1] === "b" ? -1 : match[1] === "#" ? 1 : 0,
    roman: match[2],
  };
}

export function degreeToPitchClass(degree: string): number {
  const parsed = parseDegree(degree);
  return (DEGREE_PITCHES[parsed.roman] + parsed.accidental + 12) % 12;
}

export function tonicToPitchClass(tonic: Tonic): number {
  return TONIC_PITCHES[tonic];
}

export function pitchForDegree(tonic: Tonic, degree: string): number {
  return (tonicToPitchClass(tonic) + degreeToPitchClass(degree)) % 12;
}

export function getSemitoneInterval(fromDegree: string, toDegree: string): number {
  return (degreeToPitchClass(toDegree) - degreeToPitchClass(fromDegree) + 12) % 12;
}

export function isPerfectFifthDown(fromDegree: string, toDegree: string): boolean {
  return getSemitoneInterval(fromDegree, toDegree) === 5;
}

export function isSemitoneUp(fromDegree: string, toDegree: string): boolean {
  return getSemitoneInterval(fromDegree, toDegree) === 1;
}

export function isDiatonicDegree(degree: string): boolean {
  return /^[IV]+$/.test(normalizeDegree(degree));
}

export type BassMotion = "stepwise_down" | "stepwise_up" | "pedal" | "none";

export function calculateBassLineMotion(bassDegrees: Array<string | null>): BassMotion {
  const values = bassDegrees.filter((degree): degree is string => degree !== null);
  if (values.length < 2) return "none";
  if (values.every((degree) => degree === values[0])) return "pedal";

  const intervals = values.slice(1).map((degree, index) => getSemitoneInterval(values[index], degree));
  if (intervals.every((interval) => interval === 1 || interval === 2)) return "stepwise_up";
  if (intervals.every((interval) => interval === 10 || interval === 11)) return "stepwise_down";
  return "none";
}
