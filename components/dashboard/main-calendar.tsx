"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"

import {
  CATEGORY_META,
  MONTHS_KO,
  WEEKDAYS_KO,
  addDays,
  addMonths,
  buildMonthGrid,
  isSameDay,
  startOfWeek,
  toKey,
  type CalendarEvent,
  type EventCategory,
} from "@/lib/dashboard-data"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
  onAddEvent: (e: Omit<CalendarEvent, "id">) => void
}

const CATEGORIES = Object.keys(CATEGORY_META) as EventCategory[]

export function MainCalendar({
  events,
  viewDate,
  selectedDate,
  onViewDateChange,
  onSelectDate,
  onAddEvent,
}: MainCalendarProps) {
  const [mode, setMode] = React.useState<ViewMode>("month")
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [formDate, setFormDate] = React.useState<string>(toKey(new Date()))
  const [title, setTitle] = React.useState("")
  const [time, setTime] = React.useState("")
  const [category, setCategory] = React.useState<EventCategory>("work")

  const today = new Date()

  const eventsByDay = React.useMemo(() => {
    const map = new Map<string, CalendarEvent[]>()
    for (const e of events) {
      const arr = map.get(e.date) ?? []
      arr.push(e)
      map.set(e.date, arr)
    }
    return map
  }, [events])

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

  function openAdd(dateKey: string) {
    setFormDate(dateKey)
    setTitle("")
    setTime("")
    setCategory("work")
    setDialogOpen(true)
  }

  function submit() {
    if (!title.trim()) return
    onAddEvent({
      title: title.trim(),
      date: formDate,
      time: time || undefined,
      category,
    })
    setDialogOpen(false)
  }

  const gridDays =
    mode === "month"
      ? buildMonthGrid(viewDate)
      : Array.from({ length: 7 }, (_, i) => addDays(startOfWeek(viewDate), i))

  const heading =
    mode === "month"
      ? `${viewDate.getFullYear()}년 ${MONTHS_KO[viewDate.getMonth()]}`
      : `${MONTHS_KO[startOfWeek(viewDate).getMonth()]} ${startOfWeek(viewDate).getDate()}일 – ${addDays(startOfWeek(viewDate), 6).getDate()}일`

  return (
    <section className="flex flex-col rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            {heading}
          </h2>
          <GoogleBadge />
        </div>
        <div className="flex items-center gap-2">
          <Tabs value={mode} onValueChange={(v) => setMode(v as ViewMode)}>
            <TabsList>
              <TabsTrigger value="month">월별</TabsTrigger>
              <TabsTrigger value="week">주별</TabsTrigger>
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
            <Button size="sm" variant="outline" onClick={goToday}>
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

      <div
        className={cn(
          "grid grid-cols-7 gap-1 pt-1",
          mode === "week" && "flex-1",
        )}
      >
        {gridDays.map((day) => {
          const key = toKey(day)
          const dayEvents = eventsByDay.get(key) ?? []
          const inMonth = day.getMonth() === viewDate.getMonth()
          const isToday = isSameDay(day, today)
          const isSelected = isSameDay(day, selectedDate)
          const dow = day.getDay()

          return (
            <button
              key={key}
              type="button"
              onClick={() => {
                onSelectDate(day)
                openAdd(key)
              }}
              className={cn(
                "group flex flex-col gap-1 rounded-lg border border-transparent p-1.5 text-left transition-colors hover:border-primary/40 hover:bg-secondary/50",
                mode === "month" ? "min-h-[92px]" : "min-h-[220px]",
                mode === "month" && !inMonth && "opacity-40",
                isSelected && "border-primary/50 bg-primary/5",
              )}
            >
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    "flex size-6 items-center justify-center rounded-full text-xs font-medium",
                    isToday
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground",
                    !isToday && dow === 0 && "text-[var(--event-rose)]",
                    !isToday && dow === 6 && "text-[var(--event-blue)]",
                  )}
                >
                  {day.getDate()}
                </span>
                <Plus className="size-3 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
              <div className="flex flex-col gap-1">
                {dayEvents.slice(0, mode === "month" ? 3 : 8).map((e) => (
                  <span
                    key={e.id}
                    className="flex items-center gap-1 truncate rounded-md px-1.5 py-0.5 text-[11px] font-medium"
                    style={{
                      backgroundColor: `color-mix(in oklch, ${CATEGORY_META[e.category].token} 14%, transparent)`,
                      color: CATEGORY_META[e.category].token,
                    }}
                  >
                    <span
                      className="size-1.5 shrink-0 rounded-full"
                      style={{ backgroundColor: CATEGORY_META[e.category].token }}
                    />
                    {e.time && <span className="tabular-nums">{e.time}</span>}
                    <span className="truncate">{e.title}</span>
                  </span>
                ))}
                {dayEvents.length > (mode === "month" ? 3 : 8) && (
                  <span className="px-1.5 text-[11px] text-muted-foreground">
                    +{dayEvents.length - (mode === "month" ? 3 : 8)}개 더
                  </span>
                )}
              </div>
            </button>
          )
        })}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>일정 추가</DialogTitle>
            <DialogDescription>
              {formDate} 에 새로운 일정을 등록합니다.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="event-title">제목</Label>
              <Input
                id="event-title"
                autoFocus
                value={title}
                placeholder="일정 제목"
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.nativeEvent.isComposing) submit()
                }}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="event-date">날짜</Label>
                <Input
                  id="event-date"
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="event-time">시간</Label>
                <Input
                  id="event-time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>카테고리</Label>
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCategory(c)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
                      category === c
                        ? "border-transparent text-primary-foreground"
                        : "border-border text-muted-foreground hover:bg-muted",
                    )}
                    style={
                      category === c
                        ? { backgroundColor: CATEGORY_META[c].token }
                        : undefined
                    }
                  >
                    <span
                      className="size-1.5 rounded-full"
                      style={{ backgroundColor: CATEGORY_META[c].token }}
                    />
                    {CATEGORY_META[c].label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose
              render={<Button variant="ghost">취소</Button>}
            />
            <Button onClick={submit} disabled={!title.trim()}>
              추가하기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  )
}
