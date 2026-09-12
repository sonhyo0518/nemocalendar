"use client"

import * as React from "react"
import {
  Check,
  ChevronDown,
  Pin as PinIcon,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react"

import type { Pin } from "@/lib/dashboard-data"
import { cn } from "@/lib/utils"

interface PinBoardProps {
  pins: Pin[]
  onAdd: (text: string) => void
  onUpdate: (id: string, text: string) => void
  onRemove: (id: string) => void
  readOnly?: boolean
  onRequireLogin?: () => void
}

const TEXT_CLASS =
  "text-[13px] font-medium leading-snug tracking-tight text-foreground"

const TEXTAREA_CLASS = cn(
  TEXT_CLASS,
  "min-h-[26px] max-h-40 min-w-0 flex-1 resize-none overflow-y-auto rounded-sm border border-input bg-transparent px-2 py-0.5 outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50",
)

const ACTION_BTN_CLASS =
  "grid size-5 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-40"

const ACTION_DANGER_CLASS =
  "hover:bg-destructive/10 hover:text-destructive"

const ROW_CLASS =
  "flex items-start gap-2.5 border-t border-border px-4 py-2"

function PinActionButton({
  label,
  danger,
  disabled,
  onClick,
  children,
}: {
  label: string
  danger?: boolean
  disabled?: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      className={cn(ACTION_BTN_CLASS, danger && ACTION_DANGER_CLASS)}
      onClick={onClick}
    >
      {children}
    </button>
  )
}


export function PinBoard({
  pins,
  onAdd,
  onUpdate,
  onRemove,
  readOnly = false,
  onRequireLogin,
}: PinBoardProps) {
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
    if (readOnly) {
      onRequireLogin?.()
      return
    }
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
    if (readOnly) {
      onRequireLogin?.()
      return
    }
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

  function renderComposerActions({
    confirmLabel,
    cancelLabel,
    canConfirm,
    onConfirm,
    onCancel,
  }: {
    confirmLabel: string
    cancelLabel: string
    canConfirm: boolean
    onConfirm: () => void
    onCancel: () => void
  }) {
    return (
      <div className="mt-0.5 flex shrink-0 gap-0.5">
        <PinActionButton
          label={confirmLabel}
          disabled={!canConfirm}
          onClick={onConfirm}
        >
          <Check className="size-2.5" />
        </PinActionButton>
        <PinActionButton label={cancelLabel} danger onClick={onCancel}>
          <Trash2 className="size-2.5" />
        </PinActionButton>
      </div>
    )
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
              className={ROW_CLASS}
              onBlur={(e) => handleComposerBlur(e, closeComposer)}
            >
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-theme/80" />
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
              {renderComposerActions({
                confirmLabel: "추가",
                cancelLabel: "작성 취소",
                canConfirm: Boolean(draft.trim()),
                onConfirm: submit,
                onCancel: closeComposer,
              })}
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
                  className={cn(
                    "group relative border-b-transparent transition-colors hover:bg-muted/40 last:rounded-b-[var(--radius-widget)] last:border-b-border",
                    ROW_CLASS,
                  )}
                >
                  <span className="absolute top-[22%] bottom-[22%] left-0 w-[3px] rounded-r bg-theme opacity-0 transition-opacity group-hover:opacity-100" />
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-theme/80" />
                  {editingId === pin.id ? (
                    <div
                      className="flex min-w-0 flex-1 items-start gap-2.5"
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
                      {renderComposerActions({
                        confirmLabel: "저장",
                        cancelLabel: "수정 취소",
                        canConfirm: Boolean(editDraft.trim()),
                        onConfirm: () => commitEdit(pin.id),
                        onCancel: cancelEdit,
                      })}
                    </div>
                  ) : (
                    <p
                      className={cn(
                        TEXT_CLASS,
                        "min-w-0 flex-1 whitespace-pre-wrap break-words",
                      )}
                    >
                      {pin.text}
                    </p>
                  )}
                  {editingId !== pin.id && (
                    <div className="mt-0.5 flex shrink-0 gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                      <PinActionButton
                        label="핀 수정"
                        onClick={() => startEdit(pin)}
                      >
                        <Pencil className="size-2.5" />
                      </PinActionButton>
                      <PinActionButton
                        label="핀 고정 해제"
                        danger
                        onClick={() => {
                          if (readOnly) {
                            onRequireLogin?.()
                            return
                          }
                          onRemove(pin.id)
                        }}
                      >
                        <Trash2 className="size-2.5" />
                      </PinActionButton>
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
