"use client"

import { COLORBLIND_PRESETS, COLOR_PRESETS, PASTEL_PRESETS } from "@/lib/color-presets"
import { cn } from "@/lib/utils"

function Swatch({
  value,
  selected,
  onSelect,
  className,
}: {
  value: string
  selected: boolean
  onSelect: (c: string) => void
  className?: string
}) {
  return (
    <button
      type="button"
      aria-label={value}
      onClick={() => onSelect(value)}
      className={cn(
        "size-5 shrink-0 cursor-pointer rounded-full border border-black/10",
        selected && "ring-2 ring-foreground ring-offset-1 ring-offset-background",
        className,
      )}
      style={{ backgroundColor: value }}
    />
  )
}

export function ColorPalette({
  color,
  onChange,
  swatchClassName,
  showCustom = true,
}: {
  color: string
  onChange: (color: string) => void
  swatchClassName?: string
  showCustom?: boolean
}) {
  const selected = color.toLowerCase()
  const isPreset = COLOR_PRESETS.some((c) => c.toLowerCase() === selected)

  return (
    <div className="w-full min-w-0">
      <div className="flex w-full min-w-0 flex-col gap-1.5">
        {/* 1줄: 색각이상자용만 */}
        <div className="flex w-full min-w-0 flex-wrap items-center gap-1.5">
          {COLORBLIND_PRESETS.map((preset) => (
            <Swatch
              key={preset}
              value={preset}
              selected={selected === preset.toLowerCase()}
              onSelect={onChange}
              className={swatchClassName}
            />
          ))}
        </div>
  
        {/* 2줄~: 파스텔 + 사용자 지정(맨 끝) */}
        <div className="flex w-full min-w-0 flex-wrap items-center gap-1.5">
          {PASTEL_PRESETS.map((preset) => (
            <Swatch
              key={preset}
              value={preset}
              selected={selected === preset.toLowerCase()}
              onSelect={onChange}
              className={swatchClassName}
            />
          ))}
          {showCustom && (
            <label
              className={cn(
                "relative size-5 shrink-0 cursor-pointer overflow-hidden rounded-full border border-black/10",
                swatchClassName,
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
                value={isPreset ? "#000000" : color}
                aria-label="사용자 지정 색상"
                className="absolute inset-0 cursor-pointer opacity-0"
                onChange={(e) => onChange(e.target.value)}
              />
            </label>
          )}
        </div>
      </div>
    </div>
  )
}