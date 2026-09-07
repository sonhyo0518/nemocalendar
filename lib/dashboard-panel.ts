/** 메인 FolderPanel 탭 id — UI/훅 공통 */
export type FolderPanelId = "calendar" | "todo" | "bookmarks"

export const FOLDER_PANEL_IDS = ["calendar", "todo", "bookmarks"] as const

/** URL 쿼리 키 (`?panel=todo`) */
export const PANEL_QUERY_KEY = "panel"

export function isFolderPanelId(
  value: string | null | undefined,
): value is FolderPanelId {
  return (
    value === "calendar" || value === "todo" || value === "bookmarks"
  )
}

export function parseFolderPanelId(
  value: string | null | undefined,
): FolderPanelId {
  return isFolderPanelId(value) ? value : "calendar"
}
