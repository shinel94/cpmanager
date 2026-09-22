import type { ChordStep } from "@/app/lib/server/catalog/chord-catalog";
import type { NormalizedAnalysisInput } from "@/app/lib/server/domain/analysis-context";

export type TechniqueMatchContext = NormalizedAnalysisInput & {
  next: ChordStep | null;
};

export type TechniqueMatchResult = {
  matched: boolean;
  confidence: number;
  evidence: string[];
  metadata?: Record<string, unknown>;
};

export interface TechniqueMatcher {
  readonly ruleType: string;
  match(context: TechniqueMatchContext, condition: Record<string, unknown>): TechniqueMatchResult;
}
