import assert from "node:assert/strict";
import test from "node:test";
import {
  createDefaultPopProject,
  hydrateProjectDraft,
  serializeProjectDraft,
} from "../app/lib/client/project-serializer";
import { validateProjectPayload } from "../app/lib/server/validation/project-payload";

test("serialized project draft passes backend payload validation", () => {
  const draft = createDefaultPopProject("테스트 팝 곡", "C");

  // Add chords to Intro bar 1 and Chorus bar 1
  draft.sections[0].bars[0].chords.push({
    id: "c1",
    beat: 1,
    degree: "I",
    quality: "major",
    extension: null,
    bass_degree: null,
  });
  draft.sections[2].bars[0].chords.push({
    id: "c2",
    beat: 1,
    degree: "IV",
    quality: "major",
    extension: "maj7",
    bass_degree: null,
  });

  const serialized = serializeProjectDraft(draft);

  // Validate using backend's official validateProjectPayload
  const validated = validateProjectPayload(serialized);
  assert.equal(validated.name, "테스트 팝 곡");
  assert.equal(validated.tonic, "C");
  assert.equal(validated.sections.length, 3);
  assert.equal(validated.sections[0].bars.length, 4);
  assert.equal(validated.sections[1].bars.length, 8);
  assert.equal(validated.sections[2].bars.length, 8);

  // Check positions are sequential
  assert.deepEqual(
    validated.sections.map((s) => s.position),
    [0, 1, 2],
  );
  assert.deepEqual(
    validated.sections[0].bars.map((b) => b.position),
    [1, 2, 3, 4],
  );
  // Check empty bar has chords: []
  assert.equal(validated.sections[0].bars[1].chords.length, 0);
  // Check filled bar
  assert.equal(validated.sections[0].bars[0].chords[0].degree, "I");
  assert.equal(validated.sections[2].bars[0].chords[0].extension, "maj7");
});

test("hydrates server project data into ProjectDraft with string IDs", () => {
  const serverResponse = {
    id: 42,
    name: "서버 저장 곡",
    tonic: "G",
    mode: "major",
    sections: [
      {
        id: 101,
        name: "Verse",
        bar_count: 4,
        position: 0,
        bars: [
          {
            id: 201,
            position: 1,
            chords: [
              {
                id: 301,
                beat: 1,
                degree: "I",
                quality: "major",
                extension: null,
                bass_degree: null,
              },
            ],
          },
          {
            id: 202,
            position: 2,
            chords: [],
          },
        ],
      },
    ],
  };

  const draft = hydrateProjectDraft(serverResponse);
  assert.equal(draft.id, 42);
  assert.equal(draft.name, "서버 저장 곡");
  assert.equal(draft.tonic, "G");
  assert.equal(draft.sections.length, 1);
  assert.equal(draft.sections[0].id, "101");
  // Check padding to bar_count
  assert.equal(draft.sections[0].bars.length, 4);
  assert.equal(draft.sections[0].bars[0].id, "201");
  assert.equal(draft.sections[0].bars[0].chords[0].id, "301");
  assert.equal(draft.sections[0].bars[0].chords[0].degree, "I");
});
