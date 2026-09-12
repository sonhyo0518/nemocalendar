"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => Promise<void>
}

export function DeleteAccountDialog({ open, onOpenChange, onConfirm }: Props) {
  const [understood, setUnderstood] = React.useState(false)
  const [busy, setBusy] = React.useState(false)

  React.useEffect(() => {
    if (!open) {
      setUnderstood(false)
      setBusy(false)
    }
  }, [open])

  const handleConfirm = async () => {
    if (!understood || busy) return
    setBusy(true)
    try {
      await onConfirm()
      onOpenChange(false)
    } catch {
      setBusy(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>계정 삭제</DialogTitle>
          <DialogDescription>
            삭제하면 되돌릴 수 없습니다. 서비스에 저장된 데이터가 모두
            제거됩니다.
          </DialogDescription>
        </DialogHeader>

        <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          <li>할 일, 핀, 북마크, 기념일, 배너·테마·위치 설정</li>
          <li>Google Calendar 연동 토큰(철회 시도)</li>
          <li>
            Google Calendar에 저장된 원본 일정은 삭제되지 않습니다
          </li>
        </ul>

        <Label
          htmlFor="delete-account-understood"
          className="flex items-start gap-2.5 text-sm font-normal leading-snug"
        >
          <Checkbox
            id="delete-account-understood"
            checked={understood}
            disabled={busy}
            className="mt-0.5"
            onCheckedChange={(checked) => setUnderstood(checked === true)}
          />
          <span>
            할 일·핀·북마크 등의 서비스 데이터가 영구 삭제되고, 연동된 Google 계정의 Google Calendar
            원본 일정은 남는다는 것을 이해했습니다.
          </span>
        </Label>

        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            disabled={busy}
            onClick={() => onOpenChange(false)}
          >
            취소
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={!understood || busy}
            onClick={() => void handleConfirm()}
          >
            {busy ? "삭제 중…" : "계정 삭제"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
