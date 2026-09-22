import type { TechniqueMatchContext, TechniqueMatchResult, TechniqueMatcher } from "@/app/lib/server/domain/technique-matcher";

export const modalInterchangeMatcher: TechniqueMatcher = {
  ruleType: "modal_interchange",
  match(context: TechniqueMatchContext, condition: Record<string, unknown>): TechniqueMatchResult {
    const afterCondition = condition.after;
    const afterMatches = afterCondition && typeof afterCondition === "object"
      && (afterCondition as Record<string, unknown>).degree === context.after.degree
      && (afterCondition as Record<string, unknown>).quality === context.after.quality;
    const sameRootQualityChange = condition.same_root_degree === true
      && context.before.degree === context.after.degree
      && context.before.quality === "major"
      && context.after.quality === "minor";
    const matched = Boolean(afterMatches || sameRootQualityChange);
    const sourceMode = sameRootQualityChange
      ? "Parallel minor"
      : afterMatches && (afterCondition as Record<string, unknown>).degree === "bVII"
        ? "Mixolydian/Aeolian"
        : afterMatches && (afterCondition as Record<string, unknown>).degree === "bIII"
          ? "Aeolian"
          : afterMatches
            ? "Aeolian"
            : undefined;
    return {
      matched,
      confidence: matched ? (sameRootQualityChange ? 0.98 : 0.9) : 0,
      evidence: matched ? ["평행조 또는 차용 모드의 화음으로 변경되었습니다."] : [],
      metadata: matched ? { sourceDegree: context.after.degree, sourceMode } : undefined,
    };
  },
};
