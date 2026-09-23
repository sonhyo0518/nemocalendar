"use client"

import { ExternalLink, Link2, Pencil, X } from "lucide-react"
import type { Bookmark } from "@/lib/dashboard-data"
import { isSafeHttpUrl } from "@/lib/url"
import { cn } from "@/lib/utils"
import {
  DND_TYPE,
  displayHost,
  faviconFor,
} from "@/components/dashboard/bookmark/bookmark-utils"

/* ——— 작은 카드 + OG 미리보기 ——— */
export function BookmarkCard({
  item,
  showPreview,
  onPreviewEnter,
  onPreviewLeave,
  onEdit,
  onRemove,
  onDragStartExtra,
  onDragEndExtra,
}: {
  item: Bookmark
  showPreview: boolean
  onPreviewEnter: () => void
  onPreviewLeave: () => void
  onEdit: () => void
  onRemove: () => void
  onDragStartExtra?: () => void
  onDragEndExtra?: () => void
}) {
  const icon = faviconFor(item.url, item.faviconUrl)

  function openBookmark(url: string) {
    if (!isSafeHttpUrl(url)) return
    window.open(url, "_blank", "noopener,noreferrer")
  }
  
  return (
    <div
      className="group relative"
      onMouseEnter={onPreviewEnter}
      onMouseLeave={onPreviewLeave}
    >
      <div
        draggable
        onDragStart={(e) => {
          e.dataTransfer.setData(DND_TYPE, item.id)
          e.dataTransfer.setData("text/plain", item.id) // 일부 브라우저 호환
          e.dataTransfer.effectAllowed = "move"
          onDragStartExtra?.()
        }}
        onDragEnd={() => onDragEndExtra?.()}
        className={cn(
          "rounded-md border border-border bg-card p-2 transition-colors",
          "cursor-pointer! hover:bg-muted/70 active:cursor-grabbing",
        )}
      >
        <div className="flex items-start gap-1.5">
          <span className="mt-0.5 grid size-6 shrink-0 place-items-center overflow-hidden rounded bg-muted">
            {icon ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={icon} alt="" width={14} height={14} className="size-3.5" />
            ) : (
              <Link2 className="size-3 text-muted-foreground" />
            )}
          </span>
          <button
            type="button"
            className="min-w-0 flex-1 text-left"
            onClick={() => openBookmark(item.url)}
          >
            <p className="truncate text-xs font-semibold text-foreground">
              {item.title}
            </p>
            <p className="truncate text-[10px] text-muted-foreground">
              {displayHost(item.url)}
            </p>
          </button>
        </div>
        <div className="mt-1 flex justify-end gap-0.5 opacity-0 transition-opacity max-sm:opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
          <button
            type="button"
            title="열기"
            aria-label="북마크 열기"
            className="grid size-5 place-items-center rounded text-muted-foreground hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            onClick={() => openBookmark(item.url)}
          >
            <ExternalLink className="size-2.5" />
          </button>
          <button
            type="button"
            title="수정"
            aria-label="북마크 수정"
            className="grid size-5 place-items-center rounded text-muted-foreground hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            onClick={onEdit}
          >
            <Pencil className="size-2.5" />
          </button>
          <button
            type="button"
            title="삭제"
            aria-label="북마크 삭제"
            className="grid size-5 place-items-center rounded text-muted-foreground hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            onClick={onRemove}
          >
            <X className="size-2.5" />
          </button>
        </div>
      </div>

      {/* OG 미리보기: 700ms hover */}
      {showPreview && (
        <div
          className="absolute left-0 top-full z-50 mt-1 w-[220px] overflow-hidden rounded-lg border border-border bg-card shadow-lg"
          onMouseEnter={onPreviewEnter}
          onMouseLeave={onPreviewLeave}
        >
          <div className="aspect-video bg-muted">
            {item.previewImageUrl && isSafeHttpUrl(item.previewImageUrl) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.previewImageUrl}
                alt=""
                className="size-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none"
                }}
              />
            ) : (
              <div className="grid size-full place-items-center">
                {icon ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={icon} alt="" className="size-8" />
                ) : (
                  <Link2 className="size-6 text-muted-foreground" />
                )}
              </div>
            )}
          </div>
          <div className="space-y-0.5 p-2">
            <p className="line-clamp-2 text-xs font-semibold text-foreground">
              {item.title}
            </p>
            {item.description ? (
              <p className="line-clamp-2 text-[10px] text-muted-foreground">
                {item.description}
              </p>
            ) : null}
            <p className="truncate text-[10px] text-muted-foreground">
              {displayHost(item.url)}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}