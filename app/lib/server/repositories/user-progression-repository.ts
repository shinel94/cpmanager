import type { DatabaseSync } from "node:sqlite";

import { SECTION_NAMES, normalizeStep, type ChordStep } from "@/app/lib/server/catalog/chord-catalog";
import { matchesDegreePattern } from "@/app/lib/server/domain/progression-matcher";
import { ValidationError } from "@/app/lib/server/validation/project-payload";

export type UserProgressionInput = {
  name: string;
  formTags: string[];
  description?: string;
  steps: Array<{ position: number; degree: unknown; quality?: unknown; extension?: unknown; bass_degree?: unknown }>;
};

function normalizeInput(input: UserProgressionInput) {
  if (!input.name.trim()) throw new ValidationError("Progression name is required");
  if (!Array.isArray(input.formTags)) throw new ValidationError("formTags must be an array");
  for (const tag of input.formTags) {
    if (!SECTION_NAMES.includes(tag as (typeof SECTION_NAMES)[number])) throw new ValidationError(`Unsupported form tag: ${tag}`);
  }
  if (!Array.isArray(input.steps) || input.steps.length !== 4) throw new ValidationError("Exactly four progression steps are required");
  const positions = input.steps.map((step) => step.position).sort((a, b) => a - b);
  if (positions.join(",") !== "1,2,3,4") throw new ValidationError("Progression positions must be 1 through 4");
  return {
    name: input.name.trim(),
    formTags: [...new Set(input.formTags)],
    description: input.description?.trim() || null,
    steps: input.steps.map((step) => ({ position: step.position, ...normalizeStep({ ...step, quality: step.quality ?? "major", extension: step.extension ?? null, bass_degree: step.bass_degree ?? null }) })),
  };
}

export function createUserProgression(database: DatabaseSync, input: UserProgressionInput): number {
  const progression = normalizeInput(input);
  const now = new Date().toISOString();
  database.exec("BEGIN");
  try {
    const result = database.prepare("INSERT INTO user_progressions (name, description, created_at) VALUES (?, ?, ?)").run(progression.name, progression.description, now);
    const id = Number(result.lastInsertRowid);
    const insertTag = database.prepare("INSERT INTO user_progression_form_tags (progression_id, form_tag) VALUES (?, ?)");
    const insertStep = database.prepare("INSERT INTO user_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES (?, ?, ?, ?, ?, ?)");
    for (const tag of progression.formTags) insertTag.run(id, tag);
    for (const step of progression.steps) insertStep.run(id, step.position, step.degree, step.quality, step.extension, step.bass_degree);
    database.exec("COMMIT");
    return id;
  } catch (error) {
    database.exec("ROLLBACK");
    throw error;
  }
}

export function listUserProgressions(database: DatabaseSync, query = "") {
  const rows = (!query.trim()
    ? database.prepare("SELECT id, name, description, created_at FROM user_progressions ORDER BY created_at DESC, id DESC").all()
    : database.prepare("SELECT id, name, description, created_at FROM user_progressions WHERE name LIKE ? ORDER BY created_at DESC, id DESC").all(`%${query.trim()}%`)) as unknown as Array<{ id: number; name: string; description: string | null; created_at: string }>;

  return rows.map((row) => {
    const formTags = database.prepare("SELECT form_tag FROM user_progression_form_tags WHERE progression_id = ? ORDER BY form_tag").all(row.id) as unknown as Array<{ form_tag: string }>;
    const steps = database.prepare("SELECT position, degree, quality, extension, bass_degree FROM user_progression_steps WHERE progression_id = ? ORDER BY position").all(row.id) as unknown as Array<ChordStep & { position: number }>;
    return { ...row, formTags: formTags.map((tag) => tag.form_tag), steps };
  });
}

export function getUserProgression(database: DatabaseSync, id: number) {
  const progression = database.prepare("SELECT id, name, description, created_at FROM user_progressions WHERE id = ?").get(id) as { id: number; name: string; description: string | null; created_at: string } | undefined;
  if (!progression) return null;
  const formTags = database.prepare("SELECT form_tag FROM user_progression_form_tags WHERE progression_id = ? ORDER BY form_tag").all(id) as unknown as Array<{ form_tag: string }>;
  const steps = database.prepare("SELECT position, degree, quality, extension, bass_degree FROM user_progression_steps WHERE progression_id = ? ORDER BY position").all(id) as unknown as Array<ChordStep & { position: number }>;
  return { ...progression, formTags: formTags.map((tag) => tag.form_tag), steps };
}

export function searchUserProgressions(database: DatabaseSync, tokens: string[]) {
  const progressions = listUserProgressions(database);
  return progressions.filter((progression) => matchesDegreePattern(progression.steps, tokens));
}

export function deleteUserProgression(database: DatabaseSync, id: number): boolean {
  return database.prepare("DELETE FROM user_progressions WHERE id = ?").run(id).changes > 0;
}
