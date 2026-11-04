/** 홈 dynamic(ssr:false) 청크 로드 전 첫 paint용. 세션 유무와 무관한 중립 셸 */
export function HomeLoadingFallback() {
  return (
    <div className="relative min-h-full overflow-x-hidden bg-background">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[280px] sm:h-[340px] md:h-[400px]"
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, var(--banner-theme, #7c9cbf), var(--background))",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent from-35% via-background/45 via-70% to-background" />
      </div>

      <main className="relative z-10 mx-auto flex min-w-0 max-w-7xl flex-col gap-4 p-3 sm:p-4 md:p-6">
        <header className="flex items-center justify-between gap-3 py-5 sm:py-7 md:py-8">
          <div className="flex items-center gap-3">
            <div className="size-9 animate-pulse rounded-lg bg-muted/80" />
            <div className="h-7 w-40 animate-pulse rounded-md bg-muted/80 sm:h-8 sm:w-48" />
          </div>
          <div className="size-8 animate-pulse rounded-full bg-muted/80" />
        </header>

        <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_17.5rem] lg:items-start">
          <div className="min-w-0 space-y-4">
            <div className="h-8 w-40 animate-pulse rounded-md bg-muted/80" />
            <div className="h-72 animate-pulse rounded-xl bg-muted/40" />
          </div>
          <div className="hidden space-y-3 lg:block">
            <div className="h-24 animate-pulse rounded-xl bg-muted/40" />
            <div className="h-32 animate-pulse rounded-xl bg-muted/40" />
            <div className="h-28 animate-pulse rounded-xl bg-muted/40" />
          </div>
        </div>
      </main>
    </div>
  )
}