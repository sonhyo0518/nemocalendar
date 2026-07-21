"use client"

import * as React from "react"
import { Pause, Play, RotateCcw, Timer } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type Mode = "focus" | "break"

const DURATIONS: Record<Mode, number> = {
  focus: 25 * 60,
  break: 5 * 60,
}

export function PomodoroTimer() {
  const [mode, setMode] = React.useState<Mode>("focus")
  const [remaining, setRemaining] = React.useState(DURATIONS.focus)
  const [running, setRunning] = React.useState(false)
  const [completed, setCompleted] = React.useState(0)

  React.useEffect(() => {
    if (!running) return
    const id = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(id)
          return 0
        }
        return r - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [running])

  React.useEffect(() => {
    if (remaining !== 0) return
    setRunning(false)
    if (mode === "focus") {
      setCompleted((c) => c + 1)
      setMode("break")
      setRemaining(DURATIONS.break)
    } else {
      setMode("focus")
      setRemaining(DURATIONS.focus)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining])

  function switchMode(next: Mode) {
    setMode(next)
    setRemaining(DURATIONS[next])
    setRunning(false)
  }

  function reset() {
    setRemaining(DURATIONS[mode])
    setRunning(false)
  }

  const total = DURATIONS[mode]
  const progress = 1 - remaining / total
  const radius = 52
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference * (1 - progress)

  const minutes = String(Math.floor(remaining / 60)).padStart(2, "0")
  const seconds = String(remaining % 60).padStart(2, "0")

  const accent = mode === "focus" ? "var(--primary)" : "var(--event-green)"

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Timer className="size-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">뽀모도로</h3>
        </div>
        <span className="text-xs text-muted-foreground">
          완료 {completed}회
        </span>
      </div>

      <div className="mb-4 flex justify-center gap-1.5">
        <button
          type="button"
          onClick={() => switchMode("focus")}
          className={cn(
            "rounded-full px-3 py-1 text-xs font-medium transition-colors",
            mode === "focus"
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-muted-foreground hover:text-foreground",
          )}
        >
          집중 25분
        </button>
        <button
          type="button"
          onClick={() => switchMode("break")}
          className={cn(
            "rounded-full px-3 py-1 text-xs font-medium transition-colors",
            mode === "break"
              ? "bg-[var(--event-green)] text-primary-foreground"
              : "bg-secondary text-muted-foreground hover:text-foreground",
          )}
        >
          휴식 5분
        </button>
      </div>

      <div className="relative mx-auto flex size-36 items-center justify-center">
        <svg className="size-full -rotate-90" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="var(--secondary)"
            strokeWidth="8"
          />
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke={accent}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            className="transition-[stroke-dashoffset] duration-1000 ease-linear"
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-3xl font-semibold tabular-nums text-foreground">
            {minutes}:{seconds}
          </span>
          <span className="text-xs text-muted-foreground">
            {mode === "focus" ? "집중 시간" : "휴식 시간"}
          </span>
        </div>
      </div>

      <div className="mt-4 flex justify-center gap-2">
        <Button onClick={() => setRunning((r) => !r)} className="min-w-24">
          {running ? (
            <>
              <Pause data-icon="inline-start" />
              일시정지
            </>
          ) : (
            <>
              <Play data-icon="inline-start" />
              시작
            </>
          )}
        </Button>
        <Button variant="outline" size="icon" onClick={reset} aria-label="리셋">
          <RotateCcw />
        </Button>
      </div>
    </div>
  )
}
