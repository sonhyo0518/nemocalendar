"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { COLOR_PRESETS } from "@/lib/color-presets"
import { DEFAULT_BANNER_COLOR } from "@/lib/dashboard-data"
import { authFetch } from "@/lib/api"
import { cn } from "@/lib/utils"

const HEX_RE = /^#[0-9A-Fa-f]{6}$/

function normalizeHex(value: string) {
  let v = value.trim()
  if (!v.startsWith("#")) v = `#${v}`
  return v
}

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  themeColor?: string | null
  onThemeChange: (patch: { theme_color?: string | null }) => void
  onUnauthorized?: () => void
}

export function ThemeSettingsDialog({
  open,
  onOpenChange,
  themeColor,
  onThemeChange,
  onUnauthorized,
}: Props) {
  const [hex, setHex] = React.useState(
    () => themeColor ?? DEFAULT_BANNER_COLOR,
  )
  const [hexDraft, setHexDraft] = React.useState(
    () => themeColor ?? DEFAULT_BANNER_COLOR,
  )
  const [busy, setBusy] = React.useState(false)

  const handleOpenChange = (next: boolean) => {
    if (next) {
      const color = themeColor ?? DEFAULT_BANNER_COLOR
      setHex(color)
      setHexDraft(color)
    }
    onOpenChange(next)
  }

  const isPreset = COLOR_PRESETS.some(
    (c) => c.toLowerCase() === hex.toLowerCase(),
  )

  const applyLocal = (next: string) => {
    setHex(next)
    setHexDraft(next)
  }

  const handleAuthFailure = () => {
    onOpenChange(false)
    onUnauthorized?.()
  }

  const saveColor = async () => {
    const color = normalizeHex(hexDraft)
    if (!HEX_RE.test(color)) {
      alert("색상은 #RRGGBB 형식으로 입력해 주세요. 예: #aeced0")
      return
    }
    setHex(color)
    setHexDraft(color)
    setBusy(true)
    try {
      const res = await authFetch("/api/user/theme-color", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ color }),
        onUnauthorized: handleAuthFailure,
      })
      const data = await res.json()
      if (!res.ok) {
        alert(data.error || "색상 저장 실패")
        return
      }
      onThemeChange({ theme_color: data.theme_color })
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>테마색 변경</DialogTitle>
          <DialogDescription>
            프리셋을 고르거나 사용자 지정 색을 입력한 뒤 저장하세요.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
        <div
          className="h-16 overflow-hidden rounded-lg"
          style={{ backgroundColor: hex }}
        />

          <div className="flex flex-col gap-1.5">
            <Label>프리셋</Label>
            <div className="flex flex-wrap items-center gap-1.5">
              {COLOR_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  aria-label={preset}
                  onClick={() => applyLocal(preset)}
                  className={cn(
                    "size-7 cursor-pointer rounded-full border border-black/10",
                    hex.toLowerCase() === preset.toLowerCase() &&
                      "ring-2 ring-foreground ring-offset-1 ring-offset-background",
                  )}
                  style={{ backgroundColor: preset }}
                />
              ))}
              <label
                className={cn(
                  "relative size-7 cursor-pointer overflow-hidden rounded-full border border-black/10",
                  !isPreset && "ring-2 ring-foreground ring-offset-1 ring-offset-background",
                )}
                title="사용자 지정"
              >
                <span
                  className="absolute inset-0"
                  style={{
                    background:
                      "conic-gradient(#EA4335, #F9AB00, #34A853, #4285F4, #A142F4, #EA4335)",
                  }}
                />
                <input
                  type="color"
                  value={hex}
                  aria-label="사용자 지정 색상"
                  className="absolute inset-0 cursor-pointer opacity-0"
                  onChange={(e) => applyLocal(e.target.value)}
                />
              </label>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="theme-hex">사용자 지정 (#RRGGBB)</Label>
            <Input
              id="theme-hex"
              value={hexDraft}
              maxLength={7}
              spellCheck={false}
              className="font-mono uppercase"
              placeholder={DEFAULT_BANNER_COLOR}
              onChange={(e) => {
                const next = e.target.value
                setHexDraft(next)
                const normalized = normalizeHex(next)
                if (HEX_RE.test(normalized)) setHex(normalized)
              }}
            />
          </div>
        </div>

        <DialogFooter>
          <Button onClick={saveColor} disabled={busy}>
            색 저장
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}