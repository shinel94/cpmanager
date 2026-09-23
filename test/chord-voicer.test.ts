import test from "node:test";
import assert from "node:assert/strict";
import {
  chordToVoicedNotes,
  getChordIntervals,
  midiToNoteName,
  noteNameToMidi,
  pitchClassToNoteName,
} from "@/app/lib/shared/domain/chord-voicer";
import type { ChordStep } from "@/app/lib/shared/catalog/chord-catalog";

test("midiToNoteName and noteNameToMidi roundtrip", () => {
  assert.equal(midiToNoteName(60), "C4");
  assert.equal(midiToNoteName(69), "A4");
  assert.equal(midiToNoteName(36), "C2");
  assert.equal(midiToNoteName(51), "Eb3");

  assert.equal(noteNameToMidi("C4"), 60);
  assert.equal(noteNameToMidi("A4"), 69);
  assert.equal(noteNameToMidi("C2"), 36);
  assert.equal(noteNameToMidi("Eb3"), 51);
  assert.equal(noteNameToMidi("F#3"), 54);
  assert.equal(noteNameToMidi("Gb3"), 54);
});

test("pitchClassToNoteName formats correctly", () => {
  assert.equal(pitchClassToNoteName(0, 4), "C4");
  assert.equal(pitchClassToNoteName(7, 3), "G3");
  assert.equal(pitchClassToNoteName(11, 2), "B2");
});

test("getChordIntervals handles qualities, extensions, and sus4", () => {
  assert.deepEqual(getChordIntervals("major", null), [0, 4, 7]);
  assert.deepEqual(getChordIntervals("minor", null), [0, 3, 7]);
  assert.deepEqual(getChordIntervals("diminished", null), [0, 3, 6]);
  assert.deepEqual(getChordIntervals("dominant", "7"), [0, 4, 7, 10]);
  assert.deepEqual(getChordIntervals("major", "maj7"), [0, 4, 7, 11]);
  assert.deepEqual(getChordIntervals("minor", "m7"), [0, 3, 7, 10]);
  assert.deepEqual(getChordIntervals("half-diminished", "m7b5"), [0, 3, 6, 10]);
  assert.deepEqual(getChordIntervals("major", "9"), [0, 4, 7, 10, 14]);

  // sus4 substitutes 3rd (4) with 4th (5)
  assert.deepEqual(getChordIntervals("major", "sus4"), [0, 5, 7]);
});

test("voices major diatonic chords in C major", () => {
  // I: C (root: C)
  const cChord = chordToVoicedNotes("C", {
    degree: "I",
    quality: "major",
    extension: null,
    bass_degree: null,
  });
  assert.equal(cChord.bassNote, "C2");
  assert.equal(cChord.bassMidi, 36);
  assert.deepEqual(cChord.chordNotes, ["C4", "E4", "G4"]);
  assert.deepEqual(cChord.chordMidis, [60, 64, 67]);

  // II: Dm (root: D)
  const dmChord = chordToVoicedNotes("C", {
    degree: "II",
    quality: "minor",
    extension: null,
    bass_degree: null,
  });
  assert.equal(dmChord.bassNote, "D2");
  assert.equal(dmChord.bassMidi, 38);
  assert.deepEqual(dmChord.chordNotes, ["D4", "F4", "A4"]);

  // V: G (root: G, pitch 7 >= 6 => octave 3 for smooth voice range)
  const gChord = chordToVoicedNotes("C", {
    degree: "V",
    quality: "major",
    extension: null,
    bass_degree: null,
  });
  assert.equal(gChord.bassNote, "G2");
  assert.equal(gChord.bassMidi, 43);
  assert.deepEqual(gChord.chordNotes, ["G3", "B3", "D4"]);

  // VII: Bdim (root: B, pitch 11 >= 6 => octave 3)
  const bdimChord = chordToVoicedNotes("C", {
    degree: "VII",
    quality: "diminished",
    extension: null,
    bass_degree: null,
  });
  assert.equal(bdimChord.bassNote, "B2");
  assert.equal(bdimChord.bassMidi, 47);
  assert.deepEqual(bdimChord.chordNotes, ["B3", "D4", "F4"]);
});

test("voices 7th chords and tensions accurately", () => {
  // Cmaj7
  const cMaj7 = chordToVoicedNotes("C", {
    degree: "I",
    quality: "major",
    extension: "maj7",
    bass_degree: null,
  });
  assert.deepEqual(cMaj7.chordNotes, ["C4", "E4", "G4", "B4"]);

  // G7
  const g7 = chordToVoicedNotes("C", {
    degree: "V",
    quality: "dominant",
    extension: "7",
    bass_degree: null,
  });
  assert.deepEqual(g7.chordNotes, ["G3", "B3", "D4", "F4"]);

  // Dm7
  const dm7 = chordToVoicedNotes("C", {
    degree: "II",
    quality: "minor",
    extension: "7",
    bass_degree: null,
  });
  assert.deepEqual(dm7.chordNotes, ["D4", "F4", "A4", "C5"]);

  // Bm7b5
  const bm7b5 = chordToVoicedNotes("C", {
    degree: "VII",
    quality: "half-diminished",
    extension: "m7b5",
    bass_degree: null,
  });
  assert.deepEqual(bm7b5.chordNotes, ["B3", "D4", "F4", "A4"]);

  // Gsus4
  const gSus4 = chordToVoicedNotes("C", {
    degree: "V",
    quality: "major",
    extension: "sus4",
    bass_degree: null,
  });
  assert.deepEqual(gSus4.chordNotes, ["G3", "C4", "D4"]);
});

test("voices slash chords with explicit bass degree", () => {
  // C / E (First inversion)
  const cOverE: ChordStep = {
    degree: "I",
    quality: "major",
    extension: null,
    bass_degree: "III",
  };
  const voiced = chordToVoicedNotes("C", cOverE);
  assert.equal(voiced.bassNote, "E2");
  assert.equal(voiced.bassMidi, 40);
  assert.deepEqual(voiced.chordNotes, ["C4", "E4", "G4"]);
  assert.deepEqual(voiced.allNotes, ["E2", "C4", "E4", "G4"]);

  // G / B (First inversion of V)
  const gOverB: ChordStep = {
    degree: "V",
    quality: "major",
    extension: null,
    bass_degree: "VII",
  };
  const voicedG = chordToVoicedNotes("C", gOverB);
  assert.equal(voicedG.bassNote, "B2");
  assert.equal(voicedG.bassMidi, 47);
  assert.deepEqual(voicedG.chordNotes, ["G3", "B3", "D4"]);
});

test("voices chords across different tonics", () => {
  // G major key, I = G
  const gInG = chordToVoicedNotes("G", {
    degree: "I",
    quality: "major",
    extension: null,
    bass_degree: null,
  });
  assert.equal(gInG.bassNote, "G2");
  assert.deepEqual(gInG.chordNotes, ["G3", "B3", "D4"]);

  // F major key, I = F
  const fInF = chordToVoicedNotes("F", {
    degree: "I",
    quality: "major",
    extension: null,
    bass_degree: null,
  });
  assert.equal(fInF.bassNote, "F2");
  assert.deepEqual(fInF.chordNotes, ["F4", "A4", "C5"]);

  // Ab major key, IV = Db
  const dbInAb = chordToVoicedNotes("Ab", {
    degree: "IV",
    quality: "major",
    extension: null,
    bass_degree: null,
  });
  assert.equal(dbInAb.bassNote, "Db2");
  assert.deepEqual(dbInAb.chordNotes, ["Db4", "F4", "Ab4"]);
});
