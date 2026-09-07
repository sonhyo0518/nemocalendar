import type { ReactNode } from "react"
import { MapPin, Sun, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

type WeatherCardProps = {
  location: string
  temp: number
  high: number
  low: number
  desc: string
  icon?: LucideIcon
  className?: string
  headerExtra?: ReactNode
}

export function WeatherCard({
  location,
  temp,
  high,
  low,
  desc,
  icon: Icon = Sun,
  className,
  headerExtra,
}: WeatherCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col rounded-widget border border-card-border bg-card p-4",
        className,
      )}
    >
      <div className="mb-3 flex items-center gap-1.5">
        <MapPin className="size-3.5 shrink-0 text-theme" />
        <h3 className="text-sm font-semibold text-foreground">날씨</h3>
        <span className="truncate text-xs text-muted-foreground">{location}</span>
        {headerExtra}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Icon className="size-10 text-theme" />
          <div>
            <p className="text-2xl font-semibold tabular-nums text-foreground">
              {temp}°
            </p>
            <p className="text-xs text-muted-foreground">{desc}</p>
          </div>
        </div>
        <div className="text-right text-xs text-muted-foreground">
          <p className="font-medium text-[var(--event-rose)]">최고 {high}°</p>
          <p className="font-medium text-[var(--event-blue)]">최저 {low}°</p>
        </div>
      </div>
    </div>
  )
}