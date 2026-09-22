import assert from "node:assert/strict";
import test from "node:test";

import { normalizeStep } from "../app/lib/server/catalog/chord-catalog";
import { getTechniqueMatcher, getTechniqueMatchers } from "../app/lib/server/services/technique-matchers";

const baseContext = {
  tonic: "C",
  sectionName: "Bridge",
  blockStart: 1,
  target: { barPosition: 2, beat: 1 },
  before: normalizeStep({ degree: "IV", quality: "major", extension: null, bass_degree: null }),
  after: normalizeStep({ degree: "IV", quality: "minor", extension: null, bass_degree: null }),
  next: null,
  bars: [
    { position: 1, chords: [] },
    { position: 2, chords: [] },
    { position: 3, chords: [] },
    { position: 4, chords: [] },
  ],
};

test("registers the technique matchers", () => {
  assert.deepEqual(getTechniqueMatchers().map((matcher) => matcher.ruleType), [
    "modal_interchange",
    "secondary_dominant",
    "secondary_leading_tone",
    "slash_chord",
    "chord_variation",
    "tritone_substitution",
    "backdoor_dominant",
    "chromatic_mediant",
    "passing_diminished",
    "common_tone_diminished",
  ]);
});

test("matchers return structured evidence", () => {
  const modal = getTechniqueMatcher("modal_interchange");
  const slash = getTechniqueMatcher("slash_chord");
  assert.equal(modal?.match(baseContext, { same_root_degree: true }).matched, true);
  assert.ok((modal?.match(baseContext, { same_root_degree: true }).evidence.length ?? 0) > 0);
  const slashResult = slash?.match({
    ...baseContext,
    after: normalizeStep({ degree: "V", quality: "major", extension: null, bass_degree: "VII" }),
  }, {});
  assert.equal(slashResult?.matched, true);
  const leadingTone = getTechniqueMatcher("secondary_leading_tone");
  const leadingResult = leadingTone?.match({
    ...baseContext,
    after: normalizeStep({ degree: "VII", quality: "diminished", extension: null, bass_degree: null }),
    next: normalizeStep({ degree: "I", quality: "major", extension: null, bass_degree: null }),
  }, {});
  assert.equal(leadingResult?.matched, true);
});

test("advanced matchers cover reharmonization cases", () => {
  const context = {
    tonic: "C",
    sectionName: "Bridge",
    blockStart: 1,
    target: { barPosition: 2, beat: 1 },
    before: normalizeStep({ degree: "V", quality: "major", extension: null, bass_degree: null }),
    after: normalizeStep({ degree: "bII", quality: "dominant", extension: "7", bass_degree: null }),
    next: normalizeStep({ degree: "I", quality: "major", extension: null, bass_degree: null }),
    bars: [],
  };
  assert.equal(getTechniqueMatcher("tritone_substitution")?.match(context, {}).matched, true);
  assert.equal(getTechniqueMatcher("backdoor_dominant")?.match({
    ...context,
    after: normalizeStep({ degree: "bVII", quality: "dominant", extension: "7", bass_degree: null }),
  }, {}).matched, true);
  assert.equal(getTechniqueMatcher("chromatic_mediant")?.match({
    ...context,
    before: normalizeStep({ degree: "I", quality: "major", extension: null, bass_degree: null }),
    after: normalizeStep({ degree: "bIII", quality: "major", extension: null, bass_degree: null }),
  }, {}).matched, true);
});
