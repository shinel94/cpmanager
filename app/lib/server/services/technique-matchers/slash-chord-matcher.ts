import { getSemitoneInterval } from "@/app/lib/server/domain/harmonic-math";
import type { TechniqueMatchContext, TechniqueMatchResult, TechniqueMatcher } from "@/app/lib/server/domain/technique-matcher";

export const slashChordMatcher: TechniqueMatcher = {
  ruleType: "slash_chord",
  match(context: TechniqueMatchContext): TechniqueMatchResult {
    const matched = context.after.bass_degree !== null;
    const interval = matched && context.after.bass_degree ? getSemitoneInterval(context.after.degree, context.after.bass_degree) : null;
    const inversion = interval === 3 || interval === 4
      ? "first_inversion"
      : interval === 7 || interval === 8
        ? "second_inversion"
        : interval === 10 || interval === 11
          ? "third_inversion"
          : "slash_bass";
    return {
      matched,
      confidence: matched ? 0.9 : 0,
      evidence: matched ? [`베이스 도수 ${context.after.bass_degree}를 사용하는 슬래시 코드입니다.`] : [],
      metadata: matched ? { inversion } : undefined,
    };
  },
};
