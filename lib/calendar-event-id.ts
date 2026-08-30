import type { CalendarEvent } from "@/lib/dashboard-data"

/** 이벤트 ID(`calendarId:googleEventId`)에서 원본 캘린더 ID 추출 */
export function getSourceCalendarId(event: CalendarEvent): string | null {
  if (!event.googleEventId || !event.calendarId) return null

  const suffix = `:${event.googleEventId}`
  if (event.id.endsWith(suffix)) {
    return event.id.slice(0, -suffix.length)
  }
  return event.calendarId
}