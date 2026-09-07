import {
  daysUntil,
  type BoardTask,
  type TodoPriority,
  type TodoStatus,
} from "@/lib/dashboard-data"

export type TodoViewMode = "today" | "all"

const PRIORITY_RANK: Record<TodoPriority, number> = {
  high: 0,
  medium: 1,
  low: 2,
}

const STATUS_RANK: Record<TodoStatus, number> = {
  "in-progress": 0,
  todo: 1,
  done: 2,
}

export function isOverdue(task: BoardTask): boolean {
  if (!task.due || task.status === "done") return false
  return daysUntil(task.due) < 0
}

export function isDueToday(task: BoardTask): boolean {
  if (!task.due || task.status === "done") return false
  return daysUntil(task.due) === 0
}

/** 오늘 뷰: 마감이 오늘이거나 지연인 미완료 할 일 */
export function isTodayFocusTask(task: BoardTask): boolean {
  if (task.status === "done") return false
  if (!task.due) return false
  return daysUntil(task.due) <= 0
}

export function filterTodayTasks(tasks: BoardTask[]): BoardTask[] {
  return sortTasks(tasks.filter(isTodayFocusTask))
}

export function sortTasks(tasks: BoardTask[]): BoardTask[] {
  return [...tasks].sort((a, b) => {
    const aDone = a.status === "done" ? 1 : 0
    const bDone = b.status === "done" ? 1 : 0
    if (aDone !== bDone) return aDone - bDone

    const aDue = a.due ? daysUntil(a.due) : Number.POSITIVE_INFINITY
    const bDue = b.due ? daysUntil(b.due) : Number.POSITIVE_INFINITY
    if (aDue !== bDue) return aDue - bDue

    const pr = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]
    if (pr !== 0) return pr

    return STATUS_RANK[a.status] - STATUS_RANK[b.status]
  })
}

export function splitActiveAndDone(tasks: BoardTask[]): {
  active: BoardTask[]
  done: BoardTask[]
} {
  const sorted = sortTasks(tasks)
  return {
    active: sorted.filter((t) => t.status !== "done"),
    done: sorted.filter((t) => t.status === "done"),
  }
}

export function summarizeTasks(tasks: BoardTask[]) {
  let today = 0
  let overdue = 0
  let inProgress = 0
  for (const task of tasks) {
    if (task.status === "done") continue
    if (isDueToday(task)) today += 1
    if (isOverdue(task)) overdue += 1
    if (task.status === "in-progress") inProgress += 1
  }
  return { today, overdue, inProgress }
}

export function formatDueLabel(due: string): {
  text: string
  tone: "muted" | "today" | "overdue"
} {
  const dleft = daysUntil(due)
  if (dleft < 0) {
    return { text: `지연 · D+${Math.abs(dleft)}`, tone: "overdue" }
  }
  if (dleft === 0) {
    return { text: "오늘", tone: "today" }
  }
  if (dleft === 1) {
    return { text: "내일", tone: "muted" }
  }
  return { text: `${due.slice(5)} · D-${dleft}`, tone: "muted" }
}

export function nextStatusOnCheck(
  current: TodoStatus,
  checked: boolean,
): TodoStatus {
  if (checked) return "done"
  return current === "done" ? "todo" : current
}
