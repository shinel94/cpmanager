import type { DatabaseSync } from "node:sqlite";

import { normalizeAnalysisInput } from "@/app/lib/server/domain/analysis-context";
import type { TechniqueMatchContext } from "@/app/lib/server/domain/technique-matcher";
import { getTechniqueMatcher } from "@/app/lib/server/services/technique-matchers";
import { ValidationError } from "@/app/lib/server/validation/project-payload";

export function analyzeTechnique(database: DatabaseSync, input: unknown) {
  const request = normalizeAnalysisInput(input);
  const targetBar = request.bars.find((bar) => bar.position === request.target.barPosition);
  if (!targetBar) throw new ValidationError("target bar is outside the requested block");
  if (targetBar.chords.length > 1) {
    const beats = targetBar.chords.map((chord) => chord.beat).sort((a, b) => a - b);
    if (!beats.includes(request.target.beat) || request.target.beat !== beats[0] && request.target.beat !== beats.at(-1)) return null;
  }
  const targetIndex = request.bars.findIndex((bar) => bar.position === request.target.barPosition);
  const targetChords = targetBar.chords;
  const lastBeat = targetChords.at(-1)?.beat;
  const canAnalyzeNext = targetChords.length <= 1 || request.target.beat === lastBeat;
  const next = canAnalyzeNext ? request.bars[targetIndex + 1]?.chords.at(-1) ?? null : null;
  const context: TechniqueMatchContext = { ...request, next };
  const rules = database.prepare("SELECT id, name, rule_type, condition, description FROM technique_rules WHERE enabled = 1 ORDER BY priority DESC, id ASC").all() as unknown as Array<{ id: number; name: string; rule_type: string; condition: string; description: string }>;
  const matches: Array<{
    id: number;
    name: string;
    description: string;
    confidence: number;
    evidence: string[];
    [key: string]: unknown;
  }> = [];
  for (const rule of rules) {
    const matcher = getTechniqueMatcher(rule.rule_type);
    if (!matcher) continue;
    const result = matcher.match(context, JSON.parse(rule.condition) as Record<string, unknown>);
    if (result.matched) {
      matches.push({ id: rule.id, name: rule.name, description: rule.description, confidence: result.confidence, evidence: result.evidence, ...result.metadata });
    }
  }
  if (matches.length === 0) return null;
  const [primary, ...alternatives] = matches;
  return { ...primary, alternatives };
}
