import { openAppDatabase } from "@/app/lib/server/db/app-database";
import { handleRouteError } from "@/app/lib/server/http/route-utils";
import { jsonOk } from "@/app/lib/server/http/responses";
import { searchUserProgressions } from "@/app/lib/server/repositories/user-progression-repository";

export async function POST(request: Request) {
  const database = openAppDatabase();
  try {
    const body = await request.json() as { tokens?: unknown };
    if (!Array.isArray(body.tokens) || !body.tokens.every((token) => typeof token === "string")) {
      throw new Error("tokens must be an array of strings");
    }
    return jsonOk({ items: searchUserProgressions(database, body.tokens) });
  } catch (error) {
    return handleRouteError(error);
  } finally {
    database.close();
  }
}
