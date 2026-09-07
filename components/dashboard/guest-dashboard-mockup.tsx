"use client"

import { useMemo, useState } from "react"
import { AnniversaryWidget } from "@/components/dashboard/anniversary-widget"
import { BookmarkBoard } from "@/components/dashboard/bookmark-board"
import { CalendarCategoryFilter } from "@/components/dashboard/calendar-category-filter"
import { DashboardChrome } from "@/components/dashboard/dashboard-chrome"
import type { FolderPanelId } from "@/lib/dashboard-panel"
import { MainCalendar } from "@/components/dashboard/main-calendar"
import { PinBoard } from "@/components/dashboard/pin-board"
import { PomodoroTimer } from "@/components/dashboard/pomodoro-timer"
import { TodoBoard } from "@/components/dashboard/todo-board"
import { WeatherCard } from "@/components/dashboard/weather-card"
import {
  GUEST_DEMO_BOOKMARKS,
  GUEST_DEMO_BOOKMARK_FOLDERS,
  GUEST_DEMO_CALENDARS,
  GUEST_DEMO_PINS,
  GUEST_DEMO_TASKS,
  GUEST_DEMO_TODO_CATEGORIES,
  GUEST_DEMO_VISIBLE_IDS,
  GUEST_DEMO_WEATHER,
  buildGuestDemoData,
} from "@/lib/guest-demo-data"
import { DEFAULT_BANNER_COLOR } from "@/lib/dashboard-data"

const SCALE = 0.55
const noop = () => {}
const noopAsync = async () => {}

export function GuestDashboardMockup() {
  const [mainPanel, setMainPanel] = useState<FolderPanelId>("calendar")
  const demo = useMemo(() => buildGuestDemoData(), [])
  const [viewDate, setViewDate] = useState(demo.view)
  const [selectedDate, setSelectedDate] = useState(demo.selected)
  return (
    <div
      role="region"
      aria-label="대시보드 미리보기. 탭을 바꿔 캘린더·할 일·링크를 볼 수 있습니다. 저장되지 않습니다."
      className="relative w-full overflow-hidden rounded-xl border border-border/50 bg-background/40"
      style={{ height: `min(72vh, ${1080 * SCALE}px)` }}
    >
      <div
        className="origin-top-left"
        style={{
          width: `${100 / SCALE}%`,
          transform: `scale(${SCALE})`,
        }}
      >
        <DashboardChrome
          className="p-2"
          mainPanel={mainPanel}
          onMainPanelChange={setMainPanel}
          asideClassName="pointer-events-none"
          main={
            mainPanel === "calendar" ? (
              <MainCalendar
                events={demo.events}
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
            ) : mainPanel === "todo" ? (
              <TodoBoard
                tasks={GUEST_DEMO_TASKS}
                categories={GUEST_DEMO_TODO_CATEGORIES}
                onAdd={noop}
                onMove={noop}
                onRemove={noop}
                onAddCategory={noop}
                onRemoveCategory={noop}
                onUpdate={noop}
                onUpdateCategory={noop}
                flush
              />
            ) : (
              <BookmarkBoard
                items={GUEST_DEMO_BOOKMARKS}
                folders={GUEST_DEMO_BOOKMARK_FOLDERS}
                onAddFolder={noop}
                onUpdateFolder={noop}
                onRemoveFolder={noop}
                onAdd={noop}
                onUpdate={noop}
                onRemove={noop}
                flush
              />
            )
          }
          aside={
            <>
              <PinBoard
                pins={GUEST_DEMO_PINS}
                onAdd={noop}
                onUpdate={noop}
                onRemove={noop}
              />
              <CalendarCategoryFilter
                calendars={GUEST_DEMO_CALENDARS}
                visibleIds={GUEST_DEMO_VISIBLE_IDS}
                onToggle={noop}
                onShowAll={noop}
                onHideAll={noop}
                onColorChange={noop}
              />
              <WeatherCard
                location={GUEST_DEMO_WEATHER.location}
                temp={GUEST_DEMO_WEATHER.temp}
                high={GUEST_DEMO_WEATHER.high}
                low={GUEST_DEMO_WEATHER.low}
                desc={GUEST_DEMO_WEATHER.desc}
              />
              <AnniversaryWidget
                items={demo.anniversaries}
                onAdd={noop}
                onRemove={noop}
                onUpdate={noop}
              />
              <PomodoroTimer interactive={false} />
            </>
          }
        />
      </div>
    </div>
  )
}