/** 홈 dynamic(ssr:false) 청크 로드 전 첫 paint용. guest 정적 카피 포함 */
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
  
        <main className="relative z-10 mx-auto flex min-w-0 max-w-7xl flex-col gap-2 p-3 sm:p-4">
          <header className="flex items-center justify-between gap-3 py-2">
            <div className="flex items-center gap-2">
              <div className="size-8 animate-pulse rounded-md bg-muted/80" />
              <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                Nemo Calendar
              </h1>
            </div>
            <div className="h-9 w-28 animate-pulse rounded-md bg-muted/80" />
          </header>
  
          <section className="flex w-full flex-col gap-6 py-2 sm:py-3">
            <div className="flex w-full max-w-xl flex-col items-start gap-3">
              <div className="space-y-2">
                <h2 className="text-xl font-semibold tracking-tight text-foreground text-balance sm:text-2xl">
                  캘린더·할 일·북마크를 한 화면에서
                </h2>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  탭을 바꿔 화면만 둘러볼 수 있어요. 추가·수정은 Google 로그인 후
                  이용할 수 있습니다.
                </p>
              </div>
              <div className="h-10 w-52 animate-pulse rounded-md bg-muted/80" />
            </div>
  
            <div className="h-[min(72vh,594px)] w-full animate-pulse rounded-xl bg-muted/30" />
  
            <div className="w-full space-y-3">
              <h3 className="text-sm font-medium tracking-tight text-foreground">
                제공 기능
              </h3>
              <ul className="divide-y divide-border/60 border-y border-border/60 text-sm text-muted-foreground">
                <li className="py-3">일정 관리</li>
                <li className="py-3">Google 로그인</li>
                <li className="py-3">할 일 · 고정 메세지 · 북마크</li>
                <li className="py-3">기념일 · 날씨 · 뽀모도로</li>
              </ul>
            </div>
          </section>
        </main>
      </div>
    )
  }