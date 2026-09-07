"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"
import { onColor } from "@/lib/contrast"
import {
  CATEGORY_META,
  MONTHS_KO,
  WEEKDAYS_KO,
  addDays,
  addMonths,
  buildMonthGrid,
  isHolidayCalendarOption,
  isKoreanHolidayEvent,
  isMultiDayEvent,
  isSameDay,
  startOfWeek,
  toKey,
  type CalendarEvent,
  type EventCategory,
  type GoogleCalendarOption,
} from "@/lib/dashboard-data"
import {
  CELL_HEADER_H,
  CELL_PAD_Y,
  LANE_HEIGHT,
  MONTH_CELL_H,
  MORE_LABEL_H,
  SPAN_BAR_HEIGHT,
  SPAN_BAR_TOP,
  TWO_LINE_CHIP_H,
  WEEK_CELL_H,
  applyDurationToEnd,
  eachDateKey,
  floorHourHHmm,
  getWeekOfMonthLabels,
  layoutWeekSpans,
  singleEventOffsetPx,
  spanAreaHeightPx,
  spanBarGeometry,
} from "@/lib/main-calendar-utils"
import { EventFormDialog } from "@/components/dashboard/event-form-dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { GoogleBadge } from "@/components/dashboard/google-badge"
import { cn } from "@/lib/utils"

type ViewMode = "month" | "week"

interface MainCalendarProps {
  events: CalendarEvent[]
  viewDate: Date
  selectedDate: Date
  onViewDateChange: (d: Date) => void
  onSelectDate: (d: Date) => void
  onAddEvent: (e: Omit<CalendarEvent, "id">) => Promise<void>
  onUpdateEvent: (e: CalendarEvent) => Promise<void>
  onDeleteEvent: (e: CalendarEvent) => Promise<void>
  calendars: GoogleCalendarOption[]
  themeColor?: string | null
  calendarConnected?: boolean
  isLoggedIn?: boolean
  flush?: boolean
}

