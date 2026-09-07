import type {
  Anniversary,
  BoardTask,
  Bookmark,
  BookmarkFolder,
  CalendarEvent,
  GoogleCalendarOption,
  Pin,
  TodoCategory,
} from "@/lib/dashboard-data"
import { addDays, toKey } from "@/lib/dashboard-data"

export const GUEST_DEMO_CALENDARS: GoogleCalendarOption[] = [
  {
    id: "holidays",
    summary: "대한민국의 휴일",
    backgroundColor: "#d50000",
    selected: true,
  },
  {
    id: "primary",
    summary: "내 캘린더",
    backgroundColor: "#039be5",
    primary: true,
    selected: true,
  },
  {
    id: "work",
    summary: "업무",
    backgroundColor: "#8e24aa",
    selected: true,
  },
]

export const GUEST_DEMO_VISIBLE_IDS = new Set(
  GUEST_DEMO_CALENDARS.map((c) => c.id),
)

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

/** 오늘 기준 상대 데모 데이터 (클라이언트에서 호출) */
export function buildGuestDemoData(now = new Date()) {
  const today = startOfDay(now)
  const view = new Date(today.getFullYear(), today.getMonth(), 1)
  const selected = today

  const events: CalendarEvent[] = [
    {
      id: "e1",
      title: "팀 미팅",
      date: toKey(addDays(today, -5)),
      time: "10:00",
      endTime: "11:00",
      category: "work",
      calendarId: "work",
      calendarName: "업무",
      calendarColor: "#8e24aa",
    },
    {
      id: "e2",
      title: "운동",
      date: toKey(today),
      time: "19:00",
      endTime: "20:00",
      category: "health",
      calendarId: "primary",
      calendarName: "내 캘린더",
      calendarColor: "#039be5",
    },
    {
      id: "e3",
      title: "스터디",
      date: toKey(today),
      time: "21:00",
      endTime: "22:00",
      category: "study",
      calendarId: "primary",
      calendarName: "내 캘린더",
      calendarColor: "#039be5",
    },
    {
      id: "e4",
      title: "휴가",
      date: toKey(addDays(today, 7)),
      endDate: toKey(addDays(today, 8)),
      allDay: true,
      category: "personal",
      calendarId: "primary",
      calendarName: "내 캘린더",
      calendarColor: "#039be5",
    },
    {
      id: "e5",
      title: "프로젝트 마감",
      date: toKey(addDays(today, 14)),
      allDay: true,
      category: "work",
      calendarId: "work",
      calendarName: "업무",
      calendarColor: "#8e24aa",
    },
    {
      id: "e6",
      title: "병원",
      date: toKey(addDays(today, 20)),
      time: "15:00",
      endTime: "16:00",
      category: "health",
      calendarId: "primary",
      calendarName: "내 캘린더",
      calendarColor: "#039be5",
    },
  ]

  const anniversaries: Anniversary[] = [
    {
      id: "a1",
      title: "여행",
      date: toKey(addDays(today, 14)),
      type: "dday",
      color: "#e57373",
    },
    {
      id: "a2",
      title: "생일",
      date: toKey(addDays(today, 30)),
      type: "dday",
      color: "#64b5f6",
    },
  ]

  return { view, selected, events, anniversaries }
}

export const GUEST_DEMO_PINS: Pin[] = [
  { id: "p1", text: "오늘 할 일 · 중요한 일정만 모아두기" },
]

export const GUEST_DEMO_WEATHER = {
  location: "서울",
  temp: 22,
  high: 24,
  low: 18,
  desc: "맑음",
} as const

export const GUEST_DEMO_TODO_CATEGORIES: TodoCategory[] = [
  { id: "c1", name: "업무", color: "#8e24aa" },
  { id: "c2", name: "개인", color: "#039be5" },
]

export const GUEST_DEMO_TASKS: BoardTask[] = [
  {
    id: "t1",
    title: "주간 리포트 작성",
    categoryId: "c1",
    priority: "high",
    status: "in-progress",
  },
  {
    id: "t2",
    title: "장보기",
    categoryId: "c2",
    priority: "low",
    status: "todo",
  },
]

export const GUEST_DEMO_BOOKMARK_FOLDERS: BookmarkFolder[] = [
  { id: "f1", name: "자주 쓰는", sequence: 0 },
]

export const GUEST_DEMO_BOOKMARKS: Bookmark[] = [
  {
    id: "b1",
    url: "https://calendar.google.com",
    title: "Google Calendar",
    folderId: "f1",
    sequence: 0,
  },
]