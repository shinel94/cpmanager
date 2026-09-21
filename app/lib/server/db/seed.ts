import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { DatabaseSync } from "node:sqlite";

import { normalizeStep, SECTION_NAMES, type ChordStep } from "@/app/lib/server/catalog/chord-catalog";
import { applyMigrations } from "@/app/lib/server/db/migrations";
import { TECHNIQUE_RULES } from "@/app/lib/server/rules/technique-rules";

const PROGRESSION_FILES = [
  "progressions.json",
  "progressions_2.json",
  "progressions_3.json",
  "progressions_4.json",
  "progressions_5.json",
] as const;

type RawProgression = {
  id: number;
  name: string;
  form_tags: string[];
  description?: string;
  popularity_score: number;
  connectivity_score: number;
  diversity_group: string;
  priority: number;
  steps: Array<{
    position: number;
    degree: unknown;
    quality: unknown;
    extension?: unknown;
    bass_degree?: unknown;
  }>;
};

export type NormalizedProgression = Omit<RawProgression, "steps"> & {
  steps: Array<{ position: number } & ChordStep>;
};

function readJsonFile(fileName: string): unknown {
  const path = join(process.cwd(), "progression", fileName);
  return JSON.parse(readFileSync(path, "utf8"));
}

function normalizeProgression(row: RawProgression, source: string): NormalizedProgression {
  if (!Number.isInteger(row.id) || row.id < 1) throw new Error(`${source}: invalid id`);
  if (!row.name?.trim()) throw new Error(`${source} id=${row.id}: name is required`);
  if (!Array.isArray(row.form_tags) || row.form_tags.length === 0) {
    throw new Error(`${source} id=${row.id}: form_tags is required`);
  }
  for (const tag of row.form_tags) {
    if (!SECTION_NAMES.includes(tag as (typeof SECTION_NAMES)[number])) {
      throw new Error(`${source} id=${row.id}: unsupported form tag ${tag}`);
    }
  }
  if (!Array.isArray(row.steps) || row.steps.length !== 4) {
    throw new Error(`${source} id=${row.id}: exactly four steps are required`);
  }

  const positions = row.steps.map((step) => step.position).sort((a, b) => a - b);
  if (positions.join(",") !== "1,2,3,4") {
    throw new Error(`${source} id=${row.id}: step positions must be 1 through 4`);
  }

  return {
    ...row,
    steps: row.steps.map((step) => ({
      position: step.position,
      ...normalizeStep(step),
    })),
  };
}

export function loadProgressions(): NormalizedProgression[] {
  const rows: NormalizedProgression[] = [];
  for (const fileName of PROGRESSION_FILES) {
    const parsed = readJsonFile(fileName);
    if (!Array.isArray(parsed)) throw new Error(`${fileName}: root must be an array`);
    for (const row of parsed) {
      rows.push(normalizeProgression(row as RawProgression, fileName));
    }
  }

  const ids = new Set<number>();
  for (const row of rows) {
    if (ids.has(row.id)) throw new Error(`duplicate progression id: ${row.id}`);
    ids.add(row.id);
  }
  return rows.sort((a, b) => a.id - b.id);
}

function seedProgressions(database: DatabaseSync, rows: NormalizedProgression[]): void {
  const ids = rows.map((row) => row.id);
  const placeholders = ids.map(() => "?").join(", ");
  database.prepare(
    `DELETE FROM system_recommendation_progressions WHERE id NOT IN (${placeholders})`,
  ).run(...ids);

  const insertProgression = database.prepare(`
    INSERT INTO system_recommendation_progressions
      (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      description = excluded.description,
      popularity_score = excluded.popularity_score,
      connectivity_score = excluded.connectivity_score,
      diversity_group = excluded.diversity_group,
      priority = excluded.priority
  `);
  const deleteTags = database.prepare(
    "DELETE FROM system_progression_form_tags WHERE progression_id = ?",
  );
  const insertStep = database.prepare(`
    INSERT INTO system_progression_steps
      (progression_id, position, degree, quality, extension, bass_degree)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  const deleteSteps = database.prepare(
    "DELETE FROM system_progression_steps WHERE progression_id = ?",
  );
  const insertTag = database.prepare(`
    INSERT INTO system_progression_form_tags (progression_id, form_tag)
    VALUES (?, ?)
  `);
  const now = new Date().toISOString();

  for (const row of rows) {
    insertProgression.run(
      row.id,
      row.name,
      row.description ?? null,
      row.popularity_score,
      row.connectivity_score,
      row.diversity_group,
      row.priority,
      now,
    );
    deleteTags.run(row.id);
    deleteSteps.run(row.id);
    for (const tag of row.form_tags) insertTag.run(row.id, tag);
    for (const step of row.steps) {
      insertStep.run(
        row.id,
        step.position,
        step.degree,
        step.quality,
        step.extension,
        step.bass_degree,
      );
    }
  }
}

function seedTechniqueRules(database: DatabaseSync): void {
  validateTechniqueRules();
  database.exec("DELETE FROM technique_rules");
  const insert = database.prepare(`
    INSERT INTO technique_rules
      (id, name, rule_type, condition, description, priority, enabled, created_at)
    VALUES (?, ?, ?, ?, ?, ?, 1, ?)
  `);
  const now = new Date().toISOString();
  for (const rule of TECHNIQUE_RULES) {
    insert.run(
      rule.id,
      rule.name,
      rule.rule_type,
      JSON.stringify(rule.condition),
      rule.description,
      rule.priority,
      now,
    );
  }
}

function validateTechniqueRules(): void {
  const allowedTypes = new Set([
    "modal_interchange",
    "secondary_dominant",
    "slash_chord",
    "chord_variation",
  ]);

  for (const rule of TECHNIQUE_RULES) {
    if (!Number.isInteger(rule.id) || rule.id < 1) throw new Error("Invalid technique rule id");
    if (!rule.name.trim() || !rule.description.trim()) throw new Error(`Invalid technique rule text: ${rule.id}`);
    if (!allowedTypes.has(rule.rule_type)) throw new Error(`Unsupported technique rule type: ${rule.rule_type}`);
    if (!rule.condition || typeof rule.condition !== "object" || Array.isArray(rule.condition)) {
      throw new Error(`Invalid technique rule condition: ${rule.id}`);
    }
    if (!Number.isInteger(rule.priority)) throw new Error(`Invalid technique rule priority: ${rule.id}`);
  }
}

export function seedWave1(database: DatabaseSync): { progressions: number; steps: number; rules: number } {
  applyMigrations(database);
  const rows = loadProgressions();
  database.exec("BEGIN");
  try {
    seedProgressions(database, rows);
    seedTechniqueRules(database);
    database.exec("COMMIT");
  } catch (error) {
    database.exec("ROLLBACK");
    throw error;
  }

  const count = database.prepare("SELECT COUNT(*) AS count FROM system_recommendation_progressions").get() as { count: number };
  const stepCount = database.prepare("SELECT COUNT(*) AS count FROM system_progression_steps").get() as { count: number };
  const ruleCount = database.prepare("SELECT COUNT(*) AS count FROM technique_rules").get() as { count: number };
  return { progressions: count.count, steps: stepCount.count, rules: ruleCount.count };
}
