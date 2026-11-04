"use client"

import * as React from "react"
import {
  SECTION_LABELS,
  SECTION_ORDER,
  entrySectionKeys,
  usedSectionKeys,
  type ChangelogEntry,
  type ChangelogSection,
} from "@/content/changelog"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"

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

export function ChangelogList({ entries }: { entries: ChangelogEntry[] }) {
  const [selected, setSelected] = React.useState<Set<keyof ChangelogSection>>(
    () => new Set(),
  )

  function toggle(key: keyof ChangelogSection) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const filterKeys = React.useMemo(() => usedSectionKeys(entries), [entries])

  const visible =
    selected.size === 0
      ? entries
      : entries.filter((e) =>
          entrySectionKeys(e.sections).some((k) => selected.has(k)),
        )

  return (
    <div>
      <div className="mb-8 flex flex-wrap gap-3">
        {filterKeys.map((key) => {
          const checked = selected.has(key)
          return (
            <label
              key={key}
              className={cn(
                "inline-flex cursor-pointer items-center gap-2 text-xs text-muted-foreground",
              )}
            >
              <Checkbox
                checked={checked}
                onCheckedChange={() => toggle(key)}
              />
              {SECTION_LABELS[key]}
            </label>
          )
        })}
      </div>

      <div className="space-y-10 text-[13px] text-muted-foreground">
        {visible.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            선택한 종류의 릴리즈가 없습니다.
          </p>
        ) : (
          visible.map((entry) => (
            <section
              key={entry.version}
              className="border-b border-border/60 pb-8 last:border-b-0 last:pb-0"
            >
              <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-2">
                <h2 className="text-base font-semibold tracking-tight text-foreground">
                  v{entry.version}
                </h2>
                <time
                  dateTime={entry.date}
                  className="text-xs text-muted-foreground"
                >
                  {formatDate(entry.date)}
                </time>
                <div className="flex flex-wrap gap-1.5">
                  {entrySectionKeys(entry.sections).map((key) => (
                    <Badge
                      key={key}
                      variant={key === "security" ? "destructive" : "secondary"}
                    >
                      {SECTION_LABELS[key]}
                    </Badge>
                  ))}
                </div>
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
          ))
        )}
      </div>
    </div>
  )
}