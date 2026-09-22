import type { TechniqueMatchContext, TechniqueMatchResult, TechniqueMatcher } from "@/app/lib/server/domain/technique-matcher";

export const chordVariationMatcher: TechniqueMatcher = {
  ruleType: "chord_variation",
  match(context: TechniqueMatchContext, condition: Record<string, unknown>): TechniqueMatchResult {
    const extensionChanged = context.before.extension !== context.after.extension;
    const qualityChanged = context.before.quality !== context.after.quality;
    const bassChanged = context.before.bass_degree !== context.after.bass_degree;
    const matched = condition.extension_changed === true
      ? extensionChanged || qualityChanged || bassChanged
      : extensionChanged || qualityChanged || bassChanged;
    return {
      matched,
      confidence: matched ? 0.7 : 0,
      evidence: matched ? ["코드의 화음 유형, 텐션 또는 베이스 속성이 변경되었습니다."] : [],
    };
  },
};
