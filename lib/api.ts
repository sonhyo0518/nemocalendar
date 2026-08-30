export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? ""

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

export function clearAuthSession() {
  localStorage.removeItem("accessToken")
  localStorage.removeItem("refreshToken")
  localStorage.removeItem("user")
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
}

export async function authFetch(
  path: string,
  options: AuthFetchOptions = {},
): Promise<Response> {
  const {
    auth = true,
    onUnauthorized,
    _retried = false,
    headers,
    ...rest
  } = options

  const finalHeaders = new Headers(headers)

  // JWT는 httpOnly 쿠키로 전송 (credentials: 'include')
  const res = await fetch(`${API_BASE}${path}`, {
    ...rest,
    headers: finalHeaders,
    credentials: 'include',
  })

  if (
    res.status === 401 &&
    auth &&
    !_retried &&
    path !== "/api/user/refresh"
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
    clearAuthSession()
    onUnauthorized?.()
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