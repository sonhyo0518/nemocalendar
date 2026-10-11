"use client"

import * as React from "react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

type ConfirmDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
  onConfirm: () => void | Promise<void>
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "확인",
  cancelLabel = "취소",
  danger,
  onConfirm,
}: ConfirmDialogProps) {
  const [pending, setPending] = React.useState(false)

  const handleOpenChange = (next: boolean) => {
    if (pending && !next) return
    if (!next) setPending(false)
    onOpenChange(next)
  }

  const handleConfirm = async () => {
    if (pending) return
    setPending(true)
    try {
      await onConfirm()
      handleOpenChange(false)
    } catch {
      setPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent showCloseButton={false} className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:justify-end">
          <Button
            variant="outline"
            disabled={pending}
            onClick={() => handleOpenChange(false)}
          >
            {cancelLabel}
          </Button>
          <Button
            variant={danger ? "destructive" : "default"}
            disabled={pending}
            aria-busy={pending || undefined}
            onClick={() => void handleConfirm()}
          >
            {pending ? "처리 중…" : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}