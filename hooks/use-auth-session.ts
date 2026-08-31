"use client"

import { useCallback, useEffect, useRef, useState } from "react"

import type { DashboardUser } from "@/lib/dashboard-data"
import { persistUser, readStoredUser } from "@/lib/dashboard-cache"
import { ApiError, API_BASE, authJson, clearAuthSession } from "@/lib/api"

function notifyApiError(err: unknown, fallback: string) {
  if (err instanceof ApiError && err.status === 401) return
  alert(err instanceof ApiError ? err.message : fallback)
}

type UseAuthSessionOptions = {
  onSignedOut?: (email?: string) => void
}

export function useAuthSession(options: UseAuthSessionOptions = {}) {
  const { onSignedOut } = options
  const signedOutRef = useRef(false)

  const [user, setUser] = useState<DashboardUser | null>(() => readStoredUser())
  const [authReady] = useState(() => typeof window !== "undefined")
  const [calendarConnected, setCalendarConnected] = useState(() =>
    Boolean(readStoredUser()?.calendarConnected),
  )

  const handleSignIn = useCallback((userData: DashboardUser) => {
    signedOutRef.current = false
    const next: DashboardUser = {
      name: userData.name,
      email: userData.email,
      profile_img_url: userData.profile_img_url ?? null,
      banner_img_url: userData.banner_img_url ?? null,
      theme_color: userData.theme_color ?? null,
      location: userData.location ?? null,
      calendarConnected: Boolean(userData.calendarConnected),
    }
    persistUser(next)
    setUser(next)
    setCalendarConnected(Boolean(userData.calendarConnected))
  }, [])

  const applyBanner = useCallback(
    (patch: { banner_img_url?: string | null; theme_color?: string | null }) => {
      setUser((prev) => {
        if (!prev) return prev
        const next = {
          ...prev,
          banner_img_url:
            patch.banner_img_url !== undefined
              ? patch.banner_img_url
              : prev.banner_img_url,
          theme_color:
            patch.theme_color !== undefined ? patch.theme_color : prev.theme_color,
        }
        persistUser(next)
        return next
      })
    },
    [],
  )

  const handleLocationChange = useCallback((location: string) => {
    setUser((prev) => {
      if (!prev) return prev
      const updated = { ...prev, location }
      persistUser(updated)
      return updated
    })
  }, [])

  const handleSignOut = useCallback(async () => {
    signedOutRef.current = true
    const email = user?.email
    try {
      await fetch(`${API_BASE}/api/user/logout`, {
        method: "POST",
        credentials: "include",
      })
    } catch {
      // 네트워크 오류 등 — 로컬 상태는 아래에서 정리
    }
    clearAuthSession()
    onSignedOut?.(email)
    setUser(null)
    setCalendarConnected(false)
    document.documentElement.style.removeProperty("--banner-img")
    document.documentElement.style.removeProperty("--banner-theme")
  }, [user?.email, onSignedOut])

  const markCalendarConnected = useCallback(() => {
    setCalendarConnected(true)
    setUser((prev) => {
      if (!prev) return prev
      const next = { ...prev, calendarConnected: true }
      persistUser(next)
      return next
    })
  }, [])

  const disconnectCalendar = useCallback(
    async (onUnauthorized: () => void) => {
      await authJson("/api/user/disconnect-calendar", {
        method: "POST",
        onUnauthorized,
      })
      setCalendarConnected(false)
      setUser((prev) => {
        if (!prev) return prev
        const next = { ...prev, calendarConnected: false }
        persistUser(next)
        return next
      })
    },
    [],
  )

  useEffect(() => {
    if (!user?.email) return
    let cancelled = false
    authJson<{ user: DashboardUser & { calendarConnected?: boolean } }>(
      "/api/user/me",
      { onUnauthorized: handleSignOut },
    )
      .then((data) => {
        if (cancelled || signedOutRef.current || !data?.user) return
        if (!localStorage.getItem("user")) return
        if (data.user.calendarConnected != null) {
          setCalendarConnected(Boolean(data.user.calendarConnected))
        }
        setUser((prev) => {
          if (signedOutRef.current || !prev) return prev
          const next: DashboardUser = {
            ...prev,
            name: data.user.name ?? prev.name,
            email: data.user.email ?? prev.email,
            profile_img_url:
              data.user.profile_img_url ?? prev.profile_img_url ?? null,
            banner_img_url: data.user.banner_img_url ?? null,
            theme_color: data.user.theme_color ?? null,
            location: data.user.location ?? prev.location ?? null,
            calendarConnected:
              data.user.calendarConnected ?? prev.calendarConnected,
          }
          if (
            prev.name === next.name &&
            prev.email === next.email &&
            prev.profile_img_url === next.profile_img_url &&
            prev.banner_img_url === next.banner_img_url &&
            prev.theme_color === next.theme_color &&
            prev.location === next.location &&
            prev.calendarConnected === next.calendarConnected
          ) {
            return prev
          }
          persistUser(next)
          return next
        })
      })
      .catch((err) => {
        if (cancelled) return
        if (err instanceof ApiError && err.status === 401) {
          if (!signedOutRef.current) {
            void handleSignOut()
          }
          return
        }
        notifyApiError(err, "사용자 정보를 불러오지 못했습니다.")
      })

    return () => {
      cancelled = true
    }
  }, [user?.email, handleSignOut])

  return {
    user,
    authReady,
    calendarConnected,
    setCalendarConnected,
    handleSignIn,
    handleSignOut,
    applyBanner,
    handleLocationChange,
    markCalendarConnected,
    disconnectCalendar,
  }
}