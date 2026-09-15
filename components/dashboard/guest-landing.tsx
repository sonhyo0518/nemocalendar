"use client"

import dynamic from "next/dynamic"
const GuestDashboardMockup = dynamic(
  () =>
    import("@/components/dashboard/guest-dashboard-mockup").then(
      (m) => m.GuestDashboardMockup,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="h-[min(72vh,594px)] w-full animate-pulse rounded-xl bg-muted/30" />
    ),
  },
)

type GuestLandingProps = {
  onStart: () => void
  isStarting?: boolean
  errorMessage?: string | null
}

function GoogleGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.15-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.85 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.67-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06L5.85 9.9C6.71 7.31 9.14 5.38 12 5.38Z"
      />
    </svg>
  )
}

export function GuestLanding({
  onStart,
  isStarting = false,
  errorMessage,
}: GuestLandingProps) {
  return (
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

        {/* Google Identity branding: light/dark 스펙 + 표준 컬러 G */}
        <div className="flex flex-col items-start gap-2">
        <button
          id="guest-login"
          type="button"
          onClick={onStart}
          disabled={isStarting}
          aria-busy={isStarting}
            className="inline-flex h-10 cursor-pointer items-center gap-2.5 rounded-md border border-[#DADCE0] bg-[#FFFFFF] pl-3 pr-3 text-sm font-medium leading-5 text-[#1F1F1F] hover:bg-[#F8F9FA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DADCE0]/50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-[#3C4043] dark:bg-[#131314] dark:text-[#E3E3E3] dark:hover:bg-[#1F1F1F]"
          >
            <span className="flex size-5 shrink-0 items-center justify-center rounded-sm bg-white">
              <GoogleGlyph />
            </span>
            {isStarting ? "로그인 중…" : "Google 계정으로 로그인"}
          </button>
          {errorMessage ? (
            <p role="alert" className="text-sm text-destructive">
              {errorMessage}
            </p>
          ) : null}
        </div>
      </div>

      <GuestDashboardMockup
        onRequireLogin={() => {
          document.getElementById("guest-login")?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          })
          document.getElementById("guest-login")?.focus()
        }}
      />

      <div className="w-full space-y-3">
        <h3 className="text-sm font-medium tracking-tight text-foreground">
          제공 기능
        </h3>
        <ul className="divide-y divide-border/60 border-y border-border/60">
          <li className="py-3">
            <p className="text-sm font-medium text-foreground">일정 관리</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Google Calendar와 연동해 일정을 조회·추가·수정·삭제합니다.
            </p>
          </li>
          <li className="py-3">
            <p className="text-sm font-medium text-foreground">Google 로그인</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Google 계정으로 로그인합니다. 캘린더 권한은 「캘린더 연결」을
              선택할 때만 별도로 요청합니다.
            </p>
          </li>
          <li className="py-3">
            <p className="text-sm font-medium text-foreground">
              할 일 · 고정 메세지 · 북마크
            </p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              칸반 투두, 고정 메모, 링크 폴더를 한 화면에서 관리합니다.
            </p>
          </li>
          <li className="py-3">
            <p className="text-sm font-medium text-foreground">
              기념일 · 날씨 · 뽀모도로
            </p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              D-Day/기념일, 지역 날씨, 집중 타이머를 함께 둡니다.
            </p>
          </li>
        </ul>
        <p className="text-xs leading-relaxed text-muted-foreground">
          Google 사용자 데이터(캘린더 등)는 위 기능을 제공하는 데만
          사용합니다. 자세한 내용은{" "}
          <a
            href="/privacy"
            className="text-foreground underline underline-offset-2"
          >
            개인정보처리방침
          </a>
          을 참고하세요.
        </p>
      </div>
    </section>
  )
}