"use client"

import * as React from "react"
import { Calendar, List, Pencil, Plus, Star, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DEFAULT_ANNIV_COLOR } from "@/lib/color-presets"
import { readableAccent } from "@/lib/contrast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

import { addDays, daysUntil, toKey, type Anniversary } from "@/lib/dashboard-data"

interface AnniversaryWidgetProps {
  items: Anniversary[]
  onAdd: (item: Omit<Anniversary, "id">) => void
  onRemove: (id: string) => void
  onUpdate: (id: string, patch: Pick<Anniversary, "title" | "date" | "color">) => void
  readOnly?: boolean
  onRequireLogin?: () => void
}

import { ColorPalette } from "@/components/ui/color-palette"

type Urgency = "soon" | "mid" | "far" | "past" | "milestone"

type MilestoneEvent = {
  key: string
  sourceId: string
  title: string
  date: string
  badge: string
  color?: string
}

const FUTURE_YEARS = 3

function buildMilestones(item: Anniversary): MilestoneEvent[] {
  const start = new Date(item.date + "T00:00:00")
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const horizon = new Date(today)
  horizon.setFullYear(horizon.getFullYear() + FUTURE_YEARS)

  const events: MilestoneEvent[] = []

  for (let k = 1; ; k++) {
    const d = addDays(start, k * 100)
    if (d > horizon) break
    if (d < start) continue
    events.push({
        key: `${item.id}-d${k * 100}`,
        sourceId: item.id,
        title: item.title,
        date: toKey(d),
        badge: `${k * 100}일`,
        color: item.color,
    })
  }

  for (let n = 1; ; n++) {
    const d = new Date(start.getFullYear() + n, start.getMonth(), start.getDate())
    if (d > horizon) break
    events.push({
      key: `${item.id}-y${n}`,
      sourceId: item.id,
      title: item.title,
      date: toKey(d),
      badge: `${n}주년`,
      color: item.color,
    })
  }

  return events
}

function formatDday(n: number) {
  if (n === 0) return "D-DAY"
  return n > 0 ? `D-${n}` : `D+${Math.abs(n)}`
}

function formatKoDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-")
  return `${y}년 ${Number(m)}월 ${Number(d)}일`
}

/** D-7 이하 빨강, D-30 이하 주황, 그 이상 초록. 지난 날은 past. */
function urgency(n: number): Exclude<Urgency, "milestone"> {
  if (n < 0) return "past"
  if (n <= 7) return "soon"
  if (n <= 30) return "mid"
  return "far"
}

const DOT: Record<Urgency, string> = {
  soon: "text-[var(--event-rose)] bg-[var(--event-rose)]",
  mid: "text-[var(--event-amber)] bg-[var(--event-amber)]",
  far: "text-[var(--event-green)] bg-[var(--event-green)]",
  past: "text-muted-foreground bg-muted-foreground/40",
  milestone: "text-[var(--event-rose)] bg-[var(--event-rose)]",
}

const DDAY: Record<Exclude<Urgency, "milestone">, string> = {
  soon: "text-[var(--event-rose)]",
  mid: "text-[var(--event-amber)]",
  far: "text-[var(--event-green)]",
  past: "text-muted-foreground font-bold",
}

