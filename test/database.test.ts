import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { checkDatabase, openDatabase } from "../app/lib/server/db/database";

test("creates and checks a SQLite database", () => {
  const directory = mkdtempSync(join(tmpdir(), "cpmanager-wave0-"));
  const databasePath = join(directory, "test.sqlite");

  try {
    checkDatabase(databasePath);
    const database = openDatabase(databasePath);
    const result = database.prepare("SELECT 1 AS value").get() as { value: number };
    database.close();

    assert.equal(result.value, 1);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
