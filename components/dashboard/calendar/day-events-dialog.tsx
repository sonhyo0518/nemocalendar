"use client"

import { Plus } from "lucide-react"

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  isMultiDayEvent,
  type CalendarEvent,
} from "@/lib/dashboard-data"

type DayEventsDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  dateKey: string
  events: CalendarEvent[]
  holidayLabel?: string
  canAddEvents: boolean
  onAdd: () => void
  onEdit: (event: CalendarEvent) => void
  onRequireConnect: () => void
}

export function DayEventsDialog({
  open,
  onOpenChange,
  dateKey,
  events,
  holidayLabel,
  canAddEvents,
  onAdd,
  onEdit,
  onRequireConnect,
}: DayEventsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-2 pr-10">
            <DialogTitle className="w-fit shrink-0">
              {dateKey} 일정
              {holidayLabel ? (
                <span className="ml-2 text-sm font-medium text-[var(--event-rose)]">
                  {holidayLabel}
                </span>
              ) : null}
            </DialogTitle>
            <Button
              type="button"
              size="icon-sm"
              variant="outline"
              aria-label="일정 추가"
              disabled={!canAddEvents}
              onClick={onAdd}
            >
              <Plus className="size-4" />
            </Button>
          </div>
        </DialogHeader>
        {events.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            등록된 일정이 없습니다.
          </p>
        ) : (
          <ul className="flex max-h-80 flex-col gap-2 overflow-y-auto">
            {events.map((e) => {
              const color =
                e.calendarColor ?? "var(--event-amber)"
              const multi = isMultiDayEvent(e)
              return (
                <li
                  key={e.id}
                  className="flex items-start gap-2 rounded-lg border border-border px-3 py-2 text-sm"
                >
                  <button
                    type="button"
                    className="flex min-w-0 flex-1 items-start gap-2 text-left"
                    onClick={() => onEdit(e)}
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
                onRequireConnect()
                return
              }
              onOpenChange(false)
              onAdd()
            }}
          >
            일정 추가
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
