"use client"

import Link from "next/link"
import { useEffect } from "react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-20 text-center">
      <p className="text-xs font-medium tracking-wide text-muted-foreground">
        오류
      </p>
      <h1 className="mt-2 text-xl font-semibold tracking-tight text-foreground">
        일시적인 문제가 발생했습니다
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        잠시 후 다시 시도해 주세요.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/80"
        >
          다시 시도
        </button>
        <Link
          href="/"
          className="inline-flex h-9 items-center justify-center rounded-lg border border-border bg-background px-4 text-sm font-medium text-foreground hover:bg-muted"
        >
          홈으로
        </Link>
      </div>
    </div>
  )
}