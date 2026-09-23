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

test("applies incremental SQL updates while preserving existing database data", () => {
  const directory = mkdtempSync(join(tmpdir(), "cpmanager-dbupdate-"));
  const databasePath = join(directory, "test-update.sqlite");

  try {
    const database = openDatabase(databasePath);
    const { applyMigrations } = require("../app/lib/server/db/migrations");
    const { seedWave1 } = require("../app/lib/server/db/seed");
    seedWave1(database);

    const initialCount = (
      database.prepare("SELECT COUNT(*) as count FROM system_recommendation_progressions").get() as { count: number }
    ).count;
    assert.equal(initialCount, 160);

    // Apply incremental seed SQL
    const { readFileSync } = require("node:fs");
    const sqlPath = join(process.cwd(), "progression", "seed_progressions_6.sql");
    const sqlContent = readFileSync(sqlPath, "utf8");

    database.exec("BEGIN");
    database.exec(sqlContent);
    database.exec("COMMIT");

    const updatedCount = (
      database.prepare("SELECT COUNT(*) as count FROM system_recommendation_progressions").get() as { count: number }
    ).count;
    assert.equal(updatedCount, 192);

    // Verify a sample from the new batch
    const sample = database.prepare("SELECT * FROM system_recommendation_progressions WHERE id = 161").get() as {
      id: number;
      name: string;
      diversity_group: string;
    };
    assert.ok(sample);
    assert.equal(sample.diversity_group, "jrock_anthem");

    // Apply Part 7 batch (112 progressions starting with V)
    const sqlPath7 = join(process.cwd(), "progression", "seed_progressions_7.sql");
    const sqlContent7 = readFileSync(sqlPath7, "utf8");

    database.exec("BEGIN");
    database.exec(sqlContent7);
    database.exec("COMMIT");

    const countAfterPart7 = (
      database.prepare("SELECT COUNT(*) as count FROM system_recommendation_progressions").get() as { count: number }
    ).count;
    assert.equal(countAfterPart7, 304);

    // Verify sample from Part 7 starts with degree V
    const sample7Step1 = database.prepare(
      "SELECT degree FROM system_progression_steps WHERE progression_id = 193 AND position = 1"
    ).get() as { degree: string };
    assert.equal(sample7Step1.degree, "V");

    database.close();
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
