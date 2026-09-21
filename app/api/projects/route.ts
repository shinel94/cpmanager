import { jsonError, jsonOk } from "@/app/lib/server/http/responses";
import { openAppDatabase } from "@/app/lib/server/db/app-database";
import { createProject, getProject, listProjects } from "@/app/lib/server/repositories/project-repository";
import { handleRouteError } from "@/app/lib/server/http/route-utils";

export function GET(request: Request) {
  const database = openAppDatabase();
  try {
    const query = new URL(request.url).searchParams.get("q") ?? "";
    return jsonOk({ items: listProjects(database, query) });
  } catch (error) {
    return handleRouteError(error);
  } finally {
    database.close();
  }
}

export async function POST(request: Request) {
  const database = openAppDatabase();
  try {
    const id = createProject(database, await request.json());
    return jsonOk({ project: getProject(database, id) });
  } catch (error) {
    return handleRouteError(error);
  } finally {
    database.close();
  }
}
