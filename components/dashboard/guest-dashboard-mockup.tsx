"use client"

import { useLayoutEffect, useMemo, useRef, useState } from "react"
import { AnniversaryWidget } from "@/components/dashboard/anniversary-widget"
import { BookmarkBoard } from "@/components/dashboard/bookmark-board"
import { CalendarCategoryFilter } from "@/components/dashboard/calendar-category-filter"
import { DashboardChrome } from "@/components/dashboard/dashboard-chrome"
import { MainCalendar } from "@/components/dashboard/main-calendar"
import { PinBoard } from "@/components/dashboard/pin-board"
import { PomodoroTimer } from "@/components/dashboard/pomodoro-timer"
import { TodoBoard } from "@/components/dashboard/todo-board"
import { WeatherCard } from "@/components/dashboard/weather-card"
import { useMainPanel } from "@/hooks/use-main-panel"
import { toast } from "sonner"
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

const GUEST_GATE_MSG =
  "미리보기에서는 저장되지 않아요. Google 로그인 후 이용할 수 있습니다."

type GuestDashboardMockupProps = {
  onRequireLogin?: () => void
}

export function GuestDashboardMockup({
  onRequireLogin,
}: GuestDashboardMockupProps = {}) {
  const { mainPanel, setMainPanel } = useMainPanel()
  const demo = useMemo(() => buildGuestDemoData(), [])
  const [viewDate, setViewDate] = useState(demo.view)
  const [selectedDate, setSelectedDate] = useState(demo.selected)
  
  const contentRef = useRef<HTMLDivElement>(null)
  const [contentHeight, setContentHeight] = useState(0)
  
  useLayoutEffect(() => {
    const el = contentRef.current
    if (!el) return
  
    const measure = () => setContentHeight(el.offsetHeight)
    measure()
  
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [mainPanel])
  
  function gate() {
    toast.message(GUEST_GATE_MSG, {
      action: {
        label: "로그인",
        onClick: () => onRequireLogin?.(),
      },
    })
    onRequireLogin?.()
  }
  
  return (
    <div
      role="region"
      aria-label="대시보드 미리보기. 탭을 바꿔 캘린더·할 일·링크를 볼 수 있습니다. 저장되지 않습니다."
      className="flex w-full flex-col overflow-hidden rounded-xl border border-dashed border-border bg-background/40"
    >
      <div className="flex shrink-0 items-center border-b border-border/60 bg-muted/30 px-3 py-2">
        <span className="text-xs font-medium text-muted-foreground">
          미리보기
        </span>
      </div>
  
      <div className="relative w-full overflow-hidden">
        <div
          ref={contentRef}
          className="origin-top-left"
          style={{
            width: `${100 / SCALE}%`,
            transform: `scale(${SCALE})`,
            marginBottom:
              contentHeight > 0 ? contentHeight * (SCALE - 1) : undefined,
          }}
        >
          <DashboardChrome
            className="p-2"
            mainPanel={mainPanel}
            onMainPanelChange={setMainPanel}
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
                  onRequireLogin={gate}
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
                  readOnly
                  onRequireLogin={gate}
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
                  readOnly
                  onRequireLogin={gate}
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
                  readOnly
                  onRequireLogin={gate}
                />
                <CalendarCategoryFilter
                  calendars={GUEST_DEMO_CALENDARS}
                  visibleIds={GUEST_DEMO_VISIBLE_IDS}
                  onToggle={noop}
                  onShowAll={noop}
                  onHideAll={noop}
                  onColorChange={noop}
                  readOnly
                  onRequireLogin={gate}
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
                  readOnly
                  onRequireLogin={gate}
                />
              <PomodoroTimer interactive={false} onRequireLogin={gate} />
            </>
          }
        />
        </div>
      </div>
    </div>
  )
}