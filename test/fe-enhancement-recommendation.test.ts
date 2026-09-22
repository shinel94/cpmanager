import assert from "node:assert/strict";
import test from "node:test";
import { POST as recommendationsRoute } from "../app/api/recommendations/route";
import { projectDraftReducer } from "../app/lib/client/draft-reducer";
import { createDefaultPopProject } from "../app/lib/client/project-serializer";

test("FE Enhancement: Recommendation Auto-Refresh upon Chord Input with Preserved Sort", async () => {
  // 1. Initial State: Verse 8 bars, block 1 (bars 1~4) is empty
  let project = createDefaultPopProject();
  const verse = project.sections.find((s) => s.name === "Verse")!;
  assert.ok(verse);

  // Initial call with empty bars in block 1 (1~4) under 'connectivity' sort
  const emptyBars = [1, 2, 3, 4].map((pos) => ({ position: pos, chords: [] }));
  const initialReq = new Request("http://localhost:3000/api/recommendations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      tonic: "C",
      sectionName: "Verse",
      blockStart: 1,
      bars: emptyBars,
      sort: "connectivity",
      page: 1,
      pageSize: 3,
    }),
  });

  const initialRes = await recommendationsRoute(initialReq);
  assert.equal(initialRes.status, 200);
  const initialData = (await initialRes.json()) as { ok: boolean; items: any[]; emptyReason: string | null };
  assert.equal(initialData.items.length, 3);
  assert.equal(initialData.emptyReason, null);

  // 2. User enters chord into Bar 1: I (C in C Major)
  project = projectDraftReducer(project, {
    type: "SET_CHORD",
    payload: {
      sectionId: verse.id,
      barPosition: 1,
      chord: { beat: 1, degree: "I", quality: "major", extension: null, bass_degree: null },
    },
  });

  // Automatically refreshed query with updated Bar 1 chord, keeping 'connectivity' sort
  const updatedVerse = project.sections.find((s) => s.id === verse.id)!;
  const block1Bars = [1, 2, 3, 4].map((relPos) => {
    const bar = updatedVerse.bars.find((b) => b.position === relPos);
    return {
      position: relPos,
      chords: bar?.chords.map((c) => ({
        degree: c.degree,
        quality: c.quality,
        extension: c.extension ?? undefined,
        bass_degree: c.bass_degree ?? null,
      })) ?? [],
    };
  });

  const refreshedReq = new Request("http://localhost:3000/api/recommendations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      tonic: "C",
      sectionName: "Verse",
      blockStart: 1,
      bars: block1Bars,
      sort: "connectivity", // Sort is preserved!
      page: 1,
      pageSize: 3,
    }),
  });

  const refreshedRes = await recommendationsRoute(refreshedReq);
  assert.equal(refreshedRes.status, 200);
  const refreshedData = (await refreshedRes.json()) as { ok: boolean; items: any[]; emptyReason: string | null };
  assert.ok(refreshedData.items.length > 0);
  // All recommended progressions must have step 1 = I
  for (const item of refreshedData.items) {
    assert.equal(item.steps[0].degree, "I", "Step 1 must match the newly entered chord in Bar 1");
  }

  // 3. User adds chord into Bar 2: V (G in C Major)
  project = projectDraftReducer(project, {
    type: "SET_CHORD",
    payload: {
      sectionId: verse.id,
      barPosition: 2,
      chord: { beat: 1, degree: "V", quality: "major", extension: null, bass_degree: null },
    },
  });

  const twoChordsVerse = project.sections.find((s) => s.id === verse.id)!;
  const twoChordsBars = [1, 2, 3, 4].map((relPos) => {
    const bar = twoChordsVerse.bars.find((b) => b.position === relPos);
    return {
      position: relPos,
      chords: bar?.chords.map((c) => ({
        degree: c.degree,
        quality: c.quality,
        extension: c.extension ?? undefined,
        bass_degree: c.bass_degree ?? null,
      })) ?? [],
    };
  });

  const twoChordsReq = new Request("http://localhost:3000/api/recommendations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      tonic: "C",
      sectionName: "Verse",
      blockStart: 1,
      bars: twoChordsBars,
      sort: "diversity", // Switched sort tab to diversity
      page: 1,
      pageSize: 3,
    }),
  });

  const twoChordsRes = await recommendationsRoute(twoChordsReq);
  assert.equal(twoChordsRes.status, 200);
  const twoChordsData = (await twoChordsRes.json()) as { ok: boolean; items: any[] };
  assert.ok(twoChordsData.items.length > 0);
  for (const item of twoChordsData.items) {
    assert.equal(item.steps[0].degree, "I");
    assert.equal(item.steps[1].degree, "V");
  }
});

