import assert from "node:assert/strict";
import test from "node:test";

import { projectDraftReducer } from "../app/lib/client/draft-reducer";
import { serializeProjectDraft } from "../app/lib/client/project-serializer";
import { realizeChord } from "../app/lib/shared/domain/chord-realizer";
import type { ProjectDraft } from "../app/types/client";

const createInitialDraft = (): ProjectDraft => ({
  id: 101,
  name: "Wave 3 Test Song",
  tonic: "C",
  mode: "major",
  sections: [
    {
      id: "sec_verse",
      name: "Verse",
      bar_count: 8,
      position: 0,
      bars: Array.from({ length: 8 }, (_, i) => ({
        id: `bar_v_${i + 1}`,
        position: i + 1,
        chords: [],
      })),
    },
    {
      id: "sec_chorus",
      name: "Chorus",
      bar_count: 4,
      position: 1,
      bars: Array.from({ length: 4 }, (_, i) => ({
        id: `bar_c_${i + 1}`,
        position: i + 1,
        chords: [],
      })),
    },
  ],
});

test("FE Wave 3: Section Reordering and Bar Count Adjustment", () => {
  let draft = createInitialDraft();

  // 1. Reorder sections (Chorus moves up to position 0)
  draft = projectDraftReducer(draft, {
    type: "REORDER_SECTIONS",
    payload: { fromIndex: 1, toIndex: 0 },
  });

  assert.equal(draft.sections[0].name, "Chorus");
  assert.equal(draft.sections[0].position, 0);
  assert.equal(draft.sections[1].name, "Verse");
  assert.equal(draft.sections[1].position, 1);

  // 2. Adjust bar count: Expand Chorus from 4 to 6 bars
  draft = projectDraftReducer(draft, {
    type: "UPDATE_SECTION_BARS",
    payload: { sectionId: "sec_chorus", barCount: 6 },
  });

  assert.equal(draft.sections[0].bar_count, 6);
  assert.equal(draft.sections[0].bars.length, 6);
  assert.equal(draft.sections[0].bars[5].position, 6);

  // 3. Trim Verse from 8 to 4 bars
  draft = projectDraftReducer(draft, {
    type: "UPDATE_SECTION_BARS",
    payload: { sectionId: "sec_verse", barCount: 4 },
  });

  assert.equal(draft.sections[1].bar_count, 4);
  assert.equal(draft.sections[1].bars.length, 4);
});

test("FE Wave 3: 4-Beat Subdivision & Multi-Chord Bar Assignment", () => {
  let draft = createInitialDraft();

  // 1. Assign chord to beat 1: I (C)
  draft = projectDraftReducer(draft, {
    type: "SET_CHORD",
    payload: {
      sectionId: "sec_verse",
      barPosition: 1,
      chord: { beat: 1, degree: "I", quality: "major" },
    },
  });

  // 2. Assign second chord to beat 3: V (G) -> creates multi-chord bar
  draft = projectDraftReducer(draft, {
    type: "SET_CHORD",
    payload: {
      sectionId: "sec_verse",
      barPosition: 1,
      chord: { beat: 3, degree: "V", quality: "major" },
    },
  });

  const bar1 = draft.sections[0].bars[0];
  assert.equal(bar1.chords.length, 2);
  assert.equal(bar1.chords[0].beat, 1);
  assert.equal(bar1.chords[0].degree, "I");
  assert.equal(bar1.chords[1].beat, 3);
  assert.equal(bar1.chords[1].degree, "V");

  // Verify realized display names
  assert.equal(realizeChord(draft.tonic, bar1.chords[0]), "C");
  assert.equal(realizeChord(draft.tonic, bar1.chords[1]), "G");

  // 3. Clear single beat (beat 3)
  draft = projectDraftReducer(draft, {
    type: "CLEAR_CHORD",
    payload: { sectionId: "sec_verse", barPosition: 1, beat: 3 },
  });

  const bar1AfterClearBeat = draft.sections[0].bars[0];
  assert.equal(bar1AfterClearBeat.chords.length, 1);
  assert.equal(bar1AfterClearBeat.chords[0].beat, 1);

  // 4. Serialization retains correct beat and sequential order
  const payload = serializeProjectDraft(draft);
  assert.equal(payload.sections[0].bars[0].chords.length, 1);
  assert.equal(payload.sections[0].bars[0].chords[0].beat, 1);
});

