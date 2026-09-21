import type { DatabaseSync } from "node:sqlite";

import { normalizeStep, TONICS, type ChordStep, type Tonic } from "@/app/lib/server/catalog/chord-catalog";
import { realizeChords } from "@/app/lib/server/domain/chord-realizer";
import { matchesPartialProgression, type PartialStep } from "@/app/lib/server/domain/progression-matcher";
import { ValidationError } from "@/app/lib/server/validation/project-payload";

type RecommendationRequest = {
  tonic: string;
  sectionName: string;
  blockStart: number;
  bars: Array<{ position: number; chords: unknown[] }>;
  sort?: string;
  page?: number;
  pageSize?: number;
  excludeDiversityGroups?: string[];
};

type Candidate = {
  id: number;
  name: string;
  description: string | null;
  formTags: string[];
  diversityGroup: string | null;
  popularityScore: number;
  connectivityScore: number;
  priority: number;
  steps: ChordStep[];
};

function normalizeRequest(input: unknown) {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new ValidationError("Recommendation request must be an object");
  const request = input as Partial<RecommendationRequest>;
  if (typeof request.tonic !== "string" || !TONICS.includes(request.tonic as Tonic)) throw new ValidationError("Unsupported tonic");
  if (typeof request.sectionName !== "string") throw new ValidationError("sectionName is required");
  if (!Number.isInteger(request.blockStart) || (request.blockStart as number) < 1) throw new ValidationError("blockStart must be a positive integer");
  if (!Array.isArray(request.bars) || request.bars.length !== 4) throw new ValidationError("bars must contain exactly four bars");
  const bars = request.bars.map((bar) => {
    if (!bar || typeof bar !== "object" || Array.isArray(bar)) throw new ValidationError("Invalid bar");
    if (!Number.isInteger(bar.position) || (bar.position as number) < 1) throw new ValidationError("Invalid bar position");
    if (!Array.isArray(bar.chords)) throw new ValidationError("bar.chords must be an array");
    return { position: bar.position, chords: bar.chords.map((chord) => normalizeStep(chord as Parameters<typeof normalizeStep>[0])) };
  });
  const positions = bars.map((bar) => bar.position).sort((a, b) => a - b);
  if (positions.join(",") !== "1,2,3,4") throw new ValidationError("bar positions must be 1 through 4");
  const sort = request.sort ?? "popularity";
  if (!["random", "popularity", "connectivity", "diversity"].includes(sort)) throw new ValidationError("Unsupported recommendation sort");
  const page = request.page ?? 1;
  const pageSize = request.pageSize ?? 3;
  if (!Number.isInteger(page) || page < 1 || !Number.isInteger(pageSize) || pageSize < 1 || pageSize > 50) throw new ValidationError("Invalid pagination");
  return {
    tonic: request.tonic as Tonic,
    sectionName: request.sectionName,
    blockStart: request.blockStart as number,
    bars,
    sort: sort as "random" | "popularity" | "connectivity" | "diversity",
    page,
    pageSize,
    excludeDiversityGroups: request.excludeDiversityGroups ?? [],
  };
}

function loadCandidates(database: DatabaseSync): Candidate[] {
  const progressions = database.prepare("SELECT id, name, description, popularity_score, connectivity_score, diversity_group, priority FROM system_recommendation_progressions ORDER BY id").all() as unknown as Array<{ id: number; name: string; description: string | null; popularity_score: number; connectivity_score: number; diversity_group: string | null; priority: number }>;
  const steps = database.prepare("SELECT progression_id, position, degree, quality, extension, bass_degree FROM system_progression_steps ORDER BY progression_id, position").all() as unknown as Array<{ progression_id: number; position: number } & ChordStep>;
  const tags = database.prepare("SELECT progression_id, form_tag FROM system_progression_form_tags ORDER BY progression_id, form_tag").all() as unknown as Array<{ progression_id: number; form_tag: string }>;
  return progressions.map((progression) => ({
    id: progression.id,
    name: progression.name,
    description: progression.description,
    formTags: tags.filter((tag) => tag.progression_id === progression.id).map((tag) => tag.form_tag),
    diversityGroup: progression.diversity_group,
    popularityScore: progression.popularity_score,
    connectivityScore: progression.connectivity_score,
    priority: progression.priority,
    steps: steps.filter((step) => step.progression_id === progression.id).map(({ progression_id: _id, position: _position, ...step }) => step),
  }));
}

function interleaveByGroup(candidates: Candidate[]): Candidate[] {
  const groups = new Map<string, Candidate[]>();
  for (const candidate of candidates) {
    const key = candidate.diversityGroup ?? "ungrouped";
    const group = groups.get(key) ?? [];
    group.push(candidate);
    groups.set(key, group);
  }
  const result: Candidate[] = [];
  while (groups.size > 0) {
    for (const [key, group] of groups) {
      const candidate = group.shift();
      if (candidate) result.push(candidate);
      if (group.length === 0) groups.delete(key);
    }
  }
  return result;
}

function sortCandidates(candidates: Candidate[], sort: RecommendationRequest["sort"]): Candidate[] {
  const result = [...candidates];
  if (sort === "random") {
    for (let index = result.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
    }
    return result;
  }
  if (sort === "diversity") return interleaveByGroup(result.sort((a, b) => b.priority - a.priority || a.id - b.id));
  const score = sort === "connectivity" ? "connectivityScore" : "popularityScore";
  return result.sort((a, b) => b[score] - a[score] || b.priority - a.priority || a.id - b.id);
}

export function getRecommendations(database: DatabaseSync, input: unknown) {
  const request = normalizeRequest(input);
  if (request.bars.some((bar) => bar.chords.length > 1)) return { emptyReason: "multi_chord_excluded" as const, items: [], page: request.page, hasMore: false };
  if (request.bars.every((bar) => bar.chords.length === 1)) return { emptyReason: "all_filled" as const, items: [], page: request.page, hasMore: false };

  const requested: PartialStep[] = request.bars.map((bar) => bar.chords[0] ?? null);
  const allCandidates = loadCandidates(database).filter((candidate) => matchesPartialProgression(candidate.steps, requested));
  const tagged = allCandidates.filter((candidate) => candidate.formTags.includes(request.sectionName));
  const candidates = tagged.length >= request.pageSize ? tagged : allCandidates;
  const excluded = candidates.filter((candidate) => !request.excludeDiversityGroups.includes(candidate.diversityGroup ?? "ungrouped"));
  const diversityFiltered = excluded.length >= request.pageSize ? excluded : candidates;
  const sorted = sortCandidates(diversityFiltered, request.sort);
  const offset = (request.page - 1) * request.pageSize;
  const pageItems = sorted.slice(offset, offset + request.pageSize);
  return {
    emptyReason: pageItems.length === 0 ? "no_match" as const : null,
    items: pageItems.map((candidate) => ({
      id: candidate.id,
      name: candidate.name,
      description: candidate.description,
      formTags: candidate.formTags,
      diversityGroup: candidate.diversityGroup,
      steps: candidate.steps.map((step, index) => ({ position: index + 1, ...step, displayName: realizeChords(request.tonic, [step])[0] })),
    })),
    page: request.page,
    hasMore: offset + request.pageSize < sorted.length,
  };
}
