"use client"

import * as React from "react"
import {
  CalendarClock,
  ChevronDown,
  LayoutGrid,
  MoreHorizontal,
  Pencil,
  Plus,
  Settings2,
  X,
} from "lucide-react"

import {
  PRIORITY_META,
  STATUS_META,
  type BoardTask,
  type TodoCategory,
  type TodoPriority,
  type TodoStatus,
} from "@/lib/dashboard-data"
import {
  filterTodayTasks,
  formatDueLabel,
  nextStatusOnCheck,
  sortTasks,
  splitActiveAndDone,
  summarizeTasks,
  type TodoViewMode,
} from "@/lib/todo-view"
import { TODO_CATEGORY_COLOR_PRESETS as COLOR_PRESETS } from "@/lib/color-presets"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface TodoBoardProps {
  tasks: BoardTask[]
  categories: TodoCategory[]
  onAdd: (task: Omit<BoardTask, "id">) => void
  onMove: (id: string, status: TodoStatus) => void
  onRemove: (id: string) => void
  onAddCategory: (input: { name: string; color: string }) => void
  onRemoveCategory: (id: string) => void
  onUpdate: (id: string, task: Omit<BoardTask, "id">) => void
  onUpdateCategory: (id: string, input: { name: string; color: string }) => void
  flush?: boolean
}

const STATUSES: TodoStatus[] = ["todo", "in-progress", "done"]
const PRIORITIES = Object.keys(PRIORITY_META) as TodoPriority[]
const VIEW_MODES: { id: TodoViewMode; label: string }[] = [
  { id: "today", label: "오늘" },
  { id: "all", label: "전체" },
]

