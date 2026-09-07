"use client"

import { useCallback, useEffect, useState, useSyncExternalStore } from "react"

export type ColorMode = "light" | "dark" | "system"

const STORAGE_KEY = "color-mode"

function getSystemDark() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
}

export function applyColorMode(mode: ColorMode) {
  const root = document.documentElement
  const dark = mode === "dark" || (mode === "system" && getSystemDark())
  root.classList.toggle("dark", dark)
  root.classList.toggle("light", !dark)
}

function subscribe(onStoreChange: () => void) {
  const mq = window.matchMedia("(prefers-color-scheme: dark)")
  mq.addEventListener("change", onStoreChange)
  window.addEventListener("storage", onStoreChange)
  return () => {
    mq.removeEventListener("change", onStoreChange)
    window.removeEventListener("storage", onStoreChange)
  }
}

function getSnapshot(): ColorMode {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw === "light" || raw === "dark" || raw === "system") return raw
  } catch {}
  return "system"
}

function getServerSnapshot(): ColorMode {
  return "system"
}

export function useColorMode() {
  const mode = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const [, bump] = useState(0)

  useEffect(() => {
    applyColorMode(mode)
  }, [mode])

  const setMode = useCallback((next: ColorMode) => {
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {}
    applyColorMode(next)
    bump((n) => n + 1)
  }, [])

  const resolved =
    mode === "system"
      ? typeof window !== "undefined" && getSystemDark()
        ? "dark"
        : "light"
      : mode

  return { mode, resolved, setMode }
}