import assert from "node:assert/strict";
import test from "node:test";

import { normalizeStep, TONICS } from "../app/lib/server/catalog/chord-catalog";
import { getBassNote, getMajorDiatonicChords, realizeChord, realizeChords } from "../app/lib/server/domain/chord-realizer";
import { partitionRecommendationBlocks, isBlockFilled } from "../app/lib/server/domain/recommendation-blocks";
import { matchesDegreePattern, matchesPartialProgression, normalizeSearchPattern } from "../app/lib/server/domain/progression-matcher";

const step = (degree: string, quality: "major" | "minor" | "dominant" = "major") =>
  normalizeStep({ degree, quality, extension: null, bass_degree: null });

test("realizes chords using flat canonical tonics", () => {
  assert.equal(realizeChord("C", step("I")), "C");
  assert.equal(realizeChord("C", step("VI", "minor")), "Am");
  assert.equal(realizeChord("C", normalizeStep({ degree: "V", quality: "dominant", extension: "7" })), "G7");
  assert.equal(realizeChord("C", normalizeStep({ degree: "V", quality: "major", extension: "sus4" })), "Gsus4");
  assert.equal(realizeChord("C", normalizeStep({ degree: "V", quality: "major", bass_degree: "VII" })), "G/B");
  assert.equal(getBassNote("C", "VII"), "B");
  assert.deepEqual(realizeChords("C", [step("I"), step("V"), step("VI", "minor"), step("IV")]), ["C", "G", "Am", "F"]);
});

test("generates major diatonic chords", () => {
  const chords = getMajorDiatonicChords("C");
  assert.deepEqual(chords.map((chord) => chord.displayName), ["C", "Dm", "Em", "F", "G", "Am", "Bdim"]);
  for (const tonic of TONICS) {
    assert.equal(getMajorDiatonicChords(tonic).length, 7);
    assert.ok(getMajorDiatonicChords(tonic).every((chord) => chord.displayName.length > 0));
  }
  assert.throws(() => getMajorDiatonicChords("F#"));
});

test("partitions recommendation blocks without overlap", () => {
  const bars = Array.from({ length: 9 }, (_, index) => ({ position: index + 1, chords: [] as string[] }));
  const blocks = partitionRecommendationBlocks(bars);
  assert.deepEqual(blocks.map((block) => [block.start, block.end, block.reason]), [
    [1, 4, null],
    [5, 8, null],
    [9, 9, "too_short"],
  ]);

  const excluded = partitionRecommendationBlocks([
    { position: 1, chords: ["I"] },
    { position: 2, chords: ["II", "V"] },
    { position: 3, chords: [] },
    { position: 4, chords: [] },
  ])[0];
  assert.equal(excluded.reason, "multi_chord_excluded");
  assert.equal(isBlockFilled(excluded), false);
});

test("matches degree wildcards and partial steps", () => {
  const progression = [step("I"), step("II", "minor"), step("I"), step("I")];
  assert.deepEqual(normalizeSearchPattern(["x", "ii", "I", "x"]), ["x", "II", "I", "x"]);
  assert.equal(matchesDegreePattern(progression, ["x", "ii", "I", "x"]), true);
  assert.equal(matchesDegreePattern(progression, ["I", "I", "x", "x"]), false);
  assert.throws(() => normalizeSearchPattern(["x", "x", "x", "x"]));
  assert.equal(matchesPartialProgression(progression, [step("I"), null, null, null]), true);
  assert.equal(matchesPartialProgression(progression, [null, step("V"), null, null]), false);
});
