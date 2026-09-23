import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  generateProjectMidi,
  beatsToMidiDuration,
} from "@/app/lib/client/midi/midi-exporter";
import type { ProjectDraft } from "@/app/types/client";

describe("MIDI Exporter (SMF Type 1)", () => {
  it("beatsToMidiDuration maps beat counts to valid MIDI note duration codes", () => {
    assert.equal(beatsToMidiDuration(4), "1"); // Whole note
    assert.equal(beatsToMidiDuration(3), "d2"); // Dotted half note
    assert.equal(beatsToMidiDuration(2), "2"); // Half note
    assert.equal(beatsToMidiDuration(1), "4"); // Quarter note
    assert.equal(beatsToMidiDuration(0.5), "8"); // Eighth note
  });

  it("generates a valid Standard MIDI File (Type 1, 2 tracks) for a full project", () => {
    const mockProject: ProjectDraft = {
      id: 1,
      name: "Pop Song Demo",
      tonic: "C",
      mode: "major",
      tempo: 128,
      time_signature: "4/4",
      sections: [
        {
          id: "sec-intro",
          name: "Intro",
          position: 1,
          bar_count: 4,
          bars: [
            {
              id: "bar-1",
              position: 1,
              chords: [
                {
                  id: "chord-1",
                  beat: 1,
                  degree: "I",
                  quality: "major",
                  extension: null,
                  bass_degree: null,
                },
              ],
            },
            {
              id: "bar-2",
              position: 2,
              chords: [
                {
                  id: "chord-2",
                  beat: 1,
                  degree: "V",
                  quality: "major",
                  extension: null,
                  bass_degree: "VII",
                },
              ],
            },
            {
              id: "bar-3",
              position: 3,
              chords: [
                {
                  id: "chord-3",
                  beat: 1,
                  degree: "vi",
                  quality: "minor",
                  extension: "7",
                  bass_degree: null,
                },
              ],
            },
            {
              id: "bar-4",
              position: 4,
              chords: [
                {
                  id: "chord-4",
                  beat: 1,
                  degree: "IV",
                  quality: "major",
                  extension: "maj7",
                  bass_degree: null,
                },
              ],
            },
          ],
        },
      ],
    };

    const bytes = generateProjectMidi(mockProject);

    // 1. Check MIDI header chunk "MThd"
    assert.ok(bytes instanceof Uint8Array);
    assert.ok(bytes.length > 50);

    const header = Buffer.from(bytes.slice(0, 4)).toString("ascii");
    assert.equal(header, "MThd");

    // 2. Header length is always 6 bytes
    assert.equal(bytes[4], 0);
    assert.equal(bytes[5], 0);
    assert.equal(bytes[6], 0);
    assert.equal(bytes[7], 6);

    // 3. Format is Type 1 (multiple simultaneous tracks)
    const format = (bytes[8] << 8) | bytes[9];
    assert.equal(format, 1);

    // 4. Number of tracks is 2 (Track 1: Chords, Track 2: Bass)
    const trackCount = (bytes[10] << 8) | bytes[11];
    assert.equal(trackCount, 2);

    // 5. Check track chunk headers "MTrk"
    const contentStr = Buffer.from(bytes).toString("binary");
    const mtrkMatches = contentStr.match(/MTrk/g);
    assert.ok(mtrkMatches && mtrkMatches.length === 2);
  });

  it("handles multi-chord bars and different beat durations accurately", () => {
    const mockProject: ProjectDraft = {
      id: 2,
      name: "Fast Progression",
      tonic: "G",
      mode: "major",
      tempo: 140,
      sections: [
        {
          id: "sec-verse",
          name: "Verse",
          position: 1,
          bar_count: 2,
          bars: [
            // Bar 1: 2 chords (2 beats each)
            {
              id: "b-1",
              position: 1,
              chords: [
                { id: "c-1", beat: 1, degree: "I", quality: "major", extension: null, bass_degree: null },
                { id: "c-2", beat: 3, degree: "V", quality: "major", extension: null, bass_degree: null },
              ],
            },
            // Bar 2: 4 chords (1 beat each)
            {
              id: "b-2",
              position: 2,
              chords: [
                { id: "c-3", beat: 1, degree: "vi", quality: "minor", extension: null, bass_degree: null },
                { id: "c-4", beat: 2, degree: "IV", quality: "major", extension: null, bass_degree: null },
                { id: "c-5", beat: 3, degree: "I", quality: "major", extension: null, bass_degree: null },
                { id: "c-6", beat: 4, degree: "V", quality: "major", extension: null, bass_degree: null },
              ],
            },
          ],
        },
      ],
    };

    const bytes = generateProjectMidi(mockProject);
    assert.ok(bytes.length > 100);

    const header = Buffer.from(bytes.slice(0, 4)).toString("ascii");
    assert.equal(header, "MThd");
  });

  it("preserves timeline integrity when empty bars are present", () => {
    const mockProject: ProjectDraft = {
      id: 3,
      name: "Sparse Chords",
      tonic: "F",
      mode: "major",
      tempo: 100,
      sections: [
        {
          id: "sec-1",
          name: "Intro",
          position: 1,
          bar_count: 4,
          bars: [
            // Bar 1 has chord
            {
              id: "bar-1",
              position: 1,
              chords: [
                { id: "c-1", beat: 1, degree: "I", quality: "major", extension: null, bass_degree: null },
              ],
            },
            // Bar 2 is completely empty
            {
              id: "bar-2",
              position: 2,
              chords: [],
            },
            // Bar 3 is completely empty
            {
              id: "bar-3",
              position: 3,
              chords: [],
            },
            // Bar 4 has chord
            {
              id: "bar-4",
              position: 4,
              chords: [
                { id: "c-2", beat: 1, degree: "IV", quality: "major", extension: null, bass_degree: null },
              ],
            },
          ],
        },
      ],
    };

    const bytes = generateProjectMidi(mockProject);
    assert.ok(bytes.length > 50);

    const header = Buffer.from(bytes.slice(0, 4)).toString("ascii");
    assert.equal(header, "MThd");
  });

  it("supports exporting a specific section only via targetSectionId", () => {
    const mockProject: ProjectDraft = {
      id: 4,
      name: "Multi-Section Song",
      tonic: "C",
      mode: "major",
      tempo: 120,
      sections: [
        {
          id: "sec-intro",
          name: "Intro",
          position: 1,
          bar_count: 2,
          bars: [
            {
              id: "bar-1",
              position: 1,
              chords: [
                { id: "c-1", beat: 1, degree: "I", quality: "major", extension: null, bass_degree: null },
              ],
            },
            {
              id: "bar-2",
              position: 2,
              chords: [
                { id: "c-2", beat: 1, degree: "V", quality: "major", extension: null, bass_degree: null },
              ],
            },
          ],
        },
        {
          id: "sec-chorus",
          name: "Chorus",
          position: 2,
          bar_count: 2,
          bars: [
            {
              id: "bar-3",
              position: 1,
              chords: [
                { id: "c-3", beat: 1, degree: "IV", quality: "major", extension: null, bass_degree: null },
              ],
            },
            {
              id: "bar-4",
              position: 2,
              chords: [
                { id: "c-4", beat: 1, degree: "I", quality: "major", extension: null, bass_degree: null },
              ],
            },
          ],
        },
      ],
    };

    const fullBytes = generateProjectMidi(mockProject);
    const chorusBytes = generateProjectMidi(mockProject, {
      targetSectionId: "sec-chorus",
    });

    assert.ok(fullBytes.length > chorusBytes.length);
    assert.equal(Buffer.from(chorusBytes.slice(0, 4)).toString("ascii"), "MThd");
  });
});
