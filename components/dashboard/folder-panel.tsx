"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import type { FolderPanelId } from "@/lib/dashboard-panel"

export type { FolderPanelId }

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
  const panelId = "folder-panel-content"
  function onTabKeyDown(
    e: React.KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) {
    const last = TABS.length - 1
    let next = index
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = index === last ? 0 : index + 1
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = index === 0 ? last : index - 1
    else if (e.key === "Home") next = 0
    else if (e.key === "End") next = last
    else return
    e.preventDefault()
    onValueChange(TABS[next].id)
    // 포커스 이동은 다음 렌더의 tabIndex=0 탭에 맡기거나
    // requestAnimationFrame으로 해당 버튼을 focus
  }

  return (
    <div className={cn("flex flex-col", className)}>
      <div role="tablist" aria-label="메인 패널" className="flex items-end">
        {TABS.map((tab, i) => {
          const active = value === tab.id
          const tabId = `folder-tab-${tab.id}`
          return (
            <button
              key={tab.id}
              id={tabId}
              type="button"
              role="tab"
              aria-selected={active}
              aria-controls={panelId}
              tabIndex={active ? 0 : -1}
              onClick={() => onValueChange(tab.id)}
              onKeyDown={(e) => onTabKeyDown(e, i)}
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
        id={panelId}
        role="tabpanel"
        aria-labelledby={`folder-tab-${value}`}
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