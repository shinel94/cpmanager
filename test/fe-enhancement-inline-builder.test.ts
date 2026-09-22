import assert from "node:assert/strict";
import test from "node:test";
import { projectDraftReducer } from "../app/lib/client/draft-reducer";
import { realizeChord } from "../app/lib/shared/domain/chord-realizer";
import { COMPATIBLE_EXTENSIONS } from "../app/lib/shared/catalog/chord-catalog";
import { POST as postAnalysis } from "../app/api/analysis/route";
import { openDatabase } from "../app/lib/server/db/database";
import { seedWave1 } from "../app/lib/server/db/seed";
import type { ProjectDraft, BarChordDraft } from "../app/types/client";

function createMockProject(): ProjectDraft {
  return {
    id: 1,
    name: "Inline Builder Test Song",
    tonic: "C",
    mode: "major",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    sections: [
      {
        id: "sec-verse",
        name: "Verse",
        position: 0,
        bar_count: 4,
        bars: [
          {
            id: "b1",
            position: 1,
            chords: [{ id: "c1", beat: 1, degree: "I", quality: "major", extension: null, bass_degree: null }],
          },
          {
            id: "b2",
            position: 2,
            chords: [{ id: "c2", beat: 1, degree: "IV", quality: "major", extension: null, bass_degree: null }],
          },
          {
            id: "b3",
            position: 3,
            chords: [{ id: "c3", beat: 1, degree: "V", quality: "major", extension: null, bass_degree: null }],
          },
          {
            id: "b4",
            position: 4,
            chords: [{ id: "c4", beat: 1, degree: "I", quality: "major", extension: null, bass_degree: null }],
          },
        ],
      },
    ],
  };
}

test("FE Inline Builder: Extension compatibility and inversion degree mapping", () => {
  // 1. Extension compatibility
  assert.ok(COMPATIBLE_EXTENSIONS.major.includes("maj7"));
  assert.ok(COMPATIBLE_EXTENSIONS.major.includes("9"));
  assert.ok(!COMPATIBLE_EXTENSIONS.minor.includes("maj7"));
  assert.ok(COMPATIBLE_EXTENSIONS.minor.includes("7"));
  assert.ok(COMPATIBLE_EXTENSIONS["half-diminished"].includes("m7b5"));

  // 2. Inversion realization
  const cFirstInversion = realizeChord("C", {
    degree: "I",
    quality: "major",
    extension: null,
    bass_degree: "III",
  });
  assert.equal(cFirstInversion, "C/E");

  const amFirstInversion = realizeChord("C", {
    degree: "VI",
    quality: "minor",
    extension: null,
    bass_degree: "I",
  });
  assert.equal(amFirstInversion, "Am/C");

  const gDominantInversion = realizeChord("C", {
    degree: "V",
    quality: "dominant",
    extension: "7",
    bass_degree: "VII",
  });
  assert.equal(gDominantInversion, "G7/B");
});

test("FE Inline Builder: Direct chord mutation updates draft accurately", () => {
  let project = createMockProject();

  // 1. Change Bar 2 from IV major to IV minor (Modal Interchange)
  project = projectDraftReducer(project, {
    type: "SET_CHORD",
    payload: {
      sectionId: "sec-verse",
      barPosition: 2,
      chord: {
        beat: 1,
        degree: "IV",
        quality: "minor",
        extension: null,
        bass_degree: null,
      },
    },
  });

  const bar2 = project.sections[0].bars.find((b) => b.position === 2);
  assert.ok(bar2);
  assert.equal(bar2.chords[0].quality, "minor");

  // 2. Add tension (maj7) to Bar 1
  project = projectDraftReducer(project, {
    type: "SET_CHORD",
    payload: {
      sectionId: "sec-verse",
      barPosition: 1,
      chord: {
        beat: 1,
        degree: "I",
        quality: "major",
        extension: "maj7",
        bass_degree: null,
      },
    },
  });

  const bar1 = project.sections[0].bars.find((b) => b.position === 1);
  assert.ok(bar1);
  assert.equal(bar1.chords[0].extension, "maj7");
  assert.equal(realizeChord("C", bar1.chords[0]), "Cmaj7");
});

test("FE Inline Builder: Live analysis feedback trigger upon inline mutation", async () => {
  const db = openDatabase(":memory:");
  try {
    seedWave1(db);

    // Initial Bars: I -> IV -> V -> I
    const barsPayload = [
      { position: 1, chords: [{ beat: 1, degree: "I", quality: "major" as const, extension: null, bass_degree: null }] },
      { position: 2, chords: [{ beat: 1, degree: "IV", quality: "minor" as const, extension: null, bass_degree: null }] }, // Inline-mutated to minor
      { position: 3, chords: [{ beat: 1, degree: "V", quality: "major" as const, extension: null, bass_degree: null }] },
      { position: 4, chords: [{ beat: 1, degree: "I", quality: "major" as const, extension: null, bass_degree: null }] },
    ];

    // User clicked 'Minor' in Inline Chord Builder for Bar 2
    const req = new Request("http://localhost/api/analysis", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tonic: "C",
        sectionName: "Verse",
        blockStart: 1,
        target: { barPosition: 2, beat: 1 },
        before: { degree: "IV", quality: "major", extension: null, bass_degree: null },
        after: { degree: "IV", quality: "minor", extension: null, bass_degree: null },
        bars: barsPayload,
      }),
    });

    const res = await postAnalysis(req);
    assert.equal(res.status, 200);
    const data = await res.json();

    // Instant validation: Modal Interchange is immediately recognized
    assert.ok(data.technique);
    assert.equal(data.technique.name, "모달 인터체인지");
    assert.ok(data.technique.confidence >= 0.9);
    assert.ok(Array.isArray(data.technique.evidence));
  } finally {
    db.close();
  }
});
