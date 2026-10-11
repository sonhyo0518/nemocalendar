import { afterEach, describe, expect, it, vi } from "vitest"
import {
  ApiError,
  authJson,
  clearAuthSession,
  hasStoredSession,
} from "@/lib/api"

describe("ApiError", () => {
  it("stores status and data", () => {
    const err = new ApiError("nope", 400, { error: "nope" })
    expect(err).toBeInstanceOf(Error)
    expect(err.name).toBe("ApiError")
    expect(err.status).toBe(400)
    expect(err.message).toBe("nope")
  })
})

describe("session helpers", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("hasStoredSession / clearAuthSession", () => {
    const store = new Map<string, string>()
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => {
        store.set(k, v)
      },
      removeItem: (k: string) => {
        store.delete(k)
      },
    })
    vi.stubGlobal("window", {})

    expect(hasStoredSession()).toBe(false)
    store.set("user", JSON.stringify({ email: "a@b.c" }))
    expect(hasStoredSession()).toBe(true)

    clearAuthSession()
    expect(store.has("user")).toBe(false)
    expect(store.has("accessToken")).toBe(false)
  })
})

describe("authJson", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it("returns JSON on ok", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ pins: [] }),
      }),
    )

    const data = await authJson<{ pins: unknown[] }>("/api/pins", {
      auth: false,
    })
    expect(data).toEqual({ pins: [] })
  })

  it("throws ApiError on non-ok", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({ error: "bad" }),
      }),
    )

    await expect(
      authJson("/api/pins", { auth: false }),
    ).rejects.toMatchObject({
      name: "ApiError",
      status: 400,
      message: "bad",
    })
  })
})