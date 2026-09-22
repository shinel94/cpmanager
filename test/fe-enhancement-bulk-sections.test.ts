import assert from "node:assert/strict";
import test from "node:test";
import { projectDraftReducer } from "../app/lib/client/draft-reducer";
import { serializeProjectDraft } from "../app/lib/client/project-serializer";
import type { ProjectDraft } from "../app/types/client";

function createEmptyDraft(): ProjectDraft {
  return {
    id: 1,
    name: "Bulk Songform Test",
    tonic: "C",
    mode: "major",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    sections: [],
  };
}

test("FE Bulk Sections: ADD_SECTIONS_BULK creates multiple sections with sequential positions", () => {
  let project = createEmptyDraft();

  // 1. Bulk add 3 sections: Intro (4), Verse (8), Chorus (8)
  project = projectDraftReducer(project, {
    type: "ADD_SECTIONS_BULK",
    payload: {
      sections: [
        { name: "Intro", barCount: 4 },
        { name: "Verse", barCount: 8 },
        { name: "Chorus", barCount: 8 },
      ],
    },
  });

  assert.equal(project.sections.length, 3);
  assert.equal(project.sections[0].name, "Intro");
  assert.equal(project.sections[0].position, 0);
  assert.equal(project.sections[0].bar_count, 4);
  assert.equal(project.sections[0].bars.length, 4);

  assert.equal(project.sections[1].name, "Verse");
  assert.equal(project.sections[1].position, 1);
  assert.equal(project.sections[1].bar_count, 8);
  assert.equal(project.sections[1].bars.length, 8);

  assert.equal(project.sections[2].name, "Chorus");
  assert.equal(project.sections[2].position, 2);
  assert.equal(project.sections[2].bar_count, 8);
  assert.equal(project.sections[2].bars.length, 8);

  // 2. Bulk append 2 more sections: Bridge (4), Outro (4)
  project = projectDraftReducer(project, {
    type: "ADD_SECTIONS_BULK",
    payload: {
      sections: [
        { name: "Bridge", barCount: 4 },
        { name: "Outro", barCount: 4 },
      ],
    },
  });

  assert.equal(project.sections.length, 5);
  assert.equal(project.sections[3].name, "Bridge");
  assert.equal(project.sections[3].position, 3);
  assert.equal(project.sections[4].name, "Outro");
  assert.equal(project.sections[4].position, 4);

  // Verify total bars
  const totalBars = project.sections.reduce((acc, cur) => acc + cur.bar_count, 0);
  assert.equal(totalBars, 28); // 4 + 8 + 8 + 4 + 4 = 28
});

test("FE Bulk Sections: ADD_SECTIONS_BULK with insertIndex preserves ordering", () => {
  let project = createEmptyDraft();

  // Initial: Verse (8), Chorus (8)
  project = projectDraftReducer(project, {
    type: "ADD_SECTIONS_BULK",
    payload: {
      sections: [
        { name: "Verse", barCount: 8 },
        { name: "Chorus", barCount: 8 },
      ],
    },
  });

  // Insert Intro (4) at index 0
  project = projectDraftReducer(project, {
    type: "ADD_SECTIONS_BULK",
    payload: {
      sections: [{ name: "Intro", barCount: 4 }],
      insertIndex: 0,
    },
  });

  assert.equal(project.sections.length, 3);
  assert.equal(project.sections[0].name, "Intro");
  assert.equal(project.sections[0].position, 0);
  assert.equal(project.sections[1].name, "Verse");
  assert.equal(project.sections[1].position, 1);
  assert.equal(project.sections[2].name, "Chorus");
  assert.equal(project.sections[2].position, 2);
});

test("FE Bulk Sections: Empty array guard leaves state unchanged", () => {
  const project = createEmptyDraft();
  const next = projectDraftReducer(project, {
    type: "ADD_SECTIONS_BULK",
    payload: {
      sections: [],
    },
  });
  assert.equal(next, project);
});

test("FE Custom Project Builder: Custom initial sections serialize valid server payload", () => {
  const customRows = [
    { name: "Intro", barCount: 4 },
    { name: "Verse", barCount: 8 },
    { name: "Pre-Chorus", barCount: 4 },
    { name: "Chorus", barCount: 8 },
    { name: "Outro", barCount: 4 },
  ];

  const initialSections = customRows.map((sec, idx) => ({
    id: `sec_${idx + 1}_test`,
    position: idx,
    name: sec.name,
    bar_count: sec.barCount,
    bars: Array.from({ length: sec.barCount }, (_, bIdx) => ({
      id: `bar_${idx + 1}_${bIdx + 1}`,
      position: bIdx + 1,
      chords: [],
    })),
  }));

  const draft: ProjectDraft = {
    id: 99,
    name: "My Custom Songform Project",
    tonic: "G",
    mode: "major",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    sections: initialSections,
  };

  const payload = serializeProjectDraft(draft);
  assert.equal(payload.name, "My Custom Songform Project");
  assert.equal(payload.tonic, "G");
  assert.equal(payload.sections.length, 5);
  assert.equal(payload.sections[0].bar_count, 4);
  assert.equal(payload.sections[1].bar_count, 8);
  assert.equal(payload.sections[2].bar_count, 4);
  assert.equal(payload.sections[3].bar_count, 8);
  assert.equal(payload.sections[4].bar_count, 4);
});
