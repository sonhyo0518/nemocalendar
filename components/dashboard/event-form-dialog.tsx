"use client"

import { ArrowRight, ChevronDown, X } from "lucide-react"
import { onColor } from "@/lib/contrast"
import {
  CATEGORY_META,
  isKoreanHolidayEvent,
  type CalendarEvent,
  type EventCategory,
  type GoogleCalendarOption,
} from "@/lib/dashboard-data"
import {
  DURATION_HOURS,
  DURATION_MINUTES,
  DURATION_TAGS,
  HOURS_12,
  MINUTES,
  applyDurationToEnd,
  durationMinutes,
  floorHourHHmm,
  parseHHmm,
  scheduleFieldLabelClass,
  scheduleInputClass,
  scheduleSelectClass,
  toHHmm,
  type Meridiem,
} from "@/lib/main-calendar-utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

function MeridiemTimeField({
  id,
  value,
  disabled,
  onChange,
}: {
  id: string
  value: string
  disabled?: boolean
  onChange: (next: string) => void
}) {
  const parsed = parseHHmm(value)
  const hour12 = parsed?.hour12
  const minute = parsed?.minute ?? 0
  const meridiem = parsed?.meridiem ?? "am"
  const minuteOptions =
    minute % 10 === 0 ? MINUTES : [...MINUTES, minute].sort((a, b) => a - b)

  function commit(
    nextHour: number | undefined,
    nextMinute: number,
    nextMeridiem: Meridiem,
  ) {
    if (nextHour == null) {
      onChange("")
      return
    }
    onChange(toHHmm(nextHour, nextMinute, nextMeridiem))
  }

  return (
    <div className="flex items-baseline gap-1">
      <select
        disabled={disabled}
        aria-label="오전 오후"
        className={cn(scheduleSelectClass, "w-[4.5rem] shrink-0")}
        value={hour12 == null ? "" : meridiem}
        onChange={(e) => commit(hour12 ?? 12, minute, e.target.value as Meridiem)}
      >
        {hour12 == null && <option value="">--</option>}
        <option value="am">오전</option>
        <option value="pm">오후</option>
      </select>
      <select
        id={id}
        disabled={disabled}
        aria-label="시"
        className={cn(scheduleSelectClass, "min-w-0 flex-1")}
        value={hour12 ?? ""}
        onChange={(e) => {
          const next = e.target.value
          commit(next === "" ? undefined : Number(next), minute, meridiem)
        }}
      >
        <option value="">--</option>
        {HOURS_12.map((h) => (
          <option key={h} value={h}>
            {h}
          </option>
        ))}
      </select>
      <span className="pb-[7px] text-sm font-semibold text-[var(--schedule-muted)]">
        :
      </span>
      <select
        disabled={disabled || hour12 == null}
        aria-label="분"
        className={cn(scheduleSelectClass, "min-w-0 flex-1")}
        value={hour12 == null ? "" : minute}
        onChange={(e) => commit(hour12, Number(e.target.value), meridiem)}
      >
        {hour12 == null && <option value="">--</option>}
        {minuteOptions.map((m) => (
          <option key={m} value={m}>
            {String(m).padStart(2, "0")}
          </option>
        ))}
      </select>
    </div>
  )
}

export type EventFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  accent: string
  editingEvent: CalendarEvent | null
  formDate: string
  formEndDate: string
  title: string
  time: string
  endTime: string
  category: EventCategory
  calendarId: string
  eventCalendars: GoogleCalendarOption[]
  saving: boolean
  onFormDateChange: (value: string) => void
  onFormEndDateChange: (value: string) => void
  onTitleChange: (value: string) => void
  onTimeChange: (value: string) => void
  onEndTimeChange: (value: string) => void
  onCategoryChange: (value: EventCategory) => void
  onCalendarIdChange: (value: string) => void
  onSubmit: () => void
  onDelete: () => void
}

