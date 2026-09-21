import { applyMigrations } from "@/app/lib/server/db/migrations";
import { openDatabase } from "@/app/lib/server/db/database";

export function openAppDatabase() {
  const database = openDatabase();
  applyMigrations(database);
  return database;
}
