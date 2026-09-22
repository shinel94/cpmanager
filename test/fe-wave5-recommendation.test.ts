import assert from "node:assert/strict";
import test from "node:test";

import { openDatabase } from "../app/lib/server/db/database";
import { seedWave1 } from "../app/lib/server/db/seed";
import { getRecommendations } from "../app/lib/server/services/recommendation-service";
import { analyzeTechnique } from "../app/lib/server/services/technique-analyzer";
import { projectDraftReducer } from "../app/lib/client/draft-reducer";
import type { ProjectDraft } from "../app/types/client";

const createTestDraft = (): ProjectDraft => ({
  id: 301,
  name: "Wave 5 Test Song",
  tonic: "C",
  mode: "major",
  sections: [
    {
      id: "sec_chorus",
      name: "Chorus",
      bar_count: 8,
      position: 0,
      bars: Array.from({ length: 8 }, (_, i) => ({
        id: `bar_c_${i + 1}`,
        position: i + 1,
        chords: [],
      })),
    },
  ],
});

test("FE Wave 5: Recommendation API Service with 4 Sort Criteria & Draft Context", () => {
  const db = openDatabase(":memory:");
  try {
    seedWave1(db);

    // 1. Partial input: Bar 1 has C major (I)
    const normalizedBars = [
      { position: 1, chords: [{ beat: 1, degree: "I", quality: "major", extension: null, bass_degree: null }] },
      { position: 2, chords: [] },
      { position: 3, chords: [] },
      { position: 4, chords: [] },
    ];

    // Popularity Sort
    const popResult = getRecommendations(db, {
      tonic: "C",
      sectionName: "Chorus",
      blockStart: 1,
      bars: normalizedBars,
      sort: "popularity",
      page: 1,
      pageSize: 3,
    });
    assert.equal(popResult.emptyReason, null);
    assert.equal(popResult.items.length, 3);
    assert.equal(popResult.page, 1);
    assert.equal(popResult.items[0].steps[0].displayName, "C");

    // Connectivity Sort
    const connResult = getRecommendations(db, {
      tonic: "C",
      sectionName: "Chorus",
      blockStart: 1,
      bars: normalizedBars,
      sort: "connectivity",
      page: 1,
      pageSize: 3,
    });
    assert.equal(connResult.emptyReason, null);
    assert.equal(connResult.items.length, 3);

    // Diversity Sort
    const divResult = getRecommendations(db, {
      tonic: "C",
      sectionName: "Chorus",
      blockStart: 1,
      bars: normalizedBars,
      sort: "diversity",
      page: 1,
      pageSize: 3,
    });
    assert.equal(divResult.emptyReason, null);
    assert.equal(divResult.items.length, 3);

    // Random Sort
    const randResult = getRecommendations(db, {
      tonic: "C",
      sectionName: "Chorus",
      blockStart: 1,
      bars: normalizedBars,
      sort: "random",
      page: 1,
      pageSize: 3,
    });
    assert.equal(randResult.emptyReason, null);
    assert.equal(randResult.items.length, 3);
  } finally {
    db.close();
  }
});

test("FE Wave 5: Recommendation Exception States (multi_chord_excluded & all_filled)", () => {
  const db = openDatabase(":memory:");
  try {
    seedWave1(db);

    // 1. Multi-chord exclusion
    const multiChordBars = [
      { position: 1, chords: [{ beat: 1, degree: "I", quality: "major" }, { beat: 3, degree: "V", quality: "major" }] },
      { position: 2, chords: [] },
      { position: 3, chords: [] },
      { position: 4, chords: [] },
    ];
    const multiRes = getRecommendations(db, {
      tonic: "C",
      sectionName: "Chorus",
      blockStart: 1,
      bars: multiChordBars,
    });
    assert.equal(multiRes.emptyReason, "multi_chord_excluded");
    assert.equal(multiRes.items.length, 0);

    // 2. All-filled exclusion
    const allFilledBars = [
      { position: 1, chords: [{ beat: 1, degree: "I", quality: "major" }] },
      { position: 2, chords: [{ beat: 1, degree: "V", quality: "major" }] },
      { position: 3, chords: [{ beat: 1, degree: "VI", quality: "minor" }] },
      { position: 4, chords: [{ beat: 1, degree: "IV", quality: "major" }] },
    ];
    const filledRes = getRecommendations(db, {
      tonic: "C",
      sectionName: "Chorus",
      blockStart: 1,
      bars: allFilledBars,
    });
    assert.equal(filledRes.emptyReason, "all_filled");
    assert.equal(filledRes.items.length, 0);
  } finally {
    db.close();
  }
});

