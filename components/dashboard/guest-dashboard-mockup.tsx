/** Guest 랜딩용 정적 미니 목업 — 인터랙션/데이터 없음 */
export function GuestDashboardMockup() {
    const days = ["월", "화", "수", "목", "금", "토", "일"]
    // 5주 × 7칸; 일부 칸에만 가짜 일정 점/바
    const cells = Array.from({ length: 35 }, (_, i) => i + 1)
    const eventAt: Record<number, { label: string; color: string }> = {
      3: { label: "회의", color: "var(--event-blue)" },
      10: { label: "운동", color: "var(--event-green)" },
      16: { label: "스터디", color: "var(--event-violet)" },
      22: { label: "여행", color: "var(--event-amber)" },
    }
  
    return (
      <div
        aria-hidden
        className="pointer-events-none w-full select-none"
      >
        <div className="overflow-hidden rounded-xl border border-border/70 bg-card/70 shadow-sm backdrop-blur-sm">
          <div className="grid gap-2 p-3 sm:grid-cols-[minmax(0,1fr)_7.5rem]">
            {/* 미니 캘린더 */}
            <div className="min-w-0 space-y-2">
              <div className="flex items-center justify-between px-0.5">
                <span className="text-[11px] font-semibold text-foreground/90">
                  2026. 9
                </span>
                <span className="text-[10px] text-muted-foreground">캘린더</span>
              </div>
              <div className="grid grid-cols-7 gap-px text-center text-[9px] text-muted-foreground">
                {days.map((d) => (
                  <div key={d} className="py-0.5">
                    {d}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-0.5">
                {cells.map((n) => {
                  const ev = eventAt[n]
                  const inMonth = n <= 30
                  return (
                    <div
                      key={n}
                      className="flex aspect-square flex-col items-stretch rounded-sm bg-muted/30 p-0.5"
                    >
                      <span
                        className={`text-[8px] leading-none ${
                          inMonth ? "text-foreground/70" : "text-muted-foreground/40"
                        }`}
                      >
                        {((n - 1) % 30) + 1}
                      </span>
                      {ev ? (
                        <span
                          className="mt-auto truncate rounded-[2px] px-0.5 text-[7px] font-medium text-white"
                          style={{ backgroundColor: ev.color }}
                        >
                          {ev.label}
                        </span>
                      ) : null}
                    </div>
                  )
                })}
              </div>
            </div>
  
            {/* 사이드 위젯 실루엣 */}
            <div className="flex flex-row gap-2 sm:flex-col">
              <div className="min-w-0 flex-1 space-y-1 rounded-lg border border-border/50 bg-background/50 p-2">
                <div className="text-[9px] font-medium text-foreground/80">핀</div>
                <div className="h-1.5 w-full rounded-full bg-muted" />
                <div className="h-1.5 w-4/5 rounded-full bg-muted/70" />
                <div className="h-1.5 w-3/5 rounded-full bg-muted/50" />
              </div>
              <div className="min-w-0 flex-1 space-y-1 rounded-lg border border-border/50 bg-background/50 p-2">
                <div className="text-[9px] font-medium text-foreground/80">투두</div>
                <div className="flex items-center gap-1">
                  <span className="size-1.5 shrink-0 rounded-sm bg-[var(--event-blue)]" />
                  <span className="h-1.5 flex-1 rounded-full bg-muted" />
                </div>
                <div className="flex items-center gap-1">
                  <span className="size-1.5 shrink-0 rounded-sm bg-[var(--event-green)]" />
                  <span className="h-1.5 w-3/4 rounded-full bg-muted/70" />
                </div>
                <div className="flex items-center gap-1">
                  <span className="size-1.5 shrink-0 rounded-sm bg-[var(--event-rose)]" />
                  <span className="h-1.5 w-1/2 rounded-full bg-muted/50" />
                </div>
              </div>
              <div className="hidden min-w-0 flex-1 space-y-1 rounded-lg border border-border/50 bg-background/50 p-2 sm:block">
                <div className="text-[9px] font-medium text-foreground/80">D-Day</div>
                <div className="text-[10px] font-semibold text-[var(--event-rose)]">
                  D-12
                </div>
                <div className="h-1 w-2/3 rounded-full bg-muted/60" />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }