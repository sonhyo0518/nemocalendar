import type { Metadata } from "next"
import Link from "next/link"
import { APP_VERSION, CHANGELOG } from "@/content/changelog"
import { ChangelogList } from "@/components/changelog-list"

export const metadata: Metadata = {
  title: "릴리즈 노트 | Nemo Calendar",
  description: "Nemo Calendar 버전별 변경 사항",
}

export default function ChangelogPage() {
  return (
    <article className="mx-auto max-w-2xl px-4 py-10 text-sm leading-relaxed text-foreground">
      <header className="mb-8 border-b border-border pb-4">
        <Link
          href="/"
          className="mb-4 inline-block text-xs text-muted-foreground hover:text-foreground"
        >
          ← Nemo Calendar
        </Link>
        <h1 className="text-xl font-semibold tracking-tight">릴리즈 노트</h1>
        <p className="mt-2 text-xs text-muted-foreground">
          현재 버전 v{APP_VERSION} · 앱의 주요 변경 사항을 기록합니다.
        </p>
      </header>

      <ChangelogList entries={CHANGELOG} />

      <p className="mt-10 border-t border-border pt-4">
        <Link
          href="/"
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          ← Nemo Calendar
        </Link>
      </p>
    </article>
  )
}