import { getChordCatalog } from "@/app/lib/server/catalog/chord-catalog";
import { jsonOk } from "@/app/lib/server/http/responses";

export function GET() {
  return jsonOk({ catalog: getChordCatalog() });
}
