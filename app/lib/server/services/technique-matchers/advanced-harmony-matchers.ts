import { getSemitoneInterval } from "@/app/lib/server/domain/harmonic-math";
import type { TechniqueMatchContext, TechniqueMatchResult, TechniqueMatcher } from "@/app/lib/server/domain/technique-matcher";

export const tritoneSubstitutionMatcher: TechniqueMatcher = {
  ruleType: "tritone_substitution",
  match(context: TechniqueMatchContext): TechniqueMatchResult {
    const matched = context.after.quality === "dominant"
      && (context.after.extension === "7" || context.after.extension === "9")
      && context.next !== null
      && getSemitoneInterval(context.next.degree, context.after.degree) === 1;
    return {
      matched,
      confidence: matched ? 0.9 : 0,
      evidence: matched && context.next ? [`${context.after.degree} 도미넌트가 ${context.next.degree}로 반음 해결됩니다.`] : [],
      metadata: matched && context.next ? { targetDegree: context.next.degree } : undefined,
    };
  },
};

export const backdoorDominantMatcher: TechniqueMatcher = {
  ruleType: "backdoor_dominant",
  match(context: TechniqueMatchContext): TechniqueMatchResult {
    const matched = context.after.degree === "bVII"
      && context.after.quality === "dominant"
      && (context.after.extension === "7" || context.after.extension === "9")
      && context.next?.degree === "I";
    return {
      matched,
      confidence: matched ? 0.94 : 0,
      evidence: matched ? ["bVII 도미넌트가 토닉으로 해결됩니다."] : [],
      metadata: matched ? { targetDegree: "I" } : undefined,
    };
  },
};

export const chromaticMediantMatcher: TechniqueMatcher = {
  ruleType: "chromatic_mediant",
  match(context: TechniqueMatchContext): TechniqueMatchResult {
    const interval = getSemitoneInterval(context.before.degree, context.after.degree);
    const matched = context.before.quality === context.after.quality && [3, 4, 8, 9].includes(interval);
    return {
      matched,
      confidence: matched ? 0.78 : 0,
      evidence: matched ? [`${interval}반음의 3도 관계로 이동합니다.`] : [],
    };
  },
};

export const passingDiminishedMatcher: TechniqueMatcher = {
  ruleType: "passing_diminished",
  match(context: TechniqueMatchContext): TechniqueMatchResult {
    const matched = (context.after.quality === "diminished" || context.after.quality === "half-diminished")
      && context.next !== null
      && [1, 2, 10, 11].includes(getSemitoneInterval(context.before.degree, context.after.degree))
      && [1, 2, 10, 11].includes(getSemitoneInterval(context.after.degree, context.next.degree));
    return {
      matched,
      confidence: matched ? 0.75 : 0,
      evidence: matched ? ["인접 화음 사이를 단계적으로 연결하는 디미니시드입니다."] : [],
    };
  },
};

export const commonToneDiminishedMatcher: TechniqueMatcher = {
  ruleType: "common_tone_diminished",
  match(context: TechniqueMatchContext): TechniqueMatchResult {
    const matched = (context.after.quality === "diminished" || context.after.quality === "half-diminished")
      && context.next !== null
      && context.before.degree === context.next.degree;
    return {
      matched,
      confidence: matched ? 0.7 : 0,
      evidence: matched ? ["같은 목표 도수를 중심으로 디미니시드가 연결됩니다."] : [],
    };
  },
};
