"use client"

import * as React from "react"
import Cropper, { type Area } from "react-easy-crop"

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
import { authFetch } from "@/lib/api"
import { DEFAULT_BANNER_COLOR } from "@/lib/dashboard-data"

const MAX_BYTES = 1024 * 1024
const ASPECT = 3 / 1

async function getCroppedBlob(imageSrc: string, pixelCrop: Area) {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = imageSrc
  })
  const canvas = document.createElement("canvas")
  canvas.width = pixelCrop.width
  canvas.height = pixelCrop.height
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("canvas")
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height,
  )

  const toBlob = (q: number) =>
    new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("toBlob"))),
        "image/jpeg",
        q,
      )
    })

  let quality = 0.9
  let blob = await toBlob(quality)
  while (blob.size > MAX_BYTES && quality > 0.4) {
    quality -= 0.1
    blob = await toBlob(quality)
  }
  if (blob.size > MAX_BYTES) {
    throw new Error("cropped file exceeds 1MB")
  }
  return blob
}

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  bannerImgUrl?: string | null
  themeColor?: string | null
  onBannerChange: (patch: { banner_img_url?: string | null }) => void
  onUnauthorized?: () => void
}

export function BannerSettingsDialog({
  open,
  onOpenChange,
  bannerImgUrl,
  themeColor,
  onBannerChange,
  onUnauthorized,
}: Props) {
  const previewColor = themeColor ?? DEFAULT_BANNER_COLOR
  const [imageSrc, setImageSrc] = React.useState<string | null>(null)
  const [crop, setCrop] = React.useState({ x: 0, y: 0 })
  const [zoom, setZoom] = React.useState(1)
  const [area, setArea] = React.useState<Area | null>(null)
  const [busy, setBusy] = React.useState(false)

  const handleAuthFailure = () => {
    onOpenChange(false)
    onUnauthorized?.()
  }

  const pickFile = (file: File) => {
    if (file.size > MAX_BYTES) {
      alert("1MB 이하 이미지만 올릴 수 있습니다.")
      return
    }
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      alert("jpeg, png, webp만 가능합니다.")
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      setImageSrc(String(reader.result))
      setCrop({ x: 0, y: 0 })
      setZoom(1)
    }
    reader.readAsDataURL(file)
  }

  const saveCrop = async () => {
    if (!imageSrc || !area) return
    setBusy(true)
    try {
      const blob = await getCroppedBlob(imageSrc, area)
      const form = new FormData()
      form.append("file", blob, "banner.jpg")
  
      const res = await authFetch("/api/user/banner", {
        method: "POST",
        body: form,
        onUnauthorized: handleAuthFailure,
      })
  
      const data = await res.json()
      if (!res.ok) {
        alert(data.error || "업로드 실패")
        return
      }
      onBannerChange({ banner_img_url: data.banner_img_url })
      setImageSrc(null)
    } catch (e) {
      console.error(e)
      alert("크롭 결과를 1MB 이하로 만들 수 없습니다. 영역을 줄여 주세요.")
    } finally {
      setBusy(false)
    }
  }

  const removeBanner = async () => {
    if (!bannerImgUrl) return
    setBusy(true)
    try {
      const res = await authFetch("/api/user/banner", {
        method: "DELETE",
        onUnauthorized: handleAuthFailure,
      })
  
      const data = await res.json()
      if (!res.ok) {
        alert(data.error || "삭제 실패")
        return
      }
      onBannerChange({ banner_img_url: null })
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next)
        if (!next) setImageSrc(null)
      }}
    >
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>배너 설정</DialogTitle>
          <DialogDescription>
            이미지가 없으면 테마색이 표시됩니다. 이미지는 3:1로 자릅니다.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div
            className="relative h-24 overflow-hidden rounded-lg"
            style={
              bannerImgUrl && !imageSrc
                ? undefined
                : {
                    background: `linear-gradient(to bottom, ${previewColor}, var(--background))`,
                  }
            }
          >
            {bannerImgUrl && !imageSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={bannerImgUrl}
                alt=""
                className="h-full w-full object-cover object-center"
              />
            ) : null}
          </div>

          <div className="flex flex-col gap-1.5">
            <p className="text-sm text-muted-foreground">
              이미지를 설정하지 않으면 테마색이 배너 배경으로 사용됩니다.
            </p>
            <div className="flex items-center gap-2">
              <span
                className="h-8 w-8 shrink-0 rounded-md border border-input"
                style={{ backgroundColor: previewColor }}
                aria-hidden
              />
              <span className="font-mono text-sm uppercase text-muted-foreground">
                {previewColor}
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="banner-file">이미지 (1MB 이하)</Label>
            <Input
              id="banner-file"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) pickFile(file)
                e.target.value = ""
              }}
            />
          </div>

          {imageSrc ? (
            <>
              <div className="relative h-56 w-full overflow-hidden rounded-lg bg-black">
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={ASPECT}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={(_, pixels) => setArea(pixels)}
                />
              </div>
              <input
                type="range"
                min={1}
                max={3}
                step={0.05}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
              />
            </>
          ) : null}
        </div>

        <DialogFooter>
          {bannerImgUrl ? (
            <Button variant="destructive" onClick={removeBanner} disabled={busy}>
              이미지 삭제
            </Button>
          ) : null}
          {imageSrc ? (
            <Button onClick={saveCrop} disabled={busy || !area}>
              자르고 업로드
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}