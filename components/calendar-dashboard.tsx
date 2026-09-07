"use client"

import { HeaderBanner } from "@/components/dashboard/header-banner"
import { AnniversaryWidget } from "@/components/dashboard/anniversary-widget"
import { CalendarCategoryFilter } from "@/components/dashboard/calendar-category-filter"
import { DashboardChrome } from "@/components/dashboard/dashboard-chrome"
import { MainCalendar } from "@/components/dashboard/main-calendar"
import { MiniCalendar } from "@/components/dashboard/mini-calendar"
import { PinBoard } from "@/components/dashboard/pin-board"
import { PomodoroTimer } from "@/components/dashboard/pomodoro-timer"
import { TodoBoard } from "@/components/dashboard/todo-board"
import { WeatherWidget } from "@/components/dashboard/weather-widget"
import { BookmarkBoard } from "@/components/dashboard/bookmark-board"
import { TooltipProvider } from "@/components/ui/tooltip"
import { useCalendarDashboardModel } from "@/hooks/use-calendar-dashboard-model"
import { Skeleton } from "@/components/ui/skeleton"

export function CalendarDashboard() {
  const {
    DEFAULT_BANNER_COLOR,
    user,
    authReady,
    calendarConnected,
    calendars,
    visibleCalendarIds,
    eventsLoading,
    filteredEvents,
    selectedDate,
    viewDate,
    mainPanel,
    boardTasks,
    todoCategories,
    pins,
    bookmarks,
    bookmarkFolders,
    addBookmark,
    updateBookmark,
    removeBookmark,
    addBookmarkFolder,
    updateBookmarkFolder,
    removeBookmarkFolder,
    anniversaries,
    handleSignIn,
    handleSignOut,
    applyBanner,
    handleCalendarConnected,
    handleCalendarDisconnect,
    setViewDate,
    setSelectedDate,
    setMainPanel,
    addEvent,
    updateEvent,
    deleteEvent,
    addPin,
    updatePin,
    removePin,
    addTask,
    moveTask,
    removeTask,
    addTodoCategory,
    removeTodoCategory,
    updateTask,
    updateTodoCategory,
    handleLocationChange,
    handleSelectDate,
    toggleCalendarVisibility,
    changeCalendarColor,
    showAllCalendars,
    hideAllCalendars,
    addAnniversary,
    removeAnniversary,
    updateAnniversary,
  } = useCalendarDashboardModel()

  // --- 렌더 ---
  return (
    <TooltipProvider delay={200}>
      <div className="relative min-h-full overflow-x-hidden bg-background">
        {/* 페이지 상단 full-bleed 배너 → 고정메세지 즈음 투명화 */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[280px] sm:h-[340px] md:h-[400px]"
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={
              user?.banner_img_url
                ? {
                    backgroundImage: "var(--banner-img, none)",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }
                : {
                    background: `linear-gradient(to bottom, var(--banner-theme, ${DEFAULT_BANNER_COLOR}), var(--background))`,
                  }
            }
          />
          {user?.banner_img_url ? (
            <>
              <div className="absolute inset-0 bg-gradient-to-b from-transparent from-35% via-background/45 via-70% to-background" />
              <div className="absolute inset-0 bg-gradient-to-r from-background/40 via-transparent to-transparent" />
            </>
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent from-35% via-background/45 via-70% to-background" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/40 via-transparent to-transparent" />
        </div>

        <main
          className={
            authReady && !user
              ? "relative z-10 mx-auto flex min-w-0 max-w-7xl flex-col gap-2 p-3 sm:p-4"
              : "relative z-10 mx-auto flex min-w-0 max-w-7xl flex-col gap-4 p-3 sm:p-4 md:p-6"
          }
        >
          <HeaderBanner
            user={user}
            authReady={authReady}
            calendarConnected={calendarConnected}
            onSignIn={handleSignIn}
            onCalendarConnected={handleCalendarConnected}
            onSignOut={handleSignOut}
            onBannerChange={applyBanner}
            onCalendarDisconnected={handleCalendarDisconnect}
          />
          {authReady && !user ? null : (
          <DashboardChrome
            mainPanel={mainPanel}
            onMainPanelChange={setMainPanel}
            folderPanelClassName="order-1 lg:order-none"
            asideClassName="order-2 lg:sticky lg:top-4 lg:order-none"
            main={
              mainPanel === "calendar" ? (
                !authReady ||
                (user && eventsLoading && filteredEvents.length === 0) ? (
                  <div>
                    <Skeleton className="h-8 w-40" />
                    <Skeleton className="mt-4 h-72 bg-muted/40" />
                  </div>
                ) : (
                  <MainCalendar
                    events={filteredEvents}
                    viewDate={viewDate}
                    selectedDate={selectedDate}
                    onViewDateChange={setViewDate}
                    onSelectDate={setSelectedDate}
                    onAddEvent={addEvent}
                    onUpdateEvent={updateEvent}
                    onDeleteEvent={deleteEvent}
                    calendars={calendars}
                    themeColor={user?.theme_color ?? DEFAULT_BANNER_COLOR}
                    calendarConnected={calendarConnected}
                    isLoggedIn={Boolean(user)}
                    flush
                  />
                )
              ) : mainPanel === "todo" ? (
                <TodoBoard
                  tasks={boardTasks}
                  categories={todoCategories}
                  onAdd={addTask}
                  onMove={moveTask}
                  onRemove={removeTask}
                  onAddCategory={addTodoCategory}
                  onRemoveCategory={removeTodoCategory}
                  onUpdate={updateTask}
                  onUpdateCategory={updateTodoCategory}
                  flush
                />
              ) : (
                <BookmarkBoard
                  items={bookmarks}
                  folders={bookmarkFolders}
                  onAddFolder={addBookmarkFolder}
                  onUpdateFolder={updateBookmarkFolder}
                  onRemoveFolder={removeBookmarkFolder}
                  onAdd={addBookmark}
                  onUpdate={updateBookmark}
                  onRemove={removeBookmark}
                  flush
                />
              )
            }
            aside={
              <>
                {/* mobile: weather → pin → anniversary → filter → pomodoro */}
                <div className="order-20 lg:order-10">
                  <PinBoard
                    pins={pins}
                    onAdd={addPin}
                    onUpdate={updatePin}
                    onRemove={removePin}
                  />
                </div>
                <div className="hidden">
                  <div className="hidden lg:block">
                    <MiniCalendar
                      selectedDate={selectedDate}
                      events={filteredEvents}
                      onSelectDate={handleSelectDate}
                    />
                  </div>
                </div>
                <div
                  className={
                    mainPanel === "calendar"
                      ? "order-40 lg:order-20"
                      : "hidden"
                  }
                >
                  <CalendarCategoryFilter
                    calendars={calendars}
                    visibleIds={visibleCalendarIds}
                    onToggle={toggleCalendarVisibility}
                    onShowAll={showAllCalendars}
                    onHideAll={hideAllCalendars}
                    onColorChange={changeCalendarColor}
                  />
                </div>
                <div className="order-10 lg:order-30">
                  <WeatherWidget
                    isLoggedIn={Boolean(user)}
                    location={user?.location ?? "서울"}
                    onLocationChange={handleLocationChange}
                    onUnauthorized={handleSignOut}
                  />
                </div>
                <div className="order-30 lg:order-40">
                  <AnniversaryWidget
                    items={anniversaries}
                    onAdd={addAnniversary}
                    onRemove={removeAnniversary}
                    onUpdate={updateAnniversary}
                  />
                </div>
                <div className="order-50 lg:order-50">
                  <PomodoroTimer />
                </div>
              </>
            }
          />
        )}
        </main>
      </div>
    </TooltipProvider>
  )
}
