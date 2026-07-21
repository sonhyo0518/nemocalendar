// Shared types and mock data for the calendar dashboard.

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
  date: string // yyyy-mm-dd
  time?: string
  category: EventCategory
  fromGoogle?: boolean
}

export interface Pin {
  id: string
  text: string
}

export interface MiniTodo {
  id: string
  text: string
  done: boolean
}

export type TodoPriority = "high" | "medium" | "low"
export type TodoStatus = "todo" | "in-progress" | "done"

export interface BoardTask {
  id: string
  title: string
  category: EventCategory
  due?: string
  priority: TodoPriority
  status: TodoStatus
}

export interface Anniversary {
  id: string
  title: string
  date: string // yyyy-mm-dd
  type: "dday" | "anniversary"
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

// ---- mock data (relative to today so it always looks fresh) ----

function offsetKey(days: number): string {
  return toKey(addDays(new Date(), days))
}

export const INITIAL_EVENTS: CalendarEvent[] = [
  { id: "e1", title: "팀 스탠드업", date: offsetKey(0), time: "10:00", category: "work", fromGoogle: true },
  { id: "e2", title: "디자인 리뷰", date: offsetKey(0), time: "14:00", category: "work" },
  { id: "e3", title: "요가 클래스", date: offsetKey(1), time: "19:00", category: "health" },
  { id: "e4", title: "React 스터디", date: offsetKey(2), time: "20:00", category: "study", fromGoogle: true },
  { id: "e5", title: "치과 예약", date: offsetKey(3), time: "11:30", category: "health" },
  { id: "e6", title: "엄마 생신 저녁", date: offsetKey(4), time: "18:00", category: "personal" },
  { id: "e7", title: "분기 보고서 마감", date: offsetKey(5), category: "work", fromGoogle: true },
  { id: "e8", title: "친구 결혼식", date: offsetKey(6), time: "12:00", category: "personal" },
  { id: "e9", title: "런닝 10km", date: offsetKey(-1), time: "07:00", category: "health" },
  { id: "e10", title: "독서 모임", date: offsetKey(8), time: "20:00", category: "study" },
  { id: "e11", title: "장보기", date: offsetKey(2), category: "etc" },
  { id: "e12", title: "1:1 미팅", date: offsetKey(0), time: "16:00", category: "work", fromGoogle: true },
]

export const INITIAL_PINS: Pin[] = [
  { id: "p1", text: "회의실 예약 확인하기" },
  { id: "p2", text: "프로젝트 마감 D-5" },
  { id: "p3", text: "생일 선물 주문" },
  { id: "p4", text: "구글 캘린더 동기화 설정" },
]

export const INITIAL_MINI_TODOS: MiniTodo[] = [
  { id: "m1", text: "이메일 답장", done: false },
  { id: "m2", text: "물 2L 마시기", done: true },
  { id: "m3", text: "PR 리뷰", done: false },
]

export const INITIAL_BOARD_TASKS: BoardTask[] = [
  { id: "t1", title: "랜딩 페이지 리디자인", category: "work", due: offsetKey(3), priority: "high", status: "in-progress" },
  { id: "t2", title: "API 문서 정리", category: "work", due: offsetKey(5), priority: "medium", status: "todo" },
  { id: "t3", title: "주간 회고 작성", category: "work", priority: "low", status: "done" },
  { id: "t4", title: "여행 숙소 예약", category: "personal", due: offsetKey(10), priority: "high", status: "todo" },
  { id: "t5", title: "운동 루틴 짜기", category: "health", priority: "medium", status: "in-progress" },
  { id: "t6", title: "알고리즘 5문제", category: "study", due: offsetKey(1), priority: "medium", status: "todo" },
  { id: "t7", title: "책 2챕터 읽기", category: "study", priority: "low", status: "done" },
  { id: "t8", title: "냉장고 정리", category: "etc", priority: "low", status: "todo" },
]

export const INITIAL_ANNIVERSARIES: Anniversary[] = [
  { id: "a1", title: "프로젝트 출시", date: offsetKey(12), type: "dday" },
  { id: "a2", title: "입사 기념일", date: offsetKey(45), type: "anniversary" },
  { id: "a3", title: "결혼 기념일", date: offsetKey(23), type: "anniversary" },
  { id: "a4", title: "자격증 시험", date: offsetKey(30), type: "dday" },
]
