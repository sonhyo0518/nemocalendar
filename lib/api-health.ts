import { API_BASE } from "@/lib/api"

export type HealthPayload = {
  ok?: boolean
  db?: boolean
}

export type WaitForHealthResult =
  | { ok: true; db: true }
  | { ok: false; reason: "db" | "unreachable" | "timeout" }

const DEFAULT_TIMEOUT_MS = 90_000

/** 로컬(API_BASE 없음)은 rewrite가 /api만 → health 게이트 스킵 */
export async function waitForApiHealth(
  options: { timeoutMs?: number; signal?: AbortSignal } = {},
): Promise<WaitForHealthResult> {
  if (!API_BASE) return { ok: true, db: true }

  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS
  const ctrl = new AbortController()
  const onAbort = () => ctrl.abort()
  options.signal?.addEventListener("abort", onAbort)

  const timer = setTimeout(() => ctrl.abort(), timeoutMs)

  try {
    const res = await fetch(`${API_BASE}/health`, {
      method: "GET",
      signal: ctrl.signal,
      cache: "no-store",
    })
    let body: HealthPayload = {}
    try {
      body = (await res.json()) as HealthPayload
    } catch {
      /* ignore */
    }

    if (res.ok && body.ok === true && body.db === true) {
      return { ok: true, db: true }
    }
    if (body.db === false || (res.status === 503 && body.ok === false)) {
      return { ok: false, reason: "db" }
    }
    return { ok: false, reason: "unreachable" }
  } catch (err) {
    if (ctrl.signal.aborted && !options.signal?.aborted) {
      return { ok: false, reason: "timeout" }
    }
    return { ok: false, reason: "unreachable" }
  } finally {
    clearTimeout(timer)
    options.signal?.removeEventListener("abort", onAbort)
  }
}