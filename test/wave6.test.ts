import assert from "node:assert/strict";
import test from "node:test";

import { openDatabase } from "../app/lib/server/db/database";
import { applyMigrations } from "../app/lib/server/db/migrations";
import { seedWave1 } from "../app/lib/server/db/seed";
import { createProject, deleteProject, getProject, saveProject } from "../app/lib/server/repositories/project-repository";
import { createUserProgression, searchUserProgressions } from "../app/lib/server/repositories/user-progression-repository";
import { getRecommendations } from "../app/lib/server/services/recommendation-service";
import { analyzeTechnique } from "../app/lib/server/services/technique-analyzer";

function bars(count: number, firstChord = true) {
  return Array.from({ length: count }, (_, index) => ({
    position: index + 1,
    chords: firstChord && index === 0
      ? [{ beat: 1, degree: "I", quality: "major", extension: null, bass_degree: null }]
      : [],
  }));
}

function projectPayload(barCount: number) {
  return {
    name: "Integration Project",
    tonic: "C",
    mode: "major",
    sections: [{ position: 0, name: "Verse", bar_count: barCount, bars: bars(barCount) }],
  };
}

test("reproduces a clean database and an idempotent seed", () => {
  const database = openDatabase(":memory:");
  try {
    applyMigrations(database);
    const first = seedWave1(database);
    const second = seedWave1(database);
    assert.deepEqual(first, { progressions: 160, steps: 640, rules: 13 });
    assert.deepEqual(second, first);
    const tableCount = database.prepare("SELECT COUNT(*) AS count FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'").get() as { count: number };
    assert.equal(tableCount.count, 11);
  } finally {
    database.close();
  }
});

test("covers project, recommendation, analysis, and user progression isolation", () => {
  const database = openDatabase(":memory:");
  try {
    const seedResult = seedWave1(database);
    const projectId = createProject(database, { name: "Integration Project", tonic: "C", mode: "major" });
    saveProject(database, projectId, projectPayload(8));
    assert.equal(getProject(database, projectId)?.sections[0].bars.length, 8);

    saveProject(database, projectId, projectPayload(4));
    assert.equal(getProject(database, projectId)?.sections[0].bars.length, 4);

    const systemCountBefore = (database.prepare("SELECT COUNT(*) AS count FROM system_recommendation_progressions").get() as { count: number }).count;
    const recommendation = getRecommendations(database, {
      tonic: "C",
      sectionName: "Chorus",
      blockStart: 1,
      bars: bars(4),
      sort: "popularity",
      page: 1,
      pageSize: 3,
    });
    assert.equal(recommendation.items.length, 3);
    assert.equal((database.prepare("SELECT COUNT(*) AS count FROM system_recommendation_progressions").get() as { count: number }).count, systemCountBefore);

    const analysis = analyzeTechnique(database, {
      tonic: "C",
      sectionName: "Bridge",
      blockStart: 1,
      target: { barPosition: 2, beat: 1 },
      before: { degree: "IV", quality: "major", extension: null, bass_degree: null },
      after: { degree: "IV", quality: "minor", extension: null, bass_degree: null },
      bars: [
        { position: 1, chords: [{ beat: 1, degree: "IV", quality: "major", extension: null, bass_degree: null }] },
        { position: 2, chords: [{ beat: 1, degree: "IV", quality: "minor", extension: null, bass_degree: null }] },
        { position: 3, chords: [] },
        { position: 4, chords: [] },
      ],
    });
    assert.equal(analysis?.name, "모달 인터체인지");

    const userId = createUserProgression(database, {
      name: "Private Integration",
      formTags: ["Verse"],
      steps: ["I", "II", "I", "I"].map((degree, index) => ({ position: index + 1, degree, quality: index === 1 ? "minor" : "major" })),
    });
    assert.equal(searchUserProgressions(database, ["x", "II", "I", "x"]).length, 1);
    assert.equal((database.prepare("SELECT COUNT(*) AS count FROM user_progressions WHERE id = ?").get(userId) as { count: number }).count, 1);
    assert.equal((database.prepare("SELECT COUNT(*) AS count FROM system_recommendation_progressions").get() as { count: number }).count, seedResult.progressions);
  } finally {
    database.close();
  }
});

test("rejects invalid requests and preserves project data after failed save", () => {
  const database = openDatabase(":memory:");
  try {
    applyMigrations(database);
    const projectId = createProject(database, { name: "Stable", tonic: "C", mode: "major" });
    saveProject(database, projectId, projectPayload(4));
    assert.throws(() => saveProject(database, projectId, { ...projectPayload(4), sections: [{ ...projectPayload(4).sections[0], bars: [] }] }));
    assert.equal(getProject(database, projectId)?.name, "Integration Project");
    assert.throws(() => getRecommendations(database, { tonic: "C", sectionName: "Chorus", bars: [] }));
    assert.throws(() => analyzeTechnique(database, { tonic: "C", sectionName: "Bridge", bars: [] }));
    assert.equal(deleteProject(database, projectId), true);
  } finally {
    database.close();
  }
});
