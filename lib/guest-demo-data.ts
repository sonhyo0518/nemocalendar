import type {
    Anniversary,
    CalendarEvent,
    GoogleCalendarOption,
    Pin,
  } from "@/lib/dashboard-data"
  
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
  
  /** 뷰 기준월과 맞출 것 (예: 2026-09) */
  export const GUEST_DEMO_VIEW = new Date(2026, 8, 1) // 9월
  export const GUEST_DEMO_SELECTED = new Date(2026, 8, 8)
  
  export const GUEST_DEMO_EVENTS: CalendarEvent[] = [
    {
      id: "e1",
      title: "팀 미팅",
      date: "2026-09-03",
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
      date: "2026-09-08",
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
      date: "2026-09-08",
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
      date: "2026-09-15",
      endDate: "2026-09-16",
      allDay: true,
      category: "personal",
      calendarId: "primary",
      calendarName: "내 캘린더",
      calendarColor: "#039be5",
    },
    {
      id: "e5",
      title: "프로젝트 마감",
      date: "2026-09-22",
      allDay: true,
      category: "work",
      calendarId: "work",
      calendarName: "업무",
      calendarColor: "#8e24aa",
    },
    {
      id: "e6",
      title: "병원",
      date: "2026-09-28",
      time: "15:00",
      endTime: "16:00",
      category: "health",
      calendarId: "primary",
      calendarName: "내 캘린더",
      calendarColor: "#039be5",
    },
  ]
  
  export const GUEST_DEMO_PINS: Pin[] = [
    { id: "p1", text: "오늘 할 일 · 중요한 일정만 모아두기" },
  ]
  
  export const GUEST_DEMO_ANNIVERSARIES: Anniversary[] = [
    {
      id: "a1",
      title: "여행",
      date: "2026-09-22",
      type: "dday",
      color: "#e57373",
    },
    {
      id: "a2",
      title: "생일",
      date: "2026-10-08",
      type: "dday",
      color: "#64b5f6",
    },
  ]