export function MainCalendar({
  events,
  viewDate,
  selectedDate,
  onViewDateChange,
  onSelectDate,
  onAddEvent,
  onUpdateEvent,
  onDeleteEvent,
  calendars,
  themeColor,
  flush = false,
  calendarConnected = false,
  isLoggedIn = false,
}: MainCalendarProps) {
  const accent = themeColor ?? "var(--theme)"
  const [mode, setMode] = React.useState<ViewMode>("month")
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [dayDialogOpen, setDayDialogOpen] = React.useState(false)
  const [dayDialogKey, setDayDialogKey] = React.useState(toKey(new Date()))
  const [editingEvent, setEditingEvent] = React.useState<CalendarEvent | null>(null)
  const [formDate, setFormDate] = React.useState<string>(toKey(new Date()))
  const [formEndDate, setFormEndDate] = React.useState<string>(toKey(new Date()))
  const [title, setTitle] = React.useState("")
  const [time, setTime] = React.useState("")
  const [endTime, setEndTime] = React.useState("")
  const [calendarId, setCalendarId] = React.useState("primary")
  const [category, setCategory] = React.useState<EventCategory>("etc")
  const [saving, setSaving] = React.useState(false)

  const eventCalendars = React.useMemo(
    () => calendars.filter((c) => !isHolidayCalendarOption(c)),
    [calendars],
  )

  const today = new Date()

  const gridDays =
    mode === "month"
      ? buildMonthGrid(viewDate)
      : Array.from({ length: 7 }, (_, i) => addDays(startOfWeek(viewDate), i))

  const weeks = React.useMemo(() => {
    const rows: Date[][] = []
    for (let i = 0; i < gridDays.length; i += 7) {
      rows.push(gridDays.slice(i, i + 7))
    }
    return rows
  }, [gridDays])
  const weekStart = startOfWeek(viewDate)
  const weekEnd = addDays(weekStart, 6)
  
  const weekRangeLabel = `${weekStart.getMonth() + 1}/${weekStart.getDate()} – ${weekEnd.getMonth() + 1}/${weekEnd.getDate()}`
  const weekOfMonthLabel = getWeekOfMonthLabels(weekStart, weekEnd)
  // 하루짜리만 칸 칩용 / 기간 일정은 해당 날짜 팝업에만 포함
  const singleEventsByDay = React.useMemo(() => {
    const map = new Map<string, CalendarEvent[]>()
    for (const e of events) {
      if (isMultiDayEvent(e)) continue
      if (isKoreanHolidayEvent(e)) continue
      const arr = map.get(e.date) ?? []
      arr.push(e)
      map.set(e.date, arr)
    }
    return map
  }, [events])

  /** 한글 휴일 일정 */
  const holidaysByDay = React.useMemo(() => {
    const map = new Map<string, CalendarEvent[]>()
    for (const e of events) {
      if (!isKoreanHolidayEvent(e)) continue
      const end = e.endDate ?? e.date
      for (const key of eachDateKey(e.date, end)) {
        const arr = map.get(key) ?? []
        arr.push(e)
        map.set(key, arr)
      }
    }
    return map
  }, [events])

  /** 하루짜리 일정 */
  const eventsByDay = React.useMemo(() => {
    const map = new Map<string, CalendarEvent[]>()
    for (const e of events) {
      if (isKoreanHolidayEvent(e)) continue
      const end = e.endDate ?? e.date
      for (const key of eachDateKey(e.date, end)) {
        const arr = map.get(key) ?? []
        arr.push(e)
        map.set(key, arr)
      }
    }
    return map
  }, [events])

  const dayDialogEvents = eventsByDay.get(dayDialogKey) ?? []

  function move(dir: number) {
    if (mode === "month") {
      onViewDateChange(addMonths(viewDate, dir))
    } else {
      onViewDateChange(addDays(startOfWeek(viewDate), dir * 7))
    }
  }

  function goToday() {
    onViewDateChange(new Date())
    onSelectDate(new Date())
  }
  
  function openDay(dateKey: string, day: Date) {
    onSelectDate(day)
    setDayDialogKey(dateKey)
    setDayDialogOpen(true)
  }
  
  const canAddEvents = isLoggedIn && calendarConnected

  function showCalendarConnectGuide() {
    alert("Google 캘린더를 연결해야 일정을 추가할 수 있어요.\n상단의 '캘린더 연결' 버튼을 눌러 주세요.")
  }

  function openAdd(dateKey: string) {
    if (!canAddEvents) {
      showCalendarConnectGuide()
      return
    }
    setEditingEvent(null)
    setFormDate(dateKey)
    setEditingEvent(null)
    setFormDate(dateKey)
    setTitle("")
    const start = floorHourHHmm()
    const next = applyDurationToEnd(start, dateKey, 60)
    setTime(start)
    setEndTime(next.endTime)
    setFormEndDate(next.endDate)
    setCalendarId(
      eventCalendars.find((c) => c.primary)?.id ??
        eventCalendars[0]?.id ??
        "primary",
    )
    setCategory("etc")
    setDialogOpen(true)
  }
  
  function openEdit(event: CalendarEvent) {
    if (isKoreanHolidayEvent(event)) return
    setEditingEvent(event)
    setFormDate(event.date)
    setFormEndDate(event.endDate ?? event.date)
    setTitle(event.title === "(제목 없음)" ? "" : event.title)
    setTime(event.time ?? "")
    setEndTime(event.endTime ?? "")
    setCalendarId(event.calendarId ?? "primary")
    setDayDialogOpen(false)
    setDialogOpen(true)
    setCategory(event.category ?? "etc")
  }
  
  async function submit() {
    if (!title.trim() || !calendarId || saving) return
    const cal = calendars.find((c) => c.id === calendarId)
    const endDate = formEndDate < formDate ? formDate : formEndDate
    const payload = {
      title: title.trim(),
      date: formDate,
      endDate,
      time: time || undefined,
      endTime: time ? endTime || undefined : undefined,
      allDay: !time,
      category,
    }
    setSaving(true)
    try {
      if (editingEvent) {
        await onUpdateEvent({
          ...editingEvent,
          ...payload,
          calendarId,
          calendarName: cal?.summary,
          calendarColor: cal?.backgroundColor,
        })
      } else {
        await onAddEvent({
          ...payload,
          calendarId,
          calendarName: cal?.summary,
          calendarColor: cal?.backgroundColor,
        })
      }
      setDialogOpen(false)
      setEditingEvent(null)
    } catch {
      // hook의 notifyApiError에서 이미 알림 처리
    } finally {
      setSaving(false)
    }
  }
  
  // 일정 삭제
  async function removeEvent() {
    if (!editingEvent || isKoreanHolidayEvent(editingEvent)) return
    if (!window.confirm(`「${editingEvent.title}」 일정을 삭제할까요?`)) return
    try {
      await onDeleteEvent(editingEvent)
      setDialogOpen(false)
      setEditingEvent(null)
    } catch {
      // hook의 notifyApiError에서 이미 알림 처리
    }
  }
  
  return (
    <section
      className={cn(
        "flex flex-col",
        flush
          ? "p-0" // 패딩은 FolderPanel content가 담당
          : "rounded-panel border border-card-border bg-card p-4 sm:p-5",
      )}
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          {mode === "month" ? (
            `${viewDate.getFullYear()}년 ${MONTHS_KO[viewDate.getMonth()]}`
          ) : (
            <>
              {weekOfMonthLabel}
              <span className="ml-1.5 text-sm font-medium text-muted-foreground">
                ({weekRangeLabel})
              </span>
            </>
          )}
        </h2>
          <GoogleBadge />
        </div>
        <div className="flex items-center gap-2">
          <Tabs value={mode} onValueChange={(v) => setMode(v as ViewMode)}>
            <TabsList className="rounded-full">
              <TabsTrigger value="month" className="rounded-full">
                월별
              </TabsTrigger>
              <TabsTrigger value="week" className="rounded-full">
                주별
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="flex items-center gap-1">
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={() => move(-1)}
              aria-label="이전"
            >
              <ChevronLeft />
            </Button>
            <Button size="sm" variant="outline" className="rounded-full" onClick={goToday}>
              오늘
            </Button>
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={() => move(1)}
              aria-label="다음"
            >
              <ChevronRight />
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-7 border-b border-border pb-2">
        {WEEKDAYS_KO.map((d, i) => (
          <div
            key={d}
            className={cn(
              "text-center text-xs font-medium text-muted-foreground",
              i === 0 && "text-[var(--event-rose)]",
              i === 6 && "text-[var(--event-blue)]",
            )}
          >
            {d}
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-1 pt-1">
        {weeks.map((week) => {
          const spans = layoutWeekSpans(week, events)
          const laneCountByDayKey = new Map<string, number>()
          for (const span of spans) {
            for (let col = span.colStart; col <= span.colEnd; col += 1) {
              const dayKey = toKey(week[col])
              const nextCount = span.lane + 1
              laneCountByDayKey.set(
                dayKey,
                Math.max(laneCountByDayKey.get(dayKey) ?? 0, nextCount),
              )
            }
          }
          const maxLane = spans.reduce((m, s) => Math.max(m, s.lane), -1)
          const spanAreaHeight = spanAreaHeightPx(maxLane)

          return (
            <div key={toKey(week[0])} className="relative">
              <div
                className={cn(
                  "grid grid-cols-7 gap-1",
                  mode === "week" && "flex-1",
                )}
              >
                {week.map((day) => {
                  const key = toKey(day)
                  const dayEvents = singleEventsByDay.get(key) ?? []
                  const totalDayCount = eventsByDay.get(key)?.length ?? 0
                  const cellH = mode === "month" ? MONTH_CELL_H : WEEK_CELL_H
                  const chipTop = CELL_HEADER_H + Math.max(
                    0,
                    singleEventOffsetPx(laneCountByDayKey.get(key) ?? 0),
                  )
                  const avail = cellH - CELL_PAD_Y - chipTop
                  const compact = dayEvents.length * TWO_LINE_CHIP_H > avail
                  const chipH = compact ? LANE_HEIGHT : TWO_LINE_CHIP_H
                  const allFitCompact =
                    compact && dayEvents.length * chipH <= avail
                  const maxChips = Math.max(
                    0,
                    Math.floor(
                      (avail - (allFitCompact ? 0 : MORE_LABEL_H)) / chipH,
                    ),
                  )
                  const visibleEvents = compact
                    ? dayEvents.slice(0, maxChips)
                    : dayEvents
                  const showMore = visibleEvents.length < dayEvents.length
                  const holidays = holidaysByDay.get(key) ?? []
                  const holidayLabel = holidays.map((h) => h.title).join(" · ")
                  const inMonth = day.getMonth() === viewDate.getMonth()
                  const isToday = isSameDay(day, today)
                  const isSelected = isSameDay(day, selectedDate)
                  const dow = day.getDay()
                  const isHoliday = holidays.length > 0

                  return (
                    <div
                      key={key}
                      role="button"
                      tabIndex={0}
                      onClick={() => openDay(key, day)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") openDay(key, day)
                      }}
                      className={cn(
                        "group flex flex-col gap-0 rounded-lg border border-transparent p-1.5 text-left transition-colors hover:border-primary/40 hover:bg-secondary/50",
                        mode === "month"
                          ? "h-[108px] min-h-[108px] overflow-hidden"
                          : "h-[220px] min-h-[220px] overflow-hidden",
                        mode === "month" && !inMonth && "opacity-40",
                        isSelected && !isToday && "border-primary/50 bg-primary/5",
                      )}
                      style={
                        isToday
                          ? {
                              backgroundColor: `color-mix(in srgb, ${
                                themeColor ?? "var(--primary)"
                              } 18%, transparent)`,
                              borderColor: `color-mix(in srgb, ${
                                themeColor ?? "var(--primary)"
                              } 50%, transparent)`,
                            }
                          : undefined
                      }
                    >
                      <div className="relative flex h-8 min-w-0 items-center gap-0.5 pr-4">
                      <span
                        className={cn(
                          "flex size-6 shrink-0 items-center justify-center text-xs font-medium text-foreground",
                          (dow === 0 || isHoliday) && "text-[var(--event-rose)]",
                          dow === 6 && !isHoliday && "text-[var(--event-blue)]",
                        )}
                      >
                          {day.getDate()}
                        </span>

                        {holidayLabel && (
                          <span
                            className="flex h-6 min-w-0 flex-1 items-center text-[10px] font-medium leading-none text-[var(--event-rose)] break-keep"
                            title={holidayLabel}
                          >
                            {holidayLabel}
                          </span>
                        )}

                      <button
                        type="button"
                        aria-label="일정 추가"
                        disabled={!canAddEvents}
                        onClick={(e) => {
                          e.stopPropagation()
                          if (!canAddEvents) {
                            showCalendarConnectGuide()
                            return
                          }
                          onSelectDate(day)
                          openAdd(key)
                        }}
                        className={cn(
                          "absolute top-0 right-0 rounded border border-border p-0.5 text-muted-foreground transition-opacity",
                          canAddEvents
                            ? "opacity-0 hover:bg-muted group-hover:opacity-100"
                            : "cursor-not-allowed opacity-30",
                        )}
                      >
                        <Plus className="size-3" />
                      </button>
                      </div>
                      <div
                        className="flex flex-col"
                        style={{
                          marginTop: singleEventOffsetPx(
                            laneCountByDayKey.get(key) ?? 0,
                          ),
                          gap: LANE_HEIGHT - SPAN_BAR_HEIGHT, // 2px (여러 날 lane 간격과 동일)
                        }}
                      >
                        {visibleEvents.map((e) => {
                        const color =
                          e.calendarColor ??
                          CATEGORY_META[e.category]?.token ??
                          "var(--event-amber)"
                        const solid = Boolean(e.allDay)
                        return (
                          <span
                            key={e.id}
                            className={cn(
                              cn(
                                "flex gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium",
                                compact ? "items-center" : "items-start",
                              ),
                            )}
                            style={{
                              backgroundColor: solid
                                ? color
                                : `color-mix(in oklch, ${color} 18%, transparent)`,
                              color: solid ? onColor(color) : color,
                              minHeight: compact ? SPAN_BAR_HEIGHT : undefined,
                              lineHeight: `${SPAN_BAR_HEIGHT}px`,
                            }}
                          >
                            {!solid && (
                              <span
                                className={cn(
                                  "size-1.5 shrink-0 rounded-full",
                                  !compact && "mt-1",
                                )}
                                style={{ backgroundColor: color }}
                              />
                            )}
                            <span
                              className={cn(
                                "flex min-w-0 flex-1",
                                compact ? "items-center gap-1" : "flex-col gap-0.5",
                              )}
                            >
                              {e.time && (
                                <span className="shrink-0 tabular-nums leading-tight opacity-80">
                                  {e.time}
                                </span>
                              )}
                              <span
                                className={cn(
                                  "min-w-0 leading-tight",
                                  compact
                                    ? "truncate"
                                    : "line-clamp-2 break-words",
                                )}
                              >
                                {e.title}
                              </span>
                            </span>
                          </span>
                        )
                      })}
                        {showMore && (
                          <button
                            type="button"
                            className="px-1.5 text-left text-[11px] font-medium text-muted-foreground hover:text-foreground"
                            onClick={(e) => {
                              e.stopPropagation()
                              openDay(key, day)
                            }}
                          >
                            ...{totalDayCount}개의 일정
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* 여러 날 일정 — 주를 가로지르는 막대 */}
              {spans.length > 0 && (
                <div
                  className="pointer-events-none absolute inset-x-0"
                  style={{ top: SPAN_BAR_TOP, height: spanAreaHeight }}
                >
                  {spans.map(({ event, lane, colStart, colEnd }) => {
                    const color =
                      event.calendarColor ??
                      CATEGORY_META[event.category]?.token ??
                      "var(--event-amber)"
                      const spanCols = colEnd - colStart + 1
                      const { left, width } = spanBarGeometry(colStart, spanCols)
                      return (
                        <div
                          key={`${event.id}-${colStart}`}
                          className="absolute flex items-center truncate rounded-md px-1.5 text-[11px] font-medium shadow-sm"
                          title={`${event.title} (${event.date} ~ ${event.endDate ?? event.date})`}
                          style={{
                            top: lane * LANE_HEIGHT,
                            left,
                            width,
                            height: SPAN_BAR_HEIGHT,
                            backgroundColor: color,
                            color: onColor(color),
                          }}
                        >
                        {event.title}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <Dialog open={dayDialogOpen} onOpenChange={setDayDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center gap-2 pr-10">
            <DialogTitle className="w-fit shrink-0">
              {dayDialogKey} 일정
              {(holidaysByDay.get(dayDialogKey) ?? [])
                .map((h) => h.title)
                .join(" · ") && (
                <span className="ml-2 text-sm font-medium text-[var(--event-rose)]">
                  {(holidaysByDay.get(dayDialogKey) ?? []).map((h) => h.title).join(" · ")}
                </span>
              )}
            </DialogTitle>
            <Button
              type="button"
              size="icon-sm"
              variant="outline"
              aria-label="일정 추가"
              disabled={!canAddEvents}
              onClick={() => openAdd(dayDialogKey)}
            >
              <Plus className="size-4" />
            </Button>
            </div>
          </DialogHeader>
          {dayDialogEvents.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              등록된 일정이 없습니다.
            </p>
          ) : (
            <ul className="flex max-h-80 flex-col gap-2 overflow-y-auto">
              {dayDialogEvents.map((e) => {
                const color =
                  e.calendarColor ??
                  CATEGORY_META[e.category]?.token ??
                  "var(--event-amber)"
                const multi = isMultiDayEvent(e)
                return (
                  <li
                    key={e.id}
                    className="flex items-start gap-2 rounded-lg border border-border px-3 py-2 text-sm"
                  >
                    <button
                      type="button"
                      className="flex min-w-0 flex-1 items-start gap-2 text-left"
                      onClick={() => openEdit(e)}
                    >
                      <span
                        className="mt-1.5 size-2 shrink-0 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-foreground">{e.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {multi
                            ? `${e.date} ~ ${e.endDate ?? e.date}`
                            : e.time
                              ? e.time
                              : "종일"}
                          {e.calendarName ? ` · ${e.calendarName}` : ""}
                        </p>
                      </div>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
          <DialogFooter>
            <DialogClose render={<Button variant="ghost">닫기</Button>} />
            <Button
              disabled={!canAddEvents}
              onClick={() => {
                if (!canAddEvents) {
                  showCalendarConnectGuide()
                  return
                }
                setDayDialogOpen(false)
                openAdd(dayDialogKey)
              }}
            >
              일정 추가
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <EventFormDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) setEditingEvent(null)
        }}
        accent={accent}
        editingEvent={editingEvent}
        formDate={formDate}
        formEndDate={formEndDate}
        title={title}
        time={time}
        endTime={endTime}
        category={category}
        calendarId={calendarId}
        eventCalendars={eventCalendars}
        saving={saving}
        onFormDateChange={setFormDate}
        onFormEndDateChange={setFormEndDate}
        onTitleChange={setTitle}
        onTimeChange={setTime}
        onEndTimeChange={setEndTime}
        onCategoryChange={setCategory}
        onCalendarIdChange={setCalendarId}
        onSubmit={submit}
        onDelete={removeEvent}
      />
    </section>
  )
}
