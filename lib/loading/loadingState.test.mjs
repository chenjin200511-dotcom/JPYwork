// Purpose: Verifies the public-home loading state helpers.
import assert from "node:assert/strict";
import test from "node:test";
import {
  formatLoadingNumber,
  getLoadingPhase,
  getLoadingProgress,
} from "./loadingState.mjs";

test("formats loading numbers as fixed three-digit values", () => {
  assert.equal(formatLoadingNumber(0), "000");
  assert.equal(formatLoadingNumber(9), "009");
  assert.equal(formatLoadingNumber(38), "038");
  assert.equal(formatLoadingNumber(100), "100");
});

test("maps elapsed time to booting, counting, wiping, and ready phases", () => {
  assert.equal(getLoadingPhase(0, false), "booting");
  assert.equal(getLoadingPhase(250, false), "counting");
  assert.equal(getLoadingPhase(2600, false), "wiping");
  assert.equal(getLoadingPhase(3150, false), "ready");
});

test("keeps reduced motion short without a long wipe", () => {
  assert.equal(getLoadingPhase(0, true), "booting");
  assert.equal(getLoadingPhase(120, true), "counting");
  assert.equal(getLoadingPhase(520, true), "ready");
});

test("calculates progress from zero to one hundred", () => {
  assert.equal(getLoadingProgress(0, false), 0);
  assert.equal(getLoadingProgress(2400, false), 100);
  assert.equal(getLoadingProgress(3000, false), 100);
});
