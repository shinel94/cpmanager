import { openAppDatabase } from "@/app/lib/server/db/app-database";
import { jsonError, jsonOk } from "@/app/lib/server/http/responses";
import { getRecommendations } from "@/app/lib/server/services/recommendation-service";
import { handleRouteError } from "@/app/lib/server/http/route-utils";

export async function POST(request: Request) {
  const database = openAppDatabase();
  try {
    return jsonOk(await getRecommendations(database, await request.json()));
  } catch (error) {
    return handleRouteError(error);
  } finally {
    database.close();
  }
}
