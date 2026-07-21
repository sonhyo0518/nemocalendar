"use client"

import * as React from "react"
import { Check, Pin as PinIcon, Pencil, Plus, X } from "lucide-react"

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
    <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <PinIcon className="size-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">핀 보드</h2>
          <span className="text-xs text-muted-foreground">{pins.length}개</span>
        </div>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger
            render={
              <Button size="sm" variant="outline">
                <Plus data-icon="inline-start" />
                추가
              </Button>
            }
          />
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

      {pins.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          아직 핀이 없어요. 오른쪽 위 버튼으로 추가하세요.
        </p>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-1">
          {pins.map((pin) => (
            <div
              key={pin.id}
              className={cn(
                "group relative flex min-w-[200px] max-w-[260px] shrink-0 items-start gap-2 rounded-xl border border-border bg-secondary/50 p-3 transition-colors hover:border-primary/40",
              )}
            >
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                <PinIcon className="size-3" />
              </span>
              {editingId === pin.id ? (
                <div className="flex flex-1 items-center gap-1">
                  <Input
                    autoFocus
                    value={editDraft}
                    className="h-7 text-sm"
                    onChange={(e) => setEditDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.nativeEvent.isComposing)
                        commitEdit(pin.id)
                      if (e.key === "Escape") setEditingId(null)
                    }}
                  />
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    onClick={() => commitEdit(pin.id)}
                    aria-label="저장"
                  >
                    <Check />
                  </Button>
                </div>
              ) : (
                <p className="flex-1 text-sm leading-relaxed text-foreground">
                  {pin.text}
                </p>
              )}

              {editingId !== pin.id && (
                <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    aria-label="수정"
                    onClick={() => {
                      setEditingId(pin.id)
                      setEditDraft(pin.text)
                    }}
                  >
                    <Pencil />
                  </Button>
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    aria-label="삭제"
                    onClick={() => onRemove(pin.id)}
                  >
                    <X />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
