"use client"

import * as React from "react"
import { useCallback, useState } from "react"

import { DEFAULT_BANNER_COLOR } from "@/lib/dashboard-data"
import { notifyApiError } from "@/lib/api"
import type { FolderPanelId } from "@/lib/dashboard-panel"
import { useAuthSession } from "@/hooks/use-auth-session"
import { useCalendarEvents } from "@/hooks/use-calendar-events"
import { useDashboardWidgets } from "@/hooks/use-dashboard-widgets"

export function useCalendarDashboardModel() {
  const calendarApiRef = React.useRef<{
    resetCalendarState: (email?: string) => void
  }>({ resetCalendarState: () => {} })

  const widgetsApiRef = React.useRef<{
    resetWidgetsState: () => void
  }>({ resetWidgetsState: () => {} })

  const [mainPanel, setMainPanel] = useState<FolderPanelId>("calendar")

  const resetDashboardOnSignOut = useCallback((email?: string) => {
    calendarApiRef.current.resetCalendarState(email)
    widgetsApiRef.current.resetWidgetsState()
  }, [])

  const {
    user,
    authReady,
    calendarConnected,
    setCalendarConnected,
    handleSignIn,
    handleSignOut,
    applyBanner,
    handleLocationChange,
    markCalendarConnected,
    disconnectCalendar,
  } = useAuthSession({ onSignedOut: resetDashboardOnSignOut })

  const calendar = useCalendarEvents({
    userEmail: user?.email,
    calendarConnected,
    setCalendarConnected,
    onUnauthorized: handleSignOut,
  })

  const widgets = useDashboardWidgets({
    userEmail: user?.email,
    onUnauthorized: handleSignOut,
  })

  React.useEffect(() => {
    calendarApiRef.current.resetCalendarState = calendar.resetCalendarState
    widgetsApiRef.current.resetWidgetsState = widgets.resetWidgetsState
  }, [calendar.resetCalendarState, widgets.resetWidgetsState])

  const handleCalendarConnected = () => {
    markCalendarConnected()
    calendar.invalidateEventsReload()
  }
  
  const handleCalendarDisconnect = async () => {
    if (!window.confirm("Google 캘린더 연결을 해제할까요?")) return
    try {
      await disconnectCalendar(handleSignOut)
      calendar.resetCalendarState(user?.email)
      calendar.invalidateEventsReload()
    } catch (err) {
      notifyApiError(err, "캘린더 연결 해제에 실패했습니다.")
    }
  }

  return {
    DEFAULT_BANNER_COLOR,
    user,
    authReady,
    calendarConnected,
    calendars: calendar.calendars,
    visibleCalendarIds: calendar.visibleCalendarIds,
    eventsLoading: calendar.eventsLoading,
    filteredEvents: calendar.filteredEvents,
    selectedDate: calendar.selectedDate,
    viewDate: calendar.viewDate,
    mainPanel,
    boardTasks: widgets.boardTasks,
    todoCategories: widgets.todoCategories,
    pins: widgets.pins,
    bookmarks: widgets.bookmarks,
    bookmarkFolders: widgets.bookmarkFolders,
    anniversaries: widgets.anniversaries,
    handleSignIn,
    handleSignOut,
    applyBanner,
    setCalendarConnected,
    handleCalendarConnected,
    handleCalendarDisconnect,
    setViewDate: calendar.setViewDate,
    setSelectedDate: calendar.setSelectedDate,
    setMainPanel,
    addEvent: calendar.addEvent,
    updateEvent: calendar.updateEvent,
    deleteEvent: calendar.deleteEvent,
    addPin: widgets.addPin,
    updatePin: widgets.updatePin,
    removePin: widgets.removePin,
    addBookmark: widgets.addBookmark,
    updateBookmark: widgets.updateBookmark,
    removeBookmark: widgets.removeBookmark,
    addTask: widgets.addTask,
    moveTask: widgets.moveTask,
    removeTask: widgets.removeTask,
    addTodoCategory: widgets.addTodoCategory,
    removeTodoCategory: widgets.removeTodoCategory,
    updateTask: widgets.updateTask,
    updateTodoCategory: widgets.updateTodoCategory,
    handleLocationChange,
    handleSelectDate: calendar.handleSelectDate,
    toggleCalendarVisibility: calendar.toggleCalendarVisibility,
    changeCalendarColor: calendar.changeCalendarColor,
    showAllCalendars: calendar.showAllCalendars,
    hideAllCalendars: calendar.hideAllCalendars,
    addAnniversary: widgets.addAnniversary,
    removeAnniversary: widgets.removeAnniversary,
    updateAnniversary: widgets.updateAnniversary,
    addBookmarkFolder: widgets.addBookmarkFolder,
    updateBookmarkFolder: widgets.updateBookmarkFolder,
    removeBookmarkFolder: widgets.removeBookmarkFolder,
  }
}
