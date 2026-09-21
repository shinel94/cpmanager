import { getMajorDiatonicChords } from "@/app/lib/server/domain/chord-realizer";
import { jsonError, jsonOk } from "@/app/lib/server/http/responses";

export function GET(request: Request) {
  const tonic = new URL(request.url).searchParams.get("tonic");
  if (!tonic) return jsonError("VALIDATION_ERROR", "tonic is required");
  try {
    return jsonOk({ tonic, items: getMajorDiatonicChords(tonic) });
  } catch (error) {
    return jsonError("VALIDATION_ERROR", error instanceof Error ? error.message : "Invalid tonic");
  }
}
