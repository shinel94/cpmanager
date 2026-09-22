import { getSemitoneInterval, isDiatonicDegree } from "@/app/lib/server/domain/harmonic-math";
import type { TechniqueMatchContext, TechniqueMatchResult, TechniqueMatcher } from "@/app/lib/server/domain/technique-matcher";

export const secondaryLeadingToneMatcher: TechniqueMatcher = {
  ruleType: "secondary_leading_tone",
  match(context: TechniqueMatchContext): TechniqueMatchResult {
    const next = context.next;
    const matched = (context.after.quality === "diminished" || context.after.quality === "half-diminished")
      && next !== null
      && isDiatonicDegree(next.degree)
      && getSemitoneInterval(context.after.degree, next.degree) === 1;
    return {
      matched,
      confidence: matched ? 0.9 : 0,
      evidence: matched && next ? [`다음 화음 ${next.degree}로 반음 상행 해결되는 이끔음 감화음입니다.`] : [],
      metadata: matched && next ? { targetDegree: next.degree } : undefined,
    };
  },
};
