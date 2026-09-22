import test from "node:test";
import assert from "node:assert/strict";
import { projectDraftReducer } from "../app/lib/client/draft-reducer";
import { realizeChord } from "../app/lib/shared/domain/chord-realizer";
import type { ProjectDraft } from "../app/types/client";

function createMockProject(): ProjectDraft {
  return {
    id: 1,
    name: "Full Songform Test Project",
    tonic: "C",
    mode: "major",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    sections: [
      {
        id: "sec-intro",
        name: "Intro",
        position: 0,
        bar_count: 4,
        bars: Array.from({ length: 4 }, (_, i) => ({
          id: `bar-intro-${i + 1}`,
          position: i + 1,
          chords: [],
        })),
      },
      {
        id: "sec-verse",
        name: "Verse",
        position: 1,
        bar_count: 8,
        bars: Array.from({ length: 8 }, (_, i) => ({
          id: `bar-verse-${i + 1}`,
          position: i + 1,
          chords: [],
        })),
      },
      {
        id: "sec-chorus",
        name: "Chorus",
        position: 2,
        bar_count: 8,
        bars: Array.from({ length: 8 }, (_, i) => ({
          id: `bar-chorus-${i + 1}`,
          position: i + 1,
          chords: [],
        })),
      },
    ],
  };
}

function calculateCumulativeMetrics(sections: ProjectDraft["sections"]) {
  let offset = 0;
  return sections.map((sec) => {
    const startTotalBar = offset + 1;
    const endTotalBar = offset + sec.bar_count;
    const currentOffset = offset;
    offset += sec.bar_count;
    return {
      id: sec.id,
      name: sec.name,
      bar_count: sec.bar_count,
      startTotalBar,
      endTotalBar,
      cumulativeOffset: currentOffset,
    };
  });
}

test("FE Enhancement: Full Song Form Cumulative Metrics & Realtime Section Reordering Sync", () => {
  let project = createMockProject();

  // 1. Verify Initial Cumulative Bar Calculation
  const initialMetrics = calculateCumulativeMetrics(project.sections);
  assert.equal(initialMetrics.length, 3);
  // Intro: 4 bars (#1 ~ #4)
  assert.equal(initialMetrics[0].name, "Intro");
  assert.equal(initialMetrics[0].startTotalBar, 1);
  assert.equal(initialMetrics[0].endTotalBar, 4);
  // Verse: 8 bars (#5 ~ #12)
  assert.equal(initialMetrics[1].name, "Verse");
  assert.equal(initialMetrics[1].startTotalBar, 5);
  assert.equal(initialMetrics[1].endTotalBar, 12);
  // Chorus: 8 bars (#13 ~ #20)
  assert.equal(initialMetrics[2].name, "Chorus");
  assert.equal(initialMetrics[2].startTotalBar, 13);
  assert.equal(initialMetrics[2].endTotalBar, 20);

  // 2. Reorder Sections: Drag Verse (fromIndex 1) to top (toIndex 0)
  project = projectDraftReducer(project, {
    type: "REORDER_SECTIONS",
    payload: { fromIndex: 1, toIndex: 0 },
  });

  assert.equal(project.sections[0].name, "Verse");
  assert.equal(project.sections[1].name, "Intro");
  assert.equal(project.sections[2].name, "Chorus");

  // Re-verify sequential positions
  assert.equal(project.sections[0].position, 0);
  assert.equal(project.sections[1].position, 1);
  assert.equal(project.sections[2].position, 2);

  // Re-verify Cumulative Bar Metrics immediately synchronized
  const reorderedMetrics = calculateCumulativeMetrics(project.sections);
  // Verse: 8 bars (#1 ~ #8)
  assert.equal(reorderedMetrics[0].name, "Verse");
  assert.equal(reorderedMetrics[0].startTotalBar, 1);
  assert.equal(reorderedMetrics[0].endTotalBar, 8);
  // Intro: 4 bars (#9 ~ #12)
  assert.equal(reorderedMetrics[1].name, "Intro");
  assert.equal(reorderedMetrics[1].startTotalBar, 9);
  assert.equal(reorderedMetrics[1].endTotalBar, 12);
  // Chorus: 8 bars (#13 ~ #20)
  assert.equal(reorderedMetrics[2].name, "Chorus");
  assert.equal(reorderedMetrics[2].startTotalBar, 13);
  assert.equal(reorderedMetrics[2].endTotalBar, 20);

  // 3. Move Chorus (fromIndex 2) to top (toIndex 0)
  project = projectDraftReducer(project, {
    type: "REORDER_SECTIONS",
    payload: { fromIndex: 2, toIndex: 0 },
  });

  const finalMetrics = calculateCumulativeMetrics(project.sections);
  // Chorus: 8 bars (#1 ~ #8)
  assert.equal(finalMetrics[0].name, "Chorus");
  assert.equal(finalMetrics[0].startTotalBar, 1);
  assert.equal(finalMetrics[0].endTotalBar, 8);
  // Verse: 8 bars (#9 ~ #16)
  assert.equal(finalMetrics[1].name, "Verse");
  assert.equal(finalMetrics[1].startTotalBar, 9);
  assert.equal(finalMetrics[1].endTotalBar, 16);
  // Intro: 4 bars (#17 ~ #20)
  assert.equal(finalMetrics[2].name, "Intro");
  assert.equal(finalMetrics[2].startTotalBar, 17);
  assert.equal(finalMetrics[2].endTotalBar, 20);
});

