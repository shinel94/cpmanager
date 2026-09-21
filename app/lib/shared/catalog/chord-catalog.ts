export const TONICS = [
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

export const SECTION_NAMES = [
  "Intro",
  "Verse",
  "Pre-Chorus",
  "Chorus",
  "Interlude",
  "Bridge",
  "Outro",
] as const;

export const QUALITIES = [
  "major",
  "minor",
  "diminished",
  "dominant",
  "half-diminished",
] as const;

export const EXTENSIONS = [null, "7", "9", "maj7", "m7", "m7b5", "sus4"] as const;

export const MAJOR_DIATONIC_QUALITIES = {
  I: "major",
  II: "minor",
  III: "minor",
  IV: "major",
  V: "major",
  VI: "minor",
  VII: "diminished",
} as const satisfies Record<string, Quality | "diminished">;

export type Tonic = (typeof TONICS)[number];
export type Quality = (typeof QUALITIES)[number];
export type Extension = (typeof EXTENSIONS)[number];

export const COMPATIBLE_EXTENSIONS: Record<Quality, readonly Extension[]> = {
  major: [null, "maj7", "9", "sus4"],
  minor: [null, "7", "9"],
  dominant: ["7", "9"],
  diminished: [null],
  "half-diminished": ["m7b5"],
};

export type ChordStep = {
  degree: string;
  quality: Quality;
  extension: Extension;
  bass_degree: string | null;
};

const ROMAN_TO_NUMBER: Record<string, string> = {
  I: "I",
  II: "II",
  III: "III",
  IV: "IV",
  V: "V",
  VI: "VI",
  VII: "VII",
};

const NUMBER_TO_ROMAN: Record<string, string> = {
  "1": "I",
  "2": "II",
  "3": "III",
  "4": "IV",
  "5": "V",
  "6": "VI",
  "7": "VII",
};

export function normalizeDegree(value: unknown): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error("degree must be a non-empty string");
  }

  const raw = value.trim().replace(/°$/, "");
  const match = raw.match(/^([b#]?)([ivIV]+)$/);
  if (!match) {
    throw new Error(`Unsupported degree: ${value}`);
  }

  const accidental = match[1];
  const roman = match[2].toUpperCase();
  const normalizedRoman = ROMAN_TO_NUMBER[roman];
  if (!normalizedRoman) {
    throw new Error(`Unsupported degree: ${value}`);
  }

  return `${accidental}${normalizedRoman}`;
}

export function normalizeBassDegree(value: unknown): string | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }
  if (typeof value !== "string") {
    throw new Error("bass_degree must be a string or null");
  }

  const raw = value.trim();
  const numericMatch = raw.match(/^([b#]?)([1-7])$/);
  if (numericMatch) {
    return `${numericMatch[1]}${NUMBER_TO_ROMAN[numericMatch[2]]}`;
  }

  return normalizeDegree(raw);
}

function isAllowed<T extends readonly unknown[]>(values: T, value: unknown): value is T[number] {
  return values.includes(value);
}

export function normalizeStep(input: {
  degree: unknown;
  quality: unknown;
  extension?: unknown;
  bass_degree?: unknown;
}): ChordStep {
  const degree = normalizeDegree(input.degree);
  if (!isAllowed(QUALITIES, input.quality)) {
    throw new Error(`Unsupported quality: ${String(input.quality)}`);
  }

  const extension = input.extension === undefined ? null : input.extension;
  if (!isAllowed(EXTENSIONS, extension)) {
    throw new Error(`Unsupported extension: ${String(extension)}`);
  }
  if (!COMPATIBLE_EXTENSIONS[input.quality].includes(extension)) {
    throw new Error(`Incompatible quality and extension: ${input.quality} + ${String(extension)}`);
  }

  return {
    degree,
    quality: input.quality,
    extension,
    bass_degree: normalizeBassDegree(input.bass_degree),
  };
}

export function getChordCatalog() {
  return {
    tonics: [...TONICS],
    sectionNames: [...SECTION_NAMES],
    qualities: [...QUALITIES],
    extensions: [...EXTENSIONS],
  };
}

export function getMajorDiatonicQualities() {
  return { ...MAJOR_DIATONIC_QUALITIES };
}
