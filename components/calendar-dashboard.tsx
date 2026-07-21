"use client"

import * as React from "react"

import {
  INITIAL_ANNIVERSARIES,
  INITIAL_BOARD_TASKS,
  INITIAL_EVENTS,
  INITIAL_MINI_TODOS,
  INITIAL_PINS,
  type Anniversary,
  type BoardTask,
  type CalendarEvent,
  type MiniTodo,
  type Pin,
  type TodoStatus,
} from "@/lib/dashboard-data"
import { TooltipProvider } from "@/components/ui/tooltip"
import { HeaderBanner } from "@/components/dashboard/header-banner"
import { PinBoard } from "@/components/dashboard/pin-board"
import { MainCalendar } from "@/components/dashboard/main-calendar"
import { WeatherWidget } from "@/components/dashboard/weather-widget"
import { MiniCalendar } from "@/components/dashboard/mini-calendar"
import { MiniTodoWidget } from "@/components/dashboard/mini-todo"
import { AnniversaryWidget } from "@/components/dashboard/anniversary-widget"
import { PomodoroTimer } from "@/components/dashboard/pomodoro-timer"
import { TodoBoard } from "@/components/dashboard/todo-board"

let idCounter = 0
const uid = (prefix: string) => `${prefix}-${Date.now()}-${idCounter++}`

const MOCK_USER = { name: "김하늘", email: "haneul.kim@gmail.com" }

export function CalendarDashboard() {
  const [user, setUser] = React.useState<typeof MOCK_USER | null>(null)
  const [events, setEvents] = React.useState<CalendarEvent[]>(INITIAL_EVENTS)
  const [pins, setPins] = React.useState<Pin[]>(INITIAL_PINS)
  const [miniTodos, setMiniTodos] =
    React.useState<MiniTodo[]>(INITIAL_MINI_TODOS)
  const [anniversaries, setAnniversaries] = React.useState<Anniversary[]>(
    INITIAL_ANNIVERSARIES,
  )
  const [boardTasks, setBoardTasks] =
    React.useState<BoardTask[]>(INITIAL_BOARD_TASKS)

  const [viewDate, setViewDate] = React.useState(() => new Date())
  const [selectedDate, setSelectedDate] = React.useState(() => new Date())

  // --- handlers ---
  const addEvent = (e: Omit<CalendarEvent, "id">) =>
    setEvents((prev) => [...prev, { ...e, id: uid("e") }])

  const addPin = (text: string) =>
    setPins((prev) => [...prev, { id: uid("p"), text }])
  const updatePin = (id: string, text: string) =>
    setPins((prev) => prev.map((p) => (p.id === id ? { ...p, text } : p)))
  const removePin = (id: string) =>
    setPins((prev) => prev.filter((p) => p.id !== id))

  const addMiniTodo = (text: string) =>
    setMiniTodos((prev) => [...prev, { id: uid("m"), text, done: false }])
  const toggleMiniTodo = (id: string) =>
    setMiniTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
    )
  const removeMiniTodo = (id: string) =>
    setMiniTodos((prev) => prev.filter((t) => t.id !== id))

  const addAnniversary = (item: Omit<Anniversary, "id">) =>
    setAnniversaries((prev) => [...prev, { ...item, id: uid("a") }])
  const removeAnniversary = (id: string) =>
    setAnniversaries((prev) => prev.filter((a) => a.id !== id))

  const addTask = (task: Omit<BoardTask, "id">) =>
    setBoardTasks((prev) => [...prev, { ...task, id: uid("t") }])
  const moveTask = (id: string, status: TodoStatus) =>
    setBoardTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status } : t)),
    )
  const removeTask = (id: string) =>
    setBoardTasks((prev) => prev.filter((t) => t.id !== id))

  const handleSelectDate = (d: Date) => {
    setSelectedDate(d)
    setViewDate(new Date(d.getFullYear(), d.getMonth(), 1))
  }

  return (
    <TooltipProvider delay={200}>
      <main className="mx-auto flex max-w-7xl flex-col gap-4 p-3 sm:p-4 md:p-6">
        <HeaderBanner
          user={user}
          onSignIn={() => setUser(MOCK_USER)}
          onSignOut={() => setUser(null)}
        />

        <PinBoard
          pins={pins}
          onAdd={addPin}
          onUpdate={updatePin}
          onRemove={removePin}
        />

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
          {/* Main column */}
          <div className="flex flex-col gap-4">
            <MainCalendar
              events={events}
              viewDate={viewDate}
              selectedDate={selectedDate}
              onViewDateChange={setViewDate}
              onSelectDate={setSelectedDate}
              onAddEvent={addEvent}
            />
            <TodoBoard
              tasks={boardTasks}
              onAdd={addTask}
              onMove={moveTask}
              onRemove={removeTask}
            />
          </div>

          {/* Sidebar */}
          <aside className="flex flex-col gap-4">
            <WeatherWidget />
            <div className="hidden lg:block">
              <MiniCalendar
                selectedDate={selectedDate}
                events={events}
                onSelectDate={handleSelectDate}
              />
            </div>
            <MiniTodoWidget
              todos={miniTodos}
              onAdd={addMiniTodo}
              onToggle={toggleMiniTodo}
              onRemove={removeMiniTodo}
            />
            <AnniversaryWidget
              items={anniversaries}
              onAdd={addAnniversary}
              onRemove={removeAnniversary}
            />
            <PomodoroTimer />
          </aside>
        </div>
      </main>
    </TooltipProvider>
  )
}
