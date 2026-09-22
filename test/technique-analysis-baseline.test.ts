import assert from "node:assert/strict";
import test from "node:test";

import fixture from "./fixtures/technique-analysis-baseline.json";
import { openDatabase } from "../app/lib/server/db/database";
import { seedWave1 } from "../app/lib/server/db/seed";
import { analyzeTechnique } from "../app/lib/server/services/technique-analyzer";

test("preserves the baseline analysis response contract", () => {
  const database = openDatabase(":memory:");
  try {
    seedWave1(database);
    const result = analyzeTechnique(database, fixture.request);
    assert.deepEqual(
      {
        id: result?.id,
        name: result?.name,
        description: result?.description,
      },
      fixture.expected,
    );
  } finally {
    database.close();
  }
});
