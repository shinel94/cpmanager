import { jsonOk } from "@/app/lib/server/http/responses";
import { openAppDatabase } from "@/app/lib/server/db/app-database";
import { deleteProject, getProject, saveProject } from "@/app/lib/server/repositories/project-repository";
import { handleRouteError, parseId } from "@/app/lib/server/http/route-utils";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const database = openAppDatabase();
  try {
    const { id } = await context.params;
    const project = getProject(database, parseId(id));
    if (!project) return handleRouteError(new Error(`Project not found: ${id}`));
    return jsonOk({ project });
  } catch (error) {
    return handleRouteError(error);
  } finally {
    database.close();
  }
}

export async function PUT(request: Request, context: RouteContext) {
  const database = openAppDatabase();
  try {
    const { id } = await context.params;
    const project = saveProject(database, parseId(id), await request.json());
    return jsonOk({ project });
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
    const deleted = deleteProject(database, parseId(id));
    if (!deleted) return handleRouteError(new Error(`Project not found: ${id}`));
    return jsonOk({ deleted: true });
  } catch (error) {
    return handleRouteError(error);
  } finally {
    database.close();
  }
}
