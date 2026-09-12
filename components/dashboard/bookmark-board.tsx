"use client"

import * as React from "react"
import {
  ExternalLink,
  Folder,
  FolderPlus,
  Inbox,
  Link2,
  MoreHorizontal,
  Pencil,
  Plus,
  X,
} from "lucide-react"

import type { Bookmark, BookmarkFolder } from "@/lib/dashboard-data"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type FolderFilter = "all" | "unfiled" | string // string = folderId

interface BookmarkBoardProps {
  items: Bookmark[]
  folders: BookmarkFolder[]
  onAdd: (input: {
    url: string
    title?: string
    description?: string | null
    folderId?: string | null
  }) => void
  onUpdate: (
    id: string,
    patch: Partial<
      Pick<
        Bookmark,
        "url" | "title" | "description" | "folderId" | "sequence"
      >
    >,
  ) => void
  onRemove: (id: string) => void
  onAddFolder: (name: string) => void
  onUpdateFolder: (
    id: string,
    patch: Partial<Pick<BookmarkFolder, "name" | "sequence">>,
  ) => void
  onRemoveFolder: (id: string) => void
  flush?: boolean
  readOnly?: boolean
  onRequireLogin?: () => void
}

const DND_TYPE = "application/x-nemo-bookmark-id"
const PREVIEW_DELAY_MS = 700

function normalizeUrl(raw: string) {
  const t = raw.trim()
  if (!t) return ""
  if (/^https?:\/\//i.test(t)) return t
  return `https://${t}`
}

function faviconFor(url: string, faviconUrl?: string | null) {
  if (faviconUrl) return faviconUrl
  try {
    const host = new URL(url).hostname
    return `https://www.google.com/s2/favicons?domain=${host}&sz=32`
  } catch {
    return null
  }
}

function displayHost(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "")
  } catch {
    return url
  }
}

