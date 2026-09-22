import assert from "node:assert/strict";
import test from "node:test";

import { projectDraftReducer } from "../app/lib/client/draft-reducer";
import { serializeProjectDraft } from "../app/lib/client/project-serializer";
import {
  COMPATIBLE_EXTENSIONS,
  normalizeStep,
} from "../app/lib/shared/catalog/chord-catalog";
import { realizeChord } from "../app/lib/shared/domain/chord-realizer";
import type { ProjectDraft } from "../app/types/client";

const createInitialDraft = (): ProjectDraft => ({
  id: 201,
  name: "Wave 4 Test Song",
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
  ],
});

test("FE Wave 4: Setting Tension Chords & Quality Compatibility", () => {
  let draft = createInitialDraft();
  const verseId = "sec_verse";

  // 1. Assign I maj7 (Cmaj7)
  draft = projectDraftReducer(draft, {
    type: "SET_CHORD",
    payload: {
      sectionId: verseId,
      barPosition: 1,
      chord: { beat: 1, degree: "I", quality: "major", extension: "maj7" },
    },
  });

  // 2. Assign V dominant 7 (G7)
  draft = projectDraftReducer(draft, {
    type: "SET_CHORD",
    payload: {
      sectionId: verseId,
      barPosition: 2,
      chord: { beat: 1, degree: "V", quality: "dominant", extension: "7" },
    },
  });

  // 3. Assign VI minor 7 (Am7)
  draft = projectDraftReducer(draft, {
    type: "SET_CHORD",
    payload: {
      sectionId: verseId,
      barPosition: 3,
      chord: { beat: 1, degree: "VI", quality: "minor", extension: "7" },
    },
  });

  // 4. Assign V major sus4 (Gsus4)
  draft = projectDraftReducer(draft, {
    type: "SET_CHORD",
    payload: {
      sectionId: verseId,
      barPosition: 4,
      chord: { beat: 1, degree: "V", quality: "major", extension: "sus4" },
    },
  });

  const bars = draft.sections[0].bars;

  // Realized names verification
  assert.equal(realizeChord(draft.tonic, bars[0].chords[0]), "Cmaj7");
  assert.equal(realizeChord(draft.tonic, bars[1].chords[0]), "G7");
  assert.equal(realizeChord(draft.tonic, bars[2].chords[0]), "Am7");
  assert.equal(realizeChord(draft.tonic, bars[3].chords[0]), "Gsus4");

  // Verify COMPATIBLE_EXTENSIONS catalog constraints
  assert.ok(COMPATIBLE_EXTENSIONS.major.includes("maj7"));
  assert.ok(COMPATIBLE_EXTENSIONS.major.includes("sus4"));
  assert.ok(COMPATIBLE_EXTENSIONS.minor.includes("7"));
  assert.ok(COMPATIBLE_EXTENSIONS.dominant.includes("7"));
  assert.ok(COMPATIBLE_EXTENSIONS.dominant.includes("9"));
});

test("FE Wave 4: Slash Chords (Inversions & Bass Degrees)", () => {
  let draft = createInitialDraft();
  const verseId = "sec_verse";

  // 1. Assign V/VII (G/B in C major)
  draft = projectDraftReducer(draft, {
    type: "SET_CHORD",
    payload: {
      sectionId: verseId,
      barPosition: 1,
      chord: {
        beat: 1,
        degree: "V",
        quality: "major",
        extension: null,
        bass_degree: "VII",
      },
    },
  });

  // 2. Assign I/III (C/E in C major)
  draft = projectDraftReducer(draft, {
    type: "SET_CHORD",
    payload: {
      sectionId: verseId,
      barPosition: 2,
      chord: {
        beat: 1,
        degree: "I",
        quality: "major",
        extension: null,
        bass_degree: "III",
      },
    },
  });

  // 3. Assign IV/I (F/C pedal in C major)
  draft = projectDraftReducer(draft, {
    type: "SET_CHORD",
    payload: {
      sectionId: verseId,
      barPosition: 3,
      chord: {
        beat: 1,
        degree: "IV",
        quality: "major",
        extension: null,
        bass_degree: "I",
      },
    },
  });

  const bars = draft.sections[0].bars;
  assert.equal(realizeChord(draft.tonic, bars[0].chords[0]), "G/B");
  assert.equal(realizeChord(draft.tonic, bars[1].chords[0]), "C/E");
  assert.equal(realizeChord(draft.tonic, bars[2].chords[0]), "F/C");

  // Verify slash chord normalization
  const normalizedSlash = normalizeStep(bars[0].chords[0]);
  assert.equal(normalizedSlash.bass_degree, "VII");
});

