"use client"

import * as React from "react"
import {
  Cloud,
  CloudRain,
  CloudSun,
  MapPin,
  Pencil,
  Sun,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { API_BASE, authFetch } from "@/lib/api"

type Condition = "sunny" | "partly" | "cloudy" | "rain"

const CITY_PRESETS = ["서울", "부산", "제주", "대구", "인천"]

type WeatherData = {
  condition: Condition
  temp: number
  high: number
  low: number
  desc: string
}

const ICONS: Record<Condition, React.ElementType> = {
  sunny: Sun,
  partly: CloudSun,
  cloudy: Cloud,
  rain: CloudRain,
}

export function WeatherWidget({
  className,
  isLoggedIn = false,
  location: savedLocation = "서울",
  onLocationChange,
  onUnauthorized,
}: {
  className?: string
  isLoggedIn?: boolean
  location?: string
  onLocationChange?: (location: string) => void
  onUnauthorized?: () => void
}) {
  const [data, setData] = React.useState<WeatherData | null>(null)
  const [status, setStatus] = React.useState<"loading" | "ok" | "error">("loading")
  const [location, setLocation] = React.useState("서울")
  const [open, setOpen] = React.useState(false)
  const [draft, setDraft] = React.useState("서울")
  const mounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  )

  type SuggestItem = {
    name: string
    label: string
    lat: number
    lon: number
  }
  
  const [suggestions, setSuggestions] = React.useState<SuggestItem[]>([])
  const [suggestLoading, setSuggestLoading] = React.useState(false)
  
  React.useEffect(() => {
    if (!mounted) return
    queueMicrotask(() => {
      const next = isLoggedIn ? savedLocation : "서울"
      setLocation(next)
      setDraft(next)
    })
  }, [savedLocation, mounted, isLoggedIn])

  React.useEffect(() => {
    let cancelled = false
  
    const city = isLoggedIn ? location : "서울"
    const storageKey = `weather-cache:${city}`
    const CLIENT_TTL_MS = 1000 * 60 * 60 // 1시간
  
    let cached: WeatherData | null = null
    try {
      const raw = sessionStorage.getItem(storageKey)
      if (raw) {
        const parsed = JSON.parse(raw) as { at: number; data: WeatherData }
        if (Date.now() - parsed.at < CLIENT_TTL_MS) {
          cached = parsed.data
        }
      }
    } catch {
      // ignore
    }
  
    if (cached) {
      queueMicrotask(() => {
        if (!cancelled) {
          setData(cached)
          setStatus("ok")
        }
      })
      return () => {
        cancelled = true
      }
    }
  
    queueMicrotask(() => {
      if (!cancelled) setStatus("loading")
    })
  
    const load = isLoggedIn
      ? authFetch(`/api/weather?city=${encodeURIComponent(city)}`, {
          onUnauthorized,
        })
      : fetch(`${API_BASE}/api/weather/guest`)
  
    load
      .then((r) => {
        if (!r.ok) throw new Error("fetch failed")
        return r.json() as Promise<WeatherData>
      })
      .then((json) => {
        if (!cancelled) {
          setData(json)
          setStatus("ok")
          try {
            sessionStorage.setItem(
              storageKey,
              JSON.stringify({ at: Date.now(), data: json }),
            )
          } catch {
            // ignore
          }
        }
      })
      .catch(() => {
        if (!cancelled) setStatus("error")
      })
  
    return () => {
      cancelled = true
    }
  }, [location, onUnauthorized, isLoggedIn])
  
  const activeSuggestions =
  open && draft.trim().length >= 1 ? suggestions : []

  React.useEffect(() => {
    if (!isLoggedIn || !open) return
    const q = draft.trim()
    if (q.length < 1) return
  
    let cancelled = false
    const t = window.setTimeout(() => {
      setSuggestLoading(true)
      authFetch(`/api/weather/suggest?q=${encodeURIComponent(q)}`, {
        onUnauthorized,
      })
        .then((r) => {
          if (!r.ok) throw new Error("suggest failed")
          return r.json() as Promise<{ suggestions: SuggestItem[] }>
        })
        .then((json) => {
          if (!cancelled) setSuggestions(json.suggestions ?? [])
        })
        .catch(() => {
          if (!cancelled) setSuggestions([])
        })
        .finally(() => {
          if (!cancelled) setSuggestLoading(false)
        })
    }, 300)
  
    return () => {
      cancelled = true
      window.clearTimeout(t)
    }
  }, [draft, open, onUnauthorized, isLoggedIn])

  const Icon = data ? ICONS[data.condition] : Cloud

  async function persist(name: string) {
    if (!isLoggedIn) return
    setLocation(name)
    onLocationChange?.(name)
    try {
      await authFetch("/api/user/location", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ location: name }),
        onUnauthorized,
      })
    } catch {
      // 로그인 만료 등
    }
  }
  
  function save() {
    const name = draft.trim()
    if (name) void persist(name)
    setOpen(false)
  }

  return (
    <div
      className={cn(
        "flex flex-col rounded-widget border border-card-border bg-card p-4",
        className,
      )}
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex min-w-0 items-center gap-1.5">
          <MapPin className="size-3.5 shrink-0 text-theme" />
          <h3 className="text-sm font-semibold text-foreground">날씨</h3>
          <span className="truncate text-xs text-muted-foreground">
            {mounted ? location : "서울"}
          </span>
        </div>
        {isLoggedIn && (
        <Popover
          open={open}
          onOpenChange={(next) => {
            setOpen(next)
            if (!next) setSuggestions([])
          }}
        >
          <PopoverTrigger
            render={
              <Button size="icon-xs" variant="ghost" aria-label="위치 편집" />
            }
          >
            <Pencil />
          </PopoverTrigger>
          <PopoverContent align="end" className="w-56">
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium">위치 설정</p>
              <Input
                autoFocus
                value={draft}
                placeholder="도시 이름 (예: 서울)"
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.nativeEvent.isComposing) save()
                }}
              />
              {(suggestLoading || activeSuggestions.length > 0) && (
                <ul className="max-h-36 overflow-y-auto rounded-md border border-border">
                  {suggestLoading && activeSuggestions.length === 0 ? (
                    <li className="px-2 py-1.5 text-xs text-muted-foreground">
                      검색 중…
                    </li>
                  ) : (
                    activeSuggestions.map((s) => (
                      <li key={`${s.name}-${s.lat}-${s.lon}`}>
                        <button
                          type="button"
                          className="w-full px-2 py-1.5 text-left text-sm hover:bg-muted"
                          onClick={() => {
                            setDraft(s.name)
                            void persist(s.name)
                            setOpen(false)
                            setSuggestions([])
                          }}
                        >
                          {s.label}
                        </button>
                      </li>
                    ))
                  )}
                </ul>
              )}
              <div className="flex flex-wrap gap-1">
                {CITY_PRESETS.map((c) => (
                  <Button
                    key={c}
                    size="xs"
                    variant="outline"
                    onClick={() => {
                      setDraft(c)
                      void persist(c)
                      setOpen(false)
                    }}
                  >
                    {c}
                  </Button>
                ))}
              </div>
              <Button size="sm" onClick={save} disabled={!draft.trim()}>
                저장
              </Button>
            </div>
          </PopoverContent>
        </Popover>
        )}
      </div>

      <div className="flex items-center justify-between">
        {status === "loading" && (
          <div className="flex w-full items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Skeleton className="size-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-7 w-16" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="ml-auto h-3 w-14" />
              <Skeleton className="ml-auto h-3 w-14" />
            </div>
          </div>
        )}
        {status === "error" && (
          <p className="text-sm text-muted-foreground">
            날씨를 찾을 수 없어요
          </p>
        )}
        {status === "ok" && data && (
          <>
            <div className="flex items-center gap-3">
              <Icon className="size-10 text-theme" />
              <div>
              <p className="text-2xl font-semibold tabular-nums text-foreground">
                {data.temp}°
              </p>
                <p className="text-xs text-muted-foreground">{data.desc}</p>
              </div>
            </div>
            <div className="text-right text-xs text-muted-foreground">
              <p className="font-medium text-[var(--event-rose)]">
                최고 {data.high}°
              </p>
              <p className="font-medium text-[var(--event-blue)]">
                최저 {data.low}°
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