export function EventFormDialog({
  open,
  onOpenChange,
  accent,
  editingEvent,
  formDate,
  formEndDate,
  title,
  time,
  endTime,
  category,
  calendarId,
  eventCalendars,
  saving,
  onFormDateChange,
  onFormEndDateChange,
  onTitleChange,
  onTimeChange,
  onEndTimeChange,
  onCategoryChange,
  onCalendarIdChange,
  onSubmit,
  onDelete,
}: EventFormDialogProps) {
  const dur =
    time && endTime
      ? Math.max(0, durationMinutes(time, endTime, formDate, formEndDate))
      : 60
  const hours = Math.min(12, Math.floor(dur / 60))
  const mins = dur % 60
  const minuteOptions =
    mins % 10 === 0 ? DURATION_MINUTES : [...DURATION_MINUTES, mins].sort((a, b) => a - b)

  function setDuration(nextHours: number, nextMins: number) {
    if (!time) return
    const applied = applyDurationToEnd(time, formDate, nextHours * 60 + nextMins)
    onEndTimeChange(applied.endTime)
    onFormEndDateChange(applied.endDate)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent
        showCloseButton={false}
        style={{
          ["--schedule-accent" as string]:
            `color-mix(in srgb, ${accent} 15%, var(--schedule-fg))`,
        }}
        className="max-w-[380px] gap-0 rounded-[6px] bg-[var(--schedule-surface)] p-0 text-[var(--schedule-fg)] ring-0 sm:max-w-[380px]"
      >
        <DialogHeader className="relative gap-0 border-b-2 border-[var(--schedule-accent)] px-[22px] pt-[18px] pb-3">
          <p className="mb-[3px] text-[10px] font-bold tracking-[0.12em] text-[var(--schedule-accent)] uppercase">
            {editingEvent ? "Edit Schedule" : "New Schedule"}
          </p>
          <DialogTitle className="text-[19px] font-extrabold tracking-tight">
            {editingEvent ? "일정 수정" : "일정 추가"}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {editingEvent
              ? `${formDate} 일정을 수정합니다. Google 캘린더에도 반영됩니다.`
              : `${formDate} 에 새로운 일정을 등록합니다.`}
          </DialogDescription>
          <DialogClose
            render={
              <button
                type="button"
                title="닫기"
                className="absolute top-[17px] right-[18px] grid size-[22px] place-items-center border-0 bg-transparent text-[var(--schedule-muted)] transition-[color,transform] duration-150 hover:rotate-90 hover:text-[var(--schedule-fg)]"
              />
            }
          >
            <X className="size-[15px]" strokeWidth={2.3} />
            <span className="sr-only">닫기</span>
          </DialogClose>
        </DialogHeader>

        <div className="px-[22px] pt-4 pb-[18px]">
          {/* 제목 */}
          <div className="mb-[13px]">
            <Label htmlFor="event-title" className={scheduleFieldLabelClass}>
              제목
            </Label>
            <Input
              id="event-title"
              autoFocus
              value={title}
              placeholder="일정 제목을 입력하세요"
              className={cn(scheduleInputClass, "pb-2 text-base font-extrabold md:text-base")}
              onChange={(e) => onTitleChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.nativeEvent.isComposing) onSubmit()
              }}
            />
          </div>

          {/* 날짜 */}
          <div className="mb-[13px] grid grid-cols-2 gap-x-[18px]">
            <div>
              <Label htmlFor="event-date" className={scheduleFieldLabelClass}>
                시작 날짜
              </Label>
              <Input
                id="event-date"
                type="date"
                value={formDate}
                className={scheduleInputClass}
                onChange={(e) => {
                  const next = e.target.value
                  onFormDateChange(next)
                  if (formEndDate < next) onFormEndDateChange(next)
                }}
              />
            </div>
            <div>
              <Label htmlFor="event-end-date" className={scheduleFieldLabelClass}>
                종료 날짜
              </Label>
              <Input
                id="event-end-date"
                type="date"
                min={formDate}
                value={formEndDate}
                className={scheduleInputClass}
                onChange={(e) => onFormEndDateChange(e.target.value)}
              />
            </div>
          </div>

          {/* 시간 */}
          <div className="mb-[13px] grid grid-cols-2 gap-x-[18px]">
            <div>
              <Label htmlFor="event-time" className={scheduleFieldLabelClass}>
                시작 시간
              </Label>
              <MeridiemTimeField
                id="event-time"
                value={time}
                onChange={(next) => {
                  onTimeChange(next)
                  if (!next) {
                    onEndTimeChange("")
                    return
                  }
                  const nextDur =
                    endTime
                      ? Math.max(0, durationMinutes(next, endTime, formDate, formEndDate))
                      : 60
                  const applied = applyDurationToEnd(next, formDate, nextDur || 60)
                  onEndTimeChange(applied.endTime)
                  onFormEndDateChange(applied.endDate)
                }}
              />
            </div>
            <div>
              <Label htmlFor="event-end-time" className={scheduleFieldLabelClass}>
                종료 시간
              </Label>
              <MeridiemTimeField
                id="event-end-time"
                value={endTime}
                disabled={!time}
                onChange={onEndTimeChange}
              />
            </div>
          </div>

          {/* 소요 시간 */}
          <div className="mb-[13px]">
            <Label className={scheduleFieldLabelClass}>소요 시간</Label>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
              <div className="flex items-baseline gap-2">
                <select
                  disabled={!time}
                  aria-label="소요 시간"
                  className={cn(scheduleSelectClass, "w-16")}
                  value={hours}
                  onChange={(e) =>
                    setDuration(Number(e.target.value), mins % 10 === 0 ? mins : 0)
                  }
                >
                  {DURATION_HOURS.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
                <span className="pb-[7px] text-xs font-bold text-[var(--schedule-muted)]">
                  시간
                </span>
                <select
                  disabled={!time}
                  aria-label="소요 분"
                  className={cn(scheduleSelectClass, "w-16")}
                  value={mins}
                  onChange={(e) => setDuration(hours, Number(e.target.value))}
                >
                  {minuteOptions.map((m) => (
                    <option key={m} value={m}>
                      {String(m).padStart(2, "0")}
                    </option>
                  ))}
                </select>
                <span className="pb-[7px] text-xs font-bold text-[var(--schedule-muted)]">
                  분
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    if (!time) {
                      const start = floorHourHHmm()
                      const next = applyDurationToEnd(start, formDate, 60)
                      onTimeChange(start)
                      onEndTimeChange(next.endTime)
                      onFormEndDateChange(next.endDate)
                      return
                    }
                    onTimeChange("")
                    onEndTimeChange("")
                    onFormEndDateChange(formDate)
                  }}
                  className={cn(
                    "rounded-full border px-2.5 py-1 text-[11px] font-bold transition-colors",
                    !time
                      ? "border-[var(--schedule-accent)] bg-[color-mix(in_srgb,var(--schedule-accent)_18%,white)] text-[var(--schedule-accent)]"
                      : "border-[var(--schedule-border)] text-[var(--schedule-muted)] hover:border-[var(--schedule-accent)] hover:text-[var(--schedule-fg)]",
                  )}
                >
                  종일
                </button>
                {DURATION_TAGS.map((tag) => {
                  const selected = Boolean(time) && dur === tag.minutes
                  return (
                    <button
                      key={tag.minutes}
                      type="button"
                      disabled={!time}
                      onClick={() =>
                        setDuration(Math.floor(tag.minutes / 60), tag.minutes % 60)
                      }
                      className={cn(
                        "rounded-full border px-2.5 py-1 text-[11px] font-bold transition-colors",
                        selected
                          ? "border-[var(--schedule-accent)] bg-[color-mix(in_srgb,var(--schedule-accent)_18%,white)] text-[var(--schedule-accent)]"
                          : "border-[var(--schedule-border)] text-[var(--schedule-muted)] hover:border-[var(--schedule-accent)] hover:text-[var(--schedule-fg)]",
                        "disabled:cursor-not-allowed disabled:opacity-40",
                      )}
                    >
                      {tag.label}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* 일정 카테고리 */}
          <div className="relative mb-[13px]">
            <Label htmlFor="event-category" className={scheduleFieldLabelClass}>
              일정 카테고리
            </Label>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <button
                    id="event-category"
                    type="button"
                    className={cn(
                      scheduleInputClass,
                      "flex w-full min-w-0 cursor-pointer items-center gap-2 text-left",
                    )}
                  />
                }
              >
                <span
                  className="size-2 shrink-0 rounded-full"
                  style={{ backgroundColor: CATEGORY_META[category].token }}
                />
                <span className="min-w-0 flex-1 truncate">
                  {CATEGORY_META[category].label}
                </span>
                <ChevronDown className="size-3.5 shrink-0 text-[var(--schedule-muted)]" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="min-w-(--anchor-width)">
                <DropdownMenuRadioGroup
                  value={category}
                  onValueChange={(v) => onCategoryChange(v as EventCategory)}
                >
                  {(Object.keys(CATEGORY_META) as EventCategory[]).map((key) => (
                    <DropdownMenuRadioItem key={key} value={key} closeOnClick>
                      <span
                        className="size-2.5 shrink-0 rounded-full border border-black/10"
                        style={{ backgroundColor: CATEGORY_META[key].token }}
                      />
                      {CATEGORY_META[key].label}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* 캘린더 카테고리 */}
          <div className="relative mb-[13px]">
            <Label htmlFor="event-calendar" className={scheduleFieldLabelClass}>
              캘린더 카테고리
            </Label>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <button
                    id="event-calendar"
                    type="button"
                    className={cn(
                      scheduleInputClass,
                      "flex w-full min-w-0 cursor-pointer items-center gap-2 text-left",
                    )}
                  />
                }
              >
                <span
                  className="size-2 shrink-0 rounded-full"
                  style={{
                    backgroundColor:
                      eventCalendars.find((c) => c.id === calendarId)?.backgroundColor ??
                      "var(--event-amber)",
                  }}
                />
                <span className="min-w-0 flex-1 truncate">
                  {eventCalendars.find((c) => c.id === calendarId)?.summary ?? calendarId}
                </span>
                <ChevronDown className="size-3.5 shrink-0 text-[var(--schedule-muted)]" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="min-w-(--anchor-width)">
                <DropdownMenuRadioGroup
                  value={calendarId}
                  onValueChange={onCalendarIdChange}
                >
                  {eventCalendars.map((c) => (
                    <DropdownMenuRadioItem key={c.id} value={c.id} closeOnClick>
                      <span
                        className="size-2.5 shrink-0 rounded-full border border-black/10"
                        style={{ backgroundColor: c.backgroundColor }}
                      />
                      {c.summary}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="mt-1 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {editingEvent && !isKoreanHolidayEvent(editingEvent) ? (
                <button
                  type="button"
                  onClick={onDelete}
                  className="border-0 bg-transparent p-1 text-xs font-bold text-red-500 transition-colors hover:text-red-600"
                >
                  삭제
                </button>
              ) : null}
              <DialogClose
                render={
                  <button
                    type="button"
                    className="border-0 bg-transparent p-1 text-xs font-bold text-[var(--schedule-muted)] transition-colors hover:text-[var(--schedule-fg)]"
                  />
                }
              >
                취소
              </DialogClose>
            </div>
            <Button
              onClick={onSubmit}
              disabled={!title.trim() || saving}
              className="h-auto gap-1.5 rounded-full px-[17px] py-[9px] text-[13px] font-extrabold disabled:opacity-100 not-disabled:hover:-translate-y-px"
              style={{
                backgroundColor: title.trim() ? accent : "var(--schedule-disabled)",
                color: title.trim() ? onColor(accent) : undefined,
              }}
            >
              {editingEvent ? "저장" : "추가"}
              <ArrowRight className="size-[15px]" strokeWidth={2.5} />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}