import type { DatabaseSync } from "node:sqlite";

import { normalizeStep, type ChordStep } from "@/app/lib/server/catalog/chord-catalog";
import { ValidationError } from "@/app/lib/server/validation/project-payload";

type AnalysisInput = {
  tonic: string;
  sectionName: string;
  blockStart: number;
  target: { barPosition: number; beat: number };
  before: unknown;
  after: unknown;
  bars: Array<{ position: number; chords: unknown[] }>;
};

const DEGREE_PITCHES: Record<string, number> = { I: 0, II: 2, III: 4, IV: 5, V: 7, VI: 9, VII: 11 };

function rootPitch(degree: string): number {
  const match = degree.match(/^([b#]?)(I|II|III|IV|V|VI|VII)$/);
  if (!match) return -1;
  return (DEGREE_PITCHES[match[2]] + (match[1] === "b" ? -1 : match[1] === "#" ? 1 : 0) + 12) % 12;
}

function validateInput(input: unknown) {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new ValidationError("Analysis request must be an object");
  const request = input as Partial<AnalysisInput>;
  if (typeof request.tonic !== "string" || typeof request.sectionName !== "string") throw new ValidationError("tonic and sectionName are required");
  if (!request.target || !Number.isInteger(request.target.barPosition) || !Number.isInteger(request.target.beat)) throw new ValidationError("target is required");
  if (!Array.isArray(request.bars) || request.bars.length !== 4) throw new ValidationError("bars must contain exactly four bars");
  if (request.target.beat < 1 || request.target.beat > 4) throw new ValidationError("target beat must be between 1 and 4");
  const bars = request.bars.map((bar) => ({ position: bar.position, chords: Array.isArray(bar.chords) ? bar.chords.map((chord) => normalizeStep(chord as Parameters<typeof normalizeStep>[0])) : [] }));
  const before = normalizeStep(request.before as Parameters<typeof normalizeStep>[0]);
  const after = normalizeStep(request.after as Parameters<typeof normalizeStep>[0]);
  return { ...request, bars, before, after } as { tonic: string; sectionName: string; target: { barPosition: number; beat: number }; bars: Array<{ position: number; chords: ChordStep[] }>; before: ChordStep; after: ChordStep };
}

function ruleMatches(ruleType: string, condition: Record<string, unknown>, before: ChordStep, after: ChordStep, next: ChordStep | null): boolean {
  if (ruleType === "modal_interchange") {
    if (condition.same_root_degree === true && before.degree === after.degree && before.quality === "major" && after.quality === "minor") return true;
    return Boolean(condition.after && typeof condition.after === "object" && (condition.after as Record<string, unknown>).degree === after.degree && (condition.after as Record<string, unknown>).quality === after.quality);
  }
  if (ruleType === "secondary_dominant") {
    return after.quality === "dominant" && after.extension === "7" && next !== null && (rootPitch(after.degree) - rootPitch(next.degree) + 12) % 12 === 7;
  }
  if (ruleType === "slash_chord") return after.bass_degree !== null;
  if (ruleType === "chord_variation") return before.quality !== after.quality || before.extension !== after.extension || before.bass_degree !== after.bass_degree;
  return false;
}

export function analyzeTechnique(database: DatabaseSync, input: unknown) {
  const request = validateInput(input);
  const targetBar = request.bars.find((bar) => bar.position === request.target.barPosition);
  if (!targetBar) throw new ValidationError("target bar is outside the requested block");
  if (targetBar.chords.length > 1) {
    const beats = targetBar.chords.map((_chord, index) => index + 1);
    if (!beats.includes(request.target.beat) || request.target.beat !== beats[0] && request.target.beat !== beats.at(-1)) return null;
  }
  const targetIndex = request.bars.findIndex((bar) => bar.position === request.target.barPosition);
  const next = request.bars[targetIndex + 1]?.chords.at(-1) ?? null;
  const rules = database.prepare("SELECT id, name, rule_type, condition, description FROM technique_rules WHERE enabled = 1 ORDER BY priority DESC, id ASC").all() as unknown as Array<{ id: number; name: string; rule_type: string; condition: string; description: string }>;
  for (const rule of rules) {
    if (ruleMatches(rule.rule_type, JSON.parse(rule.condition) as Record<string, unknown>, request.before, request.after, next)) {
      return { id: rule.id, name: rule.name, description: rule.description };
    }
  }
  return null;
}