export function TodoBoard({
  tasks,
  categories,
  onAdd,
  onMove,
  onRemove,
  onAddCategory,
  onRemoveCategory,
  onUpdate,
  onUpdateCategory,
  flush = false,
}: TodoBoardProps) {
  const [viewMode, setViewMode] = React.useState<TodoViewMode>("today")
  const [visibleCategoryIds, setVisibleCategoryIds] = React.useState<Set<string>>(
    () => new Set(),
  )
  const [categoryId, setCategoryId] = React.useState("")
  const [catOpen, setCatOpen] = React.useState(false)
  const [editingCategoryId, setEditingCategoryId] = React.useState<string | null>(
    null,
  )
  const [catName, setCatName] = React.useState("")
  const [catColor, setCatColor] = React.useState<string>(COLOR_PRESETS[0])

  const [collapsedIds, setCollapsedIds] = React.useState<Set<string>>(
    () => new Set(),
  )
  const [doneCollapsedIds, setDoneCollapsedIds] = React.useState<Set<string>>(
    () => new Set(),
  )
  const [open, setOpen] = React.useState(false)
  const [editingId, setEditingId] = React.useState<string | null>(null)

  const [title, setTitle] = React.useState("")
  const [priority, setPriority] = React.useState<TodoPriority>("medium")
  const [due, setDue] = React.useState("")
  const [status, setStatus] = React.useState<TodoStatus>("todo")

  React.useEffect(() => {
    const ids = categories.map((c) => c.id)
    queueMicrotask(() => {
      setVisibleCategoryIds((prev) => {
        if (prev.size === 0 && ids.length > 0) return new Set(ids)
        const kept = ids.filter((id) => prev.has(id))
        const added = ids.filter((id) => !prev.has(id))
        return new Set([...kept, ...added])
      })
      setDoneCollapsedIds((prev) => {
        if (prev.size > 0) return prev
        return new Set(ids)
      })
    })
  }, [categories])

  const summary = summarizeTasks(tasks)
  const todayTasks = filterTodayTasks(tasks)
  const visibleCats = categories.filter((c) => visibleCategoryIds.has(c.id))
  const categoryById = new Map(categories.map((c) => [c.id, c]))

  function openComposer(prefillCategoryId?: string) {
    setEditingId(null)
    setTitle("")
    setDue(viewMode === "today" ? new Date().toISOString().slice(0, 10) : "")
    setStatus("todo")
    setPriority("medium")
    setCategoryId(prefillCategoryId ?? categories[0]?.id ?? "")
    setOpen(true)
  }

  function openEditor(task: BoardTask) {
    setEditingId(task.id)
    setTitle(task.title)
    setCategoryId(task.categoryId)
    setPriority(task.priority)
    setDue(task.due ?? "")
    setStatus(task.status)
    setOpen(true)
  }

  function submit() {
    if (!title.trim() || !categoryId) return
    const payload = {
      title: title.trim(),
      categoryId,
      priority,
      due: due || undefined,
      status,
    }
    if (editingId) onUpdate(editingId, payload)
    else onAdd(payload)

    setTitle("")
    setDue("")
    setEditingId(null)
    setOpen(false)
  }

  function commitCategory() {
    if (!catName.trim()) return
    const payload = { name: catName.trim(), color: catColor }
    if (editingCategoryId) onUpdateCategory(editingCategoryId, payload)
    else onAddCategory(payload)
    setCatName("")
    setEditingCategoryId(null)
    setCatOpen(false)
  }

  function toggleCategoryVisibility(id: string) {
    setVisibleCategoryIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleCollapsed(id: string) {
    setCollapsedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <section
      className={cn(
        flush
          ? "p-0"
          : "rounded-panel border border-card-border bg-card p-4 sm:p-5",
      )}
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <LayoutGrid className="size-4 text-theme" />
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            할 일
          </h2>
          <div
            role="tablist"
            aria-label="할 일 보기"
            className="ml-1 inline-flex rounded-md border border-border p-0.5"
          >
            {VIEW_MODES.map((mode) => (
              <button
                key={mode.id}
                type="button"
                role="tab"
                aria-selected={viewMode === mode.id}
                onClick={() => setViewMode(mode.id)}
                className={cn(
                  "rounded-[5px] px-2.5 py-1 text-xs font-medium transition-colors",
                  viewMode === mode.id
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>

        <Button size="sm" variant="outline" onClick={() => openComposer()}>
          <Plus data-icon="inline-start" />새 할 일
        </Button>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
        <button
          type="button"
          className="hover:text-foreground"
          onClick={() => setViewMode("today")}
        >
          오늘{" "}
          <span className="font-semibold tabular-nums text-foreground">
            {summary.today}
          </span>
        </button>
        <span aria-hidden className="text-border">
          ·
        </span>
        <button
          type="button"
          className={cn(
            "hover:text-foreground",
            summary.overdue > 0 && "text-destructive hover:text-destructive",
          )}
          onClick={() => setViewMode("today")}
        >
          지연{" "}
          <span className="font-semibold tabular-nums">
            {summary.overdue}
          </span>
        </button>
        <span aria-hidden className="text-border">
          ·
        </span>
        <span>
          진행{" "}
          <span className="font-semibold tabular-nums text-foreground">
            {summary.inProgress}
          </span>
        </span>
      </div>

      {viewMode === "all" && (
        <div className="mb-4 flex items-center gap-2">
          <div className="-mx-1 flex min-w-0 flex-1 gap-1.5 overflow-x-auto px-1 pb-0.5">
            {categories.map((cat) => {
              const active = visibleCategoryIds.has(cat.id)
              return (
                <button
                  key={cat.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggleCategoryVisibility(cat.id)}
                  className={cn(
                    "inline-flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                    active
                      ? "bg-foreground/5 text-foreground ring-1 ring-border"
                      : "text-muted-foreground hover:bg-muted",
                  )}
                >
                  <span
                    className="size-2 rounded-full"
                    style={{ backgroundColor: cat.color }}
                  />
                  {cat.name}
                </button>
              )
            })}
          </div>
          <Popover>
            <PopoverTrigger
              render={
                <button
                  type="button"
                  aria-label="카테고리 관리"
                  className="inline-flex size-8 shrink-0 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                />
              }
            >
              <Settings2 className="size-3.5" />
            </PopoverTrigger>
            <PopoverContent align="end" className="w-64">
              <p className="mb-2 text-sm font-medium">카테고리 관리</p>
              <ul className="flex flex-col gap-1">
                {categories.map((c) => (
                  <li
                    key={c.id}
                    className="flex items-center gap-2 rounded-md px-1 py-0.5"
                  >
                    <span
                      className="size-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: c.color }}
                    />
                    <span className="min-w-0 flex-1 truncate text-sm">
                      {c.name}
                    </span>
                    <button
                      type="button"
                      aria-label="카테고리 수정"
                      className="text-muted-foreground hover:text-foreground"
                      onClick={() => {
                        setEditingCategoryId(c.id)
                        setCatName(c.name)
                        setCatColor(c.color)
                        setCatOpen(true)
                      }}
                    >
                      <Pencil className="size-3" />
                    </button>
                    {categories.length > 1 && (
                      <button
                        type="button"
                        aria-label="카테고리 삭제"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => onRemoveCategory(c.id)}
                      >
                        <X className="size-3" />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                className="mt-2 w-full rounded-md border border-dashed border-border py-1.5 text-xs text-muted-foreground hover:bg-muted"
                onClick={() => {
                  setEditingCategoryId(null)
                  setCatName("")
                  setCatColor(COLOR_PRESETS[0])
                  setCatOpen(true)
                }}
              >
                + 카테고리 추가
              </button>
            </PopoverContent>
          </Popover>
        </div>
      )}

      {viewMode === "today" ? (
        <TodayView
          tasks={todayTasks}
          categoryById={categoryById}
          onMove={onMove}
          onRemove={onRemove}
          onEdit={openEditor}
          onAdd={() => openComposer()}
        />
      ) : visibleCats.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          표시할 카테고리가 없습니다. 위 칩에서 선택하세요.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {visibleCats.map((cat) => {
            const items = sortTasks(
              tasks.filter((t) => t.categoryId === cat.id),
            )
            const { active, done } = splitActiveAndDone(items)
            const collapsed = collapsedIds.has(cat.id)
            const doneCollapsed = doneCollapsedIds.has(cat.id)
            const doneCount = done.length
            const total = items.length
            const progress = total === 0 ? 0 : doneCount / total

            return (
              <section
                key={cat.id}
                className="overflow-hidden rounded-lg border border-border bg-card"
              >
                <div
                  role="button"
                  tabIndex={0}
                  aria-expanded={!collapsed}
                  aria-label={
                    collapsed ? `${cat.name} 펼치기` : `${cat.name} 접기`
                  }
                  className="flex cursor-pointer items-center gap-2 px-4 py-3"
                  style={{
                    backgroundColor: `color-mix(in srgb, ${cat.color} 25%, transparent)`,
                  }}
                  onClick={() => toggleCollapsed(cat.id)}
                  onKeyDown={(e) => {
                    if (e.key !== "Enter" && e.key !== " ") return
                    e.preventDefault()
                    toggleCollapsed(cat.id)
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
                  <h3 className="text-[13.5px] font-bold tracking-tight">
                    {cat.name}
                  </h3>
                  <span className="text-xs font-semibold text-muted-foreground">
                    {active.length}
                    {doneCount > 0 ? ` · ${doneCount}/${total}` : ""}
                  </span>
                  <button
                    type="button"
                    title="이 카테고리에 추가"
                    aria-label="추가"
                    className="ml-auto grid size-[22px] place-items-center rounded-full text-muted-foreground hover:bg-primary/10 hover:text-primary"
                    onClick={(e) => {
                      e.stopPropagation()
                      openComposer(cat.id)
                    }}
                  >
                    <Plus className="size-3.5" />
                  </button>
                </div>
                {total > 0 && (
                  <div
                    className="h-0.5 bg-border"
                    aria-hidden
                  >
                    <div
                      className="h-full transition-[width] duration-300"
                      style={{
                        width: `${Math.round(progress * 100)}%`,
                        backgroundColor: cat.color,
                      }}
                    />
                  </div>
                )}
                <div
                  className={
                    collapsed
                      ? "grid grid-rows-[0fr] transition-[grid-template-rows] duration-200"
                      : "grid grid-rows-[1fr] transition-[grid-template-rows] duration-200"
                  }
                >
                  <div className="overflow-hidden">
                    {items.length === 0 ? (
                      <p className="border-t border-border px-4 py-6 text-center text-sm text-muted-foreground">
                        아직 할 일이 없어요.{" "}
                        <button
                          type="button"
                          className="font-medium text-foreground underline-offset-2 hover:underline"
                          onClick={() => openComposer(cat.id)}
                        >
                          할 일 추가
                        </button>
                      </p>
                    ) : (
                      <>
                        <ul>
                          {active.map((task) => (
                            <TaskRow
                              key={task.id}
                              task={task}
                              category={cat}
                              showCategory={false}
                              onMove={onMove}
                              onRemove={onRemove}
                              onEdit={openEditor}
                            />
                          ))}
                        </ul>
                        {doneCount > 0 && (
                          <div className="border-t border-border">
                            <button
                              type="button"
                              className="flex w-full items-center gap-2 px-4 py-2 text-left text-xs font-medium text-muted-foreground hover:bg-muted/40"
                              onClick={() =>
                                setDoneCollapsedIds((prev) => {
                                  const next = new Set(prev)
                                  if (next.has(cat.id)) next.delete(cat.id)
                                  else next.add(cat.id)
                                  return next
                                })
                              }
                            >
                              <ChevronDown
                                className={cn(
                                  "size-3.5 transition-transform duration-200",
                                  doneCollapsed && "-rotate-90",
                                )}
                              />
                              완료 {doneCount}
                            </button>
                            {!doneCollapsed && (
                              <ul>
                                {done.map((task) => (
                                  <TaskRow
                                    key={task.id}
                                    task={task}
                                    category={cat}
                                    showCategory={false}
                                    onMove={onMove}
                                    onRemove={onRemove}
                                    onEdit={openEditor}
                                  />
                                ))}
                              </ul>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </section>
            )
          })}
        </div>
      )}

      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next)
          if (!next) setEditingId(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingId ? "할 일 수정" : "새 할 일 추가"}
            </DialogTitle>
            <DialogDescription>
              {editingId
                ? "할 일 정보를 수정하세요."
                : "추가할 할 일의 정보를 입력하세요."}
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
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="task-category">카테고리</Label>
              <select
                id="task-category"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="h-9 rounded-md border border-input bg-background px-2 text-sm"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
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
              {editingId ? "저장" : "추가하기"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={catOpen}
        onOpenChange={(next) => {
          setCatOpen(next)
          if (!next) setEditingCategoryId(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategoryId ? "카테고리 수정" : "카테고리 추가"}
            </DialogTitle>
            <DialogDescription>이름과 색을 선택하세요.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="cat-name">이름</Label>
              <Input
                id="cat-name"
                value={catName}
                placeholder="예: 업무"
                onChange={(e) => setCatName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key !== "Enter" || e.nativeEvent.isComposing) return
                  e.preventDefault()
                  commitCategory()
                }}
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {COLOR_PRESETS.map((color) => (
                <button
                  key={color}
                  type="button"
                  aria-label={`카테고리 색상 ${color}`}
                  aria-pressed={catColor === color}
                  onClick={() => setCatColor(color)}
                  className={cn(
                    "size-7 rounded-full border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                    catColor === color
                      ? "border-foreground"
                      : "border-transparent",
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="ghost">취소</Button>} />
            <Button disabled={!catName.trim()} onClick={commitCategory}>
              {editingCategoryId ? "저장" : "추가"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  )
}

function TodayView({
  tasks,
  categoryById,
  onMove,
  onRemove,
  onEdit,
  onAdd,
}: {
  tasks: BoardTask[]
  categoryById: Map<string, TodoCategory>
  onMove: (id: string, status: TodoStatus) => void
  onRemove: (id: string) => void
  onEdit: (task: BoardTask) => void
  onAdd: () => void
}) {
  if (tasks.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border px-4 py-10 text-center">
        <p className="text-sm text-muted-foreground">
          오늘·지연된 할 일이 없습니다.
        </p>
        <button
          type="button"
          className="mt-2 text-sm font-medium text-foreground underline-offset-2 hover:underline"
          onClick={onAdd}
        >
          오늘 할 일 추가
        </button>
      </div>
    )
  }

  return (
    <section className="overflow-hidden rounded-lg border border-border">
      <div className="flex items-center gap-2 border-b border-border px-4 py-2.5">
        <h3 className="text-[13.5px] font-bold tracking-tight">오늘 · 지연</h3>
        <span className="text-xs font-semibold text-muted-foreground">
          {tasks.length}
        </span>
      </div>
      <ul>
        {tasks.map((task) => (
          <TaskRow
            key={task.id}
            task={task}
            category={categoryById.get(task.categoryId)}
            showCategory
            onMove={onMove}
            onRemove={onRemove}
            onEdit={onEdit}
          />
        ))}
      </ul>
    </section>
  )
}

function TaskRow({
  task,
  category,
  showCategory,
  onMove,
  onRemove,
  onEdit,
}: {
  task: BoardTask
  category?: TodoCategory
  showCategory: boolean
  onMove: (id: string, status: TodoStatus) => void
  onRemove: (id: string) => void
  onEdit: (task: BoardTask) => void
}) {
  const dueMeta = task.due ? formatDueLabel(task.due) : null
  const done = task.status === "done"
  const inProgress = task.status === "in-progress"
  const overdue = dueMeta?.tone === "overdue"

  return (
    <li className="group relative flex items-center gap-2.5 border-t border-border px-4 py-2.5 hover:bg-muted/40">
      <span
        aria-hidden
        className={cn(
          "absolute inset-y-0 left-0 w-0.5",
          overdue && !done && "bg-destructive",
          inProgress && !overdue && !done && "bg-theme",
        )}
      />
      <Checkbox
        checked={done}
        onCheckedChange={(checked) =>
          onMove(task.id, nextStatusOnCheck(task.status, Boolean(checked)))
        }
      />
      <button
        type="button"
        className="min-w-0 max-w-[min(100%,20rem)] shrink text-left"
        onClick={() => onEdit(task)}
      >
        <p
          className={cn(
            "truncate text-[13px] font-medium",
            done
              ? "text-muted-foreground line-through"
              : "text-foreground",
          )}
        >
          {task.title}
        </p>
        {showCategory && category && (
          <span className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-muted-foreground">
            <span
              className="size-1.5 rounded-full"
              style={{ backgroundColor: category.color }}
            />
            {category.name}
          </span>
        )}
      </button>

      <div className="flex shrink-0 items-center gap-1.5">
        {inProgress && !done && (
          <span className="rounded-md bg-theme/10 px-1.5 py-0.5 text-[10px] font-semibold text-theme">
            진행
          </span>
        )}
        {task.priority === "high" && !done && (
          <Badge
            variant="secondary"
            className={cn("text-[10px]", PRIORITY_META.high.className)}
          >
            {PRIORITY_META.high.label}
          </Badge>
        )}
        {dueMeta && (
          <span
            className={cn(
              "inline-flex shrink-0 items-center gap-1 text-[11px]",
              dueMeta.tone === "overdue" && "text-destructive",
              dueMeta.tone === "today" && "font-medium text-foreground",
              dueMeta.tone === "muted" && "text-muted-foreground",
            )}
          >
            <CalendarClock className="size-3" />
            {dueMeta.text}
          </span>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                type="button"
                title="더보기"
                aria-label="더보기"
                className="grid size-6 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100"
              />
            }
          >
            <MoreHorizontal className="size-3.5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-36">
            <DropdownMenuItem onClick={() => onEdit(task)}>
              수정
            </DropdownMenuItem>
            {STATUSES.filter((s) => s !== task.status).map((s) => (
              <DropdownMenuItem key={s} onClick={() => onMove(task.id, s)}>
                {STATUS_META[s].label}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => onRemove(task.id)}
            >
              삭제
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <button
        type="button"
        aria-label={`${task.title} 수정`}
        className="min-h-6 min-w-2 flex-1 self-stretch"
        onClick={() => onEdit(task)}
      />
    </li>
  )
}
