"use client"

import type { ReactNode } from "react"
import { FolderPanel } from "@/components/dashboard/folder-panel"
import type { FolderPanelId } from "@/lib/dashboard-panel"
import { cn } from "@/lib/utils"

type DashboardChromeProps = {
  mainPanel: FolderPanelId
  onMainPanelChange: (id: FolderPanelId) => void
  main: ReactNode
  aside: ReactNode
  className?: string
  folderPanelClassName?: string
  asideClassName?: string
}

export function DashboardChrome({
  mainPanel,
  onMainPanelChange,
  main,
  aside,
  className,
  folderPanelClassName,
  asideClassName,
}: DashboardChromeProps) {
  return (
    <div
      className={cn(
        "grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start",
        className,
      )}
    >
      <FolderPanel
        value={mainPanel}
        onValueChange={onMainPanelChange}
        className={folderPanelClassName}
      >
        {main}
      </FolderPanel>
      <aside
        className={cn(
          "flex w-full flex-col gap-4 self-start lg:pt-10",
          asideClassName,
        )}
      >
        {aside}
      </aside>
    </div>
  )
}