export function AnniversaryWidget({
  items,
  onAdd,
  onRemove,
  onUpdate,
  readOnly = false,
  onRequireLogin,
}: AnniversaryWidgetProps) {
  const [tab, setTab] = React.useState("dday")
  const [open, setOpen] = React.useState(false)
  const [title, setTitle] = React.useState("")
  const [date, setDate] = React.useState("")
  const [color, setColor] = React.useState(DEFAULT_ANNIV_COLOR)
  const [editColor, setEditColor] = React.useState(DEFAULT_ANNIV_COLOR)

  const [manageOpen, setManageOpen] = React.useState(false)
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [editTitle, setEditTitle] = React.useState("")
  const [editDate, setEditDate] = React.useState("")

  const ddays = items
    .filter((i) => i.type === "dday")
    .sort((a, b) => daysUntil(a.date) - daysUntil(b.date))
  
  const annivs = items
    .filter((i) => i.type === "anniversary")
    .sort((a, b) => daysUntil(a.date) - daysUntil(b.date))
  
  const todayRef = React.useRef<HTMLDivElement>(null)
  const scrollerRef = React.useRef<HTMLDivElement>(null)
  
  const events = React.useMemo(() => {
    return annivs
      .flatMap(buildMilestones)
      .sort((a, b) => a.date.localeCompare(b.date) || a.key.localeCompare(b.key))
  }, [annivs])
  
  function scrollToToday() {
    const el = todayRef.current
    const parent = scrollerRef.current
    if (!el || !parent) return
    parent.scrollTop =
      el.getBoundingClientRect().top -
      parent.getBoundingClientRect().top +
      parent.scrollTop
  }
  
  function goToday() {
    if (tab !== "anniversary") {
      setTab("anniversary")
      return
    }
    scrollToToday()
  }
  
  React.useLayoutEffect(() => {
    if (tab !== "anniversary") return
    const id = requestAnimationFrame(scrollToToday)
    return () => cancelAnimationFrame(id)
  }, [events, tab])

  function submit() {
    if (!title.trim() || !date) return
    onAdd({
      title: title.trim(),
      date,
      type: tab as Anniversary["type"],
      color: tab === "anniversary" ? color : undefined,
    })
    setTitle("")
    setDate("")
    setOpen(false)
  }

  function startEdit(i: Anniversary) {
    if (readOnly) {
      onRequireLogin?.()
      return
    }
    setEditingId(i.id)
    setEditTitle(i.title)
    setEditDate(i.date)
    setEditColor(i.color ?? DEFAULT_ANNIV_COLOR)
  }
  
  function saveEdit() {
    if (!editingId || !editTitle.trim() || !editDate) return
    onUpdate(editingId, {
      title: editTitle.trim(),
      date: editDate,
      color: editColor,
    })
    setEditingId(null)
  }

  return (
    <div className="rounded-widget border border-card-border bg-card p-4">
      <Tabs value={tab} onValueChange={setTab}>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="grid size-6 shrink-0 place-items-center rounded-lg bg-theme/15 text-theme">
            <Calendar className="size-3.5" />
          </span>
          <TabsList className="h-6 rounded-full p-0.5 group-data-horizontal/tabs:h-6">
            <TabsTrigger value="dday" className="rounded-full px-2 py-0 text-xs">
              D-Day
            </TabsTrigger>
            <TabsTrigger value="anniversary" className="rounded-full px-2 py-0 text-xs">
              기념일
            </TabsTrigger>
          </TabsList>
        </div>
        <div className="flex items-center gap-1">
          <div className="flex items-center gap-0.5">
          <Button
            size="icon-xs"
            variant="ghost"
            aria-label="기념일 관리"
            className={cn(tab !== "anniversary" && "hidden")}
            onClick={() => {
              if (readOnly) {
                onRequireLogin?.()
                return
              }
              setManageOpen(true)
            }}
          >
            <List />
          </Button>
              <Popover
                open={open}
                onOpenChange={(next) => {
                  if (readOnly) {
                    onRequireLogin?.()
                    return
                  }
                  setOpen(next)
                }}
              >
                <PopoverTrigger
                  render={
                    <Button size="icon-xs" variant="ghost" aria-label="기념일 추가" />
                  }
                >
                  <Plus />
                </PopoverTrigger>
                <PopoverContent align="end" className="w-72">
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
                        onChange={(e) => setTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (
                            e.key === "Enter" &&
                            !e.nativeEvent.isComposing &&
                            title.trim() &&
                            date
                          ) {
                            e.preventDefault()
                            submit()
                          }
                        }}
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
                    {tab === "anniversary" && (
                      <ColorPalette color={color} onChange={setColor} />
                    )}
                  <Button
                      size="sm"
                      onClick={submit}
                      disabled={!title.trim() || !date}
                    >
                      추가하기
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="h-6 rounded-full px-2 text-xs"
                onClick={goToday}
              >
                오늘
              </Button>
            </div>
          <Dialog open={manageOpen} onOpenChange={setManageOpen}>
            <DialogContent className="rounded-3xl sm:max-w-md">
              <DialogHeader>
                <DialogTitle>내 기념일</DialogTitle>
                <DialogDescription>
                  시작일·색을 수정하거나 삭제할 수 있어요. 100일·주년은
                  타임라인에 자동으로 표시됩니다.
                </DialogDescription>
              </DialogHeader>
              <ul className="max-h-72 space-y-2 overflow-y-auto pr-0.5">
                {annivs.map((i) => {
                  const upcoming = buildMilestones(i)
                    .map((e) => ({ ...e, n: daysUntil(e.date) }))
                    .filter((e) => e.n >= 0)
                    .sort((a, b) => a.n - b.n)[0]
                  const accent = i.color ?? DEFAULT_ANNIV_COLOR
                  const accentUi = readableAccent(accent)
                  return (
                    <li
                      key={i.id}
                      className="flex items-start gap-2.5 rounded-xl border border-border/60 bg-secondary/20 px-3 py-2.5"
                    >
                      {editingId === i.id ? (
                        <>
                          <span
                            aria-hidden
                            className="mt-1 size-3.5 shrink-0 self-start rounded-full border border-black/10"
                            style={{
                              backgroundColor: readableAccent(editColor),
                              boxShadow: `0 0 0 1.5px ${readableAccent(editColor)}`,
                            }}
                          />
                          <div className="flex min-w-0 flex-1 flex-col gap-2">
                          <div className="flex items-center gap-2">
                            <Label className="w-12 shrink-0 text-[11px] text-muted-foreground">
                              제목
                            </Label>
                            <Input
                              className="h-8 min-w-0 flex-1"
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <Label className="w-12 shrink-0 text-[11px] text-muted-foreground">
                              시작일
                            </Label>
                            <Input
                              className="h-8 min-w-0 flex-1"
                              type="date"
                              value={editDate}
                              onChange={(e) => setEditDate(e.target.value)}
                            />
                          </div>
                          <div className="flex items-start gap-2">
                            <Label className="mt-1 w-12 shrink-0 text-[11px] text-muted-foreground">
                              색상
                            </Label>
                            <div className="min-w-0 flex-1">
                              <ColorPalette
                                color={editColor}
                                onChange={setEditColor}
                              />
                            </div>
                          </div>
                            <div className="flex gap-1 pt-0.5">
                              <Button size="sm" onClick={saveEdit}>
                                저장
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setEditingId(null)}
                              >
                                취소
                              </Button>
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <span
                            aria-hidden
                            className="mt-1 size-3.5 shrink-0 self-start rounded-full border border-black/10"
                            style={{
                              backgroundColor: accentUi,
                              boxShadow: `0 0 0 1.5px ${accentUi}`,
                            }}
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                                <p className="truncate text-sm font-semibold tracking-tight">
                                  {i.title}
                                </p>
                                {upcoming && (
                                  <>
                                    <span
                                      className="inline-flex shrink-0 items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10.5px] font-bold"
                                      style={{
                                        color: accentUi,
                                        backgroundColor: `color-mix(in srgb, ${accentUi} 20%, transparent)`,
                                      }}
                                    >
                                      <Star className="size-2.5 fill-current" />
                                      {upcoming.badge}
                                    </span>
                                    <span
                                      className="shrink-0 text-[11px] font-extrabold tabular-nums"
                                      style={{ color: accentUi }}
                                    >
                                      {formatDday(upcoming.n)}
                                    </span>
                                  </>
                                )}
                              </div>
                              <div className="flex shrink-0 gap-0.5">
                                <button
                                  type="button"
                                  aria-label="수정"
                                  onClick={() => startEdit(i)}
                                  className="rounded-md p-1 text-muted-foreground hover:bg-background"
                                >
                                  <Pencil className="size-3.5" />
                                </button>
                                <button
                                  type="button"
                                  aria-label="삭제"
                                  onClick={() => {
                                    if (readOnly) {
                                      onRequireLogin?.()
                                      return
                                    }
                                    onRemove(i.id)
                                  }}
                                  className="rounded-md p-1 text-muted-foreground hover:bg-background"
                                >
                                  <X className="size-3.5" />
                                </button>
                              </div>
                            </div>
                            <p className="mt-0.5 text-[11.5px] text-muted-foreground">
                              {formatKoDate(i.date)} 시작
                            </p>
                          </div>
                        </>
                      )}
                    </li>
                  )
                })}
                {annivs.length === 0 && (
                  <li className="rounded-xl border border-dashed border-border/80 py-8 text-center text-xs text-muted-foreground">
                    등록된 기념일이 없어요
                  </li>
                )}
              </ul>
              <p className="mt-1 text-xs text-muted-foreground">
                새 기념일은 기념일 탭에서 + 로 추가하세요.
              </p>
            </DialogContent>
          </Dialog>
        </div>

        <TabsContent value="dday" className="pt-1">
          <div className="relative pl-1.5">
            {ddays.map((i, idx) => {
              const n = daysUntil(i.date)
              const u = urgency(n)
              if (editingId === i.id) {
                return (
                  <div key={i.id} className="flex flex-col gap-1.5 py-2 pl-6">
                    <Input
                      className="h-8"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                    />
                    <Input
                      className="h-8"
                      type="date"
                      value={editDate}
                      onChange={(e) => setEditDate(e.target.value)}
                    />
                    <div className="flex gap-1">
                      <Button size="sm" onClick={saveEdit}>
                        저장
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingId(null)}
                      >
                        취소
                      </Button>
                    </div>
                  </div>
                )
              }
              return (
                <TimelineRow
                  key={i.id}
                  title={i.title}
                  dateLabel={formatKoDate(i.date)}
                  dday={formatDday(n)}
                  urgency={u}
                  showLine={idx < ddays.length - 1}
                  onEdit={() => startEdit(i)}
                  onRemove={() => {
                    if (readOnly) {
                      onRequireLogin?.()
                      return
                    }
                    onRemove(i.id)
                  }}
                />
              )
            })}
            {ddays.length === 0 && (
              <p className="py-4 text-center text-xs text-muted-foreground">
                등록된 D-Day가 없어요
              </p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="anniversary" className="pt-1">
          <div
            ref={scrollerRef}
            className="relative max-h-[280px] overflow-y-auto pl-1.5"
          >
            {events.map((e, idx) => {
              const n = daysUntil(e.date)
              const prevN = idx > 0 ? daysUntil(events[idx - 1].date) : null
              const showTodayBefore =
                n >= 0 && (prevN === null || prevN < 0)
              const isLast = idx === events.length - 1

              return (
                <React.Fragment key={e.key}>
                  {showTodayBefore && (
                    <div ref={todayRef} className="relative flex items-center gap-3.5 py-2">
                      <span className="relative z-[1] size-[11px] shrink-0 rounded-full bg-foreground" />
                      <span className="text-[13px] font-bold">오늘</span>
                    </div>
                  )}
                  <TimelineRow
                    title={e.title}
                    dateLabel={formatKoDate(e.date)}
                    dday={formatDday(n)}
                    urgency={n < 0 ? "past" : n === 0 ? "milestone" : urgency(n)}
                    badge={e.badge}
                    showLine={!isLast}
                    accentColor={e.color}
                  />
                  {isLast && n < 0 && (
                    <div ref={todayRef} className="relative flex items-center gap-3.5 py-2">
                      <span className="relative z-[1] size-[11px] shrink-0 rounded-full bg-foreground" />
                      <span className="text-[13px] font-bold">오늘</span>
                    </div>
                  )}
                </React.Fragment>
              )
            })}
            {events.length === 0 && (
              <p className="py-4 text-center text-xs text-muted-foreground">
                등록된 기념일이 없어요
              </p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function TimelineRow({
  title,
  dateLabel,
  dday,
  urgency: u,
  badge,
  showLine,
  onEdit,
  onRemove,
  accentColor,
}: {
  title: string
  dateLabel: string
  dday: string
  urgency: Urgency
  badge?: string | null
  showLine: boolean
  onEdit?: () => void
  onRemove?: () => void
  accentColor?: string
}) {
  const ddayTone = u === "milestone" ? "past" : u

  return (
    <div className="group relative flex gap-3.5 py-[11px]">
      {showLine && (
        <span className="absolute top-[25px] bottom-[-5px] left-[5px] w-[1.5px] bg-border" />
      )}
      <span
        className={cn(
          "relative z-[1] mt-1 size-[11px] shrink-0 rounded-full border-2 border-card shadow-[0_0_0_1.5px_currentColor]",
          !accentColor && DOT[u],
        )}
        style={
          accentColor
            ? {
                color: readableAccent(accentColor),
                backgroundColor: readableAccent(accentColor),
              }
            : undefined
        }
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-1.5">
            <span className="min-w-0 truncate text-[13.5px] font-semibold tracking-tight">
              {title}
            </span>
            {badge && (
              <span
                className="inline-flex shrink-0 items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10.5px] font-bold"
                style={{
                  color: readableAccent(accentColor ?? "var(--event-rose)"),
                  backgroundColor: `color-mix(in srgb, ${readableAccent(accentColor ?? "var(--event-rose)")} 20%, transparent)`,
                }}
              >
                <Star className="size-2.5 fill-current" />
                {badge}
              </span>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-0.5">
          <span
            className={cn(
              "text-[13px] font-extrabold tabular-nums tracking-tight",
              !accentColor && DDAY[ddayTone],
            )}
            style={
              accentColor
                ? { color: readableAccent(accentColor) }
                : undefined
            }
          >
              {dday}
            </span>
            {(onEdit || onRemove) && (
              <span className="flex">
                {onEdit && (
                  <button
                    type="button"
                    aria-label="수정"
                    onClick={onEdit}
                    className="rounded-md p-1 text-muted-foreground hover:bg-muted"
                  >
                    <Pencil className="size-3.5" />
                  </button>
                )}
                {onRemove && (
                  <button
                    type="button"
                    aria-label="삭제"
                    onClick={onRemove}
                    className="rounded-md p-1 text-muted-foreground hover:bg-muted"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </span>
            )}
          </div>
        </div>
        <span className="mt-0.5 block text-[11.5px] text-muted-foreground">
          {dateLabel}
        </span>
      </div>
    </div>
  )
}