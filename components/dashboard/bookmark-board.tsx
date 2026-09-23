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

import { isSafeHttpUrl } from "@/lib/url"
import type { Bookmark, BookmarkFolder } from "@/lib/dashboard-data"
import {
  DND_TYPE,
  PREVIEW_DELAY_MS,
  normalizeUrl,
} from "@/components/dashboard/bookmark/bookmark-utils"
import { FolderRow } from "@/components/dashboard/bookmark/folder-row"
import { BookmarkCard } from "@/components/dashboard/bookmark/bookmark-card"
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
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
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
  const [folderPendingDelete, setFolderPendingDelete] = React.useState<{
    id: string
    name: string
  } | null>(null)

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
                if (readOnly) {
                  onRequireLogin?.()
                  return
                }
                setFolderPendingDelete({ id: f.id, name: f.name })
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
      <ConfirmDialog
        open={folderPendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setFolderPendingDelete(null)
        }}
        title="폴더 삭제"
        description={`「${folderPendingDelete?.name ?? ""}」 폴더를 삭제할까요?`}
        confirmLabel="삭제"
        danger
        onConfirm={() => {
          if (!folderPendingDelete) return
          onRemoveFolder(folderPendingDelete.id)
          if (filter === folderPendingDelete.id) setFilter("all")
          setFolderPendingDelete(null)
        }}
      />
    </section>
  )
}