test("FE Wave 5: Realtime Technique Analysis Service Integration", () => {
  const db = openDatabase(":memory:");
  try {
    seedWave1(db);

    // 1. Detect Modal Interchange: changing IV major to IV minor in Bar 2
    const modalBars = [
      { position: 1, chords: [{ beat: 1, degree: "I", quality: "major", extension: null, bass_degree: null }] },
      { position: 2, chords: [{ beat: 1, degree: "IV", quality: "minor", extension: null, bass_degree: null }] },
      { position: 3, chords: [] },
      { position: 4, chords: [] },
    ];

    const modalRes = analyzeTechnique(db, {
      tonic: "C",
      sectionName: "Bridge",
      blockStart: 1,
      target: { barPosition: 2, beat: 1 },
      before: { degree: "IV", quality: "major", extension: null, bass_degree: null },
      after: { degree: "IV", quality: "minor", extension: null, bass_degree: null },
      bars: modalBars,
    });

    assert.ok(modalRes);
    assert.equal(modalRes.name, "모달 인터체인지");

    // 2. Detect Secondary Dominant: VI dominant 7 leading to ii (Bar 3)
    const secDomBars = [
      { position: 1, chords: [{ beat: 1, degree: "I", quality: "major", extension: null, bass_degree: null }] },
      { position: 2, chords: [{ beat: 1, degree: "VI", quality: "dominant", extension: "7", bass_degree: null }] },
      { position: 3, chords: [{ beat: 1, degree: "II", quality: "minor", extension: null, bass_degree: null }] },
      { position: 4, chords: [] },
    ];

    const secDomRes = analyzeTechnique(db, {
      tonic: "C",
      sectionName: "Verse",
      blockStart: 1,
      target: { barPosition: 2, beat: 1 },
      before: { degree: "VI", quality: "minor", extension: null, bass_degree: null },
      after: { degree: "VI", quality: "dominant", extension: "7", bass_degree: null },
      bars: secDomBars,
    });

    assert.ok(secDomRes);
    assert.equal(secDomRes.name, "세컨더리 도미넌트");

    // 3. Detect Slash Chord
    const slashBars = [
      { position: 1, chords: [{ beat: 1, degree: "V", quality: "major", extension: null, bass_degree: "VII" }] },
      { position: 2, chords: [] },
      { position: 3, chords: [] },
      { position: 4, chords: [] },
    ];

    const slashRes = analyzeTechnique(db, {
      tonic: "C",
      sectionName: "Chorus",
      blockStart: 1,
      target: { barPosition: 1, beat: 1 },
      before: { degree: "V", quality: "major", extension: null, bass_degree: null },
      after: { degree: "V", quality: "major", extension: null, bass_degree: "VII" },
      bars: slashBars,
    });

    assert.ok(slashRes);
    assert.equal(slashRes.name, "슬래시 코드");
  } finally {
    db.close();
  }
});

test("FE Wave 5: Recommendation Non-Destructive Application into Client Draft (Block 1 & Block 2)", () => {
  let draft = createTestDraft();
  const chorusId = "sec_chorus";

  // Pre-fill Bar 2 with IV (F) in Block 1
  draft = projectDraftReducer(draft, {
    type: "SET_CHORD",
    payload: {
      sectionId: chorusId,
      barPosition: 2,
      chord: { beat: 1, degree: "IV", quality: "major" },
    },
  });

  // Pre-fill Bar 7 with V (G) in Block 2
  draft = projectDraftReducer(draft, {
    type: "SET_CHORD",
    payload: {
      sectionId: chorusId,
      barPosition: 7,
      chord: { beat: 1, degree: "V", quality: "major" },
    },
  });

  // Recommendation steps: I - V - VI - IV
  const recSteps = [
    { degree: "I", quality: "major" as const },
    { degree: "V", quality: "major" as const },
    { degree: "VI", quality: "minor" as const },
    { degree: "IV", quality: "major" as const },
  ];

  // Apply to Block 1 (Bars 1~4)
  draft = projectDraftReducer(draft, {
    type: "APPLY_RECOMMENDATION_BLOCK",
    payload: { sectionId: chorusId, startBar: 1, steps: recSteps },
  });

  const bars = draft.sections[0].bars;
  // Bar 1: filled with I
  assert.equal(bars[0].chords[0].degree, "I");
  // Bar 2: preserved existing IV (not overwritten by rec step V!)
  assert.equal(bars[1].chords[0].degree, "IV");
  // Bar 3: filled with VI
  assert.equal(bars[2].chords[0].degree, "VI");
  // Bar 4: filled with IV
  assert.equal(bars[3].chords[0].degree, "IV");

  // Apply to Block 2 (Bars 5~8)
  draft = projectDraftReducer(draft, {
    type: "APPLY_RECOMMENDATION_BLOCK",
    payload: { sectionId: chorusId, startBar: 5, steps: recSteps },
  });

  const block2Bars = draft.sections[0].bars;
  // Bar 5: filled with I
  assert.equal(block2Bars[4].chords[0].degree, "I");
  // Bar 6: filled with V
  assert.equal(block2Bars[5].chords[0].degree, "V");
  // Bar 7: preserved existing V (not overwritten by rec step VI!)
  assert.equal(block2Bars[6].chords[0].degree, "V");
  // Bar 8: filled with IV
  assert.equal(block2Bars[7].chords[0].degree, "IV");
});
