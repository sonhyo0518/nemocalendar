import {
    MONTHS_KO,
    addDays,
    isKoreanHolidayEvent,
    isMultiDayEvent,
    startOfWeek,
    toKey,
    type CalendarEvent,
} from "@/lib/dashboard-data"
import { cn } from "@/lib/utils"

export const scheduleFieldLabelClass =
"mb-[5px] gap-1.5 text-[10px] font-extrabold tracking-[0.04em] text-[var(--schedule-accent)] uppercase"

export const scheduleInputClass =
"h-auto rounded-none border-0 border-b-[1.5px] border-[var(--schedule-border)] bg-transparent px-0.5 pt-[3px] pb-[7px] text-sm font-semibold text-[var(--schedule-fg)] shadow-none outline-none placeholder:font-medium placeholder:text-[var(--schedule-placeholder)] focus-visible:border-[var(--schedule-accent)] focus-visible:ring-0 disabled:pointer-events-none disabled:cursor-not-allowed disabled:border-dotted disabled:bg-transparent disabled:text-[var(--schedule-placeholder)] disabled:opacity-100 dark:bg-transparent md:text-sm"

export const scheduleSelectClass = cn(
scheduleInputClass,
"appearance-none cursor-pointer pr-4",
)

export type Meridiem = "am" | "pm"

export const HOURS_12 = Array.from({ length: 12 }, (_, i) => i + 1)
export const MINUTES = Array.from({ length: 6 }, (_, i) => i * 10)
export const DURATION_HOURS = Array.from({ length: 13 }, (_, i) => i)
export const DURATION_MINUTES = MINUTES
export const DURATION_TAGS = [
{ label: "10분", minutes: 10 },
{ label: "30분", minutes: 30 },
{ label: "1시간", minutes: 60 },
{ label: "2시간", minutes: 120 },
{ label: "3시간", minutes: 180 },
] as const

export const LANE_HEIGHT = 20
export const SPAN_BAR_HEIGHT = 18
export const SPAN_BAR_TOP = 32
export const CELL_PAD_TOP = 6
export const CELL_PAD_Y = 12
/** 셀 `p-1.5`와 동일 — 하루 일정 chip 왼쪽과 맞춤 */
export const CELL_PAD_X = 6
/** 주 grid `gap-1`과 동일 */
export const GRID_GAP = 4

/** 여러 날 span bar의 left / width (주 전체 폭 기준) */
export function spanBarGeometry(colStart: number, spanCols: number) {
  const gapsTotal = 6 * GRID_GAP // 7열 사이 gap 6개
  const left = `calc((${colStart} / 7) * (100% - ${gapsTotal}px) + ${colStart * GRID_GAP + CELL_PAD_X}px)`
  const width = `calc((${spanCols} / 7) * (100% - ${gapsTotal}px) + ${(spanCols - 1) * GRID_GAP - 2 * CELL_PAD_X}px)`
  return { left, width }
}
export const CELL_HEADER_H = 32
export const MONTH_CELL_H = 108
export const WEEK_CELL_H = 220
export const TWO_LINE_CHIP_H = 36
export const MORE_LABEL_H = 18

export type WeekSpan = {
event: CalendarEvent
lane: number
colStart: number
colEnd: number
}

export function parseHHmm(value: string): {
hour12: number
minute: number
meridiem: Meridiem
} | null {
const match = value.match(/^(\d{1,2}):(\d{2})$/)
if (!match) return null
const hour24 = Number(match[1])
const minute = Number(match[2])
if (Number.isNaN(hour24) || Number.isNaN(minute)) return null
return {
    hour12: hour24 % 12 === 0 ? 12 : hour24 % 12,
    minute,
    meridiem: hour24 >= 12 ? "pm" : "am",
}
}

export function toHHmm(hour12: number, minute: number, meridiem: Meridiem): string {
let hour24 = hour12 % 12
if (meridiem === "pm") hour24 += 12
return `${String(hour24).padStart(2, "0")}:${String(minute).padStart(2, "0")}`
}

export function floorHourHHmm(d = new Date()) {
return `${String(d.getHours()).padStart(2, "0")}:00`
}

