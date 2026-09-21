import { normalizeDegree, normalizeStep, type ChordStep } from "@/app/lib/server/catalog/chord-catalog";

export type SearchToken = string | "x";

export function normalizeSearchPattern(tokens: string[]): SearchToken[] {
  if (tokens.length !== 4) throw new Error("A progression search requires exactly four tokens");
  const normalized = tokens.map((token) => {
    if (token.toLowerCase() === "x") return "x" as const;
    return normalizeDegree(token);
  });
  if (normalized.every((token) => token === "x")) {
    throw new Error("A search containing only wildcards is not allowed");
  }
  return normalized;
}

export function matchesDegreePattern(
  candidate: ChordStep[],
  tokens: string[],
): boolean {
  const pattern = normalizeSearchPattern(tokens);
  if (candidate.length !== 4) return false;
  return pattern.every((token, index) => token === "x" || token === normalizeDegree(candidate[index].degree));
}

export type PartialStep = Partial<ChordStep> | null;

export function matchesPartialProgression(candidate: ChordStep[], requested: PartialStep[]): boolean {
  if (candidate.length !== 4 || requested.length !== 4) return false;
  return requested.every((request, index) => {
    if (!request) return true;
    const actual = normalizeStep(candidate[index]);
    if (request.degree !== undefined && actual.degree !== normalizeDegree(request.degree)) return false;
    if (request.quality !== undefined && actual.quality !== request.quality) return false;
    if (request.extension !== undefined && actual.extension !== request.extension) return false;
    if (request.bass_degree !== undefined) {
      const requestedBass = request.bass_degree === null ? null : normalizeDegree(request.bass_degree);
      if (actual.bass_degree !== requestedBass) return false;
    }
    return true;
  });
}
