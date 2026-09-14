export const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? ""

if (
  process.env.NODE_ENV === "production" &&
  typeof window !== "undefined" &&
  !API_BASE
) {
  console.error(
    "[config] NEXT_PUBLIC_API_URL is missing. API calls will fail.",
  )
}

export class ApiError extends Error {
  status: number
  data?: unknown

  constructor(message: string, status: number, data?: unknown) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.data = data
  }
}

export function notifyApiError(err: unknown, fallback: string) {
  if (err instanceof ApiError && err.status === 401) return
  alert(err instanceof ApiError ? err.message : fallback)
}

export function clearAuthSession() {
  try {
    localStorage.removeItem("accessToken")
    localStorage.removeItem("refreshToken")
    localStorage.removeItem("user")
  } catch {
    // private mode / storage blocked
  }
}

export function hasStoredSession(): boolean {
  if (typeof window === "undefined") return false
  try {
    return Boolean(localStorage.getItem("user"))
  } catch {
    return false
  }
}

let refreshInFlight: Promise<void> | null = null

export async function refreshAccessToken(): Promise<void> {
  if (refreshInFlight) return refreshInFlight

  refreshInFlight = (async () => {
    const res = await fetch(`${API_BASE}/api/user/refresh`, {
      method: "POST",
      credentials: "include",
    })

    const data = await res.json().catch(() => null)

    if (!res.ok) {
      const message =
        typeof data === "object" &&
        data !== null &&
        "error" in data &&
        typeof (data as { error?: unknown }).error === "string"
          ? (data as { error: string }).error
          : `Request failed: ${res.status}`

      throw new ApiError(message, res.status, data)
    }
  })()

  try {
    await refreshInFlight
  } finally {
    refreshInFlight = null
  }
}

type AuthFetchOptions = RequestInit & {
  auth?: boolean
  onUnauthorized?: () => void
  _retried?: boolean
  _wakeRetried?: boolean
}

export async function authFetch(
  path: string,
  options: AuthFetchOptions = {},
): Promise<Response> {
  const {
    auth = true,
    onUnauthorized,
    _retried = false,
    _wakeRetried = false,
    headers,
    ...rest
  } = options

  const finalHeaders = new Headers(headers)

  let res: Response
  try {
    // JWT는 httpOnly 쿠키로 전송 (credentials: 'include')
    res = await fetch(`${API_BASE}${path}`, {
      ...rest,
      headers: finalHeaders,
      credentials: "include",
    })
  } catch (err) {
    // Render 콜드스타트·일시 네트워크 오류
    if (!_wakeRetried) {
      await new Promise((r) => setTimeout(r, 2500))
      return authFetch(path, { ...options, _wakeRetried: true })
    }
    throw err
  }

  // weather 502는 upstream 한도/실패 — 재시도하면 WeatherAPI 쿼터만 더 소모
  const isWeather = path.startsWith("/api/weather")
  if (
    !_wakeRetried &&
    (res.status === 503 ||
      res.status === 504 ||
      (!isWeather && res.status === 502))
  ) {
    await new Promise((r) => setTimeout(r, 2500))
    return authFetch(path, { ...options, _wakeRetried: true })
  }

  if (
    res.status === 401 &&
    auth &&
    !_retried &&
    path !== "/api/user/refresh" &&
    hasStoredSession()
  ) {
    try {
      await refreshAccessToken()
      return authFetch(path, { ...options, _retried: true })
    } catch {
      clearAuthSession()
      onUnauthorized?.()
      throw new ApiError("Unauthorized", 401)
    }
  }

  if (res.status === 401) {
    if (auth) {
      clearAuthSession()
      onUnauthorized?.()
    }
    throw new ApiError("Unauthorized", 401)
  }

  return res
}

export async function authJson<T>(
  path: string,
  options: AuthFetchOptions = {},
): Promise<T> {
  const res = await authFetch(path, options)

  const data = await res.json().catch(() => null)

  if (!res.ok) {
    const message =
      typeof data === "object" &&
      data !== null &&
      "error" in data &&
      typeof (data as { error?: unknown }).error === "string"
        ? (data as { error: string }).error
        : `Request failed: ${res.status}`

    throw new ApiError(message, res.status, data)
  }

  return data as T
}