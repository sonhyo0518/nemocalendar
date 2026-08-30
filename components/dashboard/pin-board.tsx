"use client"

import * as React from "react"
import { Check, ChevronDown, Pin as PinIcon, Pencil, Plus, X } from "lucide-react"

import type { Pin } from "@/lib/dashboard-data"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface PinBoardProps {
  pins: Pin[]
  onAdd: (text: string) => void
  onUpdate: (id: string, text: string) => void
  onRemove: (id: string) => void
}

export function PinBoard({ pins, onAdd, onUpdate, onRemove }: PinBoardProps) {
  const [open, setOpen] = React.useState(false)
  const [draft, setDraft] = React.useState("")
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [editDraft, setEditDraft] = React.useState("")
  const [collapsed, setCollapsed] = React.useState(false)

  function submit() {
    const text = draft.trim()
    if (!text) return
    onAdd(text)
    setDraft("")
    setOpen(false)
  }

  function commitEdit(id: string) {
    const text = editDraft.trim()
    if (text) onUpdate(id, text)
    setEditingId(null)
  }

  return (
    <section className="overflow-hidden rounded-widget border border-card-border bg-card">
      
      <div
        role="button"
        tabIndex={0}
        aria-expanded={!collapsed}
        aria-label={collapsed ? "고정 메세지 펼치기" : "고정 메세지 접기"}
        className="flex cursor-pointer items-center gap-2 px-4 py-3"
        onClick={() => setCollapsed((v) => !v)}
        onKeyDown={(e) => {
          if (e.key !== "Enter" && e.key !== " ") return
          e.preventDefault()
          setCollapsed((v) => !v)
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
        <span className="flex size-[22px] shrink-0 items-center justify-center rounded-[7px] bg-theme/20 text-theme">
          <PinIcon className="size-3" />
        </span>
        <h2 className="text-[13.5px] font-bold tracking-tight text-foreground">
          고정 메세지
        </h2>
        <span className="text-xs font-semibold text-muted-foreground">
          {pins.length}
        </span>
        <div
          className="ml-auto"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        >
          <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger
            render={
              <button
                type="button"
                title="추가"
                aria-label="핀 추가"
                className="grid size-[22px] place-items-center rounded-full text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
              />
            }
          >
            <Plus className="size-3.5" />
          </PopoverTrigger>
          <PopoverContent align="end" className="w-72">
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium text-foreground">새 핀 추가</p>
              <Input
                autoFocus
                value={draft}
                placeholder="기억할 내용을 입력하세요"
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.nativeEvent.isComposing) submit()
                }}
              />
              <div className="flex justify-end gap-2">
                <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>
                  취소
                </Button>
                <Button size="sm" onClick={submit}>
                  추가하기
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      </div>
      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-200 ease-out",
          collapsed ? "grid-rows-[0fr]" : "grid-rows-[1fr]",
        )}
      >
        <div className="min-h-0 overflow-hidden">
          {pins.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">
              아직 핀이 없어요. 제목 옆 + 버튼으로 추가하세요.
            </p>
          ) : (
            <ul>
              {pins.map((pin) => (
                <li
                  key={pin.id}
                  className="group relative flex items-start gap-2.5 border-t border-b-transparent border-border px-4 py-2 transition-colors hover:bg-muted/40 last:rounded-b-[var(--radius-widget)] last:border-b-border"
                >
                  <span className="absolute top-[22%] bottom-[22%] left-0 w-[3px] rounded-r bg-theme opacity-0 transition-opacity group-hover:opacity-100" />
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-theme/80" />
                  {editingId === pin.id ? (
                    <div className="flex min-w-0 flex-1 items-start gap-1">
                      <textarea
                        autoFocus
                        value={editDraft}
                        rows={1}
                        className="min-h-7 max-h-40 min-w-0 flex-1 resize-none overflow-y-auto rounded-sm border border-input bg-transparent px-2 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
                        ref={(el) => {
                          if (!el) return
                          el.style.height = "auto"
                          el.style.height = `${el.scrollHeight}px`
                        }}
                        onChange={(e) => {
                          setEditDraft(e.target.value)
                          const el = e.currentTarget
                          el.style.height = "auto"
                          el.style.height = `${el.scrollHeight}px`
                        }}
                        onKeyDown={(e) => {
                          // Enter = 줄바꿈, Ctrl/Cmd+Enter = 저장
                          if (
                            e.key === "Enter" &&
                            (e.metaKey || e.ctrlKey) &&
                            !e.nativeEvent.isComposing
                          ) {
                            e.preventDefault()
                            commitEdit(pin.id)
                          }
                          if (e.key === "Escape") setEditingId(null)
                        }}
                      />
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        className="mt-0.5"
                        onClick={() => commitEdit(pin.id)}
                        aria-label="저장"
                      >
                        <Check />
                      </Button>
                    </div>
                  ) : (
                    <p className="min-w-0 flex-1 whitespace-pre-wrap break-words text-[13px] font-medium tracking-tight text-foreground">
                      {pin.text}
                    </p>
                  )}
                  {editingId !== pin.id && (
                    <div className="mt-0.5 flex shrink-0 gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        type="button"
                        title="수정"
                        className="grid size-5 place-items-center rounded-md text-muted-foreground hover:bg-primary/10 hover:text-primary"
                        onClick={() => {
                          setEditingId(pin.id)
                          setEditDraft(pin.text)
                        }}
                      >
                        <Pencil className="size-2.5" />
                      </button>
                      <button
                        type="button"
                        title="고정 해제"
                        className="grid size-5 place-items-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => onRemove(pin.id)}
                      >
                        <X className="size-2.5" />
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  )
}
