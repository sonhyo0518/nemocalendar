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

type Condition = "sunny" | "partly" | "cloudy" | "rain"

const MOCK_WEATHER: Record<
  string,
  { condition: Condition; high: number; low: number; desc: string }
> = {
  서울: { condition: "partly", high: 24, low: 16, desc: "구름 조금" },
  부산: { condition: "sunny", high: 27, low: 19, desc: "맑음" },
  제주: { condition: "rain", high: 22, low: 18, desc: "비" },
  대구: { condition: "cloudy", high: 25, low: 17, desc: "흐림" },
  인천: { condition: "partly", high: 23, low: 15, desc: "구름 조금" },
}

const ICONS: Record<Condition, React.ElementType> = {
  sunny: Sun,
  partly: CloudSun,
  cloudy: Cloud,
  rain: CloudRain,
}

export function WeatherWidget() {
  const [location, setLocation] = React.useState("서울")
  const [open, setOpen] = React.useState(false)
  const [draft, setDraft] = React.useState("서울")

  const data = MOCK_WEATHER[location] ?? MOCK_WEATHER["서울"]
  const Icon = ICONS[data.condition]

  function save() {
    const name = draft.trim()
    if (name) setLocation(name)
    setOpen(false)
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
          <MapPin className="size-3.5 text-primary" />
          {location}
        </div>
        <Popover open={open} onOpenChange={setOpen}>
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
              <div className="flex flex-wrap gap-1">
                {Object.keys(MOCK_WEATHER).map((c) => (
                  <Button
                    key={c}
                    size="xs"
                    variant="outline"
                    onClick={() => {
                      setLocation(c)
                      setDraft(c)
                      setOpen(false)
                    }}
                  >
                    {c}
                  </Button>
                ))}
              </div>
              <Button size="sm" onClick={save}>
                저장
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Icon className="size-10 text-primary" />
          <div>
            <p className="text-2xl font-semibold tabular-nums text-foreground">
              {data.high}°
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
      </div>
    </div>
  )
}
