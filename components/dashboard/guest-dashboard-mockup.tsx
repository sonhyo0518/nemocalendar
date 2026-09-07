/** Guest 랜딩용 정적 미니 목업 — 실제 대시보드 레이아웃 축소판 */
export function GuestDashboardMockup() {
  const weekdays = [
    { label: "일", className: "text-[var(--event-rose)]" },
    { label: "월", className: "" },
    { label: "화", className: "" },
    { label: "수", className: "" },
    { label: "목", className: "" },
    { label: "금", className: "" },
    { label: "토", className: "text-[var(--event-blue)]" },
  ]

  // 2026-09: 1일이 화요일 → 앞에 빈 칸 2개
  const leading = 2
  const daysInMonth = 30
  const cells = Array.from({ length: 35 }, (_, i) => {
    const day = i - leading + 1
    return day >= 1 && day <= daysInMonth ? day : null
  })

  // 데모용 가짜 일정 (개인 정보 없음)
  const events: Record<number, string[]> = {
    3: ["팀 미팅"],
    8: ["운동"],
    12: ["스터디"],
    15: ["휴가"],
    16: ["휴가"],
    22: ["프로젝트 마감"],
    28: ["병원"],
  }

  return (
    <div aria-hidden className="pointer-events-none w-full select-none">
      <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_6.75rem]">
        {/* 메인: 탭 + 캘린더 */}
        <div className="min-w-0 overflow-hidden rounded-xl border border-border/70 bg-card/80 shadow-sm backdrop-blur-sm">
          {/* 폴더 탭 */}
          <div className="flex items-center gap-3 border-b border-border/50 px-2.5 pt-2 text-[9px]">
            <span className="border-b-2 border-foreground pb-1.5 font-semibold text-foreground">
              캘린더
            </span>
            <span className="pb-1.5 text-muted-foreground">할 일</span>
            <span className="pb-1.5 text-muted-foreground">링크</span>
          </div>

          <div className="space-y-1.5 p-2">
            {/* 캘린더 헤더 */}
            <div className="flex items-center justify-between gap-1 px-0.5">
              <div className="flex min-w-0 items-center gap-1.5">
                <span className="truncate text-[10px] font-semibold text-foreground">
                  2026년 9월
                </span>
                <span className="hidden shrink-0 rounded border border-border/60 px-1 py-0.5 text-[7px] text-muted-foreground xs:inline sm:inline">
                  Google 연동
                </span>
              </div>
              <div className="flex shrink-0 items-center gap-0.5 text-[7px] text-muted-foreground">
                <span className="rounded bg-muted/60 px-1 py-0.5 font-medium text-foreground">
                  월별
                </span>
                <span className="px-0.5">주별</span>
                <span className="px-0.5">&lt;</span>
                <span className="px-0.5">&gt;</span>
                <span className="rounded border border-border/50 px-1 py-0.5">
                  오늘
                </span>
              </div>
            </div>

            {/* 요일 */}
            <div className="grid grid-cols-7 text-center text-[8px] text-muted-foreground">
              {weekdays.map((d) => (
                <div key={d.label} className={`py-0.5 font-medium ${d.className}`}>
                  {d.label}
                </div>
              ))}
            </div>

            {/* 날짜 격자 */}
            <div className="grid grid-cols-7 gap-px overflow-hidden rounded-md border border-border/40 bg-border/40">
              {cells.map((day, i) => {
                const bars = day ? events[day] : undefined
                const selected = day === 8
                return (
                  <div
                    key={i}
                    className={`min-h-[1.35rem] bg-card p-0.5 ${
                      selected ? "ring-1 ring-inset ring-[var(--event-blue)]/50 bg-[var(--event-blue)]/5" : ""
                    }`}
                  >
                    {day != null ? (
                      <>
                        <div
                          className={`text-[7px] leading-none ${
                            i % 7 === 0
                              ? "text-[var(--event-rose)]"
                              : i % 7 === 6
                                ? "text-[var(--event-blue)]"
                                : "text-foreground/75"
                          }`}
                        >
                          {day}
                        </div>
                        <div className="mt-0.5 space-y-px">
                          {bars?.map((label) => (
                            <div
                              key={label}
                              className="truncate rounded-[2px] bg-[var(--event-rose)] px-0.5 text-[5.5px] font-medium leading-tight text-white"
                            >
                              {label}
                            </div>
                          ))}
                        </div>
                      </>
                    ) : null}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* 사이드 위젯 */}
        <div className="flex flex-row gap-1.5 overflow-x-auto sm:flex-col sm:overflow-visible">
          <Widget title="고정 메시지">
            <p className="line-clamp-2 text-[7px] leading-snug text-muted-foreground">
              오늘 할 일 · 중요한 일정만 모아두기
            </p>
          </Widget>

          <Widget title="캘린더">
            <RowDot color="var(--event-rose)" label="대한민국의 휴일" />
            <RowDot color="var(--event-blue)" label="내 캘린더" />
            <RowDot color="var(--event-violet)" label="업무" />
          </Widget>

          <Widget title="날씨" className="hidden lg:block">
            <div className="flex items-baseline justify-between gap-1">
              <span className="text-[8px] text-foreground/80">서울</span>
              <span className="text-[9px] font-semibold text-foreground">22°</span>
            </div>
            <div className="text-[7px] text-muted-foreground">맑음 · 체감 21°</div>
          </Widget>

          <Widget title="D-Day">
            <div className="flex items-baseline justify-between gap-1">
              <span className="truncate text-[7px] text-foreground/80">여행</span>
              <span className="shrink-0 text-[8px] font-semibold text-[var(--event-rose)]">
                D-14
              </span>
            </div>
            <div className="flex items-baseline justify-between gap-1">
              <span className="truncate text-[7px] text-foreground/80">생일</span>
              <span className="shrink-0 text-[8px] font-semibold text-[var(--event-blue)]">
                D-30
              </span>
            </div>
          </Widget>

          <Widget title="뽀모도로" className="hidden lg:block">
            <div className="mx-auto flex size-9 items-center justify-center rounded-full border-2 border-[var(--event-rose)]/70 text-[8px] font-semibold text-foreground">
              25:00
            </div>
            <div className="text-center text-[6px] text-muted-foreground">집중 시간</div>
          </Widget>
        </div>
      </div>
    </div>
  )
}

function Widget({
  title,
  children,
  className = "",
}: {
  title: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={`min-w-[5.5rem] flex-1 space-y-1 rounded-lg border border-border/60 bg-card/80 p-1.5 shadow-sm backdrop-blur-sm sm:min-w-0 ${className}`}
    >
      <div className="text-[8px] font-semibold text-foreground/85">{title}</div>
      {children}
    </div>
  )
}

function RowDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1">
      <span
        className="size-1.5 shrink-0 rounded-[2px]"
        style={{ backgroundColor: color }}
      />
      <span className="truncate text-[6.5px] text-muted-foreground">{label}</span>
    </div>
  )
}