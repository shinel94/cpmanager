import { SECTION_NAMES } from "@/app/lib/server/catalog/chord-catalog";
import { jsonOk } from "@/app/lib/server/http/responses";

export function GET() {
  return jsonOk({ items: [...SECTION_NAMES] });
}