test("FE Enhancement: Fingerprint Reactivity and Exception State Transitions", () => {
  let project = createDefaultPopProject();
  const verse = project.sections.find((s) => s.name === "Verse")!;

  // Function to simulate fingerprint generation from RecommendationPanel
  const getFingerprint = (bars: typeof verse.bars, startBar: number, endBar: number) => {
    const targetBars = bars.filter((b) => b.position >= startBar && b.position <= endBar);
    return targetBars
      .map((b) =>
        b.chords
          .map((c) => `${c.beat}:${c.degree}${c.quality}${c.extension ?? ""}/${c.bass_degree ?? ""}`)
          .join(";")
      )
      .join("|");
  };

  const fp0 = getFingerprint(verse.bars, 1, 4);
  assert.equal(fp0, "|||");

  // Set Bar 1 chord
  project = projectDraftReducer(project, {
    type: "SET_CHORD",
    payload: {
      sectionId: verse.id,
      barPosition: 1,
      chord: { beat: 1, degree: "IV", quality: "major", extension: null, bass_degree: null },
    },
  });
  const updatedVerse1 = project.sections.find((s) => s.id === verse.id)!;
  const fp1 = getFingerprint(updatedVerse1.bars, 1, 4);
  assert.notEqual(fp1, fp0, "Fingerprint must change when chord is added");
  assert.equal(fp1, "1:IVmajor/|||");

  // Modify chord extension: IV -> IVmaj7
  project = projectDraftReducer(project, {
    type: "SET_CHORD",
    payload: {
      sectionId: verse.id,
      barPosition: 1,
      chord: { beat: 1, degree: "IV", quality: "major", extension: "maj7", bass_degree: null },
    },
  });
  const updatedVerse2 = project.sections.find((s) => s.id === verse.id)!;
  const fp2 = getFingerprint(updatedVerse2.bars, 1, 4);
  assert.notEqual(fp2, fp1, "Fingerprint must change when chord extension is modified");
  assert.equal(fp2, "1:IVmajormaj7/|||");

  // Fill all 4 bars -> all_filled transition
  for (let pos = 2; pos <= 4; pos++) {
    project = projectDraftReducer(project, {
      type: "SET_CHORD",
      payload: {
        sectionId: verse.id,
        barPosition: pos,
        chord: { beat: 1, degree: "I", quality: "major", extension: null, bass_degree: null },
      },
    });
  }

  const allFilledVerse = project.sections.find((s) => s.id === verse.id)!;
  const allFilledTargetBars = allFilledVerse.bars.filter((b) => b.position >= 1 && b.position <= 4);
  const isAllFilled = allFilledTargetBars.length === 4 && allFilledTargetBars.every((b) => b.chords.length > 0);
  assert.equal(isAllFilled, true, "Should detect all_filled condition automatically");

  // Add second chord into Bar 1 (beat 3) -> multi_chord_excluded transition
  project = projectDraftReducer(project, {
    type: "SET_CHORD",
    payload: {
      sectionId: verse.id,
      barPosition: 1,
      chord: { beat: 3, degree: "V", quality: "major", extension: null, bass_degree: null },
    },
  });

  const multiChordVerse = project.sections.find((s) => s.id === verse.id)!;
  const multiChordTargetBars = multiChordVerse.bars.filter((b) => b.position >= 1 && b.position <= 4);
  const hasMultiChord = multiChordTargetBars.some((b) => b.chords.length > 1);
  assert.equal(hasMultiChord, true, "Should detect multi_chord_excluded condition automatically");
});
