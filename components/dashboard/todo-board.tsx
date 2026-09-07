"use client"

import * as React from "react"
import {
  CalendarClock,
  ChevronDown,
  LayoutGrid,
  Pencil,
  Plus,
  X,
} from "lucide-react"

import {
  PRIORITY_META,
  STATUS_META,
  daysUntil,
  type BoardTask,
  type TodoCategory,
  type TodoPriority,
  type TodoStatus,
} from "@/lib/dashboard-data"
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
  const [visibleCategoryIds, setVisibleCategoryIds] = React.useState<Set<string>>(
    () => new Set(),
  )
  const [categoryId, setCategoryId] = React.useState("")
  const [catOpen, setCatOpen] = React.useState(false)
  const [editingCategoryId, setEditingCategoryId] = React.useState<string | null>(null)
  const [catName, setCatName] = React.useState("")
  const [catColor, setCatColor] = React.useState<string>(COLOR_PRESETS[0])
 
  const [collapsedIds, setCollapsedIds] = React.useState<Set<string>>(
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
    })
  }, [categories])
  
  const visibleCats = categories.filter((c) => visibleCategoryIds.has(c.id))

  function openComposer(prefillCategoryId?: string) {
    setEditingId(null)
    setTitle("")
    setDue("")
    setStatus("todo")
    setPriority("medium")
    setCategoryId(prefillCategoryId ?? categories[0]?.id ?? "")
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
  
  return (
    <section
      className={cn(
        flush
          ? "p-0"
          : "rounded-panel border border-card-border bg-card p-4 sm:p-5",
      )}
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <LayoutGrid className="size-4 text-theme" />
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            할 일
          </h2>

          <button
            type="button"
            onClick={() =>
              setVisibleCategoryIds(new Set(categories.map((c) => c.id)))
            }
            className="rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground hover:bg-muted"
          >
            전체 선택
          </button>
          <button
            type="button"
            onClick={() => setVisibleCategoryIds(new Set())}
            className="rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground hover:bg-muted"
          >
            전체 해제
          </button>

          <span className="text-sm font-medium text-foreground">카테고리</span>
          <Popover>
            <PopoverTrigger
              render={
                <button
                  type="button"
                  aria-label="카테고리 선택"
                  className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-muted"
                />
              }
            >
              {visibleCategoryIds.size}/{categories.length}
              <ChevronDown className="size-3.5" />
            </PopoverTrigger>
            <PopoverContent align="start" className="w-64">
              <p className="mb-2 text-sm font-medium">표시할 챕터</p>
              <ul className="flex flex-col gap-1">
                {categories.map((c) => (
                  <li key={c.id} className="flex items-center gap-2 rounded-md px-1 py-0.5">
                    <Checkbox
                      checked={visibleCategoryIds.has(c.id)}
                      onCheckedChange={() => {
                        setVisibleCategoryIds((prev) => {
                          const next = new Set(prev)
                          if (next.has(c.id)) next.delete(c.id)
                          else next.add(c.id)
                          return next
                        })
                      }}
                    />
                    <span
                      className="size-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: c.color }}
                    />
                    <span className="min-w-0 flex-1 truncate text-sm">{c.name}</span>
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

        <Button size="sm" onClick={() => openComposer()}>
          <Plus data-icon="inline-start" />새 할 일
        </Button>
      </div>

      <div className="flex flex-col gap-3">
        {visibleCats.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            표시할 카테고리가 없습니다. 카테고리 메뉴에서 선택하세요.
          </p>
        ) : (
          visibleCats.map((cat) => {
            const items = tasks.filter((t) => t.categoryId === cat.id)
            const collapsed = collapsedIds.has(cat.id)
            return (
              <section
                key={cat.id}
                className="overflow-hidden rounded-lg border border-border bg-card"
              >
                <div
                  role="button"
                  tabIndex={0}
                  aria-expanded={!collapsed}
                  aria-label={collapsed ? `${cat.name} 펼치기` : `${cat.name} 접기`}
                  className="flex cursor-pointer items-center gap-2 px-4 py-3"
                  style={{
                    backgroundColor: `color-mix(in srgb, ${cat.color} 25%, transparent)`,
                  }}
                  onClick={() =>
                    setCollapsedIds((prev) => {
                      const next = new Set(prev)
                      if (next.has(cat.id)) next.delete(cat.id)
                      else next.add(cat.id)
                      return next
                    })
                  }
                  onKeyDown={(e) => {
                    if (e.key !== "Enter" && e.key !== " ") return
                    e.preventDefault()
                    setCollapsedIds((prev) => {
                      const next = new Set(prev)
                      if (next.has(cat.id)) next.delete(cat.id)
                      else next.add(cat.id)
                      return next
                    })
                  }}
                >
                  <span className="grid size-5 shrink-0 place-items-center text-muted-foreground">
                    <ChevronDown
                      className={
                        collapsed
                          ? "size-3.5 -rotate-90 transition-transform duration-200"
                          : "size-3.5 transition-transform duration-200"
                      }
                    />
                  </span>
                  <h3 className="text-[13.5px] font-bold tracking-tight">
                    {cat.name}
                  </h3>
                  <span className="text-xs font-semibold text-muted-foreground">
                    {items.length}
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
                        아직 할 일이 없어요. + 로 추가하세요.
                      </p>
                    ) : (
                      <ul>
                      {items.map((task) => {
                        const dleft = task.due ? daysUntil(task.due) : null
                        return (
                          <li
                            key={task.id}
                            className="group relative flex items-center gap-2.5 border-t border-border px-4 py-2 hover:bg-muted/40"
                          >
                            <Checkbox
                              checked={task.status === "done"}
                              onCheckedChange={(checked) =>
                                onMove(task.id, checked ? "done" : "todo")
                              }
                            />
                            <p
                              className={
                                task.status === "done"
                                  ? "min-w-0 flex-1 truncate text-[13px] font-medium text-muted-foreground line-through"
                                  : "min-w-0 flex-1 truncate text-[13px] font-medium text-foreground"
                              }
                            >
                              {task.title}
                            </p>
                            <Badge
                              variant="secondary"
                              className={PRIORITY_META[task.priority].className}
                            >
                              {PRIORITY_META[task.priority].label}
                            </Badge>
                            {task.due && (
                              <span
                                className={
                                  dleft !== null && dleft < 0
                                    ? "inline-flex shrink-0 items-center gap-1 text-[11px] text-destructive"
                                    : "inline-flex shrink-0 items-center gap-1 text-[11px] text-muted-foreground"
                                }
                              >
                                <CalendarClock className="size-3" />
                                {task.due.slice(5)}
                                {dleft !== null &&
                                  ` · ${dleft === 0 ? "오늘" : dleft > 0 ? `D-${dleft}` : `D+${Math.abs(dleft)}`}`}
                              </span>
                            )}
                            <div className="flex shrink-0 gap-0.5 opacity-0 group-hover:opacity-100">
                              <button
                                type="button"
                                title="수정"
                                className="grid size-5 place-items-center rounded-md text-muted-foreground hover:bg-primary/10 hover:text-primary"
                                onClick={() => {
                                  setEditingId(task.id)
                                  setTitle(task.title)
                                  setCategoryId(task.categoryId)
                                  setPriority(task.priority)
                                  setDue(task.due ?? "")
                                  setStatus(task.status)
                                  setOpen(true)
                                }}
                              >
                                <Pencil className="size-2.5" />
                              </button>
                              <button
                                type="button"
                                title="삭제"
                                className="grid size-5 place-items-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                onClick={() => onRemove(task.id)}
                              >
                                <X className="size-2.5" />
                              </button>
                            </div>
                          </li>
                        )
                      })}
                      </ul>
                    )}
                  </div>
                </div>
              </section>
            )
          })
        )}
      </div>

      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next)
          if (!next) setEditingId(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "할 일 수정" : "새 할 일 추가"}</DialogTitle>
            <DialogDescription>
              {editingId
                ? "할 일 정보를 수정하세요."
                : "보드에 추가할 할 일의 정보를 입력하세요."}
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
              <Label htmlFor="task-category">챕터</Label>
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
                    catColor === color ? "border-foreground" : "border-transparent",
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="ghost">취소</Button>} />
            <Button
              disabled={!catName.trim()}
              onClick={commitCategory}
            >
              {editingCategoryId ? "저장" : "추가"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  )
}