test("FE Wave 4: Modal Interchange & Secondary Dominant Presets", () => {
  let draft = createInitialDraft();
  const verseId = "sec_verse";

  // 1. Modal Interchange: iv minor (Fm in C major)
  draft = projectDraftReducer(draft, {
    type: "SET_CHORD",
    payload: {
      sectionId: verseId,
      barPosition: 1,
      chord: { beat: 1, degree: "IV", quality: "minor", extension: null },
    },
  });

  // 2. Modal Interchange: bVI major (Ab in C major)
  draft = projectDraftReducer(draft, {
    type: "SET_CHORD",
    payload: {
      sectionId: verseId,
      barPosition: 2,
      chord: { beat: 1, degree: "bVI", quality: "major", extension: null },
    },
  });

  // 3. Modal Interchange: bVII major (Bb in C major)
  draft = projectDraftReducer(draft, {
    type: "SET_CHORD",
    payload: {
      sectionId: verseId,
      barPosition: 3,
      chord: { beat: 1, degree: "bVII", quality: "major", extension: null },
    },
  });

  // 4. Secondary Dominant: V7/ii (VI7 -> A7 in C major)
  draft = projectDraftReducer(draft, {
    type: "SET_CHORD",
    payload: {
      sectionId: verseId,
      barPosition: 4,
      chord: { beat: 1, degree: "VI", quality: "dominant", extension: "7" },
    },
  });

  // 5. Secondary Dominant: V7/V (II7 -> D7 in C major)
  draft = projectDraftReducer(draft, {
    type: "SET_CHORD",
    payload: {
      sectionId: verseId,
      barPosition: 5,
      chord: { beat: 1, degree: "II", quality: "dominant", extension: "7" },
    },
  });

  const bars = draft.sections[0].bars;
  assert.equal(realizeChord(draft.tonic, bars[0].chords[0]), "Fm");
  assert.equal(realizeChord(draft.tonic, bars[1].chords[0]), "Ab");
  assert.equal(realizeChord(draft.tonic, bars[2].chords[0]), "Bb");
  assert.equal(realizeChord(draft.tonic, bars[3].chords[0]), "A7");
  assert.equal(realizeChord(draft.tonic, bars[4].chords[0]), "D7");
});

test("FE Wave 4: Serialization of Extended and Slash Chords", () => {
  let draft = createInitialDraft();
  const verseId = "sec_verse";

  // Complex chord: V dominant 7 with bass VII (G7/B)
  draft = projectDraftReducer(draft, {
    type: "SET_CHORD",
    payload: {
      sectionId: verseId,
      barPosition: 1,
      chord: {
        beat: 1,
        degree: "V",
        quality: "dominant",
        extension: "7",
        bass_degree: "VII",
      },
    },
  });

  const serialized = serializeProjectDraft(draft);
  const bar1Chords = serialized.sections[0].bars[0].chords;

  assert.equal(bar1Chords.length, 1);
  assert.equal(bar1Chords[0].beat, 1);
  assert.equal(bar1Chords[0].degree, "V");
  assert.equal(bar1Chords[0].quality, "dominant");
  assert.equal(bar1Chords[0].extension, "7");
  assert.equal(bar1Chords[0].bass_degree, "VII");
});
