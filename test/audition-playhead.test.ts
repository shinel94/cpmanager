import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { playAuditionChord, playProgressionPreview, stopProgressionPreview } from "@/app/lib/client/audio/audition";
import { chordToVoicedNotes } from "@/app/lib/shared/domain/chord-voicer";

describe("Audition and Playhead Synchronization", () => {
  it("chordToVoicedNotes produces valid notes for audition chords", () => {
    const cMajor = chordToVoicedNotes("C", { degree: "I", quality: "major" });
    assert.deepEqual(cMajor.chordNotes, ["C4", "E4", "G4"]);
    assert.equal(cMajor.bassNote, "C2");
    assert.ok(cMajor.allNotes.includes("C2"));
    assert.ok(cMajor.allNotes.includes("C4"));

    const dMinor7 = chordToVoicedNotes("C", { degree: "ii", quality: "minor", extension: "7" });
    assert.deepEqual(dMinor7.chordNotes, ["D4", "F4", "A4", "C5"]);
    assert.equal(dMinor7.bassNote, "D2");

    const gOverB = chordToVoicedNotes("C", { degree: "V", quality: "major", bass_degree: "VII" });
    assert.equal(gOverB.bassNote, "B2");
  });

  it("playAuditionChord and playProgressionPreview guard Node environment gracefully", async () => {
    // Should not throw or crash in Node environment (typeof window === "undefined")
    await assert.doesNotReject(async () => {
      await playAuditionChord({ degree: "I", quality: "major" }, "C");
    });

    assert.doesNotThrow(() => {
      playProgressionPreview(
        [
          { degree: "I", quality: "major" },
          { degree: "V", quality: "major" },
          { degree: "vi", quality: "minor" },
          { degree: "IV", quality: "major" },
        ],
        "C",
      );
      stopProgressionPreview();
    });
  });

  it("calculates correct playhead active conditions for bars and beats", () => {
    const mockPlayhead = {
      sectionId: "sec-verse",
      sectionName: "Verse",
      barPosition: 3,
      beat: 2,
      chord: null,
    };

    const isVerseBar3Active =
      mockPlayhead.sectionId === "sec-verse" && mockPlayhead.barPosition === 3;
    assert.equal(isVerseBar3Active, true);

    const isVerseBar2Active =
      mockPlayhead.sectionId === "sec-verse" && mockPlayhead.barPosition === 2;
    assert.equal(isVerseBar2Active, false);

    const isChorusBar3Active =
      mockPlayhead.sectionId === "sec-chorus" && mockPlayhead.barPosition === 3;
    assert.equal(isChorusBar3Active, false);

    const activeBeatInBar3 = isVerseBar3Active ? mockPlayhead.beat : null;
    assert.equal(activeBeatInBar3, 2);
  });

  it("beatsToTransportDuration maps beat counts to valid Tone.js Transport Time notation", async () => {
    const { beatsToTransportDuration } = await import("@/app/lib/client/audio/audio-scheduler");

    // 4 beats (1 whole measure in 4/4) -> 1:0:0 (not "4 * 4n" which evaluates as 4 raw seconds!)
    assert.equal(beatsToTransportDuration(4), "1:0:0");

    // 2 beats (half measure) -> 0:2:0
    assert.equal(beatsToTransportDuration(2), "0:2:0");

    // 1 beat (quarter note) -> 0:1:0
    assert.equal(beatsToTransportDuration(1), "0:1:0");

    // 3 beats (dotted half) -> 0:3:0
    assert.equal(beatsToTransportDuration(3), "0:3:0");

    // 0.5 beats (eighth note) -> 0:0:2 (2 sixteenths)
    assert.equal(beatsToTransportDuration(0.5), "0:0:2");

    // 8 beats (2 full measures) -> 2:0:0
    assert.equal(beatsToTransportDuration(8), "2:0:0");
  });
});

