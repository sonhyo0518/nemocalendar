"use client"

type GuestLandingProps = {
  onStart: () => void
}

export function GuestLanding({ onStart }: GuestLandingProps) {
  return (
    <section className="mx-auto flex max-w-xl flex-col items-start gap-6 py-6 sm:py-10">
      <div className="space-y-3">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground text-balance sm:text-3xl">
          캘린더·할 일·북마크를 한 화면에서
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
          Google 계정으로 로그인하면 일정, 투두, 핀 메모, 기념일, 뽀모도로를
          하나의 워크스페이스에서 관리할 수 있습니다.
        </p>
      </div>

      <ul className="grid w-full gap-2 text-sm text-muted-foreground sm:grid-cols-3">
        <li className="rounded-lg border border-border/60 bg-card/50 px-3 py-2">
          Google Calendar 연동
        </li>
        <li className="rounded-lg border border-border/60 bg-card/50 px-3 py-2">
          투두 · 북마크 · 핀
        </li>
        <li className="rounded-lg border border-border/60 bg-card/50 px-3 py-2">
          D-Day · 뽀모도로
        </li>
      </ul>

      <button
        type="button"
        onClick={onStart}
        className="inline-flex h-11 min-w-[44px] cursor-pointer items-center justify-center rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary/80"
      >
        Google로 시작하기
      </button>
    </section>
  )
}