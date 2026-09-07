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

const STORAGE_KEY = "pomodoroState:v1"

type PomodoroPersisted = {
  mode: Mode
  remaining: number
  running: boolean
  completed: number
  endsAt: number | null
}

const DEFAULT_STATE: PomodoroPersisted = {
  mode: "focus",
  remaining: DURATIONS.focus,
  running: false,
  completed: 0,
  endsAt: null,
}

function loadPomodoroState(): PomodoroPersisted {
  if (typeof window === "undefined") return DEFAULT_STATE
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_STATE

    const parsed = JSON.parse(raw) as Partial<PomodoroPersisted>
    let mode: Mode = parsed.mode === "break" ? "break" : "focus"
    let completed =
      typeof parsed.completed === "number" && parsed.completed >= 0
        ? parsed.completed
        : 0
    let running = Boolean(parsed.running)
    let remaining =
      typeof parsed.remaining === "number"
        ? Math.min(Math.max(0, parsed.remaining), DURATIONS[mode])
        : DURATIONS[mode]

      if (running && typeof parsed.endsAt === "number") {
        remaining = Math.max(0, Math.ceil((parsed.endsAt - Date.now()) / 1000))
        if (remaining === 0) running = false
      }
      
      // 0초로 저장된 상태 복원 시, 마운트 effect에서 중복 완료 처리되지 않도록 정규화
      if (remaining === 0 && !running) {
        if (mode === "focus") {
          completed += 1
          mode = "break"
          remaining = DURATIONS.break
        } else {
          mode = "focus"
          remaining = DURATIONS.focus
        }
      }
      
      return {
        mode,
        remaining,
        running,
        completed,
        endsAt: running && typeof parsed.endsAt === "number" ? parsed.endsAt : null,
      }
  } catch {
    return DEFAULT_STATE
  }
}

function savePomodoroState(state: PomodoroPersisted) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {}
}

export function PomodoroTimer({
  interactive = true,
}: {
  interactive?: boolean
}) {
  const [initial] = React.useState(() =>
    interactive ? loadPomodoroState() : DEFAULT_STATE,
  )
  const [mode, setMode] = React.useState<Mode>(initial.mode)
  const [remaining, setRemaining] = React.useState(initial.remaining)
  const [running, setRunning] = React.useState(
    interactive ? initial.running : false,
  )
  const [completed, setCompleted] = React.useState(initial.completed)
  const skipCompletionOnMount = React.useRef(
    interactive && initial.remaining === 0 && !initial.running,
  )

  React.useEffect(() => {
    if (!interactive) return
    savePomodoroState({
      mode,
      remaining,
      running,
      completed,
      endsAt: running ? Date.now() + remaining * 1000 : null,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interactive, mode, running, completed])
  

  React.useEffect(() => {
    if (!interactive || running) return
    savePomodoroState({
      mode,
      remaining,
      running: false,
      completed,
      endsAt: null,
    })
  }, [interactive, remaining, running, mode, completed])

  React.useEffect(() => {
    if (!interactive || !running) return
    const id = setInterval(() => {
      setRemaining((r) => {
        if (r > 1) return r - 1
  
        clearInterval(id)
        queueMicrotask(() => {
          if (skipCompletionOnMount.current) {
            skipCompletionOnMount.current = false
            return
          }
          setRunning(false)
          setMode((current) => {
            if (current === "focus") {
              setCompleted((c) => c + 1)
              setRemaining(DURATIONS.break)
              return "break"
            }
            setRemaining(DURATIONS.focus)
            return "focus"
          })
        })
        return 0
      })
    }, 1000)
    return () => clearInterval(id)
  }, [interactive, running])

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

  const accent = mode === "focus" ? "var(--theme)" : "var(--event-green)"

  return (
    <div className="rounded-widget border border-card-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Timer className="size-4 text-theme" />
          <h3 className="text-sm font-semibold text-foreground">뽀모도로</h3>
        </div>
        <span className="text-xs text-muted-foreground">
          완료 {completed}회
        </span>
      </div>

      <div className="mb-4 flex justify-center gap-1.5">
        <button
          type="button"
          disabled={!interactive}
          onClick={() => interactive && switchMode("focus")}
          className={cn(
            "rounded-full px-3 py-1 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60",
            mode === "focus"
              ? "bg-theme text-theme-foreground"
              : "bg-secondary text-muted-foreground hover:text-foreground",
          )}
        >
          집중 25분
        </button>
        <button
          type="button"
          disabled={!interactive}
          onClick={() => interactive && switchMode("break")}
          className={cn(
            "rounded-full px-3 py-1 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60",
            mode === "break"
              ? "bg-[var(--event-green)]/20 text-[var(--event-green)] ring-1 ring-[var(--event-green)]/40"
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
        <Button
          disabled={!interactive}
          onClick={() => interactive && setRunning((r) => !r)}
          className="min-w-24"
        >
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
        <Button
          variant="outline"
          size="icon"
          disabled={!interactive}
          onClick={() => interactive && reset()}
          aria-label="리셋"
        >
          <RotateCcw />
        </Button>
      </div>
    </div>
  )
}
