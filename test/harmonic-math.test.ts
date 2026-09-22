import assert from "node:assert/strict";
import test from "node:test";

import {
  calculateBassLineMotion,
  degreeToPitchClass,
  getSemitoneInterval,
  isDiatonicDegree,
  isPerfectFifthDown,
  isSemitoneUp,
  pitchForDegree,
} from "../app/lib/server/domain/harmonic-math";

test("calculates shared degree pitch relationships", () => {
  assert.equal(degreeToPitchClass("I"), 0);
  assert.equal(degreeToPitchClass("bVI"), 8);
  assert.equal(getSemitoneInterval("V", "I"), 5);
  assert.equal(isPerfectFifthDown("V", "I"), true);
  assert.equal(isSemitoneUp("VII", "I"), true);
  assert.equal(pitchForDegree("C", "V"), 7);
  assert.equal(isDiatonicDegree("VI"), true);
  assert.equal(isDiatonicDegree("bVI"), false);
});

test("classifies bass motion", () => {
  assert.equal(calculateBassLineMotion(["I", "VII", "VI", "V"]), "stepwise_down");
  assert.equal(calculateBassLineMotion(["I", "II", "III", "IV"]), "stepwise_up");
  assert.equal(calculateBassLineMotion(["I", "I", "I"]), "pedal");
  assert.equal(calculateBassLineMotion(["I", "V", "II"]), "none");
});
