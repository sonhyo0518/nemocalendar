"use client"

import * as React from "react"
import { MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"


/* ——— 폴더 행 ——— */
export function FolderRow({
    active,
    dropActive,
    icon,
    label,
    count,
    onSelect,
    onDragOver,
    onDragLeave,
    onDrop,
    onRename,
    onDelete,
    editing,
    editValue,
    onEditChange,
    onEditCommit,
    onEditCancel,
  }: {
    active: boolean
    dropActive: boolean
    icon: React.ReactNode
    label: string
    count: number
    onSelect: () => void
    onDragOver?: (e: React.DragEvent) => void
    onDragLeave?: () => void
    onDrop?: (e: React.DragEvent) => void
    onRename?: () => void
    onDelete?: () => void
    editing?: boolean
    editValue?: string
    onEditChange?: (v: string) => void
    onEditCommit?: () => void
    onEditCancel?: () => void
  }) {
    return (
      <div
        className={cn(
          "group flex items-center gap-1 rounded-md px-1.5 py-1 text-xs transition-colors",
          active && "bg-theme/15 text-foreground",
          !active && "text-muted-foreground hover:bg-muted/60",
          dropActive && "ring-1 ring-theme bg-theme/20",
        )}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <span className="shrink-0 opacity-70">{icon}</span>
  
        {editing ? (
          <input
            autoFocus
            value={editValue}
            className="h-8 min-w-0 flex-1 rounded border border-input bg-background px-1.5 text-sm outline-none focus-visible:ring-1 focus-visible:ring-ring"
            onChange={(e) => onEditChange?.(e.target.value)}
            onBlur={() => onEditCommit?.()}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.nativeEvent.isComposing) onEditCommit?.()
              if (e.key === "Escape") onEditCancel?.()
            }}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <button
            type="button"
            title={label}
            className="min-w-0 flex-1 truncate text-left font-medium"
            onClick={onSelect}
            onDoubleClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onRename?.()
            }}
          >
            {label}
          </button>
        )}
  
        {/* 숫자 */}
        <span className="w-5 shrink-0 text-right tabular-nums opacity-60">
          {count}
        </span>
  
        {/* ⋯ 메뉴: 폭 한 칸만 */}
        <div className="flex w-5 shrink-0 justify-end">
          {onRename || onDelete ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <button
                    type="button"
                    title="폴더 메뉴"
                    aria-label="폴더 메뉴"
                    className="grid size-5 place-items-center rounded text-muted-foreground opacity-0 transition-opacity hover:bg-muted hover:text-foreground max-sm:opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100"
                  />
                }
              >
                <MoreHorizontal className="size-3.5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-32">
                {onRename && (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation()
                      onRename()
                    }}
                  >
                    이름 변경
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete()
                    }}
                  >
                    삭제
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <span className="size-5" />
          )}
        </div>
      </div>
    )
  }