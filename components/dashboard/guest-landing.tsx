"use client"

import { GuestDashboardMockup } from "@/components/dashboard/guest-dashboard-mockup"

type GuestLandingProps = {
  onStart: () => void
}

export function GuestLanding({ onStart }: GuestLandingProps) {
  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-4 py-2 sm:py-3">
      <div className="flex w-full max-w-xl flex-col items-start gap-3">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold tracking-tight text-foreground text-balance sm:text-2xl">
            캘린더·할 일·북마크를 한 화면에서
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Google 계정으로 로그인하면 일정, 투두, 핀, 기념일, 뽀모도로를
            한곳에서 관리할 수 있습니다.
          </p>
        </div>

        <button
          type="button"
          onClick={onStart}
          className="inline-flex h-10 min-w-[44px] cursor-pointer items-center justify-center rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary/80"
        >
          Google로 시작하기
        </button>
      </div>

      <GuestDashboardMockup />
    </section>
  )
}