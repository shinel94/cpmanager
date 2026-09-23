import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { openDatabase } from "@/app/lib/server/db/database";

function printUsage(): void {
  console.log(`
Usage:
  npm run db:update <path_to_sql_file>
  npm run db:update -- <path_to_sql_file>
  npm run db:update -- "INSERT INTO ..."
  npm run db:update -- --db data/custom.sqlite <path_to_sql_file>

Examples:
  npm run db:update progression/seed_progressions_6.sql
  npm run db:update -- progression/seed_progressions_6.sql
`);
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
    printUsage();
    process.exit(args.length === 0 ? 1 : 0);
  }

  let dbPath: string | undefined;
  let sqlInput: string | undefined;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--db") {
      dbPath = args[i + 1] ? resolve(process.cwd(), args[i + 1]) : undefined;
      i++;
    } else if (!sqlInput) {
      sqlInput = arg;
    }
  }

  if (!sqlInput) {
    console.error("Error: No SQL file or query provided.");
    printUsage();
    process.exit(1);
  }

  let sqlContent: string;
  let sourceDescription: string;

  const resolvedFilePath = resolve(process.cwd(), sqlInput);
  if (existsSync(resolvedFilePath)) {
    sqlContent = readFileSync(resolvedFilePath, "utf8");
    sourceDescription = `File: ${sqlInput}`;
  } else {
    // Treat as raw SQL query
    sqlContent = sqlInput;
    sourceDescription = "Inline SQL query";
  }

  if (!sqlContent.trim()) {
    console.error("Error: Provided SQL is empty.");
    process.exit(1);
  }

  console.log(`[db:update] Target database: ${dbPath ?? "default (data/cpmanager.sqlite)"}`);
  console.log(`[db:update] Source: ${sourceDescription}`);

  const database = openDatabase(dbPath);

  try {
    database.exec("BEGIN");
    database.exec(sqlContent);
    database.exec("COMMIT");

    const recCount = (
      database.prepare("SELECT COUNT(*) as count FROM system_recommendation_progressions").get() as { count: number }
    ).count;
    const stepCount = (
      database.prepare("SELECT COUNT(*) as count FROM system_progression_steps").get() as { count: number }
    ).count;
    const tagCount = (
      database.prepare("SELECT COUNT(*) as count FROM system_progression_form_tags").get() as { count: number }
    ).count;

    console.log("[db:update] Success! Update committed atomically.");
    console.log(`[db:update] Current database stats:`);
    console.log(`  - System Progressions: ${recCount}`);
    console.log(`  - Progression Steps:   ${stepCount}`);
    console.log(`  - Form Tags:           ${tagCount}`);
  } catch (error) {
    try {
      database.exec("ROLLBACK");
    } catch {
      // rollback may fail if transaction never started
    }
    console.error("[db:update] Error executing SQL update:", error);
    process.exit(1);
  } finally {
    database.close();
  }
}

main().catch((err) => {
  console.error("[db:update] Unexpected failure:", err);
  process.exit(1);
});
