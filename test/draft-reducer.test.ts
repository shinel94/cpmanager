import assert from "node:assert/strict";
import test from "node:test";
import { projectDraftReducer } from "../app/lib/client/draft-reducer";
import {
  createDefaultPopProject,
  createEmptyProject,
} from "../app/lib/client/project-serializer";

test("creates empty project and default pop preset", () => {
  const empty = createEmptyProject("내 곡", "G");
  assert.equal(empty.name, "내 곡");
  assert.equal(empty.tonic, "G");
  assert.equal(empty.sections.length, 0);

  const pop = createDefaultPopProject();
  assert.equal(pop.sections.length, 3);
  assert.deepEqual(
    pop.sections.map((s) => [s.name, s.bar_count, s.position]),
    [
      ["Intro", 4, 0],
      ["Verse", 8, 1],
      ["Chorus", 8, 2],
    ],
  );
  assert.equal(pop.sections[0].bars.length, 4);
  assert.equal(pop.sections[1].bars.length, 8);
});

test("updates project metadata", () => {
  const initial = createEmptyProject();
  const updated = projectDraftReducer(initial, {
    type: "UPDATE_META",
    payload: { name: "멋진 노래", tonic: "Eb" },
  });
  assert.equal(updated.name, "멋진 노래");
  assert.equal(updated.tonic, "Eb");
});

test("adds and removes sections with sequential re-indexing", () => {
  let state = createEmptyProject();
  state = projectDraftReducer(state, {
    type: "ADD_SECTION",
    payload: { name: "Intro", barCount: 4 },
  });
  state = projectDraftReducer(state, {
    type: "ADD_SECTION",
    payload: { name: "Verse", barCount: 8 },
  });
  state = projectDraftReducer(state, {
    type: "ADD_SECTION",
    payload: { name: "Chorus", barCount: 8 },
  });

  assert.equal(state.sections.length, 3);
  assert.deepEqual(
    state.sections.map((s) => s.position),
    [0, 1, 2],
  );

  const verseId = state.sections[1].id;
  state = projectDraftReducer(state, {
    type: "REMOVE_SECTION",
    payload: { sectionId: verseId },
  });

  assert.equal(state.sections.length, 2);
  assert.deepEqual(
    state.sections.map((s) => [s.name, s.position]),
    [
      ["Intro", 0],
      ["Chorus", 1],
    ],
  );
});

test("reorders sections correctly", () => {
  let state = createDefaultPopProject(); // Intro(0), Verse(1), Chorus(2)
  state = projectDraftReducer(state, {
    type: "REORDER_SECTIONS",
    payload: { fromIndex: 2, toIndex: 0 }, // Move Chorus to first
  });

  assert.deepEqual(
    state.sections.map((s) => [s.name, s.position]),
    [
      ["Chorus", 0],
      ["Intro", 1],
      ["Verse", 2],
    ],
  );
});

test("expands and trims section bars", () => {
  let state = createDefaultPopProject();
  const introId = state.sections[0].id; // 4 bars

  // Expand to 6 bars
  state = projectDraftReducer(state, {
    type: "UPDATE_SECTION_BARS",
    payload: { sectionId: introId, barCount: 6 },
  });
  assert.equal(state.sections[0].bar_count, 6);
  assert.equal(state.sections[0].bars.length, 6);
  assert.deepEqual(
    state.sections[0].bars.map((b) => b.position),
    [1, 2, 3, 4, 5, 6],
  );

  // Shrink to 3 bars
  state = projectDraftReducer(state, {
    type: "UPDATE_SECTION_BARS",
    payload: { sectionId: introId, barCount: 3 },
  });
  assert.equal(state.sections[0].bar_count, 3);
  assert.equal(state.sections[0].bars.length, 3);
  assert.deepEqual(
    state.sections[0].bars.map((b) => b.position),
    [1, 2, 3],
  );
});

test("sets and clears chords on bars", () => {
  let state = createDefaultPopProject();
  const secId = state.sections[0].id;

  // Set chord on bar 1, beat 1
  state = projectDraftReducer(state, {
    type: "SET_CHORD",
    payload: {
      sectionId: secId,
      barPosition: 1,
      chord: { beat: 1, degree: "I", quality: "major" },
    },
  });

  assert.equal(state.sections[0].bars[0].chords.length, 1);
  assert.equal(state.sections[0].bars[0].chords[0].degree, "I");

  // Add another chord to bar 1 at beat 3
  state = projectDraftReducer(state, {
    type: "SET_CHORD",
    payload: {
      sectionId: secId,
      barPosition: 1,
      chord: { beat: 3, degree: "V", quality: "major" },
    },
  });

  assert.equal(state.sections[0].bars[0].chords.length, 2);
  assert.equal(state.sections[0].bars[0].chords[0].beat, 1);
  assert.equal(state.sections[0].bars[0].chords[1].beat, 3);

  // Clear beat 3
  state = projectDraftReducer(state, {
    type: "CLEAR_CHORD",
    payload: { sectionId: secId, barPosition: 1, beat: 3 },
  });
  assert.equal(state.sections[0].bars[0].chords.length, 1);

  // Clear bar completely
  state = projectDraftReducer(state, {
    type: "CLEAR_BAR",
    payload: { sectionId: secId, barPosition: 1 },
  });
  assert.equal(state.sections[0].bars[0].chords.length, 0);
});

test("applies recommendation block non-destructively", () => {
  let state = createDefaultPopProject();
  const secId = state.sections[0].id; // 4 bars

  // Pre-fill bar 1 with IV
  state = projectDraftReducer(state, {
    type: "SET_CHORD",
    payload: {
      sectionId: secId,
      barPosition: 1,
      chord: { beat: 1, degree: "IV", quality: "major" },
    },
  });

  // Apply recommendation: I - V - VI - IV
  state = projectDraftReducer(state, {
    type: "APPLY_RECOMMENDATION_BLOCK",
    payload: {
      sectionId: secId,
      startBar: 1,
      steps: [
        { degree: "I", quality: "major" },
        { degree: "V", quality: "major" },
        { degree: "VI", quality: "minor" },
        { degree: "IV", quality: "major" },
      ],
    },
  });

  // Bar 1 should preserve existing 'IV', not overwritten by 'I'!
  assert.equal(state.sections[0].bars[0].chords[0].degree, "IV");
  // Bars 2, 3, 4 should be filled with recommended chords!
  assert.equal(state.sections[0].bars[1].chords[0].degree, "V");
  assert.equal(state.sections[0].bars[2].chords[0].degree, "VI");
  assert.equal(state.sections[0].bars[3].chords[0].degree, "IV");
});
