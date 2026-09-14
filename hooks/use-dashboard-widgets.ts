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
      try {
        const data = await authJson<{ pin: Pin }>("/api/pins", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
          onUnauthorized,
        })
        setPins((prev) => [data.pin, ...prev])
      } catch (err) {
        notifyApiError(err, "핀 추가에 실패했습니다.")
      }
    },
    [onUnauthorized],
  )

  const updatePin = useCallback(
    async (id: string, text: string) => {
      try {
        await authJson(`/api/pins/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
          onUnauthorized,
        })
        setPins((prev) =>
          prev.map((pin) => (pin.id === id ? { ...pin, text } : pin)),
        )
      } catch (err) {
        notifyApiError(err, "핀 수정에 실패했습니다.")
      }
    },
    [onUnauthorized],
  )

  const removePin = useCallback(
    async (id: string) => {
      try {
        await authJson(`/api/pins/${id}`, {
          method: "DELETE",
          onUnauthorized,
        })
        setPins((prev) => prev.filter((pin) => pin.id !== id))
      } catch (err) {
        notifyApiError(err, "핀 삭제에 실패했습니다.")
      }
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
      try {
        const data = await authJson<{ bookmark: Bookmark }>("/api/bookmarks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
          onUnauthorized,
        })
        setBookmarks((prev) =>
          [...prev, data.bookmark].sort((a, b) => a.sequence - b.sequence),
        )
      } catch (err) {
        notifyApiError(err, "북마크 추가에 실패했습니다.")
      }
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
      try {
        const data = await authJson<{ bookmark: Bookmark }>(
          `/api/bookmarks/${id}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(patch),
            onUnauthorized,
          },
        )
        setBookmarks((prev) =>
          prev
            .map((b) => (b.id === id ? data.bookmark : b))
            .sort((a, b) => a.sequence - b.sequence),
        )
      } catch (err) {
        notifyApiError(err, "북마크 수정에 실패했습니다.")
      }
    },
    [onUnauthorized],
  )

  const removeBookmark = useCallback(
    async (id: string) => {
      try {
        await authJson(`/api/bookmarks/${id}`, {
          method: "DELETE",
          onUnauthorized,
        })
        setBookmarks((prev) => prev.filter((b) => b.id !== id))
      } catch (err) {
        notifyApiError(err, "북마크 삭제에 실패했습니다.")
      }
    },
    [onUnauthorized],
  )

  const addBookmarkFolder = useCallback(
    async (name: string) => {
      try {
        const data = await authJson<{ folder: BookmarkFolder }>(
          "/api/bookmark-folders",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name }),
            onUnauthorized,
          },
        )
        setBookmarkFolders((prev) =>
          [...prev, data.folder].sort((a, b) => a.sequence - b.sequence),
        )
      } catch (err) {
        notifyApiError(err, "폴더 추가에 실패했습니다.")
      }
    },
    [onUnauthorized],
  )

  const updateBookmarkFolder = useCallback(
    async (
      id: string,
      patch: Partial<Pick<BookmarkFolder, "name" | "sequence">>,
    ) => {
      try {
        const data = await authJson<{ folder: BookmarkFolder }>(
          `/api/bookmark-folders/${id}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(patch),
            onUnauthorized,
          },
        )
        setBookmarkFolders((prev) =>
          prev
            .map((f) => (f.id === id ? data.folder : f))
            .sort((a, b) => a.sequence - b.sequence),
        )
      } catch (err) {
        notifyApiError(err, "폴더 수정에 실패했습니다.")
      }
    },
    [onUnauthorized],
  )

  const removeBookmarkFolder = useCallback(
    async (id: string) => {
      try {
        await authJson(`/api/bookmark-folders/${id}`, {
          method: "DELETE",
          onUnauthorized,
        })
        setBookmarkFolders((prev) => prev.filter((f) => f.id !== id))
        setBookmarks((prev) =>
          prev.map((b) => (b.folderId === id ? { ...b, folderId: null } : b)),
        )
      } catch (err) {
        notifyApiError(err, "폴더 삭제에 실패했습니다.")
      }
    },
    [onUnauthorized],
  )

  const addAnniversary = useCallback(
    async (item: Omit<Anniversary, "id">) => {
      try {
        const data = await authJson<{ anniversary: Anniversary }>(
          "/api/anniversaries",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(item),
            onUnauthorized,
          },
        )
        setAnniversaries((prev) => [...prev, data.anniversary])
      } catch (err) {
        notifyApiError(err, "기념일 추가에 실패했습니다.")
      }
    },
    [onUnauthorized],
  )

  const removeAnniversary = useCallback(
    async (id: string) => {
      try {
        await authJson(`/api/anniversaries/${id}`, {
          method: "DELETE",
          onUnauthorized,
        })
        setAnniversaries((prev) => prev.filter((item) => item.id !== id))
      } catch (err) {
        notifyApiError(err, "기념일 삭제에 실패했습니다.")
      }
    },
    [onUnauthorized],
  )

  const updateAnniversary = useCallback(
    async (id: string, patch: Pick<Anniversary, "title" | "date" | "color">) => {
      try {
        const data = await authJson<{ anniversary: Anniversary }>(
          `/api/anniversaries/${id}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(patch),
            onUnauthorized,
          },
        )
        setAnniversaries((prev) =>
          prev.map((item) => (item.id === id ? data.anniversary : item)),
        )
      } catch (err) {
        notifyApiError(err, "기념일 수정에 실패했습니다.")
      }
    },
    [onUnauthorized],
  )

  const addTask = useCallback(
    async (task: Omit<BoardTask, "id">) => {
      try {
        const data = await authJson<{ todo: BoardTask }>("/api/todos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(task),
          onUnauthorized,
        })
        setBoardTasks((prev) => [...prev, data.todo])
      } catch (err) {
        notifyApiError(err, "할 일 추가에 실패했습니다.")
      }
    },
    [onUnauthorized],
  )

  const moveTask = useCallback(
    async (id: string, status: TodoStatus) => {
      try {
        await authJson(`/api/todos/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
          onUnauthorized,
        })
        setBoardTasks((prev) =>
          prev.map((task) => (task.id === id ? { ...task, status } : task)),
        )
      } catch (err) {
        notifyApiError(err, "할 일 이동에 실패했습니다.")
      }
    },
    [onUnauthorized],
  )

  const updateTask = useCallback(
    async (id: string, task: Omit<BoardTask, "id">) => {
      try {
        const data = await authJson<{ todo: BoardTask }>(`/api/todos/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(task),
          onUnauthorized,
        })
        setBoardTasks((prev) =>
          prev.map((item) => (item.id === id ? data.todo : item)),
        )
      } catch (err) {
        notifyApiError(err, "할 일 수정에 실패했습니다.")
      }
    },
    [onUnauthorized],
  )

  const removeTask = useCallback(
    async (id: string) => {
      try {
        await authJson(`/api/todos/${id}`, {
          method: "DELETE",
          onUnauthorized,
        })
        setBoardTasks((prev) => prev.filter((task) => task.id !== id))
      } catch (err) {
        notifyApiError(err, "할 일 삭제에 실패했습니다.")
      }
    },
    [onUnauthorized],
  )

  const addTodoCategory = useCallback(
    async (input: { name: string; color: string }) => {
      try {
        const data = await authJson<{ category: TodoCategory }>(
          "/api/todo-categories",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(input),
            onUnauthorized,
          },
        )
        setTodoCategories((prev) => [...prev, data.category])
      } catch (err) {
        notifyApiError(err, "카테고리 추가에 실패했습니다.")
      }
    },
    [onUnauthorized],
  )

  const updateTodoCategory = useCallback(
    async (id: string, input: { name: string; color: string }) => {
      try {
        const data = await authJson<{ category: TodoCategory }>(
          `/api/todo-categories/${id}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(input),
            onUnauthorized,
          },
        )
        setTodoCategories((prev) =>
          prev.map((category) => (category.id === id ? data.category : category)),
        )
      } catch (err) {
        notifyApiError(err, "카테고리 수정에 실패했습니다.")
      }
    },
    [onUnauthorized],
  )

  const removeTodoCategory = useCallback(
    async (id: string) => {
      try {
        await authJson(`/api/todo-categories/${id}`, {
          method: "DELETE",
          onUnauthorized,
        })
        setTodoCategories((prev) => prev.filter((category) => category.id !== id))
        setBoardTasks((prev) =>
          prev.map((task) =>
            task.categoryId === id ? { ...task, categoryId: "" } : task,
          ),
        )
      } catch (err) {
        notifyApiError(err, "카테고리 삭제에 실패했습니다.")
      }
    },
    [onUnauthorized],
  )

  useEffect(() => {
    if (!userEmail) return
    let cancelled = false
  
    Promise.all([
      authJson<{ pins?: Pin[] }>("/api/pins", { onUnauthorized }),
      authJson<{ bookmarks?: Bookmark[] }>("/api/bookmarks", { onUnauthorized }),
      authJson<{ folders?: BookmarkFolder[] }>("/api/bookmark-folders", {
        onUnauthorized,
      }),
      authJson<{ anniversaries?: Anniversary[] }>("/api/anniversaries", {
        onUnauthorized,
      }),
      authJson<{ categories?: TodoCategory[] }>("/api/todo-categories", {
        onUnauthorized,
      }),
      authJson<{ todos?: BoardTask[] }>("/api/todos", { onUnauthorized }),
    ])
      .then(([pinData, bookmarkData, folderData, annData, catData, todoData]) => {
        if (cancelled) return
        setPins(pinData?.pins ?? [])
        setBookmarks(bookmarkData?.bookmarks ?? [])
        setBookmarkFolders(folderData?.folders ?? [])
        setAnniversaries(annData?.anniversaries ?? [])
        setTodoCategories(catData?.categories ?? [])
        setBoardTasks(todoData?.todos ?? [])
      })
      .catch((err) => {
        if (cancelled) return
        notifyApiError(err, "대시보드 데이터를 불러오지 못했습니다.")
        setPins([])
        setBookmarks([])
        setBookmarkFolders([])
        setAnniversaries([])
        setTodoCategories([])
        setBoardTasks([])
      })
  
    return () => {
      cancelled = true
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