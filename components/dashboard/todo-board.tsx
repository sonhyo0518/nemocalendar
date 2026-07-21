"use client"

import * as React from "react"
import { CalendarClock, LayoutGrid, Plus } from "lucide-react"

import {
  CATEGORY_META,
  PRIORITY_META,
  STATUS_META,
  daysUntil,
  type BoardTask,
  type EventCategory,
  type TodoPriority,
  type TodoStatus,
} from "@/lib/dashboard-data"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

interface TodoBoardProps {
  tasks: BoardTask[]
  onAdd: (task: Omit<BoardTask, "id">) => void
  onMove: (id: string, status: TodoStatus) => void
  onRemove: (id: string) => void
}

const STATUSES: TodoStatus[] = ["todo", "in-progress", "done"]
const CATEGORIES = Object.keys(CATEGORY_META) as EventCategory[]
const PRIORITIES = Object.keys(PRIORITY_META) as TodoPriority[]

const STATUS_ACCENT: Record<TodoStatus, string> = {
  todo: "bg-muted-foreground/40",
  "in-progress": "bg-[var(--event-amber)]",
  done: "bg-[var(--event-green)]",
}

export function TodoBoard({ tasks, onAdd, onMove, onRemove }: TodoBoardProps) {
  const [filter, setFilter] = React.useState<EventCategory | "all">("all")
  const [dragId, setDragId] = React.useState<string | null>(null)
  const [overCol, setOverCol] = React.useState<TodoStatus | null>(null)
  const [open, setOpen] = React.useState(false)

  const [title, setTitle] = React.useState("")
  const [category, setCategory] = React.useState<EventCategory>("work")
  const [priority, setPriority] = React.useState<TodoPriority>("medium")
  const [due, setDue] = React.useState("")
  const [status, setStatus] = React.useState<TodoStatus>("todo")

  const visible =
    filter === "all" ? tasks : tasks.filter((t) => t.category === filter)

  function submit() {
    if (!title.trim()) return
    onAdd({
      title: title.trim(),
      category,
      priority,
      due: due || undefined,
      status,
    })
    setTitle("")
    setDue("")
    setOpen(false)
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <LayoutGrid className="size-4 text-primary" />
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            할 일 보드
          </h2>
        </div>
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus data-icon="inline-start" />새 할 일
        </Button>
      </div>

      <div className="mb-4 flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => setFilter("all")}
          className={cn(
            "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
            filter === "all"
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border text-muted-foreground hover:bg-muted",
          )}
        >
          전체
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setFilter(c)}
            className={cn(
              "flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              filter === c
                ? "border-transparent text-primary-foreground"
                : "border-border text-muted-foreground hover:bg-muted",
            )}
            style={
              filter === c
                ? { backgroundColor: CATEGORY_META[c].token }
                : undefined
            }
          >
            <span
              className="size-1.5 rounded-full"
              style={{ backgroundColor: CATEGORY_META[c].token }}
            />
            {CATEGORY_META[c].label}
          </button>
        ))}
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {STATUSES.map((col) => {
          const colTasks = visible.filter((t) => t.status === col)
          return (
            <div
              key={col}
              onDragOver={(e) => {
                e.preventDefault()
                setOverCol(col)
              }}
              onDragLeave={() => setOverCol((c) => (c === col ? null : c))}
              onDrop={() => {
                if (dragId) onMove(dragId, col)
                setDragId(null)
                setOverCol(null)
              }}
              className={cn(
                "flex flex-col gap-2 rounded-xl border border-border bg-secondary/40 p-2.5 transition-colors",
                overCol === col && "border-primary/50 bg-primary/5",
              )}
            >
              <div className="flex items-center gap-2 px-1 py-1">
                <span
                  className={cn("size-2 rounded-full", STATUS_ACCENT[col])}
                />
                <span className="text-sm font-medium text-foreground">
                  {STATUS_META[col].label}
                </span>
                <span className="ml-auto rounded-full bg-background px-1.5 text-xs text-muted-foreground">
                  {colTasks.length}
                </span>
              </div>

              <div className="flex min-h-[80px] flex-col gap-2">
                {colTasks.map((task) => {
                  const dleft = task.due ? daysUntil(task.due) : null
                  return (
                    <article
                      key={task.id}
                      draggable
                      onDragStart={() => setDragId(task.id)}
                      onDragEnd={() => {
                        setDragId(null)
                        setOverCol(null)
                      }}
                      className={cn(
                        "group cursor-grab rounded-lg border border-border bg-card p-3 shadow-sm transition-all active:cursor-grabbing",
                        dragId === task.id && "opacity-50",
                      )}
                    >
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <p
                          className={cn(
                            "text-sm font-medium text-foreground",
                            col === "done" && "text-muted-foreground line-through",
                          )}
                        >
                          {task.title}
                        </p>
                        <button
                          type="button"
                          aria-label="삭제"
                          onClick={() => onRemove(task.id)}
                          className="shrink-0 text-xs text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                        >
                          삭제
                        </button>
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span
                          className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium"
                          style={{
                            backgroundColor: `color-mix(in oklch, ${CATEGORY_META[task.category].token} 14%, transparent)`,
                            color: CATEGORY_META[task.category].token,
                          }}
                        >
                          {CATEGORY_META[task.category].label}
                        </span>
                        <Badge
                          variant="secondary"
                          className={PRIORITY_META[task.priority].className}
                        >
                          {PRIORITY_META[task.priority].label}
                        </Badge>
                        {task.due && (
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 text-[11px] tabular-nums",
                              dleft !== null && dleft < 0
                                ? "text-destructive"
                                : "text-muted-foreground",
                            )}
                          >
                            <CalendarClock className="size-3" />
                            {task.due.slice(5)}
                            {dleft !== null &&
                              ` · ${dleft === 0 ? "오늘" : dleft > 0 ? `D-${dleft}` : `D+${Math.abs(dleft)}`}`}
                          </span>
                        )}
                      </div>
                    </article>
                  )
                })}
                {colTasks.length === 0 && (
                  <p className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-border py-6 text-center text-xs text-muted-foreground">
                    여기로 카드를 끌어오세요
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>새 할 일 추가</DialogTitle>
            <DialogDescription>
              보드에 추가할 할 일의 정보를 입력하세요.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="task-title">제목</Label>
              <Input
                id="task-title"
                autoFocus
                value={title}
                placeholder="할 일 제목"
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.nativeEvent.isComposing) submit()
                }}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="task-due">마감일</Label>
                <Input
                  id="task-due"
                  type="date"
                  value={due}
                  onChange={(e) => setDue(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>상태</Label>
                <div className="flex gap-1">
                  {STATUSES.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setStatus(s)}
                      className={cn(
                        "flex-1 rounded-md border px-1 py-1.5 text-[11px] font-medium transition-colors",
                        status === s
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border text-muted-foreground hover:bg-muted",
                      )}
                    >
                      {STATUS_META[s].label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>카테고리</Label>
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCategory(c)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
                      category === c
                        ? "border-transparent text-primary-foreground"
                        : "border-border text-muted-foreground hover:bg-muted",
                    )}
                    style={
                      category === c
                        ? { backgroundColor: CATEGORY_META[c].token }
                        : undefined
                    }
                  >
                    <span
                      className="size-1.5 rounded-full"
                      style={{ backgroundColor: CATEGORY_META[c].token }}
                    />
                    {CATEGORY_META[c].label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>우선순위</Label>
              <div className="flex gap-1.5">
                {PRIORITIES.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={cn(
                      "flex-1 rounded-md border px-2 py-1.5 text-xs font-medium transition-colors",
                      priority === p
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:bg-muted",
                    )}
                  >
                    {PRIORITY_META[p].label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="ghost">취소</Button>} />
            <Button onClick={submit} disabled={!title.trim()}>
              추가하기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  )
}
