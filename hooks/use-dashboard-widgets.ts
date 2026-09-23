"use client"

import { useCallback, useEffect, useState } from "react"

import type {
  Anniversary,
  BoardTask,
  Bookmark,
  BookmarkFolder,
  Pin,
  TodoCategory,
  TodoStatus,
} from "@/lib/dashboard-data"
import { authJson, notifyApiError } from "@/lib/api"

async function mutateWidget<T>(
  request: () => Promise<T>,
  onSuccess: (data: T) => void,
  errorMessage: string,
): Promise<void> {
  try {
    const data = await request()
    onSuccess(data)
  } catch (err) {
    notifyApiError(err, errorMessage)
  }
}

type UseDashboardWidgetsOptions = {
  userEmail?: string
  onUnauthorized: () => void
}

export function useDashboardWidgets({
  userEmail,
  onUnauthorized,
}: UseDashboardWidgetsOptions) {
  const [pins, setPins] = useState<Pin[]>([])
  const [anniversaries, setAnniversaries] = useState<Anniversary[]>([])
  const [todoCategories, setTodoCategories] = useState<TodoCategory[]>([])
  const [boardTasks, setBoardTasks] = useState<BoardTask[]>([])
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [bookmarkFolders, setBookmarkFolders] = useState<BookmarkFolder[]>([])

  const resetWidgetsState = useCallback(() => {
    setTodoCategories([])
    setBoardTasks([])
    setAnniversaries([])
    setPins([])
    setBookmarks([])
    setBookmarkFolders([])
  }, [])

  const addPin = useCallback(
    async (text: string) => {
      await mutateWidget(
        () =>
          authJson<{ pin: Pin }>("/api/pins", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text }),
            onUnauthorized,
          }),
        (data) => setPins((prev) => [data.pin, ...prev]),
        "핀 추가에 실패했습니다.",
      )
    },
    [onUnauthorized],
  )

  const updatePin = useCallback(
    async (id: string, text: string) => {
      await mutateWidget(
        () =>
          authJson(`/api/pins/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text }),
            onUnauthorized,
          }),
        () =>
          setPins((prev) =>
            prev.map((pin) => (pin.id === id ? { ...pin, text } : pin)),
          ),
        "핀 수정에 실패했습니다.",
      )
    },
    [onUnauthorized],
  )

  const removePin = useCallback(
    async (id: string) => {
      await mutateWidget(
        () =>
          authJson(`/api/pins/${id}`, {
            method: "DELETE",
            onUnauthorized,
          }),
        () => setPins((prev) => prev.filter((pin) => pin.id !== id)),
        "핀 삭제에 실패했습니다.",
      )
    },
    [onUnauthorized],
  )

  const addBookmark = useCallback(
    async (input: {
      url: string
      title?: string
      description?: string | null
      folderId?: string | null
    }) => {
      await mutateWidget(
        () =>
          authJson<{ bookmark: Bookmark }>("/api/bookmarks", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(input),
            onUnauthorized,
          }),
        (data) => setBookmarks((prev) => [...prev, data.bookmark].sort((a, b) => a.sequence - b.sequence)),
        "북마크 추가에 실패했습니다.",
      )
    },
    [onUnauthorized],
  )

  const updateBookmark = useCallback(
    async (
      id: string,
      patch: Partial<
        Pick<
          Bookmark,
          | "url"
          | "title"
          | "description"
          | "faviconUrl"
          | "previewImageUrl"
          | "folderId"
          | "sequence"
        >
      >,
    ) => {
      await mutateWidget(
        () =>
          authJson<{ bookmark: Bookmark }>(`/api/bookmarks/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(patch),
            onUnauthorized,
          }),
        (data) => setBookmarks((prev) => prev.map((b) => (b.id === id ? data.bookmark : b)).sort((a, b) => a.sequence - b.sequence)),
        "북마크 수정에 실패했습니다.",
      )
    },
    [onUnauthorized],
  )

  const removeBookmark = useCallback(
    async (id: string) => {
      await mutateWidget(
        () =>
          authJson(`/api/bookmarks/${id}`, {
            method: "DELETE",
            onUnauthorized,
          }),
        () => setBookmarks((prev) => prev.filter((b) => b.id !== id)),
        "북마크 삭제에 실패했습니다.",
      )
    },
    [onUnauthorized],
  )

  const addBookmarkFolder = useCallback(
    async (name: string) => {
      await mutateWidget(
        () =>
          authJson<{ folder: BookmarkFolder }>("/api/bookmark-folders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name }),
            onUnauthorized,
          }),
        (data) => setBookmarkFolders((prev) => [...prev, data.folder].sort((a, b) => a.sequence - b.sequence)),
        "폴더 추가에 실패했습니다.",
      )
    },
    [onUnauthorized],
  )

  const updateBookmarkFolder = useCallback(
    async (
      id: string,
      patch: Partial<Pick<BookmarkFolder, "name" | "sequence">>,
    ) => {
      await mutateWidget(
        () =>
          authJson<{ folder: BookmarkFolder }>(`/api/bookmark-folders/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(patch),
            onUnauthorized,
          }),
        (data) => setBookmarkFolders((prev) => prev.map((f) => (f.id === id ? data.folder : f)).sort((a, b) => a.sequence - b.sequence)),
        "폴더 수정에 실패했습니다.",
      )
    },
    [onUnauthorized],
  )

  const removeBookmarkFolder = useCallback(
    async (id: string) => {
      await mutateWidget(
        () =>
          authJson(`/api/bookmark-folders/${id}`, {
            method: "DELETE",
            onUnauthorized,
          }),
          () => {
            setBookmarkFolders((prev) => prev.filter((f) => f.id !== id))
            setBookmarks((prev) =>
              prev.map((b) => (b.folderId === id ? { ...b, folderId: null } : b)),
            )
          },
          "폴더 삭제에 실패했습니다.",
      )
    },
    [onUnauthorized],
  )

  const addAnniversary = useCallback(
    async (item: Omit<Anniversary, "id">) => {
      await mutateWidget(
        () =>
          authJson<{ anniversary: Anniversary }>("/api/anniversaries", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(item),
            onUnauthorized,
          }),
        (data) => setAnniversaries((prev) => [...prev, data.anniversary]),
        "기념일 추가에 실패했습니다.",
      )
    },
    [onUnauthorized],
  )

  const removeAnniversary = useCallback(
    async (id: string) => {
        await mutateWidget(
          () =>
            authJson(`/api/anniversaries/${id}`, {
          method: "DELETE",
          onUnauthorized,
        }),
        () => setAnniversaries((prev) => prev.filter((item) => item.id !== id)),
        "기념일 삭제에 실패했습니다.",
      )
    },
    [onUnauthorized],
  )

  const updateAnniversary = useCallback(
    async (id: string, patch: Pick<Anniversary, "title" | "date" | "color">) => {
      await mutateWidget(
        () =>
          authJson<{ anniversary: Anniversary }>(`/api/anniversaries/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(patch),
            onUnauthorized,
          }),
        (data) => setAnniversaries((prev) => prev.map((item) => (item.id === id ? data.anniversary : item))),
        "기념일 수정에 실패했습니다.",
      )
    },
    [onUnauthorized],
  )

  const addTask = useCallback(
    async (task: Omit<BoardTask, "id">) => {  
        await mutateWidget(
          () =>
            authJson<{ todo: BoardTask }>("/api/todos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(task),
          onUnauthorized,
          }),
        (data) => setBoardTasks((prev) => [...prev, data.todo]),
        "할 일 추가에 실패했습니다.",
      )
    },
    [onUnauthorized],
  )

  const moveTask = useCallback(
    async (id: string, status: TodoStatus) => {
      await mutateWidget(
        () =>
          authJson(`/api/todos/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status }),
            onUnauthorized,
          }),
        (data) => setBoardTasks((prev) => prev.map((task) => (task.id === id ? { ...task, status } : task))),
        "할 일 이동에 실패했습니다.",
      )
    },
    [onUnauthorized],
  )

  const updateTask = useCallback(
    async (id: string, task: Omit<BoardTask, "id">) => {
      await mutateWidget(
        () =>
          authJson<{ todo: BoardTask }>(`/api/todos/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(task),
            onUnauthorized,
          }),
        (data) =>
          setBoardTasks((prev) =>
            prev.map((item) => (item.id === id ? data.todo : item)),
          ),
        "할 일 수정에 실패했습니다.",
      )
    },
    [onUnauthorized],
  )

  const removeTask = useCallback(
    async (id: string) => {
        await mutateWidget(
          () =>
            authJson(`/api/todos/${id}`, {
          method: "DELETE",
          onUnauthorized,
            }),
          () => setBoardTasks((prev) => prev.filter((task) => task.id !== id)),
          "할 일 삭제에 실패했습니다.",
        )
      },
    [onUnauthorized],
  )

  const addTodoCategory = useCallback(
    async (input: { name: string; color: string }) => {
      await mutateWidget(
        () =>
          authJson<{ category: TodoCategory }>("/api/todo-categories", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(input),
            onUnauthorized,
          }),
        (data) => setTodoCategories((prev) => [...prev, data.category]),
        "카테고리 추가에 실패했습니다.",
      )
    },
    [onUnauthorized],
  )

  const updateTodoCategory = useCallback(
    async (id: string, input: { name: string; color: string }) => {
      await mutateWidget(
        () =>
          authJson<{ category: TodoCategory }>(`/api/todo-categories/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(input),
            onUnauthorized,
          }),
        (data) => setTodoCategories((prev) => prev.map((category) => (category.id === id ? data.category : category))),
        "카테고리 수정에 실패했습니다.",
      )
    },
    [onUnauthorized],
  )

  const removeTodoCategory = useCallback(
    async (id: string) => {
      await mutateWidget(
        () =>
          authJson(`/api/todo-categories/${id}`, {
            method: "DELETE",
            onUnauthorized,
          }),
          () => {
            setTodoCategories((prev) =>
              prev.filter((category) => category.id !== id),
            )
            setBoardTasks((prev) =>
              prev.map((task) =>
                task.categoryId === id ? { ...task, categoryId: "" } : task,
              ),
            )
          },
          "카테고리 삭제에 실패했습니다.",
      )
    },
    [onUnauthorized],
  )

  useEffect(() => {
    if (!userEmail) return
    const ctrl = new AbortController()
    const opts = { onUnauthorized, signal: ctrl.signal }
    Promise.all([
      authJson<{ pins?: Pin[] }>("/api/pins", opts),
      authJson<{ bookmarks?: Bookmark[] }>("/api/bookmarks", opts),
      authJson<{ folders?: BookmarkFolder[] }>("/api/bookmark-folders", opts),
      authJson<{ anniversaries?: Anniversary[] }>("/api/anniversaries", opts),
      authJson<{ categories?: TodoCategory[] }>("/api/todo-categories", opts),
      authJson<{ todos?: BoardTask[] }>("/api/todos", opts),
    ])
      .then(([pinData, bookmarkData, folderData, annData, catData, todoData]) => {
        if (ctrl.signal.aborted) return
        setPins(pinData?.pins ?? [])
        setBookmarks(bookmarkData?.bookmarks ?? [])
        setBookmarkFolders(folderData?.folders ?? [])
        setAnniversaries(annData?.anniversaries ?? [])
        setTodoCategories(catData?.categories ?? [])
        setBoardTasks(todoData?.todos ?? [])
      })
      .catch((err) => {
        if (ctrl.signal.aborted) return
        if (err instanceof Error && err.name === "AbortError") return
        notifyApiError(err, "대시보드 데이터를 불러오지 못했습니다.")
        setPins([])
        setBookmarks([])
        setBookmarkFolders([])
        setAnniversaries([])
        setTodoCategories([])
        setBoardTasks([])
      })
  
    return () => {
      ctrl.abort()
    }
  }, [userEmail, onUnauthorized])
  
  return {
    pins,
    bookmarks,
    bookmarkFolders,
    anniversaries,
    boardTasks,
    todoCategories,
    addPin,
    updatePin,
    removePin,
    addBookmark,
    updateBookmark,
    removeBookmark,
    addBookmarkFolder,
    updateBookmarkFolder,
    removeBookmarkFolder,
    addAnniversary,
    removeAnniversary,
    updateAnniversary,
    addTask,
    moveTask,
    updateTask,
    removeTask,
    addTodoCategory,
    updateTodoCategory,
    removeTodoCategory,
    resetWidgetsState,
  }
}