"use client"

import * as React from "react"
import { CalendarHeart, Gift, Plus, X } from "lucide-react"

import {
  daysUntil,
  type Anniversary,
} from "@/lib/dashboard-data"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface AnniversaryWidgetProps {
  items: Anniversary[]
  onAdd: (item: Omit<Anniversary, "id">) => void
  onRemove: (id: string) => void
}

function formatDday(n: number) {
  if (n === 0) return "D-DAY"
  return n > 0 ? `D-${n}` : `D+${Math.abs(n)}`
}

export function AnniversaryWidget({
  items,
  onAdd,
  onRemove,
}: AnniversaryWidgetProps) {
  const [tab, setTab] = React.useState("dday")
  const [open, setOpen] = React.useState(false)
  const [title, setTitle] = React.useState("")
  const [date, setDate] = React.useState("")

  const ddays = items
    .filter((i) => i.type === "dday")
    .sort((a, b) => daysUntil(a.date) - daysUntil(b.date))
  const annivs = items
    .filter((i) => i.type === "anniversary")
    .sort((a, b) => daysUntil(a.date) - daysUntil(b.date))

  function submit() {
    if (!title.trim() || !date) return
    onAdd({ title: title.trim(), date, type: tab as Anniversary["type"] })
    setTitle("")
    setDate("")
    setOpen(false)
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarHeart className="size-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">기념일</h3>
        </div>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger
            render={
              <Button size="icon-xs" variant="ghost" aria-label="기념일 추가" />
            }
          >
            <Plus />
          </PopoverTrigger>
          <PopoverContent align="end" className="w-64">
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium">
                새 {tab === "dday" ? "D-Day" : "기념일"} 추가
              </p>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="anniv-title" className="text-xs">
                  제목
                </Label>
                <Input
                  id="anniv-title"
                  value={title}
                  className="h-8"
                  placeholder="예: 프로젝트 출시"
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="anniv-date" className="text-xs">
                  날짜
                </Label>
                <Input
                  id="anniv-date"
                  type="date"
                  value={date}
                  className="h-8"
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              <Button size="sm" onClick={submit} disabled={!title.trim() || !date}>
                추가하기
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="w-full">
          <TabsTrigger value="dday">D-Day</TabsTrigger>
          <TabsTrigger value="anniversary">기념일</TabsTrigger>
        </TabsList>

        <TabsContent value="dday" className="pt-3">
          <div className="flex flex-col gap-2">
            {ddays.map((i) => {
              const n = daysUntil(i.date)
              return (
                <div
                  key={i.id}
                  className="group relative flex items-center justify-between overflow-hidden rounded-xl border border-primary/20 bg-primary/5 p-3"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {i.title}
                    </p>
                    <p className="text-xs text-muted-foreground">{i.date}</p>
                  </div>
                  <span
                    className={cn(
                      "text-2xl font-bold tabular-nums",
                      n === 0 ? "text-[var(--event-rose)]" : "text-primary",
                    )}
                  >
                    {formatDday(n)}
                  </span>
                  <button
                    type="button"
                    aria-label="삭제"
                    onClick={() => onRemove(i.id)}
                    className="absolute right-1 top-1 rounded-md p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-background group-hover:opacity-100"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              )
            })}
            {ddays.length === 0 && (
              <p className="py-4 text-center text-xs text-muted-foreground">
                등록된 D-Day가 없어요
              </p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="anniversary" className="pt-3">
          <ul className="flex flex-col gap-1">
            {annivs.map((i) => {
              const n = daysUntil(i.date)
              return (
                <li
                  key={i.id}
                  className="group flex items-center gap-2 rounded-lg px-2 py-2 hover:bg-secondary/60"
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                    <Gift className="size-4" />
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {i.title}
                    </p>
                    <p className="text-xs text-muted-foreground">{i.date}</p>
                  </div>
                  <span className="text-xs font-semibold tabular-nums text-primary">
                    {formatDday(n)}
                  </span>
                  <button
                    type="button"
                    aria-label="삭제"
                    onClick={() => onRemove(i.id)}
                    className="rounded-md p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-background group-hover:opacity-100"
                  >
                    <X className="size-3.5" />
                  </button>
                </li>
              )
            })}
            {annivs.length === 0 && (
              <li className="py-4 text-center text-xs text-muted-foreground">
                등록된 기념일이 없어요
              </li>
            )}
          </ul>
        </TabsContent>
      </Tabs>
    </div>
  )
}
