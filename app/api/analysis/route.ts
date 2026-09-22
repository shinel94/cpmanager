import { openAppDatabase } from "@/app/lib/server/db/app-database";
import { handleRouteError } from "@/app/lib/server/http/route-utils";
import { jsonOk } from "@/app/lib/server/http/responses";
import { analyzeProgression } from "@/app/lib/server/services/progression-analyzer";
import { analyzeTechnique } from "@/app/lib/server/services/technique-analyzer";

export async function POST(request: Request) {
  const database = openAppDatabase();
  try {
    const body = await request.json();
    const technique = analyzeTechnique(database, body);
    const progressionPatterns = analyzeProgression(body);
    const bodyRecord = body as { blockStart?: number; target?: { barPosition?: number; beat?: number } };
    return jsonOk({
      technique,
      progressionPattern: progressionPatterns[0] ?? null,
      progressionAlternatives: progressionPatterns.slice(1),
      context: {
        blockStart: bodyRecord.blockStart,
        barPosition: bodyRecord.target?.barPosition,
        beat: bodyRecord.target?.beat,
      },
    });
  } catch (error) {
    return handleRouteError(error);
  } finally {
    database.close();
  }
}
