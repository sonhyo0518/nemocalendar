import {
    DEFAULT_BANNER_COLOR,
    type CalendarEvent,
    type DashboardUser,
    type GoogleCalendarOption,
  } from "@/lib/dashboard-data"
  
  const EVENTS_CACHE_TTL_MS = 1000 * 60 * 5
  const EVENTS_CACHE_PREFIX = "calendarEventsCache:v1:"
  const CALENDARS_CACHE_PREFIX = "calendarListCache:v1:"
  const CALENDAR_COLOR_OVERRIDES_PREFIX = "calendarColorOverrides:v1:"
  const CALENDAR_VISIBILITY_PREFIX = "calendarVisibility:v1:"
  
  function getColorOverridesKey(email?: string) {
    return `${CALENDAR_COLOR_OVERRIDES_PREFIX}${email ?? "anon"}`
  }
  
  function getVisibilityKey(email?: string) {
    return `${CALENDAR_VISIBILITY_PREFIX}${email ?? "anon"}`
  }
  
  export function readColorOverrides(email?: string): Record<string, string> {
    try {
      const raw = localStorage.getItem(getColorOverridesKey(email))
      if (!raw) return {}
      const parsed = JSON.parse(raw) as Record<string, string>
      return parsed && typeof parsed === "object" ? parsed : {}
    } catch {
      return {}
    }
  }
  
  export function writeColorOverrides(email: string | undefined, map: Record<string, string>) {
    if (!email) return
    try {
      localStorage.setItem(getColorOverridesKey(email), JSON.stringify(map))
    } catch {}
  }
  
  export function readVisibleCalendarIds(email?: string): string[] | null {
    try {
      const raw = localStorage.getItem(getVisibilityKey(email))
      if (!raw) return null
      const parsed = JSON.parse(raw) as string[]
      return Array.isArray(parsed) ? parsed : null
    } catch {
      return null
    }
  }
  
  export function writeVisibleCalendarIds(email: string | undefined, ids: string[]) {
    if (!email) return
    try {
      localStorage.setItem(getVisibilityKey(email), JSON.stringify(ids))
    } catch {}
  }
  
  export function applyColorOverrides<
    T extends {
      id?: string
      calendarId?: string
      backgroundColor?: string
      calendarColor?: string
    },
  >(
    items: T[],
    overrides: Record<string, string>,
    idKey: "id" | "calendarId",
    colorKey: "backgroundColor" | "calendarColor",
  ): T[] {
    return items.map((item) => {
      const id = item[idKey]
      if (!id || !overrides[id]) return item
      return { ...item, [colorKey]: overrides[id] }
    })
  }
  
  const getEventsCacheKey = (email?: string) =>
    `${EVENTS_CACHE_PREFIX}${email ?? "anon"}`
  
  const getCalendarsCacheKey = (email?: string) =>
    `${CALENDARS_CACHE_PREFIX}${email ?? "anon"}`
  
  export function readCalendarsCache(email?: string): GoogleCalendarOption[] | null {
    try {
      const raw = localStorage.getItem(getCalendarsCacheKey(email))
      if (!raw) return null
      const parsed = JSON.parse(raw) as { calendars?: GoogleCalendarOption[] }
      return Array.isArray(parsed?.calendars) ? parsed.calendars : null
    } catch {
      return null
    }
  }
  
  export function writeCalendarsCache(
    email: string | undefined,
    calendars: GoogleCalendarOption[],
  ) {
    try {
      localStorage.setItem(
        getCalendarsCacheKey(email),
        JSON.stringify({ calendars }),
      )
    } catch {}
  }
  
  export function readEventsCache(
    email?: string,
    opts?: { allowStale?: boolean },
  ): CalendarEvent[] | null {
    try {
      const raw = localStorage.getItem(getEventsCacheKey(email))
      if (!raw) return null
      const parsed = JSON.parse(raw) as { ts: number; events: CalendarEvent[] }
      if (!parsed?.ts || !Array.isArray(parsed?.events)) return null
      if (
        !opts?.allowStale &&
        Date.now() - parsed.ts > EVENTS_CACHE_TTL_MS
      ) {
        return null
      }
      return parsed.events
    } catch {
      return null
    }
  }
  
  export function writeEventsCache(email: string | undefined, events: CalendarEvent[]) {
    try {
      localStorage.setItem(
        getEventsCacheKey(email),
        JSON.stringify({ ts: Date.now(), events }),
      )
    } catch {}
  }
  
  export function persistUser(user: DashboardUser) {
    localStorage.setItem("user", JSON.stringify(user))
    if (typeof document === "undefined") return
    if (user.banner_img_url) {
      document.documentElement.style.setProperty(
        "--banner-img",
        `url(${JSON.stringify(user.banner_img_url)})`,
      )
    } else {
      document.documentElement.style.removeProperty("--banner-img")
    }
    const theme = user.theme_color ?? DEFAULT_BANNER_COLOR
    document.documentElement.style.setProperty("--banner-theme", theme)
  }
  
  export function readStoredUser(): DashboardUser | null {
    if (typeof window === "undefined") return null
    try {
      const saved = localStorage.getItem("user")
      if (!saved) return null
      const parsed = JSON.parse(saved) as DashboardUser & {
        banner_color?: string | null
      }
      return {
        ...parsed,
        theme_color: parsed.theme_color ?? parsed.banner_color ?? null,
      }
    } catch {}
    return null
  }