export function BookmarkBoard({
  items,
  folders,
  onAdd,
  onUpdate,
  onRemove,
  onAddFolder,
  onUpdateFolder,
  onRemoveFolder,
  flush = false,
  readOnly = false,
  onRequireLogin,
}: BookmarkBoardProps) {
  const [filter, setFilter] = React.useState<FolderFilter>("all")
  const [dropTarget, setDropTarget] = React.useState<FolderFilter | null>(null)
  const [dragging, setDragging] = React.useState(false)
  const [previewId, setPreviewId] = React.useState<string | null>(null)
  const previewTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  const [open, setOpen] = React.useState(false)
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [url, setUrl] = React.useState("")
  const [title, setTitle] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [folderDraft, setFolderDraft] = React.useState("")
  const [editingFolderId, setEditingFolderId] = React.useState<string | null>(null)
  const [editingFolderName, setEditingFolderName] = React.useState("")

  const sortedFolders = React.useMemo(
    () => [...folders].sort((a, b) => a.sequence - b.sequence),
    [folders],
  )

  const unfiledCount = items.filter((b) => !b.folderId).length

  const visible = React.useMemo(() => {
    const list = [...items].sort((a, b) => a.sequence - b.sequence)
    if (filter === "all") return list
    if (filter === "unfiled") return list.filter((b) => !b.folderId)
    return list.filter((b) => b.folderId === filter)
  }, [items, filter])

  function clearPreviewTimer() {
    if (previewTimer.current) {
      clearTimeout(previewTimer.current)
      previewTimer.current = null
    }
  }

  function onCardEnter(id: string) {
    clearPreviewTimer()
    previewTimer.current = setTimeout(() => setPreviewId(id), PREVIEW_DELAY_MS)
  }

  function onCardLeave() {
    clearPreviewTimer()
    setPreviewId(null)
  }

  React.useEffect(() => () => clearPreviewTimer(), [])

  function resetForm() {
    setEditingId(null)
    setUrl("")
    setTitle("")
    setDescription("")
  }

  function openCreate() {
    if (readOnly) {
      onRequireLogin?.()
      return
    }
    resetForm()
    setOpen(true)
  }
  
  function openEdit(item: Bookmark) {
    if (readOnly) {
      onRequireLogin?.()
      return
    }
    setEditingId(item.id)
    setUrl(item.url)
    setTitle(item.title)
    setDescription(item.description ?? "")
    setOpen(true)
  }
  
  function addFolder() {
    if (readOnly) {
      onRequireLogin?.()
      return
    }
    const name = folderDraft.trim()
    if (!name) return
    onAddFolder(name)
    setFolderDraft("")
  }

  function submit() {
    const normalized = normalizeUrl(url)
    if (!normalized) return

    const folderId =
      filter !== "all" && filter !== "unfiled" ? filter : null

    if (editingId) {
      onUpdate(editingId, {
        url: normalized,
        title: title.trim() || undefined,
        description: description.trim() || null,
      })
    } else {
      onAdd({
        url: normalized,
        title: title.trim() || undefined,
        description: description.trim() || null,
        folderId,
      })
    }
    setOpen(false)
    resetForm()
  }

  function startRenameFolder(folder: BookmarkFolder) {
    if (readOnly) {
      onRequireLogin?.()
      return
    }
    setEditingFolderId(folder.id)
    setEditingFolderName(folder.name)
  }

  function commitRenameFolder() {
    if (!editingFolderId) return
    const name = editingFolderName.trim()
    const prev = folders.find((f) => f.id === editingFolderId)
    if (name && prev && name !== prev.name) {
      onUpdateFolder(editingFolderId, { name })
    }
    setEditingFolderId(null)
    setEditingFolderName("")
  }

  function handleDrop(target: FolderFilter, e: React.DragEvent) {
    if (readOnly) {
      onRequireLogin?.()
      return
    }
    e.preventDefault()
    setDropTarget(null)
    const id =
      e.dataTransfer.getData(DND_TYPE) || e.dataTransfer.getData("text/plain")
    if (!id) return
    if (target === "all") return
    const folderId = target === "unfiled" ? null : target
    onUpdate(id, { folderId })
  }

  return (
    <section
      className={cn(
        flush
          ? "p-0"
          : "rounded-panel border border-card-border bg-card p-4 sm:p-5",
        dragging && "cursor-grabbing",
      )}
      onDragOver={(e) => {
        if (!dragging) return
        e.preventDefault()
        e.dataTransfer.dropEffect = "move"
      }}
    >
      {/* 헤더 */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Link2 className="size-4 text-theme" />
          <h2 className="text-base font-semibold tracking-tight text-foreground">
            링크
          </h2>
          <span className="text-xs font-semibold text-muted-foreground">
            {items.length}
          </span>
        </div>
        <Button size="sm" onClick={openCreate}>
          <Plus data-icon="inline-start" />
          새 링크
        </Button>
      </div>

      <div className="grid gap-3 lg:grid-cols-[220px_minmax(0,1fr)]">
        {/* 왼쪽: 폴더 리스트 */}
        <aside className="flex flex-col gap-0.5 rounded-lg border border-border p-1.5">
          <FolderRow
            active={filter === "all"}
            dropActive={false}
            icon={<Inbox className="size-3.5" />}
            label="전체"
            count={items.length}
            onSelect={() => setFilter("all")}
          />
          <FolderRow
            active={filter === "unfiled"}
            dropActive={dropTarget === "unfiled"}
            icon={<Folder className="size-3.5" />}
            label="미분류"
            count={unfiledCount}
            onSelect={() => setFilter("unfiled")}
            onDragOver={(e) => {
              e.preventDefault()
              e.dataTransfer.dropEffect = "move"
              setDropTarget("unfiled")
            }}
            onDragLeave={() => setDropTarget(null)}
            onDrop={(e) => handleDrop("unfiled", e)}
          />
          {sortedFolders.map((f) => (
            <FolderRow
              key={f.id}
              active={filter === f.id}
              dropActive={dropTarget === f.id}
              icon={<Folder className="size-3.5" />}
              label={f.name}
              count={items.filter((b) => b.folderId === f.id).length}
              onSelect={() => setFilter(f.id)}
              onDragOver={(e) => {
                e.preventDefault()
                e.dataTransfer.dropEffect = "move"
                setDropTarget(f.id)
              }}
              onDragLeave={() => setDropTarget(null)}
              onDrop={(e) => handleDrop(f.id, e)}
              onRename={() => startRenameFolder(f)}
              editing={editingFolderId === f.id}
              editValue={editingFolderName}
              onEditChange={setEditingFolderName}
              onEditCommit={commitRenameFolder}
              onEditCancel={() => {
                setEditingFolderId(null)
                setEditingFolderName("")
              }}
              onDelete={() => {
                if (window.confirm(`「${f.name}」 폴더를 삭제할까요?`)) { 
                  if (readOnly) {
                    onRequireLogin?.()
                    return
                  }
                  onRemoveFolder(f.id)
                  if (filter === f.id) setFilter("all")
                }
              }}
            />
          ))}

          <div className="mt-1 flex gap-1 border-t border-border pt-1.5">
            <Input
              value={folderDraft}
              placeholder="새 폴더"
              className="h-7 text-xs"
              onChange={(e) => setFolderDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.nativeEvent.isComposing) addFolder()
              }}
            />
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              className="size-7 shrink-0"
              title="폴더 추가"
              onClick={addFolder}
            >
              <FolderPlus className="size-3.5" />
            </Button>
          </div>
        </aside>

        {/* 오른쪽: 작은 카드 그리드 */}
        <div>
          {visible.length === 0 ? (
            <p className="py-8 text-center text-xs text-muted-foreground">
              {filter === "all"
                ? "링크를 추가하거나, 카드를 폴더로 끌어다 넣으세요."
                : "이 폴더에 링크가 없어요."}
            </p>
          ) : (
            <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
              {visible.map((item) => (
                <li key={item.id} className="relative">
                  <BookmarkCard
                    onDragStartExtra={() => setDragging(true)}
                    onDragEndExtra={() => {
                      setDragging(false)
                      setDropTarget(null)
                    }}
                    item={item}
                    showPreview={previewId === item.id}
                    onPreviewEnter={() => onCardEnter(item.id)}
                    onPreviewLeave={onCardLeave}
                    onEdit={() => openEdit(item)}
                    onRemove={() => {
                      if (readOnly) {
                        onRequireLogin?.()
                        return
                      }
                      onRemove(item.id)
                    }}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* 추가/수정 Dialog — 기존과 동일 */}
      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next)
          if (!next) resetForm()
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingId ? "링크 수정" : "새 링크 추가"}
            </DialogTitle>
            <DialogDescription>
              {editingId
                ? "URL과 제목, 설명을 수정하세요."
                : "자주 쓰는 페이지 URL을 저장하세요."}
            </DialogDescription>
          </DialogHeader>

          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault()
              submit()
            }}
          >
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="bookmark-url">URL</Label>
                <Input
                  id="bookmark-url"
                  autoFocus
                  value={url}
                  placeholder="https://example.com"
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="bookmark-title">제목 (선택)</Label>
                <Input
                  id="bookmark-title"
                  value={title}
                  placeholder="비우면 OG/도메인으로 저장"
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="bookmark-description">설명 (선택)</Label>
                <Input
                  id="bookmark-description"
                  value={description}
                  placeholder="짧은 메모"
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setOpen(false)
                  resetForm()
                }}
              >
                취소
              </Button>
              <Button type="submit" disabled={!url.trim()}>
                {editingId ? "저장" : "추가"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  )
}

/* ——— 폴더 행 ——— */
function FolderRow({
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
                  className="grid size-5 place-items-center rounded text-muted-foreground opacity-0 transition-opacity hover:bg-muted group-hover:opacity-100 hover:text-foreground"
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

/* ——— 작은 카드 + OG 미리보기 ——— */
function BookmarkCard({
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
            onClick={() =>
              window.open(item.url, "_blank", "noopener,noreferrer")
            }
          >
            <p className="truncate text-xs font-semibold text-foreground">
              {item.title}
            </p>
            <p className="truncate text-[10px] text-muted-foreground">
              {displayHost(item.url)}
            </p>
          </button>
        </div>
        <div className="mt-1 flex justify-end gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            type="button"
            title="열기"
            aria-label="북마크 열기"
            className="grid size-5 place-items-center rounded text-muted-foreground hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            onClick={() =>
              window.open(item.url, "_blank", "noopener,noreferrer")
            }
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
            {item.previewImageUrl ? (
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