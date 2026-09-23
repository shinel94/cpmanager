import type { DatabaseSync } from "node:sqlite";

import { normalizeStep, type ChordStep, type Tonic } from "@/app/lib/server/catalog/chord-catalog";
import {
  validateProjectCreation,
  validateProjectPayload,
  type NormalizedProjectPayload,
  type ProjectPayload,
} from "@/app/lib/server/validation/project-payload";

type ProjectRow = {
  id: number;
  name: string;
  tonic: Tonic;
  mode: "major";
  tempo: number;
  time_signature: string;
  created_at: string;
  updated_at: string;
};

type SectionRow = {
  id: number;
  position: number;
  name: string;
  bar_count: number;
};

export type ProjectRecord = ProjectRow & {
  sections: Array<{
    id: number;
    position: number;
    name: string;
    bar_count: number;
    bars: Array<{
      id: number;
      position: number;
      chords: Array<{ id: number; beat: number } & ChordStep>;
    }>;
  }>;
};

export function createProject(database: DatabaseSync, input: unknown): number {
  const project = validateProjectCreation(input);
  const now = new Date().toISOString();
  const result = database
    .prepare("INSERT INTO projects (name, tonic, mode, tempo, time_signature, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)")
    .run(project.name, project.tonic, project.mode, project.tempo, project.time_signature, now, now);
  return Number(result.lastInsertRowid);
}

export function listProjects(database: DatabaseSync, query = "") {
  const trimmed = query.trim();
  if (trimmed === "") {
    return database.prepare("SELECT id, name, tonic, mode, tempo, time_signature, created_at, updated_at FROM projects ORDER BY updated_at DESC, id DESC").all();
  }
  return database
    .prepare("SELECT id, name, tonic, mode, tempo, time_signature, created_at, updated_at FROM projects WHERE name LIKE ? ORDER BY updated_at DESC, id DESC")
    .all(`%${trimmed}%`);
}

export function getProject(database: DatabaseSync, projectId: number): ProjectRecord | null {
  const project = database.prepare("SELECT id, name, tonic, mode, tempo, time_signature, created_at, updated_at FROM projects WHERE id = ?").get(projectId) as ProjectRow | undefined;
  if (!project) return null;

  const sections = database.prepare("SELECT id, position, name, bar_count FROM sections WHERE project_id = ? ORDER BY position").all(projectId) as unknown as SectionRow[];
  const bars = database.prepare("SELECT id, section_id, position FROM bars WHERE section_id IN (SELECT id FROM sections WHERE project_id = ?) ORDER BY section_id, position").all(projectId) as unknown as Array<{ id: number; section_id: number; position: number }>;
  const chords = database.prepare("SELECT id, bar_id, beat, degree, quality, extension, bass_degree FROM bar_chords WHERE bar_id IN (SELECT bars.id FROM bars JOIN sections ON sections.id = bars.section_id WHERE sections.project_id = ?) ORDER BY bar_id, beat").all(projectId) as unknown as Array<{ id: number; bar_id: number; beat: number } & ChordStep>;

  return {
    ...project,
    sections: sections.map((section) => ({
      ...section,
      bars: bars
        .filter((bar) => bar.section_id === section.id)
        .map((bar) => ({
          ...bar,
          chords: chords.filter((chord) => chord.bar_id === bar.id),
        })),
    })),
  };
}

export function saveProject(database: DatabaseSync, projectId: number, input: ProjectPayload): ProjectRecord {
  const payload = validateProjectPayload(input);
  const existing = database.prepare("SELECT id FROM projects WHERE id = ?").get(projectId);
  if (!existing) throw new Error(`Project not found: ${projectId}`);

  database.exec("BEGIN");
  try {
    const now = new Date().toISOString();
    database.prepare("UPDATE projects SET name = ?, tonic = ?, mode = ?, tempo = ?, time_signature = ?, updated_at = ? WHERE id = ?").run(payload.name, payload.tonic, payload.mode, payload.tempo, payload.time_signature, now, projectId);
    database.prepare("DELETE FROM sections WHERE project_id = ?").run(projectId);

    const insertSection = database.prepare("INSERT INTO sections (project_id, position, name, bar_count) VALUES (?, ?, ?, ?)");
    const insertBar = database.prepare("INSERT INTO bars (section_id, position) VALUES (?, ?)");
    const insertChord = database.prepare("INSERT INTO bar_chords (bar_id, beat, degree, quality, extension, bass_degree) VALUES (?, ?, ?, ?, ?, ?)");

    for (const section of payload.sections) {
      const sectionResult = insertSection.run(projectId, section.position, section.name, section.bar_count);
      const sectionId = Number(sectionResult.lastInsertRowid);
      for (const bar of section.bars) {
        const barResult = insertBar.run(sectionId, bar.position);
        const barId = Number(barResult.lastInsertRowid);
        for (const chord of bar.chords) {
          insertChord.run(barId, chord.beat, chord.degree, chord.quality, chord.extension, chord.bass_degree);
        }
      }
    }

    database.exec("COMMIT");
  } catch (error) {
    database.exec("ROLLBACK");
    throw error;
  }

  const saved = getProject(database, projectId);
  if (!saved) throw new Error(`Project disappeared after save: ${projectId}`);
  return saved;
}

export function deleteProject(database: DatabaseSync, projectId: number): boolean {
  const result = database.prepare("DELETE FROM projects WHERE id = ?").run(projectId);
  return result.changes > 0;
}
