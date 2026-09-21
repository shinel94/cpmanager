import { resolve } from "node:path";

import { openDatabase } from "@/app/lib/server/db/database";
import { loadProgressions, seedWave1 } from "@/app/lib/server/db/seed";

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const dbFlagIndex = args.indexOf("--db");
const databasePath = dbFlagIndex >= 0 && args[dbFlagIndex + 1]
  ? resolve(process.cwd(), args[dbFlagIndex + 1])
  : undefined;

if (dryRun) {
  const rows = loadProgressions();
  console.log(JSON.stringify({ progressions: rows.length, steps: rows.length * 4, dryRun: true }));
} else {
  const database = openDatabase(databasePath);
  try {
    const result = seedWave1(database);
    console.log(JSON.stringify(result));
  } finally {
    database.close();
  }
}
