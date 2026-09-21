import { jsonOk } from "@/app/lib/server/http/responses";
import { openAppDatabase } from "@/app/lib/server/db/app-database";
import { getProject } from "@/app/lib/server/repositories/project-repository";
import { realizeChord } from "@/app/lib/server/domain/chord-realizer";
import { handleRouteError, parseId } from "@/app/lib/server/http/route-utils";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const database = openAppDatabase();
  try {
    const { id } = await context.params;
    const project = getProject(database, parseId(id));
    if (!project) return handleRouteError(new Error(`Project not found: ${id}`));
    const chart = {
      ...project,
      sections: project.sections.map((section) => ({
        ...section,
        bars: section.bars.map((bar) => ({
          ...bar,
          chords: bar.chords.map((chord) => ({
            ...chord,
            displayName: realizeChord(project.tonic, chord),
          })),
        })),
      })),
    };
    return jsonOk({ project: chart });
  } catch (error) {
    return handleRouteError(error);
  } finally {
    database.close();
  }
}
