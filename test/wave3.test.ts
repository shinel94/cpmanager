import assert from "node:assert/strict";
import test from "node:test";

import { getChordCatalog } from "../app/lib/server/catalog/chord-catalog";
import { getMajorDiatonicChords } from "../app/lib/server/domain/chord-realizer";
import { openDatabase } from "../app/lib/server/db/database";
import { applyMigrations } from "../app/lib/server/db/migrations";
import { createProject, deleteProject, getProject, saveProject } from "../app/lib/server/repositories/project-repository";
import { createUserProgression, getUserProgression, listUserProgressions } from "../app/lib/server/repositories/user-progression-repository";
import { validateProjectPayload } from "../app/lib/server/validation/project-payload";
import { GET as getKeys } from "../app/api/meta/keys/route";
import { GET as getDiatonic } from "../app/api/meta/diatonic/route";
import { POST as postRealize } from "../app/api/meta/realize/route";

function projectPayload() {
  return {
    name: "Wave 3 Test",
    tonic: "C",
    mode: "major",
    sections: [{
      position: 0,
      name: "Verse",
      bar_count: 4,
      bars: [1, 2, 3, 4].map((position) => ({
        position,
        chords: position === 1 ? [{ beat: 1, degree: "I", quality: "major" }] : [],
      })),
    }],
  };
}

test("validates full project payloads", () => {
  const payload = validateProjectPayload(projectPayload());
  assert.equal(payload.tonic, "C");
  assert.equal(payload.sections[0].bars.length, 4);
  assert.throws(() => validateProjectPayload({ ...projectPayload(), tonic: "F#" }));
  assert.throws(() => validateProjectPayload({ ...projectPayload(), sections: [{ ...projectPayload().sections[0], bar_count: 3 }] }));
});

test("saves and loads a project atomically", () => {
  const database = openDatabase(":memory:");
  try {
    applyMigrations(database);
    const id = createProject(database, { name: "Initial", tonic: "C", mode: "major" });
    const saved = saveProject(database, id, projectPayload());
    assert.equal(saved.sections[0].bars[0].chords[0].degree, "I");
    assert.equal(getProject(database, id)?.name, "Wave 3 Test");

    assert.throws(() => saveProject(database, id, { ...projectPayload(), sections: [{ ...projectPayload().sections[0], bars: [] }] }));
    assert.equal(getProject(database, id)?.name, "Wave 3 Test");
    assert.equal(deleteProject(database, id), true);
    assert.equal(getProject(database, id), null);
  } finally {
    database.close();
  }
});

test("stores user progressions separately", () => {
  const database = openDatabase(":memory:");
  try {
    applyMigrations(database);
    const id = createUserProgression(database, {
      name: "My Progression",
      formTags: ["Verse", "Chorus"],
      steps: ["I", "II", "V", "I"].map((degree, index) => ({
        position: index + 1,
        degree,
        quality: index === 1 ? "minor" : "major",
      })),
    });
    assert.equal(id > 0, true);
    assert.equal((listUserProgressions(database, "My") as unknown[]).length, 1);
    assert.equal(getUserProgression(database, id)?.steps.length, 4);
    assert.equal((database.prepare("SELECT COUNT(*) AS count FROM user_progression_form_tags WHERE progression_id = ?").get(id) as { count: number }).count, 2);
  } finally {
    database.close();
  }
});

test("meta domain contracts expose catalog and diatonic values", () => {
  assert.equal(getChordCatalog().tonics.includes("Gb"), true);
  assert.deepEqual(getMajorDiatonicChords("C").map((chord) => chord.displayName), ["C", "Dm", "Em", "F", "G", "Am", "Bdim"]);
});

test("Meta Route Handlers return the shared domain contract", async () => {
  const keys = getKeys();
  assert.equal(keys.status, 200);
  assert.deepEqual((await keys.json()).items.includes("Gb"), true);

  const diatonic = getDiatonic(new Request("http://localhost/api/meta/diatonic?tonic=C"));
  assert.deepEqual((await diatonic.json()).items.map((item: { displayName: string }) => item.displayName), ["C", "Dm", "Em", "F", "G", "Am", "Bdim"]);

  const realized = await postRealize(new Request("http://localhost/api/meta/realize", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ tonic: "C", mode: "major", chords: [{ degree: "V", quality: "dominant", extension: "7", bass_degree: null }] }),
  }));
  assert.deepEqual((await realized.json()).names, ["G7"]);
});
