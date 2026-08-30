import { CalendarDays } from "lucide-react"

export function GoogleBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-border bg-secondary/60 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
      <CalendarDays className="size-3 text-theme" />
      Google 연동
    </span>
  )
}