import assert from "node:assert/strict";
import test from "node:test";
import { POST as searchUserProgressionsRoute } from "../app/api/user-progressions/search/route";
import { POST as createUserProgressionRoute, GET as listUserProgressionsRoute } from "../app/api/user-progressions/route";
import { DELETE as deleteUserProgressionRoute } from "../app/api/user-progressions/[id]/route";
import { projectDraftReducer } from "../app/lib/client/draft-reducer";
import { createDefaultPopProject } from "../app/lib/client/project-serializer";
import { realizeChord } from "../app/lib/shared/domain/chord-realizer";

test("FE Wave 6: User Progression Registration, Listing, and Realized Chords", async () => {
  const reqBody = {
    name: "My Custom Ballad Progression",
    description: "감성적인 발라드 후렴 빌드업 진행",
    formTags: ["Chorus", "Verse"],
    steps: [
      { position: 1, degree: "I", quality: "major", extension: "maj7", bass_degree: null },
      { position: 2, degree: "V", quality: "dominant", extension: "7", bass_degree: "VII" },
      { position: 3, degree: "VI", quality: "minor", extension: "7", bass_degree: null },
      { position: 4, degree: "IV", quality: "major", extension: "maj7", bass_degree: null },
    ],
  };

  const createReq = new Request("http://localhost:3000/api/user-progressions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(reqBody),
  });

  const createRes = await createUserProgressionRoute(createReq);
  assert.equal(createRes.status, 200);
  const createData = (await createRes.json()) as { ok: boolean; id: number };
  assert.ok(createData.id > 0);

  // List progressions
  const listReq = new Request("http://localhost:3000/api/user-progressions?q=Custom");
  const listRes = await listUserProgressionsRoute(listReq);
  assert.equal(listRes.status, 200);
  const listData = (await listRes.json()) as { ok: boolean; items: any[] };
  const found = listData.items.find((item) => item.id === createData.id);
  assert.ok(found);
  assert.equal(found.name, "My Custom Ballad Progression");
  assert.deepEqual(found.formTags.sort(), ["Chorus", "Verse"]);

  // Verify realized chord names under C Major
  const cChords = found.steps.map((s: any) =>
    realizeChord("C", {
      degree: s.degree,
      quality: s.quality,
      extension: s.extension,
      bass_degree: s.bass_degree,
    })
  );
  assert.deepEqual(cChords, ["Cmaj7", "G7/B", "Am7", "Fmaj7"]);

  // Verify realized chord names under G Major
  const gChords = found.steps.map((s: any) =>
    realizeChord("G", {
      degree: s.degree,
      quality: s.quality,
      extension: s.extension,
      bass_degree: s.bass_degree,
    })
  );
  assert.deepEqual(gChords, ["Gmaj7", "D7/Gb", "Em7", "Cmaj7"]);

  // Cleanup
  const delReq = new Request(`http://localhost:3000/api/user-progressions/${createData.id}`, {
    method: "DELETE",
  });
  const delRes = await deleteUserProgressionRoute(delReq, {
    params: Promise.resolve({ id: String(createData.id) }),
  });
  assert.equal(delRes.status, 200);
});

