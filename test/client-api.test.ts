import assert from "node:assert/strict";
import test from "node:test";
import { apiClient, ApiClientError } from "../app/lib/client/api";

test("ApiClientError encapsulates error codes and HTTP status", () => {
  const err = new ApiClientError("Custom message", "VALIDATION_FAILED", 400);
  assert.equal(err.message, "Custom message");
  assert.equal(err.code, "VALIDATION_FAILED");
  assert.equal(err.status, 400);
  assert.equal(err.name, "ApiClientError");
});

test("apiClient handles successful responses and parses JSON", async () => {
  const originalFetch = globalThis.fetch;
  try {
    globalThis.fetch = async () =>
      new Response(JSON.stringify({ ok: true, data: "test-data" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });

    const res = await apiClient.get<{ ok: true; data: string }>("/api/mock");
    assert.equal(res.ok, true);
    assert.equal(res.data, "test-data");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("apiClient throws structured ApiClientError on API failure", async () => {
  const originalFetch = globalThis.fetch;
  try {
    globalThis.fetch = async () =>
      new Response(
        JSON.stringify({
          ok: false,
          error: { code: "NOT_FOUND", message: "프로젝트를 찾을 수 없습니다." },
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        },
      );

    await assert.rejects(
      async () => {
        await apiClient.get("/api/projects/999");
      },
      (err: unknown) => {
        assert.ok(err instanceof ApiClientError);
        assert.equal(err.code, "NOT_FOUND");
        assert.equal(err.status, 404);
        assert.equal(err.message, "프로젝트를 찾을 수 없습니다.");
        return true;
      },
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("apiClient handles network disconnection gracefully", async () => {
  const originalFetch = globalThis.fetch;
  try {
    globalThis.fetch = async () => {
      throw new TypeError("Failed to fetch");
    };

    await assert.rejects(
      async () => {
        await apiClient.get("/api/offline");
      },
      (err: unknown) => {
        assert.ok(err instanceof ApiClientError);
        assert.equal(err.code, "NETWORK_DISCONNECTED");
        assert.equal(err.status, 0);
        return true;
      },
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});
