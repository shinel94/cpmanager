import assert from "node:assert/strict";
import test from "node:test";

import {
  getMajorDiatonicQualities,
  normalizeBassDegree,
  normalizeDegree,
  normalizeStep,
} from "../app/lib/server/catalog/chord-catalog";
import { applyMigrations } from "../app/lib/server/db/migrations";
import { loadProgressions, seedWave1 } from "../app/lib/server/db/seed";
import { openDatabase } from "../app/lib/server/db/database";

test("normalizes degree and chord attributes", () => {
  assert.equal(normalizeDegree("ii"), "II");
  assert.equal(normalizeDegree("vii°"), "VII");
  assert.equal(normalizeDegree("#IV"), "#IV");
  assert.equal(normalizeBassDegree("b7"), "bVII");
  assert.throws(() => normalizeDegree("bbVI"));
  assert.deepEqual(getMajorDiatonicQualities(), {
    I: "major",
    II: "minor",
    III: "minor",
    IV: "major",
    V: "major",
    VI: "minor",
    VII: "diminished",
  });

  assert.deepEqual(
    normalizeStep({ degree: "vii°", quality: "half-diminished", extension: "m7b5" }),
    { degree: "VII", quality: "half-diminished", extension: "m7b5", bass_degree: null },
  );
  assert.deepEqual(
    normalizeStep({ degree: "V", quality: "dominant", extension: "7" }),
    { degree: "V", quality: "dominant", extension: "7", bass_degree: null },
  );
  assert.throws(() => normalizeStep({ degree: "V", quality: "major", extension: "m7b5" }));
});

test("loads and normalizes all recommendation data", () => {
  const rows = loadProgressions();
  assert.equal(rows.length, 160);
  assert.equal(rows.reduce((total, row) => total + row.steps.length, 0), 640);
  assert.equal(rows.every((row) => row.steps.every((step) => /^[b#]?[IV]+$/.test(step.degree))), true);
});

test("creates all Wave 1 tables and seeds data", () => {
  const database = openDatabase(":memory:");
  try {
    applyMigrations(database);
    const tables = database
      .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name")
      .all() as Array<{ name: string }>;
    assert.equal(tables.length, 11);

    const result = seedWave1(database);
    assert.deepEqual(result, { progressions: 160, steps: 640, rules: 5 });

    const tagCount = database.prepare("SELECT COUNT(*) AS count FROM system_progression_form_tags").get() as { count: number };
    assert.ok(tagCount.count > 0);

    database.prepare("INSERT INTO projects (id, name, tonic, created_at, updated_at) VALUES (1, 'test', 'C', 'now', 'now')").run();
    database.prepare("INSERT INTO sections (id, project_id, position, name, bar_count) VALUES (1, 1, 0, 'Verse', 1)").run();
    database.prepare("INSERT INTO bars (id, section_id, position) VALUES (1, 1, 1)").run();
    database.prepare("INSERT INTO bar_chords (id, bar_id, beat, degree, quality) VALUES (1, 1, 1, 'I', 'major')").run();
    assert.throws(() => database.prepare("INSERT INTO bar_chords (bar_id, beat, degree, quality) VALUES (1, 1, 'V', 'major')").run());
    database.prepare("DELETE FROM projects WHERE id = 1").run();
    const remainingBars = database.prepare("SELECT COUNT(*) AS count FROM bars").get() as { count: number };
    assert.equal(remainingBars.count, 0);
  } finally {
    database.close();
  }
});
