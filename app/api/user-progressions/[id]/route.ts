import { openAppDatabase } from "@/app/lib/server/db/app-database";
import { handleRouteError, parseId } from "@/app/lib/server/http/route-utils";
import { jsonOk } from "@/app/lib/server/http/responses";
import { deleteUserProgression, getUserProgression } from "@/app/lib/server/repositories/user-progression-repository";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const database = openAppDatabase();
  try {
    const { id } = await context.params;
    const progression = getUserProgression(database, parseId(id));
    if (!progression) return handleRouteError(new Error(`User progression not found: ${id}`));
    return jsonOk({ progression });
  } catch (error) {
    return handleRouteError(error);
  } finally {
    database.close();
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const database = openAppDatabase();
  try {
    const { id } = await context.params;
    if (!deleteUserProgression(database, parseId(id))) return handleRouteError(new Error(`User progression not found: ${id}`));
    return jsonOk({ deleted: true });
  } catch (error) {
    return handleRouteError(error);
  } finally {
    database.close();
  }
}
