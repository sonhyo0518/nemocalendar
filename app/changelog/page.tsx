import type { Metadata } from "next"
import Link from "next/link"
import {
  APP_VERSION,
  CHANGELOG,
  SECTION_LABELS,
  SECTION_ORDER,
  type ChangelogSection,
} from "@/content/changelog"

export const metadata: Metadata = {
  title: "릴리즈 노트 | Nemo Calendar",
  description: "Nemo Calendar 버전별 변경 사항",
}

function formatDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number)
  if (!y || !m || !d) return iso
  return `${y}년 ${m}월 ${d}일`
}

function SectionList({
  sectionKey,
  items,
}: {
  sectionKey: keyof ChangelogSection
  items: string[]
}) {
  return (
    <div>
      <h3 className="mb-2 text-sm font-medium text-foreground">
        {SECTION_LABELS[sectionKey]}
      </h3>
      <ul className="list-disc space-y-1 pl-5">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  )
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

      <div className="space-y-10 text-[13px] text-muted-foreground">
        {CHANGELOG.map((entry) => (
          <section
            key={entry.version}
            className="border-b border-border/60 pb-8 last:border-b-0 last:pb-0"
          >
            <div className="mb-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h2 className="text-base font-semibold tracking-tight text-foreground">
                v{entry.version}
              </h2>
              <time
                dateTime={entry.date}
                className="text-xs text-muted-foreground"
              >
                {formatDate(entry.date)}
              </time>
            </div>
            {entry.summary ? (
              <p className="mb-4 text-[13px]">{entry.summary}</p>
            ) : null}
            <div className="space-y-4">
              {SECTION_ORDER.map((key) => {
                const items = entry.sections[key]
                if (!items?.length) return null
                return (
                  <SectionList key={key} sectionKey={key} items={items} />
                )
              })}
            </div>
          </section>
        ))}
      </div>
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