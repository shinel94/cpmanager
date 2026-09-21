import { jsonOk } from "@/app/lib/server/http/responses";
import { TONICS } from "@/app/lib/server/catalog/chord-catalog";

export function GET() {
  return jsonOk({ items: [...TONICS] });
}
