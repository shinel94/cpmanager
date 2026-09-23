import test from "node:test";
import assert from "node:assert/strict";
import {
  calculateBarChordDurations,
  buildProjectPlaybackTimeline,
} from "@/app/lib/client/audio/timeline-calculator";
import { AudioEngine } from "@/app/lib/client/audio/audio-engine";
import { AudioScheduler } from "@/app/lib/client/audio/audio-scheduler";
import type { BarChordDraft, ProjectDraft } from "@/app/types/client";

test("calculateBarChordDurations computes correct duration for various beat layouts", () => {
  // 1. Single chord on beat 1 -> 4 beats
  const single: BarChordDraft[] = [
    {
      id: "c1",
      beat: 1,
      degree: "I",
      quality: "major",
      extension: null,
      bass_degree: null,
    },
  ];
  const d1 = calculateBarChordDurations(single);
  assert.equal(d1.length, 1);
  assert.equal(d1[0].durationBeats, 4);

  // 2. Two chords on beats 1 and 3 -> 2 beats each
  const twoChords: BarChordDraft[] = [
    {
      id: "c1",
      beat: 1,
      degree: "I",
      quality: "major",
      extension: null,
      bass_degree: null,
    },
    {
      id: "c2",
      beat: 3,
      degree: "V",
      quality: "major",
      extension: null,
      bass_degree: null,
    },
  ];
  const d2 = calculateBarChordDurations(twoChords);
  assert.equal(d2.length, 2);
  assert.equal(d2[0].durationBeats, 2);
  assert.equal(d2[1].durationBeats, 2);

  // 3. Three chords on beats 1, 2, 4 -> 1 beat, 2 beats, 1 beat
  const threeChords: BarChordDraft[] = [
    {
      id: "c1",
      beat: 1,
      degree: "I",
      quality: "major",
      extension: null,
      bass_degree: null,
    },
    {
      id: "c2",
      beat: 2,
      degree: "IV",
      quality: "major",
      extension: null,
      bass_degree: null,
    },
    {
      id: "c3",
      beat: 4,
      degree: "V",
      quality: "major",
      extension: null,
      bass_degree: null,
    },
  ];
  const d3 = calculateBarChordDurations(threeChords);
  assert.equal(d3.length, 3);
  assert.equal(d3[0].durationBeats, 1);
  assert.equal(d3[1].durationBeats, 2);
  assert.equal(d3[2].durationBeats, 1);

  // 4. Four chords on beats 1, 2, 3, 4 -> 1 beat each
  const fourChords: BarChordDraft[] = [1, 2, 3, 4].map((beat) => ({
    id: `c${beat}`,
    beat,
    degree: "I",
    quality: "major",
    extension: null,
    bass_degree: null,
  }));
  const d4 = calculateBarChordDurations(fourChords);
  assert.equal(d4.length, 4);
  assert.ok(d4.every((item) => item.durationBeats === 1));

  // 5. Empty chords array
  assert.deepEqual(calculateBarChordDurations([]), []);
});

test("buildProjectPlaybackTimeline generates sequential timeline with rests and chords", () => {
  const mockProject: ProjectDraft = {
    id: 1,
    name: "Test Timeline Project",
    tonic: "C",
    mode: "major",
    tempo: 120,
    time_signature: "4/4",
    sections: [
      {
        id: "sec_intro",
        name: "Intro",
        bar_count: 2,
        position: 0,
        bars: [
          // Bar 1: Empty (Rest)
          {
            id: "b1",
            position: 1,
            chords: [],
          },
          // Bar 2: Cmaj7 on Beat 1 (4 beats)
          {
            id: "b2",
            position: 2,
            chords: [
              {
                id: "c_cmaj7",
                beat: 1,
                degree: "I",
                quality: "major",
                extension: "maj7",
                bass_degree: null,
              },
            ],
          },
        ],
      },
      {
        id: "sec_verse",
        name: "Verse",
        bar_count: 1,
        position: 1,
        bars: [
          // Bar 1: Dm on Beat 1 (2 beats), G7 on Beat 3 (2 beats)
          {
            id: "b3",
            position: 1,
            chords: [
              {
                id: "c_dm",
                beat: 1,
                degree: "II",
                quality: "minor",
                extension: "7",
                bass_degree: null,
              },
              {
                id: "c_g7",
                beat: 3,
                degree: "V",
                quality: "dominant",
                extension: "7",
                bass_degree: null,
              },
            ],
          },
        ],
      },
    ],
  };

  // Full timeline
  const events = buildProjectPlaybackTimeline(mockProject);
  assert.equal(events.length, 4);

  // Event 1: Intro Bar 1 Rest (4 beats, timeBeats: 0)
  assert.equal(events[0].sectionName, "Intro");
  assert.equal(events[0].barPosition, 1);
  assert.equal(events[0].timeBeats, 0);
  assert.equal(events[0].durationBeats, 4);
  assert.equal(events[0].isRest, true);

  // Event 2: Intro Bar 2 Cmaj7 (4 beats, timeBeats: 4)
  assert.equal(events[1].sectionName, "Intro");
  assert.equal(events[1].barPosition, 2);
  assert.equal(events[1].timeBeats, 4);
  assert.equal(events[1].durationBeats, 4);
  assert.equal(events[1].isRest, false);
  assert.equal(events[1].voiced?.bassNote, "C2");
  assert.deepEqual(events[1].voiced?.chordNotes, ["C4", "E4", "G4", "B4"]);

  // Event 3: Verse Bar 1 Dm7 (2 beats, timeBeats: 8)
  assert.equal(events[2].sectionName, "Verse");
  assert.equal(events[2].timeBeats, 8);
  assert.equal(events[2].durationBeats, 2);
  assert.equal(events[2].voiced?.bassNote, "D2");

  // Event 4: Verse Bar 1 G7 (2 beats, timeBeats: 10)
  assert.equal(events[3].sectionName, "Verse");
  assert.equal(events[3].timeBeats, 10);
  assert.equal(events[3].durationBeats, 2);
  assert.equal(events[3].voiced?.bassNote, "G2");

  // Filter single section
  const verseEvents = buildProjectPlaybackTimeline(mockProject, {
    targetSectionId: "sec_verse",
  });
  assert.equal(verseEvents.length, 2);
  assert.equal(verseEvents[0].sectionName, "Verse");
});

test("AudioEngine and AudioScheduler guard SSR gracefully in Node environment", async () => {
  const engine = AudioEngine.getInstance();
  const initResult = await engine.init();
  assert.equal(initResult, false); // SSR returns false

  // Calling methods in Node does not throw
  await engine.unlockAudioContext();
  engine.setVolume(0.5);
  await engine.playAuditionChord(["C4", "E4", "G4"]);
  engine.playMetronomeClick(true);
  engine.dispose();

  const scheduler = AudioScheduler.getInstance();
  assert.equal(scheduler.getStatus(), "stopped");
  await scheduler.play({
    id: null,
    name: "SSR Test",
    tonic: "C",
    mode: "major",
    sections: [],
  });
  scheduler.pause();
  scheduler.stop();
  scheduler.setBpm(130);
  scheduler.setMetronome(true);
  scheduler.setLoop(true);
});
