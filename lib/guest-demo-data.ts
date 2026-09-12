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
  {
    id: "family",
    summary: "가족",
    backgroundColor: "#0b8043",
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
      title: "주간 스크럼",
      date: toKey(addDays(today, 1)),
      time: "09:30",
      endTime: "10:00",
      category: "work",
      calendarId: "work",
      calendarName: "업무",
      calendarColor: "#8e24aa",
    },
    {
      id: "e5",
      title: "점심 약속",
      date: toKey(addDays(today, 2)),
      time: "12:30",
      endTime: "13:30",
      category: "personal",
      calendarId: "primary",
      calendarName: "내 캘린더",
      calendarColor: "#039be5",
    },
    {
      id: "e6",
      title: "부모님 저녁",
      date: toKey(addDays(today, 3)),
      time: "18:30",
      endTime: "20:30",
      category: "personal",
      calendarId: "family",
      calendarName: "가족",
      calendarColor: "#0b8043",
    },
    {
      id: "e7",
      title: "디자인 리뷰",
      date: toKey(addDays(today, 4)),
      time: "14:00",
      endTime: "15:00",
      category: "work",
      calendarId: "work",
      calendarName: "업무",
      calendarColor: "#8e24aa",
    },
    {
      id: "e8",
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
      id: "e9",
      title: "가족 여행",
      date: toKey(addDays(today, 10)),
      endDate: toKey(addDays(today, 12)),
      allDay: true,
      category: "personal",
      calendarId: "family",
      calendarName: "가족",
      calendarColor: "#0b8043",
    },
    {
      id: "e10",
      title: "프로젝트 마감",
      date: toKey(addDays(today, 14)),
      allDay: true,
      category: "work",
      calendarId: "work",
      calendarName: "업무",
      calendarColor: "#8e24aa",
    },
    {
      id: "e11",
      title: "독서 모임",
      date: toKey(addDays(today, 16)),
      time: "19:00",
      endTime: "21:00",
      category: "study",
      calendarId: "primary",
      calendarName: "내 캘린더",
      calendarColor: "#039be5",
    },
    {
      id: "e12",
      title: "병원",
      date: toKey(addDays(today, 20)),
      time: "15:00",
      endTime: "16:00",
      category: "health",
      calendarId: "primary",
      calendarName: "내 캘린더",
      calendarColor: "#039be5",
    },
    {
      id: "e13",
      title: "분기 발표",
      date: toKey(addDays(today, 22)),
      time: "11:00",
      endTime: "12:00",
      category: "work",
      calendarId: "work",
      calendarName: "업무",
      calendarColor: "#8e24aa",
    },
    {
      id: "e14",
      title: "아이 학교 행사",
      date: toKey(addDays(today, 25)),
      time: "10:00",
      endTime: "11:30",
      category: "personal",
      calendarId: "family",
      calendarName: "가족",
      calendarColor: "#0b8043",
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
    {
      id: "a3",
      title: "시험",
      date: toKey(addDays(today, 45)),
      type: "dday",
      color: "#ffb74d",
    },
    {
      id: "a4",
      title: "입사",
      date: toKey(addDays(today, -400)),
      type: "anniversary",
      color: "#81c784",
    },
    {
      id: "a5",
      title: "결혼",
      date: toKey(addDays(today, -1100)),
      type: "anniversary",
      color: "#f06292",
    },
    {
      id: "a6",
      title: "첫 만남",
      date: toKey(addDays(today, -200)),
      type: "anniversary",
      color: "#ba68c8",
    },
    {
      id: "a7",
      title: "이사",
      date: toKey(addDays(today, -80)),
      type: "anniversary",
      color: "#4db6ac",
    },
  ]

  return { view, selected, events, anniversaries }
}

export const GUEST_DEMO_PINS: Pin[] = [
  { id: "p1", text: "오늘 할 일 · 중요한 일정만 모아두기" },
  { id: "p2", text: "주간 스크럼 전 보드 확인하기" },
  { id: "p3", text: "여행 짐 리스트 · 여권·충전기·옷" },
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
  { id: "c3", name: "학습", color: "#f6bf26" },
  { id: "c4", name: "건강", color: "#e67c73" },
]

const demoToday = toKey(new Date())
const demoYesterday = toKey(addDays(new Date(), -1))
const demoIn2 = toKey(addDays(new Date(), 2))
const demoIn5 = toKey(addDays(new Date(), 5))
const demoIn7 = toKey(addDays(new Date(), 7))
const demoIn10 = toKey(addDays(new Date(), 10))

