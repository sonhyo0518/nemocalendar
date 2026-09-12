"use client"

import { CalendarDays, ChevronDown } from "lucide-react"
import * as React from "react"
import { onColor } from "@/lib/contrast"
import { isHolidayCalendarOption, type GoogleCalendarOption } from "@/lib/dashboard-data"
import { COLOR_PRESETS } from "@/lib/color-presets"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface CalendarCategoryFilterProps {
  calendars: GoogleCalendarOption[]
  visibleIds: Set<string>
  onToggle: (calendarId: string) => void
  onShowAll: () => void
  onHideAll: () => void
  onColorChange: (calendarId: string, color: string) => void
  readOnly?: boolean
  onRequireLogin?: () => void
}

function CalendarColorPicker({
  color,
  label,
  onChange,
}: {
  color: string
  label: string
  onChange: (color: string) => void
}) {
  const isPreset = COLOR_PRESETS.some(
    (c) => c.toLowerCase() === color.toLowerCase(),
  )

  return (
    <Popover>
      <PopoverTrigger
        render={
          <button
            type="button"
            aria-label={`${label} 색상`}
            className="size-3.5 shrink-0 cursor-pointer rounded-full border border-border shadow-sm"
            style={{ backgroundColor: color }}
          />
        }
      />
      <PopoverContent align="start" className="w-auto p-2">
        <div className="flex max-w-52 flex-wrap items-center gap-1.5">
          {COLOR_PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              aria-label={preset}
              onClick={() => onChange(preset)}
              className={cn(
                "size-5 cursor-pointer rounded-full border border-black/10",
                color.toLowerCase() === preset.toLowerCase() &&
                  "ring-2 ring-foreground ring-offset-1 ring-offset-background",
              )}
              style={{ backgroundColor: preset }}
            />
          ))}
          <label
            className={cn(
              "relative size-5 cursor-pointer overflow-hidden rounded-full border border-black/10",
              !isPreset && "ring-2 ring-foreground ring-offset-1 ring-offset-background",
            )}
            title="사용자 지정"
          >
            <span
              className="absolute inset-0"
              style={{
                background:
                  "conic-gradient(#EA4335, #F9AB00, #34A853, #4285F4, #A142F4, #EA4335)",
              }}
            />
            <input
              type="color"
              value={color}
              aria-label={`${label} 사용자 지정 색상`}
              className="absolute inset-0 cursor-pointer opacity-0"
              onChange={(e) => onChange(e.target.value)}
            />
          </label>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export function CalendarCategoryFilter({
  calendars,
  visibleIds,
  onToggle,
  onShowAll,
  onHideAll,
  onColorChange,
  readOnly = false,
  onRequireLogin,
}: CalendarCategoryFilterProps) {
  const selectableCalendars = calendars.filter((c) => !isHolidayCalendarOption(c))
  const selectableVisibleCount = selectableCalendars.filter((c) =>
    visibleIds.has(c.id),
  ).length
  
  const allVisible =
    selectableCalendars.length > 0 &&
    selectableVisibleCount === selectableCalendars.length
  const allHidden = selectableCalendars.length > 0 && selectableVisibleCount === 0
  const isMixed = !allVisible && !allHidden
  const [collapsed, setCollapsed] = React.useState(false)
  
  function toggleCollapsed() {
    setCollapsed((v) => !v)
  }
  
  return (
<div className="overflow-hidden rounded-widget border border-card-border bg-card">
  <div
    role="button"
    tabIndex={0}
    aria-expanded={!collapsed}
    aria-label={collapsed ? "캘린더 펼치기" : "캘린더 접기"}
    className="flex cursor-pointer items-center gap-2 px-4 py-3"
    onClick={toggleCollapsed}
    onKeyDown={(e) => {
      if (e.key !== "Enter" && e.key !== " ") return
      e.preventDefault()
      toggleCollapsed()
    }}
  >
    <span className="grid size-5 shrink-0 place-items-center text-muted-foreground">
      <ChevronDown
        className={cn(
          "size-3.5 transition-transform duration-200",
          collapsed && "-rotate-90",
        )}
      />
    </span>
    <CalendarDays className="size-4 text-theme" />
    <h3 className="text-sm font-semibold text-foreground">캘린더</h3>
    <span className="text-xs font-semibold text-muted-foreground">
      {calendars.length}
    </span>
    <div
      className="ml-auto inline-flex overflow-hidden rounded-full border border-border bg-background"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        onClick={() => {
          if (readOnly) {
            onRequireLogin?.()
            return
          }
          onShowAll()
        }}
        className={cn(
          "px-2.5 py-0.5 text-[10px] font-medium leading-5 transition-colors",
          "text-foreground hover:bg-muted/40",
          !isMixed && !allVisible && "bg-muted text-muted-foreground",
        )}
      >
        전체
      </button>

      <div className="w-px bg-border" />

      <button
        type="button"
        onClick={() => {
          if (readOnly) {
            onRequireLogin?.()
            return
          }
          onHideAll()
        }}
        className={cn(
          "px-2.5 py-0.5 text-[10px] font-medium leading-5 transition-colors",
          "text-foreground hover:bg-muted/40",
          !isMixed && !allHidden && "bg-muted text-muted-foreground",
        )}
      >
        숨김
      </button>
    </div>
  </div>

  <div
    className={cn(
      "grid transition-[grid-template-rows] duration-200 ease-out",
      collapsed ? "grid-rows-[0fr]" : "grid-rows-[1fr]",
    )}
  >
    <div className="min-h-0 overflow-hidden">
      <div className="px-4 pb-4">
      {calendars.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          연결된 Google 캘린더가 없습니다.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {calendars.map((c) => {
            const holiday = isHolidayCalendarOption(c)
            const checked = holiday ? true : visibleIds.has(c.id)
            return (
              <li key={c.id}>
                <div className="flex items-center gap-2 rounded-lg px-1 py-0.5 text-sm">
                  {!holiday && (
                    <Checkbox
                    checked={checked}
                    className="border-[var(--cal-color)] bg-transparent data-checked:border-[var(--cal-color)] data-checked:bg-[var(--cal-color)] data-checked:text-[var(--cal-fg)] dark:data-checked:bg-[var(--cal-color)]"
                    style={
                      {
                        "--cal-color": c.backgroundColor,
                        "--cal-fg": onColor(c.backgroundColor),
                      } as React.CSSProperties
                    }
                    onCheckedChange={() => {
                      if (readOnly) {
                        onRequireLogin?.()
                        return
                      }
                      onToggle(c.id)
                    }}
                  />
                )}
                {!holiday && (
                  <CalendarColorPicker
                    color={c.backgroundColor}
                    label={c.summary}
                    onChange={(color) => {
                      if (readOnly) {
                        onRequireLogin?.()
                        return
                      }
                      onColorChange(c.id, color)
                    }}
                  />
                )}
                  <span
                    className={cn(
                      "min-w-0 text-foreground",
                      !checked && "opacity-50",
                    )}
                  >
                    {c.summary}
                  </span>
                </div>
                </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
    </div>
  )
}