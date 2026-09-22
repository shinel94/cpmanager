import assert from "node:assert/strict";
import test from "node:test";

import { normalizeAnalysisInput } from "../app/lib/server/domain/analysis-context";
import { openDatabase } from "../app/lib/server/db/database";
import { seedWave1 } from "../app/lib/server/db/seed";
import { analyzeTechnique } from "../app/lib/server/services/technique-analyzer";

const chord = (degree: string, quality: "major" | "minor" = "major", beat?: number) => ({
  ...(beat === undefined ? {} : { beat }),
  degree,
  quality,
  extension: null,
  bass_degree: null,
});

test("normalizes missing beats using one-indexed fallback", () => {
  const normalized = normalizeAnalysisInput({
    tonic: "C",
    sectionName: "Verse",
    blockStart: 1,
    target: { barPosition: 2, beat: 2 },
    before: chord("I"),
    after: chord("V"),
    bars: [
      { position: 1, chords: [chord("I")] },
      { position: 2, chords: [chord("IV"), chord("V")] },
      { position: 3, chords: [] },
      { position: 4, chords: [] },
    ],
  });
  assert.deepEqual(normalized.bars[1].chords.map((item) => item.beat), [1, 2]);
});

test("preserves explicit non-contiguous beats", () => {
  const normalized = normalizeAnalysisInput({
    tonic: "C",
    sectionName: "Verse",
    blockStart: 1,
    target: { barPosition: 2, beat: 3 },
    before: chord("I"),
    after: chord("V"),
    bars: [
      { position: 1, chords: [] },
      { position: 2, chords: [chord("IV", "major", 1), chord("V", "major", 3)] },
      { position: 3, chords: [] },
      { position: 4, chords: [] },
    ],
  });
  assert.deepEqual(normalized.bars[1].chords.map((item) => item.beat), [1, 3]);
});

test("skips middle-beat mutation analysis", () => {
  const database = openDatabase(":memory:");
  try {
    seedWave1(database);
    const result = analyzeTechnique(database, {
      tonic: "C",
      sectionName: "Verse",
      blockStart: 1,
      target: { barPosition: 2, beat: 2 },
      before: chord("IV"),
      after: chord("V"),
      bars: [
        { position: 1, chords: [chord("I")] },
        { position: 2, chords: [chord("IV", "major", 1), chord("V", "major", 2), chord("I", "major", 3)] },
        { position: 3, chords: [] },
        { position: 4, chords: [] },
      ],
    });
    assert.equal(result, null);
  } finally {
    database.close();
  }
});
