import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import type { BoardTask } from "@/lib/dashboard-data"
import {
  filterTodayTasks,
  formatDueLabel,
  isOverdue,
  isTodayFocusTask,
  nextStatusOnCheck,
  sortTasks,
  summarizeTasks,
} from "@/lib/todo-view"

function task(partial: Partial<BoardTask> & Pick<BoardTask, "id" | "title">): BoardTask {
  return {
    categoryId: "c1",
    due: "",
    status: "todo",
    priority: "medium",
    ...partial,
  }
}

describe("todo-view", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 9, 11, 12, 0, 0)) // 2026-10-11 local
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("isOverdue / isTodayFocusTask / filterTodayTasks", () => {
    const overdue = task({ id: "1", title: "a", due: "2026-10-10" })
    const today = task({ id: "2", title: "b", due: "2026-10-11" })
    const future = task({ id: "3", title: "c", due: "2026-10-12" })
    const done = task({
      id: "4",
      title: "d",
      due: "2026-10-10",
      status: "done",
    })
    const futureInProgress = task({
      id: "5",
      title: "e",
      due: "2026-10-12",
      status: "in-progress",
    })
    const noDue = task({ id: "6", title: "f", due: "" })
    const noDueInProgress = task({
      id: "7",
      title: "g",
      due: "",
      status: "in-progress",
    })
  
    expect(isOverdue(overdue)).toBe(true)
    expect(isOverdue(today)).toBe(false)
    expect(isOverdue(done)).toBe(false)
  
    expect(isTodayFocusTask(overdue)).toBe(true)
    expect(isTodayFocusTask(today)).toBe(true)
    expect(isTodayFocusTask(future)).toBe(false)
    expect(isTodayFocusTask(done)).toBe(false)
    expect(isTodayFocusTask(futureInProgress)).toBe(true)
    expect(isTodayFocusTask(noDue)).toBe(true)
    expect(isTodayFocusTask(noDueInProgress)).toBe(true)
  
    const focus = filterTodayTasks([
      overdue,
      today,
      future,
      done,
      futureInProgress,
      noDue,
      noDueInProgress,
    ])
    // sort: due 없는 항목은 뒤로, due 오름차순 → 1,2,5,6,7
    expect(focus.map((t) => t.id)).toEqual(["1", "2", "5", "7", "6"])
  })

  it("sortTasks: active before done, then due, then priority", () => {
    const sorted = sortTasks([
      task({ id: "low", title: "l", due: "2026-10-11", priority: "low" }),
      task({ id: "high", title: "h", due: "2026-10-11", priority: "high" }),
      task({
        id: "done",
        title: "d",
        due: "2026-10-11",
        status: "done",
        priority: "high",
      }),
    ])
    expect(sorted.map((t) => t.id)).toEqual(["high", "low", "done"])
  })

  it("summarizeTasks and formatDueLabel", () => {
    const summary = summarizeTasks([
      task({ id: "1", title: "a", due: "2026-10-11" }),
      task({ id: "2", title: "b", due: "2026-10-10" }),
      task({
        id: "3",
        title: "c",
        due: "2026-10-11",
        status: "in-progress",
      }),
      task({ id: "4", title: "d", due: "" }),
      task({
        id: "5",
        title: "e",
        due: "2026-10-20",
        status: "todo",
      }),
    ])
    // 포커스: 1·2·3·4 (미래 마감 todo인 5 제외)
    expect(summary).toEqual({ today: 4, overdue: 1, inProgress: 1 })

    expect(formatDueLabel("2026-10-10").tone).toBe("overdue")
    expect(formatDueLabel("2026-10-11")).toEqual({
      text: "오늘",
      tone: "today",
    })
  })

  it("nextStatusOnCheck", () => {
    expect(nextStatusOnCheck("todo", true)).toBe("done")
    expect(nextStatusOnCheck("done", false)).toBe("todo")
    expect(nextStatusOnCheck("in-progress", false)).toBe("in-progress")
  })
})