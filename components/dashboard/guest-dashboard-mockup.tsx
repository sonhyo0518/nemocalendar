"use client"

import { useMemo, useState } from "react"
import { AnniversaryWidget } from "@/components/dashboard/anniversary-widget"
import { CalendarCategoryFilter } from "@/components/dashboard/calendar-category-filter"
import { FolderPanel } from "@/components/dashboard/folder-panel"
import { MainCalendar } from "@/components/dashboard/main-calendar"
import { PinBoard } from "@/components/dashboard/pin-board"
import { PomodoroTimer } from "@/components/dashboard/pomodoro-timer"
import { WeatherWidget } from "@/components/dashboard/weather-widget"
import {
  GUEST_DEMO_ANNIVERSARIES,
  GUEST_DEMO_CALENDARS,
  GUEST_DEMO_EVENTS,
  GUEST_DEMO_PINS,
  GUEST_DEMO_SELECTED,
  GUEST_DEMO_VIEW,
} from "@/lib/guest-demo-data"
import { DEFAULT_BANNER_COLOR } from "@/lib/dashboard-data"

const SCALE = 0.55

const noop = () => {}
const noopAsync = async () => {}

export function GuestDashboardMockup() {
  const [viewDate, setViewDate] = useState(GUEST_DEMO_VIEW)
  const [selectedDate, setSelectedDate] = useState(GUEST_DEMO_SELECTED)
  const visibleIds = useMemo(
    () => new Set(GUEST_DEMO_CALENDARS.map((c) => c.id)),
    [],
  )

  return (
    <div
      aria-hidden
      className="relative w-full overflow-hidden rounded-xl border border-border/50 bg-background/40"
      // scale 후에도 레이아웃 높이가 맞게: 대략 콘텐츠 높이 * SCALE
      style={{ height: `min(72vh, ${1080 * SCALE}px)` }}
    >
      <div
        className="origin-top-left pointer-events-none"
        style={{
          width: `${100 / SCALE}%`,
          transform: `scale(${SCALE})`,
        }}
      >
        <div className="grid gap-4 p-2 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start">
          <FolderPanel value="calendar" onValueChange={noop}>
            <MainCalendar
              events={GUEST_DEMO_EVENTS}
              viewDate={viewDate}
              selectedDate={selectedDate}
              onViewDateChange={setViewDate}
              onSelectDate={setSelectedDate}
              onAddEvent={noopAsync}
              onUpdateEvent={noopAsync}
              onDeleteEvent={noopAsync}
              calendars={GUEST_DEMO_CALENDARS}
              themeColor={DEFAULT_BANNER_COLOR}
              calendarConnected={false}
              isLoggedIn={false}
              flush
            />
          </FolderPanel>

          <aside className="flex flex-col gap-4 lg:pt-10">
            <PinBoard
              pins={GUEST_DEMO_PINS}
              onAdd={noop}
              onUpdate={noop}
              onRemove={noop}
            />
            <CalendarCategoryFilter
              calendars={GUEST_DEMO_CALENDARS}
              visibleIds={visibleIds}
              onToggle={noop}
              onShowAll={noop}
              onHideAll={noop}
              onColorChange={noop}
            />
            <WeatherWidget isLoggedIn={false} location="서울" />
            <AnniversaryWidget
              items={GUEST_DEMO_ANNIVERSARIES}
              onAdd={noop}
              onRemove={noop}
              onUpdate={noop}
            />
            <PomodoroTimer />
          </aside>
        </div>
      </div>
    </div>
  )
}