import assert from "node:assert/strict";
import test from "node:test";
import { openDatabase } from "../app/lib/server/db/database";
import { seedWave1 } from "../app/lib/server/db/seed";
import { analyzeTechnique } from "../app/lib/server/services/technique-analyzer";
import { analyzeProgression } from "../app/lib/server/services/progression-analyzer";
import { POST as postAnalysis } from "../app/api/analysis/route";
import type { TechniqueFeedback, BarDraft } from "../app/types/client";

test("FE Enhancement Analysis: POST /api/analysis integration with rich feedback", async () => {
  const db = openDatabase(":memory:");
  try {
    seedWave1(db);

    // 1. Secondary Dominant (VI7 -> ii)
    const secDomBars = [
      { position: 1, chords: [{ beat: 1, degree: "I", quality: "major", extension: null, bass_degree: null }] },
      { position: 2, chords: [{ beat: 1, degree: "VI", quality: "dominant", extension: "7", bass_degree: null }] },
      { position: 3, chords: [{ beat: 1, degree: "II", quality: "minor", extension: null, bass_degree: null }] },
      { position: 4, chords: [{ beat: 1, degree: "V", quality: "major", extension: null, bass_degree: null }] },
    ];

    const reqSecDom = new Request("http://localhost/api/analysis", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tonic: "C",
        sectionName: "Verse",
        blockStart: 1,
        target: { barPosition: 2, beat: 1 },
        before: { degree: "VI", quality: "minor", extension: null, bass_degree: null },
        after: { degree: "VI", quality: "dominant", extension: "7", bass_degree: null },
        bars: secDomBars,
      }),
    });

    const resSecDom = await postAnalysis(reqSecDom);
    assert.equal(resSecDom.status, 200);
    const dataSecDom = await resSecDom.json();

    assert.ok(dataSecDom.technique);
    assert.equal(dataSecDom.technique.name, "세컨더리 도미넌트");
    assert.ok(typeof dataSecDom.technique.confidence === "number");
    assert.ok(dataSecDom.technique.confidence >= 0.85);
    assert.ok(Array.isArray(dataSecDom.technique.evidence));
    assert.ok(dataSecDom.technique.evidence.length > 0);
    assert.equal(dataSecDom.technique.targetDegree, "II");

    // Check progression pattern detection in same payload
    assert.ok(dataSecDom.progressionPattern);
    assert.equal(dataSecDom.progressionPattern.type, "cadence");

    // 2. Modal Interchange (IVm in Major key)
    const modalBars = [
      { position: 1, chords: [{ beat: 1, degree: "I", quality: "major", extension: null, bass_degree: null }] },
      { position: 2, chords: [{ beat: 1, degree: "IV", quality: "minor", extension: null, bass_degree: null }] },
      { position: 3, chords: [{ beat: 1, degree: "V", quality: "major", extension: null, bass_degree: null }] },
      { position: 4, chords: [{ beat: 1, degree: "I", quality: "major", extension: null, bass_degree: null }] },
    ];

    const reqModal = new Request("http://localhost/api/analysis", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tonic: "C",
        sectionName: "Chorus",
        blockStart: 1,
        target: { barPosition: 2, beat: 1 },
        before: { degree: "IV", quality: "major", extension: null, bass_degree: null },
        after: { degree: "IV", quality: "minor", extension: null, bass_degree: null },
        bars: modalBars,
      }),
    });

    const resModal = await postAnalysis(reqModal);
    assert.equal(resModal.status, 200);
    const dataModal = await resModal.json();

    assert.ok(dataModal.technique);
    assert.equal(dataModal.technique.name, "모달 인터체인지");
    assert.ok(dataModal.technique.confidence >= 0.9);
    assert.equal(dataModal.technique.sourceMode, "Parallel minor");
    assert.ok(Array.isArray(dataModal.technique.evidence));
    assert.ok(Array.isArray(dataModal.technique.alternatives));
  } finally {
    db.close();
  }
});

test("FE Enhancement Analysis: Pure progression/cadence fallback into TechniqueFeedback", async () => {
  // Authentic Cadence without local technique mutation (I - IV - V - I)
  const authenticBars = [
    { position: 1, chords: [{ beat: 1, degree: "I", quality: "major", extension: null, bass_degree: null }] },
    { position: 2, chords: [{ beat: 1, degree: "IV", quality: "major", extension: null, bass_degree: null }] },
    { position: 3, chords: [{ beat: 1, degree: "V", quality: "major", extension: null, bass_degree: null }] },
    { position: 4, chords: [{ beat: 1, degree: "I", quality: "major", extension: null, bass_degree: null }] },
  ];

  const req = new Request("http://localhost/api/analysis", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      tonic: "C",
      sectionName: "Chorus",
      blockStart: 1,
      target: { barPosition: 1, beat: 1 },
      before: { degree: "I", quality: "major", extension: null, bass_degree: null },
      after: { degree: "I", quality: "major", extension: null, bass_degree: null },
      bars: authenticBars,
    }),
  });

  const res = await postAnalysis(req);
  assert.equal(res.status, 200);
  const data = await res.json();

  // Pure diatonic chord mutation -> technique is null, but progressionPattern is detected
  assert.equal(data.technique, null);
  assert.ok(data.progressionPattern);
  assert.equal(data.progressionPattern.name, "정격 종지");

  // FE Fallback Logic Simulation:
  const feTechniqueFeedback: TechniqueFeedback = {
    id: 0,
    name: data.progressionPattern.name,
    description: data.progressionPattern.description,
    confidence: 1.0,
    evidence: [`4마디 코드 진행 분석: ${data.progressionPattern.name}`],
    progressionPattern: data.progressionPattern,
    progressionAlternatives: data.progressionAlternatives || [],
  };

  assert.equal(feTechniqueFeedback.id, 0);
  assert.equal(feTechniqueFeedback.name, "정격 종지");
  assert.equal(feTechniqueFeedback.progressionPattern?.type, "cadence");
  assert.equal(feTechniqueFeedback.confidence, 1.0);
});

test("FE Enhancement Analysis: 4-bar block partitioning and active bar evaluation", () => {
  // Test blockStart boundary calculation for bars in 8-bar section
  const calculateBlockStart = (barPos: number) => Math.floor((barPos - 1) / 4) * 4 + 1;

  assert.equal(calculateBlockStart(1), 1);
  assert.equal(calculateBlockStart(2), 1);
  assert.equal(calculateBlockStart(3), 1);
  assert.equal(calculateBlockStart(4), 1);
  assert.equal(calculateBlockStart(5), 5);
  assert.equal(calculateBlockStart(6), 5);
  assert.equal(calculateBlockStart(7), 5);
  assert.equal(calculateBlockStart(8), 5);

  // Test block slice extraction for 8 bars
  const mockBars: BarDraft[] = Array.from({ length: 8 }, (_, i) => ({
    id: `bar-${i + 1}`,
    position: i + 1,
    chords: [{ id: `chord-${i + 1}-1`, beat: 1, degree: "I", quality: "major" as const, extension: null, bass_degree: null }],
  }));

  const block1Bars = mockBars.slice(0, 4);
  assert.equal(block1Bars.length, 4);
  assert.equal(block1Bars[0].position, 1);
  assert.equal(block1Bars[3].position, 4);

  const block2Bars = mockBars.slice(4, 8);
  assert.equal(block2Bars.length, 4);
  assert.equal(block2Bars[0].position, 5);
  assert.equal(block2Bars[3].position, 8);
});
