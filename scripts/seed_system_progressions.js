#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { DatabaseSync } = require("node:sqlite");

const ROOT = path.resolve(__dirname, "..");
const PROGRESSION_DIR = path.join(ROOT, "progression");
const DEFAULT_DB = path.join(ROOT, "data", "cpmanager.sqlite");

const JSON_FILES = [
  "progressions.json",
  "progressions_2.json",
  "progressions_3.json",
  "progressions_4.json",
  "progressions_5.json",
];

const FORM_TAGS = new Set([
  "Intro",
  "Verse",
  "Pre-Chorus",
  "Chorus",
  "Interlude",
  "Bridge",
  "Outro",
]);

const args = parseArgs(process.argv.slice(2));
const dbPath = path.resolve(args.db || DEFAULT_DB);

function parseArgs(argv) {
  const out = { dryRun: false, db: null };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === "--dry-run") out.dryRun = true;
    else if (argv[i] === "--db") out.db = argv[++i];
  }
  return out;
}

function loadProgressions() {
  const items = [];
  for (const file of JSON_FILES) {
    const full = path.join(PROGRESSION_DIR, file);
    if (!fs.existsSync(full)) {
      throw new Error(`시드 파일이 없습니다: ${full}`);
    }
    const parsed = JSON.parse(fs.readFileSync(full, "utf8"));
    if (!Array.isArray(parsed)) {
      throw new Error(`${file}은 배열이어야 합니다.`);
    }
    for (const row of parsed) {
      validateProgression(row, file);
      items.push({ ...row, _source: file });
    }
  }
  const ids = new Set();
  for (const row of items) {
    if (ids.has(row.id)) throw new Error(`중복 id: ${row.id}`);
    ids.add(row.id);
  }
  return items;
}

function validateProgression(row, file) {
  const prefix = `${file} id=${row && row.id}`;
  if (!row || typeof row.id !== "number") throw new Error(`${prefix}: id 없음`);
  if (!row.name || !String(row.name).trim()) throw new Error(`${prefix}: name 없음`);
  if (!Array.isArray(row.form_tags) || row.form_tags.length === 0) {
    throw new Error(`${prefix}: form_tags 필요`);
  }
  for (const tag of row.form_tags) {
    if (!FORM_TAGS.has(tag)) throw new Error(`${prefix}: 지원하지 않는 form_tag ${tag}`);
  }
  if (typeof row.popularity_score !== "number") throw new Error(`${prefix}: popularity_score`);
  if (typeof row.connectivity_score !== "number") throw new Error(`${prefix}: connectivity_score`);
  if (!row.diversity_group) throw new Error(`${prefix}: diversity_group`);
  if (typeof row.priority !== "number") throw new Error(`${prefix}: priority`);
  if (!Array.isArray(row.steps) || row.steps.length !== 4) {
    throw new Error(`${prefix}: steps는 정확히 4개여야 합니다.`);
  }
  const positions = row.steps.map((s) => s.position).sort((a, b) => a - b);
  if (positions.join(",") !== "1,2,3,4") {
    throw new Error(`${prefix}: steps.position은 1~4여야 합니다.`);
  }
  for (const step of row.steps) {
    if (!step.degree) throw new Error(`${prefix} pos=${step.position}: degree 없음`);
    if (!step.quality) throw new Error(`${prefix} pos=${step.position}: quality 없음`);
  }
}

function ensureSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS system_recommendation_progressions (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      form_tags TEXT,
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
      UNIQUE (progression_id, position),
      FOREIGN KEY (progression_id)
        REFERENCES system_recommendation_progressions(id)
        ON DELETE CASCADE
    );
  `);
}

function seed(db, items) {
  const upsertProgression = db.prepare(`
    INSERT INTO system_recommendation_progressions (
      id, name, form_tags, description,
      popularity_score, connectivity_score, diversity_group, priority, created_at
    ) VALUES (
      @id, @name, @form_tags, @description,
      @popularity_score, @connectivity_score, @diversity_group, @priority, @created_at
    )
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      form_tags = excluded.form_tags,
      description = excluded.description,
      popularity_score = excluded.popularity_score,
      connectivity_score = excluded.connectivity_score,
      diversity_group = excluded.diversity_group,
      priority = excluded.priority
  `);
  const deleteSteps = db.prepare(
    "DELETE FROM system_progression_steps WHERE progression_id = ?"
  );
  const insertStep = db.prepare(`
    INSERT INTO system_progression_steps (
      progression_id, position, degree, quality, extension, bass_degree
    ) VALUES (?, ?, ?, ?, ?, ?)
  `);

  const now = new Date().toISOString();
  const insertAll = db.transaction((rows) => {
    for (const row of rows) {
      upsertProgression.run({
        id: row.id,
        name: row.name,
        form_tags: JSON.stringify(row.form_tags),
        description: row.description || null,
        popularity_score: row.popularity_score,
        connectivity_score: row.connectivity_score,
        diversity_group: row.diversity_group,
        priority: row.priority,
        created_at: now,
      });
      deleteSteps.run(row.id);
      for (const step of row.steps) {
        insertStep.run(
          row.id,
          step.position,
          step.degree,
          step.quality,
          step.extension ?? null,
          step.bass_degree ?? null
        );
      }
    }
  });
  insertAll(items);
}

function summarize(items) {
  const byFile = {};
  const byForm = {};
  const byGroup = {};
  for (const row of items) {
    byFile[row._source] = (byFile[row._source] || 0) + 1;
    byGroup[row.diversity_group] = (byGroup[row.diversity_group] || 0) + 1;
    for (const tag of row.form_tags) {
      byForm[tag] = (byForm[tag] || 0) + 1;
    }
  }
  return { byFile, byForm, byGroup };
}

function main() {
  const items = loadProgressions();
  const stats = summarize(items);
  console.log(`검증 완료: ${items.length}개 진행, ${items.length * 4}개 스텝`);
  console.log("파일별:", stats.byFile);
  console.log("송폼별:", stats.byForm);

  if (args.dryRun) {
    console.log("dry-run: DB에 쓰지 않습니다.");
    return;
  }

  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  const db = new DatabaseSync(dbPath);
  db.exec("PRAGMA foreign_keys = ON");
  ensureSchema(db);
  seed(db, items);
  const count = db
    .prepare("SELECT COUNT(*) AS n FROM system_recommendation_progressions")
    .get().n;
  const stepCount = db
    .prepare("SELECT COUNT(*) AS n FROM system_progression_steps")
    .get().n;
  db.close();
  console.log(`저장 완료: ${dbPath}`);
  console.log(`system_recommendation_progressions = ${count}`);
  console.log(`system_progression_steps = ${stepCount}`);
}

main();
