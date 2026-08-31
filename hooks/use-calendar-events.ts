"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import {
  type CalendarEvent,
  type GoogleCalendarOption,
  monthGridRange,
  isHolidayCalendarOption,
} from "@/lib/dashboard-data"
import {
  applyColorOverrides,
  readCalendarsCache,
  readColorOverrides,
  readEventsCache,
  readStoredUser,
  readVisibleCalendarIds,
  writeCalendarsCache,
  writeColorOverrides,
  writeEventsCache,
  writeVisibleCalendarIds,
} from "@/lib/dashboard-cache"
import { getSourceCalendarId } from "@/lib/calendar-event-id"
import { ApiError, authFetch, authJson } from "@/lib/api"

function notifyApiError(err: unknown, fallback: string) {
  if (err instanceof ApiError && err.status === 401) return
  alert(err instanceof ApiError ? err.message : fallback)
}

type UseCalendarEventsOptions = {
  userEmail?: string
  calendarConnected: boolean
  setCalendarConnected: (connected: boolean) => void
  onUnauthorized: () => void
}

export function useCalendarEvents({
  userEmail,
  calendarConnected,
  setCalendarConnected,
  onUnauthorized,
}: UseCalendarEventsOptions) {
  const [calendars, setCalendars] = useState<GoogleCalendarOption[]>(() => {
    const stored = readStoredUser()
    return stored ? (readCalendarsCache(stored.email) ?? []) : []
  })
  const [visibleCalendarIds, setVisibleCalendarIds] = useState<Set<string>>(() => {
    const stored = readStoredUser()
    if (!stored) return new Set()
    const saved = readVisibleCalendarIds(stored.email)
    if (saved?.length) return new Set(saved)
    const list = readCalendarsCache(stored.email) ?? []
    return new Set(list.map((c) => c.id))
  })
  const visibilityInitialized = useRef(
    Boolean(
      readStoredUser() &&
        readVisibleCalendarIds(readStoredUser()?.email)?.length,
    ),
  )

  const loadedRangesRef = useRef(new Set<string>())
  const [eventsReloadToken, setEventsReloadToken] = useState(0)

  const invalidateEventsReload = useCallback(() => {
    loadedRangesRef.current.clear()
    setEventsReloadToken((n) => n + 1)
  }, [])

  const [events, setEvents] = useState<CalendarEvent[]>(() => {
    const stored = readStoredUser()
    return stored
      ? (readEventsCache(stored.email, { allowStale: true }) ?? [])
      : []
  })
  const [eventsLoading, setEventsLoading] = useState(false)
  const [viewDate, setViewDate] = useState(() => new Date())
  const [selectedDate, setSelectedDate] = useState(() => new Date())

  const resetCalendarState = useCallback((email?: string) => {
    setEvents([])
    loadedRangesRef.current.clear()
    setCalendars([])
    setVisibleCalendarIds(new Set())
    visibilityInitialized.current = false
    writeEventsCache(email, [])
    writeCalendarsCache(email, [])
  }, [])

  const filteredEvents = useMemo(() => {
    if (calendars.length === 0) return events
    return events.filter(
      (event) => !event.calendarId || visibleCalendarIds.has(event.calendarId),
    )
  }, [events, visibleCalendarIds, calendars.length])

  const resolvedVisibleCalendarIds =
    calendars.length === 0 ? new Set<string>() : visibleCalendarIds

  const toggleCalendarVisibility = useCallback(
    (id: string) => {
      setVisibleCalendarIds((prev) => {
        const next = new Set(prev)
        if (next.has(id)) next.delete(id)
        else next.add(id)
        writeVisibleCalendarIds(userEmail, [...next])
        return next
      })
    },
    [userEmail],
  )

  const changeCalendarColor = useCallback(
    (id: string, color: string) => {
      const next = { ...readColorOverrides(userEmail), [id]: color }
      writeColorOverrides(userEmail, next)
      setCalendars((prev) =>
        prev.map((c) => (c.id === id ? { ...c, backgroundColor: color } : c)),
      )
      setEvents((prev) => {
        const updated = prev.map((e) =>
          e.calendarId === id ? { ...e, calendarColor: color } : e,
        )
        writeEventsCache(userEmail, updated)
        return updated
      })
    },
    [userEmail],
  )

  const showAllCalendars = useCallback(() => {
    const next = new Set(calendars.map((calendar) => calendar.id))
    writeVisibleCalendarIds(userEmail, [...next])
    setVisibleCalendarIds(next)
  }, [calendars, userEmail])

  const hideAllCalendars = useCallback(() => {
    writeVisibleCalendarIds(userEmail, [])
    setVisibleCalendarIds(new Set())
  }, [userEmail])

  const addEvent = useCallback(
    async (event: Omit<CalendarEvent, "id">) => {
      if (!calendarConnected) {
        alert("Google 캘린더를 연결해야 일정을 추가할 수 있어요.")
        return
      }
      try {
        const data = await authJson<{ event: CalendarEvent }>(
          "/api/calendar/events",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: event.title,
              date: event.date,
              endDate: event.endDate,
              time: event.time,
              endTime: event.endTime,
              calendarId: event.calendarId,
              category: event.category,
            }),
            onUnauthorized,
          },
        )
        setEvents((prev) => {
          const next = [...prev, data.event]
          writeEventsCache(userEmail, next)
          return next
        })
        invalidateEventsReload()
      } catch (err) {
        notifyApiError(err, "일정 추가에 실패했습니다.")
        throw err
      }
    },
    [userEmail, onUnauthorized, invalidateEventsReload],
  )

  const updateEvent = useCallback(
    async (event: CalendarEvent) => {
      const sourceCalendarId = getSourceCalendarId(event)
      if (!sourceCalendarId || !event.googleEventId) return
      try {
        const data = await authJson<{ event: CalendarEvent }>(
          "/api/calendar/events",
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: event.title,
              date: event.date,
              endDate: event.endDate,
              time: event.time,
              endTime: event.endTime,
              calendarId: sourceCalendarId,
              destinationCalendarId: event.calendarId,
              googleEventId: event.googleEventId,
              category: event.category,
            }),
            onUnauthorized,
          },
        )
        setEvents((prev) => {
          const next = prev.map((e) => (e.id === event.id ? data.event : e))
          writeEventsCache(userEmail, next)
          return next
        })
        invalidateEventsReload()
      } catch (err) {
        notifyApiError(err, "일정 수정에 실패했습니다.")
        throw err
      }
    },
    [userEmail, onUnauthorized, invalidateEventsReload],
  )

  const deleteEvent = useCallback(
    async (event: CalendarEvent) => {
      const sourceCalendarId = getSourceCalendarId(event)
      if (!sourceCalendarId || !event.googleEventId) return
      try {
        await authJson("/api/calendar/events", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            calendarId: sourceCalendarId,
            googleEventId: event.googleEventId,
          }),
          onUnauthorized,
        })
        setEvents((prev) => {
          const next = prev.filter((e) => e.id !== event.id)
          writeEventsCache(userEmail, next)
          return next
        })
        invalidateEventsReload()
      } catch (err) {
        notifyApiError(err, "일정 삭제에 실패했습니다.")
        throw err
      }
    },
    [userEmail, onUnauthorized, invalidateEventsReload],
  )

  const handleSelectDate = useCallback((date: Date) => {
    setSelectedDate(date)
    setViewDate(new Date(date.getFullYear(), date.getMonth(), 1))
  }, [])

  useEffect(() => {
    if (calendars.length === 0) return

    setVisibleCalendarIds((prev) => {
      if (!visibilityInitialized.current) {
        visibilityInitialized.current = true
        const email = readStoredUser()?.email
        const saved = email ? readVisibleCalendarIds(email) : null
        if (saved?.length) {
          const known = new Set(calendars.map((calendar) => calendar.id))
          const kept = saved.filter((id) => known.has(id))
          const added = calendars
            .map((calendar) => calendar.id)
            .filter((id) => !saved.includes(id))
          return new Set([...kept, ...added])
        }
        return new Set(calendars.map((calendar) => calendar.id))
      }
      const known = new Set(calendars.map((calendar) => calendar.id))
      const kept = [...prev].filter((id) => known.has(id))
      const added = calendars
        .map((calendar) => calendar.id)
        .filter((id) => !prev.has(id))
      return new Set([...kept, ...added])
    })
  }, [calendars])

  useEffect(() => {
    if (!userEmail || !calendarConnected) return
    const { from, to } = monthGridRange(viewDate)
    const rangeKey = `${from}:${to}`
    if (loadedRangesRef.current.has(rangeKey)) return
    let cancelled = false
    const hasCache = Boolean(readEventsCache(userEmail, { allowStale: true }))
    if (!hasCache) {
      void Promise.resolve().then(() => {
        if (!cancelled) setEventsLoading(true)
      })
    }
    const qs = new URLSearchParams({ from, to })
    authFetch(`/api/calendar/events?${qs}`, { onUnauthorized })
      .then(async (res) => {
        if (res.status === 403) {
          const body = await res.json().catch(() => ({} as { code?: string }))
          if (body.code === "NEEDS_CALENDAR_CONSENT") {
            if (!cancelled) setCalendarConnected(false)
            return null
          }
        }
        if (!res.ok) throw new Error(`Failed to load events: ${res.status}`)
        return res.json() as Promise<{
          events?: CalendarEvent[]
          calendars?: GoogleCalendarOption[]
        }>
      })
      .then((data) => {
        if (cancelled || !data) return
        const fresh = applyColorOverrides(
          (data.events ?? []) as CalendarEvent[],
          readColorOverrides(userEmail),
          "calendarId",
          "calendarColor",
        )
        loadedRangesRef.current.add(rangeKey)
        setEvents((prev) => {
          const byId = new Map(prev.map((e) => [e.id, e]))
          for (const e of fresh) byId.set(e.id, e)
          const merged = [...byId.values()]
          writeEventsCache(userEmail, merged)
          return merged
        })
        if (data.calendars?.length) {
          const overrides = readColorOverrides(userEmail)
          const sorted = [...data.calendars]
            .map((c) =>
              overrides[c.id] ? { ...c, backgroundColor: overrides[c.id] } : c,
            )
            .sort((a, b) =>
              isHolidayCalendarOption(a) ? -1 : isHolidayCalendarOption(b) ? 1 : 0,
            )
          setCalendars(sorted)
          writeCalendarsCache(userEmail, sorted)
        }
      })
      .catch((err) => {
        if (cancelled) return
        notifyApiError(err, "캘린더 일정을 불러오지 못했습니다.")
        if (!hasCache) setEvents([])
      })
      .finally(() => {
        if (!cancelled) setEventsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [
    userEmail,
    calendarConnected,
    viewDate,
    eventsReloadToken,
    onUnauthorized,
    setCalendarConnected,
  ])

  return {
    calendars,
    visibleCalendarIds: resolvedVisibleCalendarIds,
    eventsLoading,
    filteredEvents,
    viewDate,
    setViewDate,
    selectedDate,
    setSelectedDate,
    addEvent,
    updateEvent,
    deleteEvent,
    toggleCalendarVisibility,
    changeCalendarColor,
    showAllCalendars,
    hideAllCalendars,
    handleSelectDate,
    invalidateEventsReload,
    resetCalendarState,
  }
}