function addMinutesToHHmm(start: string, minutes: number) {
const [h, m] = start.split(":").map(Number)
const total = h * 60 + m + minutes
const dayOffset = Math.floor(total / (24 * 60))
const wrapped = ((total % (24 * 60)) + 24 * 60) % (24 * 60)
const hh = String(Math.floor(wrapped / 60)).padStart(2, "0")
const mm = String(wrapped % 60).padStart(2, "0")
return { time: `${hh}:${mm}`, dayOffset }
}
  
export function applyDurationToEnd(
start: string,
startDate: string,
totalMinutes: number,
) {
const { time: nextEnd, dayOffset } = addMinutesToHHmm(start, totalMinutes)
const d = new Date(`${startDate}T00:00`)
d.setDate(d.getDate() + dayOffset)
return { endTime: nextEnd, endDate: toKey(d) }
}
  
export function durationMinutes(
start: string,
end: string,
startDate: string,
endDate: string,
) {
const [sh, sm] = start.split(":").map(Number)
const [eh, em] = end.split(":").map(Number)
const days =
    (new Date(`${endDate}T00:00`).getTime() -
    new Date(`${startDate}T00:00`).getTime()) /
    86400000
return days * 24 * 60 + (eh * 60 + em) - (sh * 60 + sm)
}
  
export function singleEventOffsetPx(laneCount: number) {
return laneCount * LANE_HEIGHT - CELL_PAD_TOP
}

export function spanAreaHeightPx(maxLane: number) {
return Math.max(0, (maxLane + 1) * LANE_HEIGHT)
}

function maxDateKey(a: string, b: string) {
return a > b ? a : b
}

function minDateKey(a: string, b: string) {
return a < b ? a : b
}

export function getWeekOfMonthLabels(weekStart: Date, weekEnd: Date) {
const monthCandidates = [
    { year: weekStart.getFullYear(), month: weekStart.getMonth() },
    { year: weekEnd.getFullYear(), month: weekEnd.getMonth() },
].filter(
    (m, i, arr) =>
    i === arr.findIndex((x) => x.year === m.year && x.month === m.month),
)

const labels = monthCandidates.map(({ year, month }) => {
    const firstOfMonth = new Date(year, month, 1)
    const firstWeekStart = startOfWeek(firstOfMonth)
    const diffMs = weekStart.getTime() - firstWeekStart.getTime()
    const weekNo = Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000)) + 1
    return `${MONTHS_KO[month]} ${weekNo}주차`
})

return labels.join(" · ")
}

export function eachDateKey(start: string, endInclusive: string): string[] {
const keys: string[] = []
let cur = new Date(start + "T12:00:00")
const last = new Date(endInclusive + "T12:00:00")
while (cur <= last) {
    keys.push(toKey(cur))
    cur = addDays(cur, 1)
}
return keys
}

export function layoutWeekSpans(week: Date[], events: CalendarEvent[]): WeekSpan[] {
const weekStart = toKey(week[0])
const weekEnd = toKey(week[6])
const weekKeys = week.map(toKey)

const multi = events
    .filter((e) => {
    if (isKoreanHolidayEvent(e)) return false
    if (!isMultiDayEvent(e)) return false
    const end = e.endDate ?? e.date
    return e.date <= weekEnd && end >= weekStart
    })
    .sort((a, b) => {
    const byStart = a.date.localeCompare(b.date)
    if (byStart !== 0) return byStart
    return (b.endDate ?? b.date).localeCompare(a.endDate ?? a.date)
    })

const laneLastEnd: string[] = []
const layouts: WeekSpan[] = []

for (const event of multi) {
    const segStart = maxDateKey(event.date, weekStart)
    const segEnd = minDateKey(event.endDate ?? event.date, weekEnd)
    const colStart = weekKeys.indexOf(segStart)
    const colEnd = weekKeys.indexOf(segEnd)
    if (colStart < 0 || colEnd < 0) continue

    let lane = 0
    for (; lane < laneLastEnd.length; lane++) {
    if (laneLastEnd[lane] < segStart) break
    }
    if (lane === laneLastEnd.length) laneLastEnd.push(segEnd)
    else laneLastEnd[lane] = segEnd

    layouts.push({ event, lane, colStart, colEnd })
}

return layouts
}