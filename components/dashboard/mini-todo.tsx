"use client"

import * as React from "react"
import { ListChecks, X } from "lucide-react"

import type { MiniTodo } from "@/lib/dashboard-data"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface MiniTodoWidgetProps {
  todos: MiniTodo[]
  onAdd: (text: string) => void
  onToggle: (id: string) => void
  onRemove: (id: string) => void
}

export function MiniTodoWidget({
  todos,
  onAdd,
  onToggle,
  onRemove,
}: MiniTodoWidgetProps) {
  const [draft, setDraft] = React.useState("")
  const remaining = todos.filter((t) => !t.done).length

  function submit() {
    const text = draft.trim()
    if (!text) return
    onAdd(text)
    setDraft("")
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <ListChecks className="size-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">간단 할 일</h3>
        <span className="ml-auto text-xs text-muted-foreground">
          {remaining}개 남음
        </span>
      </div>

      <Input
        value={draft}
        placeholder="입력 후 Enter로 추가"
        className="mb-2 h-8"
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.nativeEvent.isComposing) submit()
        }}
      />

      <ul className="flex flex-col gap-0.5">
        {todos.map((t) => (
          <li
            key={t.id}
            className="group flex items-center gap-2 rounded-md px-1 py-1.5 hover:bg-secondary/60"
          >
            <Checkbox
              id={`mini-${t.id}`}
              checked={t.done}
              onCheckedChange={() => onToggle(t.id)}
            />
            <label
              htmlFor={`mini-${t.id}`}
              className={cn(
                "flex-1 cursor-pointer text-sm text-foreground",
                t.done && "text-muted-foreground line-through",
              )}
            >
              {t.text}
            </label>
            <Button
              size="icon-xs"
              variant="ghost"
              aria-label="삭제"
              className="opacity-0 transition-opacity group-hover:opacity-100"
              onClick={() => onRemove(t.id)}
            >
              <X />
            </Button>
          </li>
        ))}
        {todos.length === 0 && (
          <li className="py-3 text-center text-xs text-muted-foreground">
            할 일을 추가해보세요
          </li>
        )}
      </ul>
    </div>
  )
}
