import assert from "node:assert/strict";
import test from "node:test";

import { analyzeProgression } from "../app/lib/server/services/progression-analyzer";
import { POST as postAnalysis } from "../app/api/analysis/route";

const bars = (steps: Array<{ degree: string; quality: "major" | "minor" | "dominant" }>) => steps.map((step, index) => ({
  position: index + 1,
  chords: [{ beat: 1, ...step, extension: null, bass_degree: null as string | null }],
}));

const request = (barData: ReturnType<typeof bars>) => ({
  tonic: "C",
  sectionName: "Chorus",
  blockStart: 1,
  target: { barPosition: 1, beat: 1 },
  before: barData[0].chords[0],
  after: barData[0].chords[0],
  bars: barData,
});

test("detects cadence patterns", () => {
  assert.equal(analyzeProgression(request(bars([
    { degree: "I", quality: "major" },
    { degree: "II", quality: "minor" },
    { degree: "V", quality: "major" },
    { degree: "I", quality: "major" },
  ])))[0].name, "정격 종지");
  assert.equal(analyzeProgression(request(bars([
    { degree: "I", quality: "major" },
    { degree: "II", quality: "minor" },
    { degree: "V", quality: "major" },
    { degree: "VI", quality: "minor" },
  ])))[0].name, "기만 종지");
});

test("detects ii-V-I, circle, and loop patterns", () => {
  const twoFiveOne = analyzeProgression(request(bars([
    { degree: "I", quality: "major" },
    { degree: "II", quality: "minor" },
    { degree: "V", quality: "major" },
    { degree: "I", quality: "major" },
  ])));
  assert.equal(twoFiveOne.some((pattern) => pattern.name === "ii - V - I 진행"), true);

  const loop = analyzeProgression(request(bars([
    { degree: "I", quality: "major" },
    { degree: "IV", quality: "major" },
    { degree: "I", quality: "major" },
    { degree: "IV", quality: "major" },
  ])));
  assert.equal(loop.some((pattern) => pattern.name === "반복 루프 진행"), true);
});

test("does not analyze a multi-chord block as a progression", () => {
  const block = bars([
    { degree: "I", quality: "major" },
    { degree: "IV", quality: "major" },
    { degree: "V", quality: "major" },
    { degree: "I", quality: "major" },
  ]);
  block[1].chords.push({ beat: 3, degree: "V", quality: "major", extension: null, bass_degree: null });
  assert.deepEqual(analyzeProgression(request(block)), []);
});

test("detects descending bass line patterns", () => {
  const barData = bars([
    { degree: "I", quality: "major" },
    { degree: "V", quality: "major" },
    { degree: "VI", quality: "minor" },
    { degree: "V", quality: "major" },
  ]);
  barData[1].chords[0].bass_degree = "VII";
  barData[2].chords[0].bass_degree = "VI";
  barData[3].chords[0].bass_degree = "V";
  assert.equal(analyzeProgression(request(barData)).some((pattern) => pattern.name === "하강 베이스 라인"), true);
});

test("analysis API keeps technique compatibility and exposes progressionPattern", async () => {
  const barData = bars([
    { degree: "I", quality: "major" },
    { degree: "II", quality: "minor" },
    { degree: "V", quality: "major" },
    { degree: "I", quality: "major" },
  ]);
  const response = await postAnalysis(new Request("http://localhost/api/analysis", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      ...request(barData),
      target: { barPosition: 4, beat: 1 },
      before: barData[2].chords[0],
      after: barData[3].chords[0],
    }),
  }));
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.equal(body.technique, null);
  assert.equal(body.progressionPattern.name, "정격 종지");
});
