"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

import {
  MONTHS_KO,
  WEEKDAYS_KO,
  addMonths,
  buildMonthGrid,
  isSameDay,
  toKey,
  type CalendarEvent,
} from "@/lib/dashboard-data"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface MiniCalendarProps {
  selectedDate: Date
  events: CalendarEvent[]
  onSelectDate: (d: Date) => void
}

export function MiniCalendar({
  selectedDate,
  events,
  onSelectDate,
}: MiniCalendarProps) {
  const [viewDate, setViewDate] = React.useState(
    () => new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1),
  )
  const today = new Date()

  const eventDays = React.useMemo(
    () => new Set(events.map((e) => e.date)),
    [events],
  )

  const days = buildMonthGrid(viewDate)

  return (
    <div className="rounded-widget border border-card-border bg-card p-4">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-semibold text-foreground">
          {viewDate.getFullYear()}년 {MONTHS_KO[viewDate.getMonth()]}
        </p>
        <div className="flex items-center gap-0.5">
          <Button
            size="icon-xs"
            variant="ghost"
            aria-label="이전 달"
            onClick={() => setViewDate(addMonths(viewDate, -1))}
          >
            <ChevronLeft />
          </Button>
          <Button
            size="icon-xs"
            variant="ghost"
            aria-label="다음 달"
            onClick={() => setViewDate(addMonths(viewDate, 1))}
          >
            <ChevronRight />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7">
        {WEEKDAYS_KO.map((d, i) => (
          <div
            key={d}
            className={cn(
              "py-1 text-center text-[10px] font-medium text-muted-foreground",
              i === 0 && "text-[var(--event-rose)]",
              i === 6 && "text-[var(--event-blue)]",
            )}
          >
            {d}
          </div>
        ))}
        {days.map((day) => {
          const key = toKey(day)
          const inMonth = day.getMonth() === viewDate.getMonth()
          const isToday = isSameDay(day, today)
          const isSelected = isSameDay(day, selectedDate)
          const hasEvent = eventDays.has(key)

          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelectDate(day)}
              className={cn(
                "relative mx-auto flex size-7 flex-col items-center justify-center rounded-full text-xs transition-colors hover:bg-secondary",
                !inMonth && "text-muted-foreground/40",
                inMonth && "text-foreground",
                isSelected && "bg-primary text-primary-foreground hover:bg-primary",
                isToday && !isSelected && "font-bold text-primary",
              )}
            >
              {day.getDate()}
              {hasEvent && (
                <span
                  className={cn(
                    "absolute bottom-0.5 size-1 rounded-full",
                    isSelected ? "bg-primary-foreground" : "bg-primary",
                  )}
                />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
