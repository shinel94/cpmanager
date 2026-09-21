import { ValidationError } from "@/app/lib/server/validation/project-payload";
import { jsonError } from "@/app/lib/server/http/responses";

export function parseId(value: string): number {
  const id = Number(value);
  if (!Number.isSafeInteger(id) || id < 1) throw new ValidationError("id must be a positive integer");
  return id;
}

export function handleRouteError(error: unknown) {
  if (error instanceof ValidationError) return jsonError(error.code, error.message, 400);
  if (error instanceof Error && error.message.startsWith("Project not found:")) {
    return jsonError("NOT_FOUND", error.message, 404);
  }
  if (error instanceof Error && error.message.startsWith("User progression not found:")) {
    return jsonError("NOT_FOUND", error.message, 404);
  }
  if (error instanceof Error && (error.message.startsWith("tokens") || error.message.includes("wildcard") || error.message.includes("progression search"))) {
    return jsonError("VALIDATION_ERROR", error.message, 400);
  }
  return jsonError("INTERNAL_ERROR", error instanceof Error ? error.message : "Unexpected server error", 500);
}
