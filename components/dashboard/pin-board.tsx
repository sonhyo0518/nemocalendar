"use client"

import * as React from "react"
import {
  Check,
  ChevronDown,
  Pin as PinIcon,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react"

import type { Pin } from "@/lib/dashboard-data"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface PinBoardProps {
  pins: Pin[]
  onAdd: (text: string) => void
  onUpdate: (id: string, text: string) => void
  onRemove: (id: string) => void
}

const TEXTAREA_CLASS =
  "min-h-7 max-h-40 min-w-0 flex-1 resize-none overflow-y-auto rounded-sm border border-input bg-transparent px-2 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"

export function PinBoard({ pins, onAdd, onUpdate, onRemove }: PinBoardProps) {
  const [composing, setComposing] = React.useState(false)
  const [draft, setDraft] = React.useState("")
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [editDraft, setEditDraft] = React.useState("")
  const [collapsed, setCollapsed] = React.useState(false)
  const inputRef = React.useRef<HTMLTextAreaElement | null>(null)

  function resizeComposer(el: HTMLTextAreaElement) {
    el.style.height = "auto"
    el.style.height = `${el.scrollHeight}px`
  }

  function closeComposer() {
    setComposing(false)
    setDraft("")
  }

  function cancelEdit() {
    setEditingId(null)
    setEditDraft("")
  }

  function openComposer() {
    cancelEdit()
    setCollapsed(false)
    setComposing(true)
    queueMicrotask(() => {
      const el = inputRef.current
      if (!el) return
      resizeComposer(el)
      el.focus({ preventScroll: true })
    })
  }

  function submit() {
    const text = draft.trim()
    if (!text) return
    onAdd(text)
    setDraft("")
    setComposing(false)
  }

  function commitEdit(id: string) {
    const text = editDraft.trim()
    if (text) onUpdate(id, text)
    setEditingId(null)
  }

  function startEdit(pin: Pin) {
    closeComposer()
    setEditingId(pin.id)
    setEditDraft(pin.text)
  }

  function handleComposerBlur(
    e: React.FocusEvent<HTMLDivElement>,
    onCancel: () => void,
  ) {
    if (e.currentTarget.contains(e.relatedTarget as Node | null)) return
    onCancel()
  }

  return (
    <section className="overflow-hidden rounded-widget border border-card-border bg-card">
      <div className="flex items-center gap-2 px-4 py-3">
        <button
          type="button"
          aria-expanded={!collapsed}
          aria-label={collapsed ? "고정 메세지 펼치기" : "고정 메세지 접기"}
          className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 text-left"
          onClick={() => setCollapsed((v) => !v)}
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
        </button>
        <button
          type="button"
          title="추가"
          aria-label="핀 추가"
          aria-pressed={composing}
          className={cn(
            "grid size-[22px] shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary",
            composing && "bg-primary/10 text-primary",
          )}
          onClick={() => {
            if (composing) closeComposer()
            else openComposer()
          }}
        >
          <Plus className="size-3.5" />
        </button>
      </div>

      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-200 ease-out",
          collapsed ? "grid-rows-[0fr]" : "grid-rows-[1fr]",
        )}
      >
        <div className="min-h-0 overflow-hidden">
          {composing && (
            <div
              className="flex items-start gap-1.5 border-t border-border px-4 py-2"
              onBlur={(e) => handleComposerBlur(e, closeComposer)}
            >
              <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-theme/80" />
              <textarea
                ref={inputRef}
                rows={1}
                value={draft}
                placeholder="기억할 내용을 입력하세요"
                className={TEXTAREA_CLASS}
                onChange={(e) => {
                  setDraft(e.target.value)
                  resizeComposer(e.currentTarget)
                }}
                onKeyDown={(e) => {
                  if (
                    e.key === "Enter" &&
                    (e.metaKey || e.ctrlKey) &&
                    !e.nativeEvent.isComposing
                  ) {
                    e.preventDefault()
                    submit()
                  }
                  if (e.key === "Escape") closeComposer()
                }}
              />
              <Button
                size="icon-sm"
                variant="ghost"
                className="mt-0.5 shrink-0"
                aria-label="추가"
                disabled={!draft.trim()}
                onClick={submit}
              >
                <Check />
              </Button>
              <Button
                size="icon-sm"
                variant="ghost"
                className="mt-0.5 shrink-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                aria-label="작성 취소"
                onClick={closeComposer}
              >
                <Trash2 />
              </Button>
            </div>
          )}

          {pins.length === 0 && !composing ? (
            <p className="border-t border-border px-4 py-6 text-center text-sm text-muted-foreground">
              아직 핀이 없어요.{" "}
              <button
                type="button"
                className="font-medium text-foreground underline-offset-2 hover:underline"
                onClick={openComposer}
              >
                핀 추가
              </button>
            </p>
          ) : pins.length > 0 ? (
            <ul>
              {pins.map((pin) => (
                <li
                  key={pin.id}
                  className="group relative flex items-start gap-2.5 border-t border-b-transparent border-border px-4 py-2 transition-colors hover:bg-muted/40 last:rounded-b-[var(--radius-widget)] last:border-b-border"
                >
                  <span className="absolute top-[22%] bottom-[22%] left-0 w-[3px] rounded-r bg-theme opacity-0 transition-opacity group-hover:opacity-100" />
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-theme/80" />
                  {editingId === pin.id ? (
                    <div
                      className="flex min-w-0 flex-1 items-start gap-1.5"
                      onBlur={(e) => handleComposerBlur(e, cancelEdit)}
                    >
                      <textarea
                        value={editDraft}
                        rows={1}
                        className={TEXTAREA_CLASS}
                        ref={(el) => {
                          if (!el) return
                          resizeComposer(el)
                          el.focus({ preventScroll: true })
                        }}
                        onChange={(e) => {
                          setEditDraft(e.target.value)
                          resizeComposer(e.currentTarget)
                        }}
                        onKeyDown={(e) => {
                          if (
                            e.key === "Enter" &&
                            (e.metaKey || e.ctrlKey) &&
                            !e.nativeEvent.isComposing
                          ) {
                            e.preventDefault()
                            commitEdit(pin.id)
                          }
                          if (e.key === "Escape") cancelEdit()
                        }}
                      />
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        className="mt-0.5 shrink-0"
                        aria-label="저장"
                        disabled={!editDraft.trim()}
                        onClick={() => commitEdit(pin.id)}
                      >
                        <Check />
                      </Button>
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        className="mt-0.5 shrink-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        aria-label="수정 취소"
                        onClick={cancelEdit}
                      >
                        <Trash2 />
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
                        aria-label="핀 수정"
                        className="grid size-5 place-items-center rounded-md text-muted-foreground hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                        onClick={() => startEdit(pin)}
                      >
                        <Pencil className="size-2.5" />
                      </button>
                      <button
                        type="button"
                        title="고정 해제"
                        aria-label="핀 고정 해제"
                        className="grid size-5 place-items-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                        onClick={() => onRemove(pin.id)}
                      >
                        <X className="size-2.5" />
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </section>
  )
}
