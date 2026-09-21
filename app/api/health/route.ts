import { NextResponse } from "next/server";

import { checkDatabase } from "@/app/lib/server/db/database";

export function GET() {
  try {
    checkDatabase();
    return NextResponse.json({ ok: true, service: "cpmanager", database: "ok" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown database error";
    return NextResponse.json(
      { ok: false, error: { code: "DATABASE_UNAVAILABLE", message } },
      { status: 503 },
    );
  }
}
