import { CalendarDays } from "lucide-react"

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function GoogleBadge() {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <span
            className="inline-flex items-center gap-1 rounded-full border border-border bg-secondary/60 px-2 py-0.5 text-[11px] font-medium text-muted-foreground"
            aria-label="구글 캘린더 연동 예정"
          />
        }
      >
        <CalendarDays className="size-3 text-primary" />
        Google 연동
      </TooltipTrigger>
      <TooltipContent>구글 캘린더 연동 예정입니다</TooltipContent>
    </Tooltip>
  )
}
