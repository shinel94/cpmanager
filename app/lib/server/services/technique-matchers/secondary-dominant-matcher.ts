import { getSemitoneInterval } from "@/app/lib/server/domain/harmonic-math";
import type { TechniqueMatchContext, TechniqueMatchResult, TechniqueMatcher } from "@/app/lib/server/domain/technique-matcher";

export const secondaryDominantMatcher: TechniqueMatcher = {
  ruleType: "secondary_dominant",
  match(context: TechniqueMatchContext): TechniqueMatchResult {
    const next = context.next;
    const matched = context.after.quality === "dominant"
      && (context.after.extension === "7" || context.after.extension === "9")
      && next !== null
      && next.degree !== "VII"
      && next.quality !== "diminished"
      && getSemitoneInterval(next.degree, context.after.degree) === 7;
    return {
      matched,
      confidence: matched ? 0.95 : 0,
      evidence: matched && next ? [`다음 화음 ${next.degree}로 해결되는 도미넌트 화음입니다.`] : [],
      metadata: matched && next ? { targetDegree: next.degree } : undefined,
    };
  },
};
