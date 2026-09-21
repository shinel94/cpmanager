import { normalizeStep } from "@/app/lib/server/catalog/chord-catalog";
import { realizeChords } from "@/app/lib/server/domain/chord-realizer";
import { jsonError, jsonOk } from "@/app/lib/server/http/responses";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { tonic?: string; mode?: string; chords?: unknown[] };
    if (!body.tonic || body.mode !== "major" || !Array.isArray(body.chords)) {
      return jsonError("VALIDATION_ERROR", "tonic, mode=major, and chords are required");
    }
    const steps = body.chords.map((chord) => normalizeStep(chord as Parameters<typeof normalizeStep>[0]));
    return jsonOk({ names: realizeChords(body.tonic, steps) });
  } catch (error) {
    return jsonError("VALIDATION_ERROR", error instanceof Error ? error.message : "Invalid realization request");
  }
}
