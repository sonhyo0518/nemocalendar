"use client"

import { useCallback } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import {
  PANEL_QUERY_KEY,
  parseFolderPanelId,
  type FolderPanelId,
} from "@/lib/dashboard-panel"

/** 메인 FolderPanel을 `?panel=` 쿼리와 동기화 (새로고침·공유 유지) */
export function useMainPanel() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const mainPanel = parseFolderPanelId(searchParams.get(PANEL_QUERY_KEY))

  const setMainPanel = useCallback(
    (id: FolderPanelId) => {
      const params = new URLSearchParams(searchParams.toString())
      if (id === "calendar") {
        params.delete(PANEL_QUERY_KEY)
      } else {
        params.set(PANEL_QUERY_KEY, id)
      }
      const qs = params.toString()
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
    },
    [pathname, router, searchParams],
  )

  return { mainPanel, setMainPanel }
}
