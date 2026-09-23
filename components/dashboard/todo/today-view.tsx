"use client"

import type { BoardTask, TodoCategory, TodoStatus } from "@/lib/dashboard-data"
import { TaskRow } from "@/components/dashboard/todo/task-row"

export function TodayView({
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