export const GUEST_DEMO_TASKS: BoardTask[] = [
  {
    id: "t1",
    title: "주간 리포트 작성",
    categoryId: "c1",
    priority: "high",
    status: "in-progress",
    due: demoToday,
  },
  {
    id: "t2",
    title: "회의 자료 정리",
    categoryId: "c1",
    priority: "medium",
    status: "todo",
    due: demoToday,
  },
  {
    id: "t3",
    title: "슬랙 멘션 회신",
    categoryId: "c1",
    priority: "high",
    status: "todo",
    due: demoToday,
  },
  {
    id: "t4",
    title: "분기 계획 초안",
    categoryId: "c1",
    priority: "medium",
    status: "todo",
    due: demoIn5,
  },
  {
    id: "t5",
    title: "코드 리뷰 3건",
    categoryId: "c1",
    priority: "medium",
    status: "in-progress",
    due: demoIn2,
  },
  {
    id: "t6",
    title: "배포 체크리스트 점검",
    categoryId: "c1",
    priority: "high",
    status: "todo",
    due: demoIn7,
  },
  {
    id: "t7",
    title: "장보기",
    categoryId: "c2",
    priority: "low",
    status: "todo",
    due: demoYesterday,
  },
  {
    id: "t8",
    title: "공과금 납부",
    categoryId: "c2",
    priority: "medium",
    status: "todo",
    due: demoIn5,
  },
  {
    id: "t9",
    title: "옷장 정리",
    categoryId: "c2",
    priority: "low",
    status: "todo",
    due: demoIn10,
  },
  {
    id: "t10",
    title: "책 반납",
    categoryId: "c2",
    priority: "low",
    status: "done",
    due: demoYesterday,
  },
  {
    id: "t11",
    title: "TypeScript 핸드북 읽기",
    categoryId: "c3",
    priority: "medium",
    status: "in-progress",
    due: demoIn2,
  },
  {
    id: "t12",
    title: "영어 단어 30개",
    categoryId: "c3",
    priority: "low",
    status: "todo",
    due: demoToday,
  },
  {
    id: "t13",
    title: "알고리즘 문제 2개",
    categoryId: "c3",
    priority: "medium",
    status: "todo",
    due: demoIn5,
  },
  {
    id: "t14",
    title: "저녁 러닝 5km",
    categoryId: "c4",
    priority: "medium",
    status: "todo",
    due: demoToday,
  },
  {
    id: "t15",
    title: "스트레칭 15분",
    categoryId: "c4",
    priority: "low",
    status: "done",
    due: demoYesterday,
  },
]

export const GUEST_DEMO_BOOKMARK_FOLDERS: BookmarkFolder[] = [
  { id: "f1", name: "자주 쓰는", sequence: 0 },
  { id: "f2", name: "업무", sequence: 1 },
  { id: "f3", name: "학습", sequence: 2 },
  { id: "f4", name: "여가", sequence: 3 },
]

export const GUEST_DEMO_BOOKMARKS: Bookmark[] = [
  {
    id: "b1",
    url: "https://calendar.google.com",
    title: "Google Calendar",
    folderId: "f1",
    sequence: 0,
  },
  {
    id: "b2",
    url: "https://mail.google.com",
    title: "Gmail",
    folderId: "f1",
    sequence: 1,
  },
  {
    id: "b3",
    url: "https://drive.google.com",
    title: "Google Drive",
    folderId: "f1",
    sequence: 2,
  },
  {
    id: "b4",
    url: "https://github.com",
    title: "GitHub",
    folderId: "f2",
    sequence: 0,
  },
  {
    id: "b5",
    url: "https://notion.so",
    title: "Notion",
    folderId: "f2",
    sequence: 1,
  },
  {
    id: "b6",
    url: "https://linear.app",
    title: "Linear",
    folderId: "f2",
    sequence: 2,
  },
  {
    id: "b7",
    url: "https://developer.mozilla.org",
    title: "MDN Web Docs",
    folderId: "f3",
    sequence: 0,
  },
  {
    id: "b8",
    url: "https://react.dev",
    title: "React Docs",
    folderId: "f3",
    sequence: 1,
  },
  {
    id: "b9",
    url: "https://www.youtube.com",
    title: "YouTube",
    folderId: "f4",
    sequence: 0,
  },
  {
    id: "b10",
    url: "https://www.spotify.com",
    title: "Spotify",
    folderId: "f4",
    sequence: 1,
  },
]
