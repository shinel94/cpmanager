import type { DatabaseSync } from "node:sqlite";

export const MIGRATION_VERSION = 2;

export function applyMigrations(database: DatabaseSync): void {
  database.exec(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      tonic TEXT NOT NULL,
      mode TEXT NOT NULL DEFAULT 'major',
      tempo INTEGER NOT NULL DEFAULT 120 CHECK (tempo BETWEEN 40 AND 240),
      time_signature TEXT NOT NULL DEFAULT '4/4',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sections (
      id INTEGER PRIMARY KEY,
      project_id INTEGER NOT NULL,
      position INTEGER NOT NULL,
      name TEXT NOT NULL,
      bar_count INTEGER NOT NULL CHECK (bar_count >= 1),
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
      UNIQUE (project_id, position)
    );

    CREATE TABLE IF NOT EXISTS bars (
      id INTEGER PRIMARY KEY,
      section_id INTEGER NOT NULL,
      position INTEGER NOT NULL,
      FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE,
      UNIQUE (section_id, position)
    );

    CREATE TABLE IF NOT EXISTS bar_chords (
      id INTEGER PRIMARY KEY,
      bar_id INTEGER NOT NULL,
      beat INTEGER NOT NULL CHECK (beat BETWEEN 1 AND 4),
      degree TEXT NOT NULL,
      quality TEXT NOT NULL,
      extension TEXT,
      bass_degree TEXT,
      FOREIGN KEY (bar_id) REFERENCES bars(id) ON DELETE CASCADE,
      UNIQUE (bar_id, beat)
    );

    CREATE TABLE IF NOT EXISTS system_recommendation_progressions (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      popularity_score INTEGER NOT NULL DEFAULT 0,
      connectivity_score INTEGER NOT NULL DEFAULT 0,
      diversity_group TEXT,
      priority INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS system_progression_steps (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      progression_id INTEGER NOT NULL,
      position INTEGER NOT NULL CHECK (position BETWEEN 1 AND 4),
      degree TEXT NOT NULL,
      quality TEXT NOT NULL,
      extension TEXT,
      bass_degree TEXT,
      FOREIGN KEY (progression_id)
        REFERENCES system_recommendation_progressions(id) ON DELETE CASCADE,
      UNIQUE (progression_id, position)
    );

    CREATE TABLE IF NOT EXISTS system_progression_form_tags (
      progression_id INTEGER NOT NULL,
      form_tag TEXT NOT NULL,
      FOREIGN KEY (progression_id)
        REFERENCES system_recommendation_progressions(id) ON DELETE CASCADE,
      PRIMARY KEY (progression_id, form_tag)
    );

    CREATE TABLE IF NOT EXISTS user_progressions (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS user_progression_steps (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      progression_id INTEGER NOT NULL,
      position INTEGER NOT NULL CHECK (position BETWEEN 1 AND 4),
      degree TEXT NOT NULL,
      quality TEXT,
      extension TEXT,
      bass_degree TEXT,
      FOREIGN KEY (progression_id)
        REFERENCES user_progressions(id) ON DELETE CASCADE,
      UNIQUE (progression_id, position)
    );

    CREATE TABLE IF NOT EXISTS user_progression_form_tags (
      progression_id INTEGER NOT NULL,
      form_tag TEXT NOT NULL,
      FOREIGN KEY (progression_id)
        REFERENCES user_progressions(id) ON DELETE CASCADE,
      PRIMARY KEY (progression_id, form_tag)
    );

    CREATE TABLE IF NOT EXISTS technique_rules (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      rule_type TEXT NOT NULL,
      condition TEXT NOT NULL,
      description TEXT NOT NULL,
      priority INTEGER NOT NULL,
      enabled INTEGER NOT NULL DEFAULT 1 CHECK (enabled IN (0, 1)),
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_sections_project ON sections(project_id, position);
    CREATE INDEX IF NOT EXISTS idx_bars_section ON bars(section_id, position);
    CREATE INDEX IF NOT EXISTS idx_system_tags_form ON system_progression_form_tags(form_tag);
    CREATE INDEX IF NOT EXISTS idx_user_tags_form ON user_progression_form_tags(form_tag);
    CREATE INDEX IF NOT EXISTS idx_technique_rules_priority
      ON technique_rules(enabled, priority DESC, id ASC);
  `);

  // Ensure incremental column migration for existing projects table
  const projectColumns = database
    .prepare("PRAGMA table_info(projects)")
    .all() as unknown as Array<{ name: string }>;
  const columnNames = new Set(projectColumns.map((col) => col.name));

  if (!columnNames.has("tempo")) {
    database.exec(
      "ALTER TABLE projects ADD COLUMN tempo INTEGER NOT NULL DEFAULT 120 CHECK (tempo BETWEEN 40 AND 240);"
    );
  }
  if (!columnNames.has("time_signature")) {
    database.exec(
      "ALTER TABLE projects ADD COLUMN time_signature TEXT NOT NULL DEFAULT '4/4';"
    );
  }
}