test("FE Enhancement: Direct Chord Editing and Isolation Across Sections in Full Song Form", () => {
  let project = createMockProject();

  // Set C on Intro bar #1, beat 1
  project = projectDraftReducer(project, {
    type: "SET_CHORD",
    payload: {
      sectionId: "sec-intro",
      barPosition: 1,
      chord: { beat: 1, degree: "I", quality: "major" },
    },
  });

  // Set F on Verse bar #1, beat 1
  project = projectDraftReducer(project, {
    type: "SET_CHORD",
    payload: {
      sectionId: "sec-verse",
      barPosition: 1,
      chord: { beat: 1, degree: "IV", quality: "major" },
    },
  });

  // Set G7 on Chorus bar #8, beat 1
  project = projectDraftReducer(project, {
    type: "SET_CHORD",
    payload: {
      sectionId: "sec-chorus",
      barPosition: 8,
      chord: { beat: 1, degree: "V", quality: "dominant", extension: "7" },
    },
  });

  const intro = project.sections.find((s) => s.id === "sec-intro")!;
  const verse = project.sections.find((s) => s.id === "sec-verse")!;
  const chorus = project.sections.find((s) => s.id === "sec-chorus")!;

  assert.equal(intro.bars[0].chords[0].degree, "I");
  assert.equal(verse.bars[0].chords[0].degree, "IV");
  assert.equal(chorus.bars[7].chords[0].degree, "V");
  assert.equal(chorus.bars[7].chords[0].extension, "7");

  // Clear bar in Verse: Intro and Chorus remain untouched
  project = projectDraftReducer(project, {
    type: "CLEAR_BAR",
    payload: {
      sectionId: "sec-verse",
      barPosition: 1,
    },
  });

  const updatedVerse = project.sections.find((s) => s.id === "sec-verse")!;
  const updatedIntro = project.sections.find((s) => s.id === "sec-intro")!;
  const updatedChorus = project.sections.find((s) => s.id === "sec-chorus")!;

  assert.equal(updatedVerse.bars[0].chords.length, 0);
  assert.equal(updatedIntro.bars[0].chords[0].degree, "I");
  assert.equal(updatedChorus.bars[7].chords[0].degree, "V");
});

test("FE Enhancement: Songform Card Collapse/Minimize State and Summary Preview", () => {
  let project = createMockProject();

  // Populate Verse with 4 chords: C -> Am -> F -> G7
  const progression = [
    { pos: 1, degree: "I", quality: "major" as const },
    { pos: 2, degree: "VI", quality: "minor" as const },
    { pos: 3, degree: "IV", quality: "major" as const },
    { pos: 4, degree: "V", quality: "dominant" as const, extension: "7" as const },
  ];

  for (const item of progression) {
    project = projectDraftReducer(project, {
      type: "SET_CHORD",
      payload: {
        sectionId: "sec-verse",
        barPosition: item.pos,
        chord: {
          beat: 1,
          degree: item.degree,
          quality: item.quality,
          extension: item.extension,
        },
      },
    });
  }

  // Verify realized chord progression preview for collapsed summary
  const verse = project.sections.find((s) => s.id === "sec-verse")!;
  const previewChords = verse.bars
    .flatMap((b) => b.chords)
    .map((c) => realizeChord(project.tonic, c));

  assert.deepEqual(previewChords, ["C", "Am", "F", "G7"]);

  // Test collapse state set operations
  let collapsed = new Set<string>();
  assert.equal(collapsed.has("sec-verse"), false);

  // Toggle collapse on Verse
  collapsed = new Set(collapsed);
  collapsed.add("sec-verse");
  assert.equal(collapsed.has("sec-verse"), true);
  assert.equal(collapsed.size, 1);

  // Collapse all
  collapsed = new Set(project.sections.map((s) => s.id));
  assert.equal(collapsed.size, 3);
  assert.equal(collapsed.has("sec-intro"), true);
  assert.equal(collapsed.has("sec-verse"), true);
  assert.equal(collapsed.has("sec-chorus"), true);

  // Expand all
  collapsed = new Set();
  assert.equal(collapsed.size, 0);
});
