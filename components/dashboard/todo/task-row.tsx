"use client"

import { CalendarClock, MoreHorizontal } from "lucide-react"
import {
  PRIORITY_META,
  STATUS_META,
  type BoardTask,
  type TodoCategory,
  type TodoStatus,
} from "@/lib/dashboard-data"
import { formatDueLabel, nextStatusOnCheck } from "@/lib/todo-view"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

const STATUSES: TodoStatus[] = ["todo", "in-progress", "done"]

export function TaskRow({
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