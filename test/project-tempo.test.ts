import test from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { applyMigrations } from "@/app/lib/server/db/migrations";
import {
  createProject,
  getProject,
  listProjects,
  saveProject,
} from "@/app/lib/server/repositories/project-repository";
import {
  createDefaultPopProject,
  createEmptyProject,
  hydrateProjectDraft,
  serializeProjectDraft,
} from "@/app/lib/client/project-serializer";
import { projectDraftReducer } from "@/app/lib/client/draft-reducer";

function createInMemoryDb(): DatabaseSync {
  const db = new DatabaseSync(":memory:");
  applyMigrations(db);
  return db;
}

test("creates project with default tempo and custom tempo in DB", () => {
  const db = createInMemoryDb();
  try {
    // 1. Default tempo 120
    const id1 = createProject(db, {
      name: "Default Tempo Song",
      tonic: "C",
    });
    const project1 = getProject(db, id1);
    assert.ok(project1);
    assert.equal(project1.tempo, 120);
    assert.equal(project1.time_signature, "4/4");

    // 2. Custom tempo 145
    const id2 = createProject(db, {
      name: "Fast Dance Song",
      tonic: "G",
      tempo: 145,
    });
    const project2 = getProject(db, id2);
    assert.ok(project2);
    assert.equal(project2.tempo, 145);
    assert.equal(project2.time_signature, "4/4");

    // 3. listProjects exposes tempo and time_signature
    const list = listProjects(db) as Array<{ id: number; tempo: number; time_signature: string }>;
    assert.equal(list.length, 2);
    assert.ok(list.some((p) => p.tempo === 120));
    assert.ok(list.some((p) => p.tempo === 145));
  } finally {
    db.close();
  }
});

test("updates tempo when saving project and rejects invalid tempo", () => {
  const db = createInMemoryDb();
  try {
    const id = createProject(db, {
      name: "BPM Test",
      tonic: "D",
      tempo: 100,
    });

    // Valid update to 85 BPM
    const updated = saveProject(db, id, {
      name: "BPM Test Updated",
      tonic: "D",
      tempo: 85,
      sections: [
        {
          name: "Intro",
          position: 0,
          bar_count: 4,
          bars: Array.from({ length: 4 }, (_, idx) => ({
            position: idx + 1,
            chords: [],
          })),
        },
      ],
    });
    assert.equal(updated.tempo, 85);
    assert.equal(updated.time_signature, "4/4");

    // Reject tempo < 40
    assert.throws(
      () =>
        saveProject(db, id, {
          name: "Too slow",
          tonic: "D",
          tempo: 30,
          sections: [],
        }),
      /tempo must be an integer >= 40/
    );

    // Reject tempo > 240
    assert.throws(
      () =>
        saveProject(db, id, {
          name: "Too fast",
          tonic: "D",
          tempo: 280,
          sections: [],
        }),
      /tempo must be <= 240/
    );
  } finally {
    db.close();
  }
});

test("client ProjectDraft manages tempo and serializes/hydrates accurately", () => {
  // 1. Initial templates
  const empty = createEmptyProject("Empty", "C");
  assert.equal(empty.tempo, 120);
  assert.equal(empty.time_signature, "4/4");

  const pop = createDefaultPopProject("Pop", "F");
  assert.equal(pop.tempo, 120);
  assert.equal(pop.time_signature, "4/4");

  // 2. Reducer SET_TEMPO with bounds clamping
  const s1 = projectDraftReducer(pop, {
    type: "SET_TEMPO",
    payload: { tempo: 150 },
  });
  assert.equal(s1.tempo, 150);

  const s2 = projectDraftReducer(s1, {
    type: "SET_TEMPO",
    payload: { tempo: 300 }, // clamped to 240
  });
  assert.equal(s2.tempo, 240);

  const s3 = projectDraftReducer(s2, {
    type: "SET_TEMPO",
    payload: { tempo: 20 }, // clamped to 40
  });
  assert.equal(s3.tempo, 40);

  // 3. Serialize includes tempo and time_signature
  const serialized = serializeProjectDraft(s1);
  assert.equal(serialized.tempo, 150);
  assert.equal(serialized.time_signature, "4/4");

  // 4. Hydrate restores tempo and time_signature from server response
  const hydrated = hydrateProjectDraft({
    project: {
      id: 99,
      name: "Server Song",
      tonic: "A",
      tempo: 96,
      time_signature: "4/4",
      sections: [],
    },
  });
  assert.equal(hydrated.tempo, 96);
  assert.equal(hydrated.time_signature, "4/4");
});
