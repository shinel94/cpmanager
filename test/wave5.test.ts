import assert from "node:assert/strict";
import test from "node:test";

import { applyMigrations } from "../app/lib/server/db/migrations";
import { openDatabase } from "../app/lib/server/db/database";
import { seedWave1 } from "../app/lib/server/db/seed";
import { getRecommendations } from "../app/lib/server/services/recommendation-service";
import { analyzeTechnique } from "../app/lib/server/services/technique-analyzer";
import { createUserProgression, searchUserProgressions } from "../app/lib/server/repositories/user-progression-repository";

const emptyBars = () => [1, 2, 3, 4].map((position) => ({ position, chords: [] as unknown[] }));

test("recommends from draft bars without a project ID", () => {
  const database = openDatabase(":memory:");
  try {
    seedWave1(database);
    const bars = emptyBars();
    bars[0].chords = [{ beat: 1, degree: "I", quality: "major", extension: null, bass_degree: null }];
    const result = getRecommendations(database, { tonic: "C", sectionName: "Chorus", blockStart: 1, bars, sort: "popularity", page: 1, pageSize: 3 });
    assert.equal(result.emptyReason, null);
    assert.ok(result.items.length > 0);
    assert.equal(result.items[0].steps[0].displayName, "C");
  } finally {
    database.close();
  }
});

test("recommendation returns explicit draft block exclusions", () => {
  const database = openDatabase(":memory:");
  try {
    seedWave1(database);
    const bars = emptyBars();
    bars[1].chords = [
      { beat: 1, degree: "I", quality: "major", extension: null, bass_degree: null },
      { beat: 2, degree: "V", quality: "major", extension: null, bass_degree: null },
    ];
    assert.equal(getRecommendations(database, { tonic: "C", sectionName: "Chorus", blockStart: 1, bars }).emptyReason, "multi_chord_excluded");
  } finally {
    database.close();
  }
});

test("analyzes technique from unsaved four-bar context", () => {
  const database = openDatabase(":memory:");
  try {
    seedWave1(database);
    const bars = emptyBars();
    bars[0].chords = [{ beat: 1, degree: "IV", quality: "major", extension: null, bass_degree: null }];
    bars[1].chords = [{ beat: 1, degree: "IV", quality: "minor", extension: null, bass_degree: null }];
    const result = analyzeTechnique(database, {
      tonic: "C",
      sectionName: "Bridge",
      blockStart: 1,
      target: { barPosition: 2, beat: 1 },
      before: bars[0].chords[0],
      after: bars[1].chords[0],
      bars,
    });
    assert.equal(result?.name, "모달 인터체인지");
  } finally {
    database.close();
  }
});

test("searches user progressions with degree wildcards", () => {
  const database = openDatabase(":memory:");
  try {
    applyMigrations(database);
    createUserProgression(database, {
      name: "Stored",
      formTags: ["Verse"],
      steps: ["I", "II", "I", "I"].map((degree, index) => ({ position: index + 1, degree, quality: index === 1 ? "minor" : "major" })),
    });
    assert.equal(searchUserProgressions(database, ["x", "ii", "I", "x"]).length, 1);
    assert.throws(() => searchUserProgressions(database, ["x", "x", "x", "x"]));
  } finally {
    database.close();
  }
});
