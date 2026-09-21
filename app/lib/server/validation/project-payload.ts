import { SECTION_NAMES, TONICS, normalizeStep, type ChordStep, type Tonic } from "@/app/lib/server/catalog/chord-catalog";

export class ValidationError extends Error {
  readonly code = "VALIDATION_ERROR";

  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export type ProjectPayload = {
  name: string;
  tonic: string;
  mode?: string;
  sections: Array<{
    position: number;
    name: string;
    bar_count: number;
    bars: Array<{
      position: number;
      chords: Array<{
        beat: number;
        degree: unknown;
        quality: unknown;
        extension?: unknown;
        bass_degree?: unknown;
      }>;
    }>;
  }>;
};

export type NormalizedProjectPayload = {
  name: string;
  tonic: Tonic;
  mode: "major";
  sections: Array<{
    position: number;
    name: string;
    bar_count: number;
    bars: Array<{
      position: number;
      chords: Array<{ beat: number } & ChordStep>;
    }>;
  }>;
};

function objectValue(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new ValidationError(`${label} must be an object`);
  }
  return value as Record<string, unknown>;
}

function integerValue(value: unknown, label: string, minimum: number): number {
  if (!Number.isInteger(value) || (value as number) < minimum) {
    throw new ValidationError(`${label} must be an integer >= ${minimum}`);
  }
  return value as number;
}

function sequentialPositions(values: number[], expectedLength: number, start: number, label: string): void {
  if (values.length !== expectedLength) {
    throw new ValidationError(`${label} must contain exactly ${expectedLength} items`);
  }
  const sorted = [...values].sort((a, b) => a - b);
  const expected = Array.from({ length: expectedLength }, (_, index) => index + start);
  if (sorted.some((value, index) => value !== expected[index])) {
    throw new ValidationError(`${label} positions must be sequential`);
  }
}

export function validateProjectPayload(input: unknown): NormalizedProjectPayload {
  const project = objectValue(input, "project");
  if (typeof project.name !== "string" || project.name.trim() === "") {
    throw new ValidationError("Project name is required");
  }
  if (typeof project.tonic !== "string" || !TONICS.includes(project.tonic as Tonic)) {
    throw new ValidationError("Unsupported tonic");
  }
  if (project.mode !== undefined && project.mode !== "major") {
    throw new ValidationError("Only major mode is supported");
  }
  if (!Array.isArray(project.sections)) {
    throw new ValidationError("sections must be an array");
  }

  const sections = project.sections.map((rawSection) => {
    const section = objectValue(rawSection, "section");
    if (typeof section.name !== "string" || section.name.trim() === "") {
      throw new ValidationError("Section name is required");
    }
    if (!Array.isArray(section.bars)) {
      throw new ValidationError("section.bars must be an array");
    }
    const barCount = integerValue(section.bar_count, "bar_count", 1);
    if (section.position === undefined) throw new ValidationError("section.position is required");
    const position = integerValue(section.position, "section.position", 0);
    if (!SECTION_NAMES.includes(section.name as (typeof SECTION_NAMES)[number]) && section.name.trim() === "") {
      throw new ValidationError("Invalid section name");
    }

    const bars = section.bars.map((rawBar) => {
      const bar = objectValue(rawBar, "bar");
      const barPosition = integerValue(bar.position, "bar.position", 1);
      if (!Array.isArray(bar.chords)) throw new ValidationError("bar.chords must be an array");
      const beatSet = new Set<number>();
      const chords = bar.chords.map((rawChord) => {
        const chord = objectValue(rawChord, "chord");
        const beat = integerValue(chord.beat, "chord.beat", 1);
        if (beat > 4) throw new ValidationError("chord.beat must be between 1 and 4");
        if (beatSet.has(beat)) throw new ValidationError(`Duplicate chord beat: ${beat}`);
        beatSet.add(beat);
        return { beat, ...normalizeStep(chord as Parameters<typeof normalizeStep>[0]) };
      });
      return { position: barPosition, chords };
    });

    sequentialPositions(bars.map((bar) => bar.position), barCount, 1, "bar");
    return {
      position,
      name: section.name.trim(),
      bar_count: barCount,
      bars,
    };
  });

  sequentialPositions(sections.map((section) => section.position), sections.length, 0, "section");
  return {
    name: project.name.trim(),
    tonic: project.tonic as Tonic,
    mode: "major",
    sections,
  };
}

export function validateProjectCreation(input: unknown): { name: string; tonic: Tonic; mode: "major" } {
  const value = objectValue(input, "project");
  if (typeof value.name !== "string" || value.name.trim() === "") {
    throw new ValidationError("Project name is required");
  }
  if (typeof value.tonic !== "string" || !TONICS.includes(value.tonic as Tonic)) {
    throw new ValidationError("Unsupported tonic");
  }
  if (value.mode !== undefined && value.mode !== "major") {
    throw new ValidationError("Only major mode is supported");
  }
  return { name: value.name.trim(), tonic: value.tonic as Tonic, mode: "major" };
}
