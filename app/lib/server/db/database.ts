import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { DatabaseSync } from "node:sqlite";

export function getDatabasePath(): string {
  return process.env.CPMANAGER_DB_PATH ?? resolve(process.cwd(), "data/cpmanager.sqlite");
}

export function openDatabase(databasePath = getDatabasePath()): DatabaseSync {
  mkdirSync(dirname(databasePath), { recursive: true });
  const database = new DatabaseSync(databasePath);
  database.exec("PRAGMA foreign_keys = ON;");
  database.exec("PRAGMA journal_mode = WAL;");
  database.exec("PRAGMA busy_timeout = 5000;");
  return database;
}

export function checkDatabase(databasePath = getDatabasePath()): void {
  const database = openDatabase(databasePath);
  try {
    database.prepare("SELECT 1 AS ok").get();
  } finally {
    database.close();
  }
}
