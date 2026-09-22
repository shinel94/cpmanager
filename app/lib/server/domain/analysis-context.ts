import { normalizeStep, type ChordStep } from "@/app/lib/server/catalog/chord-catalog";
import { ValidationError } from "@/app/lib/server/validation/project-payload";

export type NormalizedBarChord = ChordStep & { beat: number };
export type NormalizedBar = { position: number; chords: NormalizedBarChord[] };

export type NormalizedAnalysisInput = {
  tonic: string;
  sectionName: string;
  blockStart: number;
  target: { barPosition: number; beat: number };
  before: ChordStep;
  after: ChordStep;
  bars: NormalizedBar[];
};

function normalizeBars(rawBars: unknown[]): NormalizedBar[] {
  if (rawBars.length !== 4) throw new ValidationError("bars must contain exactly four bars");
  const bars = rawBars.map((rawBar) => {
    if (!rawBar || typeof rawBar !== "object" || Array.isArray(rawBar)) throw new ValidationError("Invalid analysis bar");
    const bar = rawBar as { position?: unknown; chords?: unknown };
    if (!Number.isInteger(bar.position) || (bar.position as number) < 1) throw new ValidationError("Invalid analysis bar position");
    if (!Array.isArray(bar.chords)) throw new ValidationError("Analysis bar chords must be an array");
    const usedBeats = new Set<number>();
    const chords = bar.chords.map((rawChord, index) => {
      if (!rawChord || typeof rawChord !== "object" || Array.isArray(rawChord)) throw new ValidationError("Invalid analysis chord");
      const chord = rawChord as Record<string, unknown>;
      const beat = chord.beat === undefined ? index + 1 : chord.beat;
      if (!Number.isInteger(beat) || (beat as number) < 1 || (beat as number) > 4) throw new ValidationError("Analysis beat must be between 1 and 4");
      if (usedBeats.has(beat as number)) throw new ValidationError(`Duplicate analysis beat: ${beat}`);
      usedBeats.add(beat as number);
      return { beat: beat as number, ...normalizeStep(chord as Parameters<typeof normalizeStep>[0]) };
    });
    return { position: bar.position as number, chords: chords.sort((a, b) => a.beat - b.beat) };
  });
  const positions = bars.map((bar) => bar.position).sort((a, b) => a - b);
  if (positions.join(",") !== "1,2,3,4") throw new ValidationError("Analysis bar positions must be 1 through 4");
  return bars;
}

export function normalizeAnalysisInput(input: unknown): NormalizedAnalysisInput {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new ValidationError("Analysis request must be an object");
  const request = input as Record<string, unknown>;
  if (typeof request.tonic !== "string" || typeof request.sectionName !== "string") throw new ValidationError("tonic and sectionName are required");
  if (!request.target || typeof request.target !== "object" || Array.isArray(request.target)) throw new ValidationError("target is required");
  const target = request.target as { barPosition?: unknown; beat?: unknown };
  if (!Number.isInteger(target.barPosition) || !Number.isInteger(target.beat) || (target.beat as number) < 1 || (target.beat as number) > 4) throw new ValidationError("target must contain a valid barPosition and beat");
  if (!Number.isInteger(request.blockStart) || (request.blockStart as number) < 1) throw new ValidationError("blockStart must be a positive integer");
  if (!Array.isArray(request.bars)) throw new ValidationError("bars must contain exactly four bars");
  const bars = normalizeBars(request.bars);
  const before = normalizeStep(request.before as Parameters<typeof normalizeStep>[0]);
  const after = normalizeStep(request.after as Parameters<typeof normalizeStep>[0]);
  return {
    tonic: request.tonic,
    sectionName: request.sectionName,
    blockStart: request.blockStart as number,
    target: { barPosition: target.barPosition as number, beat: target.beat as number },
    before,
    after,
    bars,
  };
}