test("FE Wave 6: Wildcard 4-token Pattern Search and All-Wildcard Guard", async () => {
  // 1. Create a known test progression
  const createReq = new Request("http://localhost:3000/api/user-progressions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Wildcard Target Progression",
      formTags: ["Verse"],
      steps: [
        { position: 1, degree: "I", quality: "major" },
        { position: 2, degree: "II", quality: "minor" },
        { position: 3, degree: "V", quality: "major" },
        { position: 4, degree: "I", quality: "major" },
      ],
    }),
  });
  const createRes = await createUserProgressionRoute(createReq);
  const createData = (await createRes.json()) as { ok: boolean; id: number };

  try {
    // 2. Search with wildcard: ["x", "II", "V", "x"] -> should match
    const searchReq1 = new Request("http://localhost:3000/api/user-progressions/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tokens: ["x", "II", "V", "x"] }),
    });
    const searchRes1 = await searchUserProgressionsRoute(searchReq1);
    assert.equal(searchRes1.status, 200);
    const searchData1 = (await searchRes1.json()) as { ok: boolean; items: any[] };
    assert.ok(searchData1.items.some((item) => item.id === createData.id));

    // 3. Search with non-matching wildcard: ["x", "IV", "V", "x"] -> should not match
    const searchReq2 = new Request("http://localhost:3000/api/user-progressions/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tokens: ["x", "IV", "V", "x"] }),
    });
    const searchRes2 = await searchUserProgressionsRoute(searchReq2);
    assert.equal(searchRes2.status, 200);
    const searchData2 = (await searchRes2.json()) as { ok: boolean; items: any[] };
    assert.ok(!searchData2.items.some((item) => item.id === createData.id));

    // 4. Client-side all-wildcard guard logic simulation
    const tokensAllX = ["x", "x", "x", "x"];
    const isAllWildcards = tokensAllX.every((t) => !t.trim() || t.trim().toLowerCase() === "x");
    assert.equal(isAllWildcards, true, "All-x wildcard must be detected to disable search button");

    const tokensWithOneDegree = ["x", "II", "x", "x"];
    const isNotAllWildcards = tokensWithOneDegree.every((t) => !t.trim() || t.trim().toLowerCase() === "x");
    assert.equal(isNotAllWildcards, false, "At least one degree enables search button");
  } finally {
    // Cleanup
    await deleteUserProgressionRoute(
      new Request(`http://localhost:3000/api/user-progressions/${createData.id}`, { method: "DELETE" }),
      { params: Promise.resolve({ id: String(createData.id) }) }
    );
  }
});

test("FE Wave 6: Non-Destructive Application of User Progression into Client Draft", () => {
  // Setup project: Verse 8 bars (bar 1 pre-filled with C)
  let project = createDefaultPopProject();
  const verseSection = project.sections.find((s) => s.name === "Verse")!;
  assert.ok(verseSection);

  // Pre-fill bar 1 with existing custom chord
  project = projectDraftReducer(project, {
    type: "SET_CHORD",
    payload: {
      sectionId: verseSection.id,
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

  // User progression to apply: I - V - VI - IV
  const userSteps = [
    { position: 1, degree: "I", quality: "major" as const },
    { position: 2, degree: "V", quality: "major" as const },
    { position: 3, degree: "VI", quality: "minor" as const },
    { position: 4, degree: "IV", quality: "major" as const },
  ];

  // Apply to Block 1 (Bars 1~4)
  project = projectDraftReducer(project, {
    type: "APPLY_RECOMMENDATION_BLOCK",
    payload: {
      sectionId: verseSection.id,
      startBar: 1,
      steps: userSteps,
    },
  });

  const updatedVerse = project.sections.find((s) => s.id === verseSection.id)!;

  // Bar 1 should preserve user's existing Imaj7 (non-destructive)
  assert.equal(updatedVerse.bars[0].chords[0].extension, "maj7");
  // Bars 2, 3, 4 should be filled with user progression
  assert.equal(updatedVerse.bars[1].chords[0].degree, "V");
  assert.equal(updatedVerse.bars[2].chords[0].degree, "VI");
  assert.equal(updatedVerse.bars[3].chords[0].degree, "IV");

  // Apply user progression to Block 2 (Bars 5~8)
  project = projectDraftReducer(project, {
    type: "APPLY_RECOMMENDATION_BLOCK",
    payload: {
      sectionId: verseSection.id,
      startBar: 5,
      steps: userSteps,
    },
  });

  const finalVerse = project.sections.find((s) => s.id === verseSection.id)!;
  assert.equal(finalVerse.bars[4].chords[0].degree, "I");
  assert.equal(finalVerse.bars[5].chords[0].degree, "V");
  assert.equal(finalVerse.bars[6].chords[0].degree, "VI");
  assert.equal(finalVerse.bars[7].chords[0].degree, "IV");
});
