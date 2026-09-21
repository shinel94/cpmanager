import { openAppDatabase } from "@/app/lib/server/db/app-database";
import { handleRouteError } from "@/app/lib/server/http/route-utils";
import { jsonOk } from "@/app/lib/server/http/responses";
import { analyzeTechnique } from "@/app/lib/server/services/technique-analyzer";

export async function POST(request: Request) {
  const database = openAppDatabase();
  try {
    return jsonOk({ technique: analyzeTechnique(database, await request.json()) });
  } catch (error) {
    return handleRouteError(error);
  } finally {
    database.close();
  }
}
