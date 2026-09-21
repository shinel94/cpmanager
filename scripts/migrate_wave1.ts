import { applyMigrations } from "@/app/lib/server/db/migrations";
import { openDatabase } from "@/app/lib/server/db/database";

const database = openDatabase();
try {
  applyMigrations(database);
  console.log("Wave 1 migrations applied");
} finally {
  database.close();
}
