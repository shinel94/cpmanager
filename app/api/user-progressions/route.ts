import { openAppDatabase } from "@/app/lib/server/db/app-database";
import { handleRouteError } from "@/app/lib/server/http/route-utils";
import { jsonOk } from "@/app/lib/server/http/responses";
import { createUserProgression, listUserProgressions } from "@/app/lib/server/repositories/user-progression-repository";

export function GET(request: Request) {
  const database = openAppDatabase();
  try {
    const query = new URL(request.url).searchParams.get("q") ?? "";
    return jsonOk({ items: listUserProgressions(database, query) });
  } catch (error) {
    return handleRouteError(error);
  } finally {
    database.close();
  }
}

export async function POST(request: Request) {
  const database = openAppDatabase();
  try {
    const id = createUserProgression(database, await request.json());
    return jsonOk({ id });
  } catch (error) {
    return handleRouteError(error);
  } finally {
    database.close();
  }
}
