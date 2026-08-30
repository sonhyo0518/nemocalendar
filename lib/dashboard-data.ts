// Shared types and mock data for the calendar dashboard.
export { DEFAULT_BANNER_COLOR, DEFAULT_ANNIV_COLOR } from "./color-presets"

export type DashboardUser = {
  name: string
  email: string
  profile_img_url?: string | null
  banner_img_url?: string | null
  theme_color?: string | null
  location?: string | null
  calendarConnected?: boolean
}

export type EventCategory = "work" | "personal" | "study" | "health" | "etc"

export const CATEGORY_META: Record<
  EventCategory,
  { label: string; token: string; dot: string; soft: string }
> = {
  work: {
    label: "업무",
    token: "var(--event-blue)",
    dot: "bg-[var(--event-blue)]",
    soft: "bg-[var(--event-blue)]/12 text-[var(--event-blue)]",
  },
  personal: {
    label: "개인",
    token: "var(--event-green)",
    dot: "bg-[var(--event-green)]",
    soft: "bg-[var(--event-green)]/12 text-[var(--event-green)]",
  },
  study: {
    label: "학습",
    token: "var(--event-violet)",
    dot: "bg-[var(--event-violet)]",
    soft: "bg-[var(--event-violet)]/12 text-[var(--event-violet)]",
  },
  health: {
    label: "건강",
    token: "var(--event-rose)",
    dot: "bg-[var(--event-rose)]",
    soft: "bg-[var(--event-rose)]/12 text-[var(--event-rose)]",
  },
  etc: {
    label: "기타",
    token: "var(--event-amber)",
    dot: "bg-[var(--event-amber)]",
    soft: "bg-[var(--event-amber)]/12 text-[var(--event-amber)]",
  },
}

export interface CalendarEvent {
  id: string
  title: string
  date: string // start yyyy-mm-dd
  endDate?: string // inclusive end yyyy-mm-dd
  allDay?: boolean
  time?: string // 시작 HH:mm
  endTime?: string // 종료 HH:mm (시간 일정일 때만)
  category: EventCategory // todo 보드 호환용; Google은 보통 'etc'
  calendarId?: string
  calendarName?: string
  calendarColor?: string
  googleEventId?: string
  fromGoogle?: boolean
}

/** 여러 날에 걸친 일정인지 */
export function isMultiDayEvent(e: CalendarEvent): boolean {
  return (e.endDate ?? e.date) > e.date
}

export const HOLIDAY_CALENDAR_NAMES = [
  "대한민국의 휴일",
  "Holidays in South Korea",
  "South Korea Holidays",
] as const

export function isHolidayCalendarName(name?: string | null): boolean {
  if (!name) return false
  return (HOLIDAY_CALENDAR_NAMES as readonly string[]).includes(name)
}

export function isHolidayCalendarOption(c: GoogleCalendarOption): boolean {
  return isHolidayCalendarName(c.summary)
}

export function isKoreanHolidayEvent(e: CalendarEvent): boolean {
  return isHolidayCalendarName(e.calendarName)
}

export interface GoogleCalendarOption {
  id: string
  summary: string
  backgroundColor: string
  foregroundColor?: string
  primary?: boolean
  selected?: boolean
}

export interface Pin {
  id: string
  text: string
}

export interface BookmarkFolder {
  id: string
  name: string
  sequence: number
}

export interface Bookmark {
  id: string
  url: string
  title: string
  description?: string | null
  faviconUrl?: string | null
  previewImageUrl?: string | null
  folderId?: string | null
  sequence: number
}

export type TodoPriority = "high" | "medium" | "low"
export type TodoStatus = "todo" | "in-progress" | "done"

export interface TodoCategory {
  id: string
  name: string
  color: string
}

export interface BoardTask {
  id: string
  title: string
  categoryId: string
  due?: string
  priority: TodoPriority
  status: TodoStatus
}

export interface Anniversary {
  id: string
  title: string
  date: string // yyyy-mm-dd
  type: "dday" | "anniversary"
  color?: string
}

export const PRIORITY_META: Record<
  TodoPriority,
  { label: string; className: string }
> = {
  high: { label: "높음", className: "bg-[var(--event-rose)]/12 text-[var(--event-rose)]" },
  medium: { label: "보통", className: "bg-[var(--event-amber)]/15 text-[var(--event-amber)]" },
  low: { label: "낮음", className: "bg-muted text-muted-foreground" },
}

export const STATUS_META: Record<TodoStatus, { label: string }> = {
  todo: { label: "할 일" },
  "in-progress": { label: "진행 중" },
  done: { label: "완료" },
}

// ---- date helpers ----

export function toKey(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

export function addMonths(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth() + n, 1)
}

export function addDays(d: Date, n: number): Date {
  const r = new Date(d)
  r.setDate(r.getDate() + n)
  return r
}

export function startOfWeek(d: Date): Date {
  const r = new Date(d)
  r.setDate(r.getDate() - r.getDay())
  r.setHours(0, 0, 0, 0)
  return r
}

export function isSameDay(a: Date, b: Date): boolean {
  return toKey(a) === toKey(b)
}

export function daysUntil(dateStr: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(dateStr + "T00:00:00")
  return Math.round((target.getTime() - today.getTime()) / 86400000)
}

export const WEEKDAYS_KO = ["일", "월", "화", "수", "목", "금", "토"]
export const MONTHS_KO = [
  "1월", "2월", "3월", "4월", "5월", "6월",
  "7월", "8월", "9월", "10월", "11월", "12월",
]

// Build a 6-week (42 cell) grid for a given month.
export function buildMonthGrid(viewDate: Date): Date[] {
  const first = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1)
  const start = startOfWeek(first)
  return Array.from({ length: 42 }, (_, i) => addDays(start, i))
}

/** 월 그리드 첫날~마지막날 (yyyy-mm-dd). 주 보기도 이 달 그리드를 쓰면 됨 */
export function monthGridRange(viewDate: Date): { from: string; to: string } {
  const days = buildMonthGrid(viewDate)
  return { from: toKey(days[0]), to: toKey(days[days.length - 1]) }
}