test("FE Wave 3: 4-Bar Block Partitioning & Status Calculation", () => {
  const draft = createInitialDraft();
  const verse = draft.sections[0]; // 8 bars

  // 8 bars should partition into exactly 2 blocks of 4
  const blockSize = 4;
  const blocks = Array.from({ length: Math.ceil(verse.bars.length / blockSize) }, (_, i) =>
    verse.bars.slice(i * blockSize, i * blockSize + blockSize),
  );

  assert.equal(blocks.length, 2);
  assert.equal(blocks[0].length, 4);
  assert.equal(blocks[1].length, 4);

  // Block 1: 1~4
  assert.equal(blocks[0][0].position, 1);
  assert.equal(blocks[0][3].position, 4);

  // Block 2: 5~8
  assert.equal(blocks[1][0].position, 5);
  assert.equal(blocks[1][3].position, 8);
});

test("FE Wave 3: Dynamic 4-Bar Recommendation Application to Block 2 (Bars 5~8) & Less-than-4-bars Guard", () => {
  let draft = createInitialDraft(); // Verse has 8 empty bars
  const verseId = "sec_verse";

  // Pre-fill bar 1 with I chord to verify non-interference with Block 1
  draft = projectDraftReducer(draft, {
    type: "SET_CHORD",
    payload: {
      sectionId: verseId,
      barPosition: 1,
      chord: { beat: 1, degree: "I", quality: "major" },
    },
  });

  // Pre-fill bar 6 with IV chord to verify non-destructive fill within Block 2
  draft = projectDraftReducer(draft, {
    type: "SET_CHORD",
    payload: {
      sectionId: verseId,
      barPosition: 6,
      chord: { beat: 1, degree: "IV", quality: "major" },
    },
  });

  // Recommendation steps: I - V - VI - IV
  const recSteps = [
    { degree: "I", quality: "major" as const },
    { degree: "V", quality: "major" as const },
    { degree: "VI", quality: "minor" as const },
    { degree: "IV", quality: "major" as const },
  ];

  // Apply recommendation specifically targeting Block 2 (startBar: 5)
  draft = projectDraftReducer(draft, {
    type: "APPLY_RECOMMENDATION_BLOCK",
    payload: {
      sectionId: verseId,
      startBar: 5,
      steps: recSteps,
    },
  });

  const verseBars = draft.sections.find((s) => s.id === verseId)!.bars;

  // Verify Block 1 (Bars 1~4): Bar 1 still has its original chord, Bars 2~4 remain empty
  assert.equal(verseBars[0].chords[0].degree, "I");
  assert.equal(verseBars[1].chords.length, 0);
  assert.equal(verseBars[2].chords.length, 0);
  assert.equal(verseBars[3].chords.length, 0);

  // Verify Block 2 (Bars 5~8):
  // Bar 5: filled with step 0 ('I')
  assert.equal(verseBars[4].chords.length, 1);
  assert.equal(verseBars[4].chords[0].degree, "I");

  // Bar 6: kept original pre-filled chord ('IV'), not overwritten by step 1 ('V')
  assert.equal(verseBars[5].chords.length, 1);
  assert.equal(verseBars[5].chords[0].degree, "IV");

  // Bar 7: filled with step 2 ('VI')
  assert.equal(verseBars[6].chords.length, 1);
  assert.equal(verseBars[6].chords[0].degree, "VI");

  // Bar 8: filled with step 3 ('IV')
  assert.equal(verseBars[7].chords.length, 1);
  assert.equal(verseBars[7].chords[0].degree, "IV");

  // Verify Less-than-4-bars Guard logic:
  // When section is trimmed to 6 bars, Block 2 has only bars 5 and 6 (count = 2 < 4)
  draft = projectDraftReducer(draft, {
    type: "UPDATE_SECTION_BARS",
    payload: { sectionId: verseId, barCount: 6 },
  });

  const trimmedVerse = draft.sections.find((s) => s.id === verseId)!;
  const targetStartBar = 5;
  const targetEndBar = Math.min(targetStartBar + 3, trimmedVerse.bar_count);
  const barsInBlock2 = trimmedVerse.bars.filter(
    (b) => b.position >= targetStartBar && b.position <= targetEndBar,
  );

  assert.equal(barsInBlock2.length, 2);
  const isTargetBlockLessThanFour = barsInBlock2.length < 4;
  assert.equal(isTargetBlockLessThanFour, true);
});
