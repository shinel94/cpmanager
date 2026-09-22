import type { TechniqueMatcher } from "@/app/lib/server/domain/technique-matcher";
import { chordVariationMatcher } from "@/app/lib/server/services/technique-matchers/chord-variation-matcher";
import { modalInterchangeMatcher } from "@/app/lib/server/services/technique-matchers/modal-interchange-matcher";
import { secondaryDominantMatcher } from "@/app/lib/server/services/technique-matchers/secondary-dominant-matcher";
import { secondaryLeadingToneMatcher } from "@/app/lib/server/services/technique-matchers/secondary-leading-tone-matcher";
import { slashChordMatcher } from "@/app/lib/server/services/technique-matchers/slash-chord-matcher";
import {
  backdoorDominantMatcher,
  chromaticMediantMatcher,
  commonToneDiminishedMatcher,
  passingDiminishedMatcher,
  tritoneSubstitutionMatcher,
} from "@/app/lib/server/services/technique-matchers/advanced-harmony-matchers";

const MATCHERS: TechniqueMatcher[] = [
  modalInterchangeMatcher,
  secondaryDominantMatcher,
  secondaryLeadingToneMatcher,
  slashChordMatcher,
  chordVariationMatcher,
  tritoneSubstitutionMatcher,
  backdoorDominantMatcher,
  chromaticMediantMatcher,
  passingDiminishedMatcher,
  commonToneDiminishedMatcher,
];

export function getTechniqueMatcher(ruleType: string): TechniqueMatcher | undefined {
  return MATCHERS.find((matcher) => matcher.ruleType === ruleType);
}

export function getTechniqueMatchers(): TechniqueMatcher[] {
  return [...MATCHERS];
}
