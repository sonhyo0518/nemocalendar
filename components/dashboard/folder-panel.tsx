"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export type FolderPanelId = "calendar" | "todo" | "bookmarks"

const TABS: { id: FolderPanelId; label: string }[] = [
  { id: "calendar", label: "캘린더" },
  { id: "todo", label: "할 일" },
  { id: "bookmarks", label: "링크" },
]

interface FolderPanelProps {
  value: FolderPanelId
  onValueChange: (id: FolderPanelId) => void
  children: React.ReactNode
  className?: string
}

export function FolderPanel({
  value,
  onValueChange,
  children,
  className,
}: FolderPanelProps) {
  return (
    <div className={cn("flex flex-col", className)}>
      {/* px 제거 → content 왼쪽과 세로 정렬 / gap-0 → 탭끼리·content에 붙임 */}
      <div
        role="tablist"
        aria-label="메인 패널"
        className="flex items-end"
      >
        {TABS.map((tab, i) => {
          const active = value === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onValueChange(tab.id)}
              className={cn(
                "relative -mb-px px-5 py-2.5 text-sm font-medium tracking-tight",
                "rounded-t-panel border border-card-border",
                "transition-colors duration-150",
                // 두 번째 탭부터 왼쪽 border 겹침 → 한 줄로 붙음
                i > 0 && "-ml-px",
                active
                  ? "z-10 border-b-transparent bg-card text-foreground"
                  : "z-0 bg-muted/40 text-muted-foreground hover:bg-muted/70 hover:text-foreground",
              )}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      <div
        role="tabpanel"
        className={cn(
          "rounded-b-panel rounded-tr-panel border border-card-border bg-card",
          "p-4 sm:p-5",
          // 첫 탭이 왼쪽에서 시작하므로, content 왼쪽 위는 각지게(탭이 덮음)
          "rounded-tl-none",
        )}
      >
        {children}
      </div>
    </div>
  )
}