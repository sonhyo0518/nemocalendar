export type ChangelogSection = {
  added?: string[]
  changed?: string[]
  deprecated?: string[]
  removed?: string[]
  fixed?: string[]
  security?: string[]
}

export type ChangelogEntry = {
  version: string
  date: string
  summary?: string
  sections: ChangelogSection
}

/** Newest first. Keep in sync with root CHANGELOG.md (released versions only). */
export const CHANGELOG: ChangelogEntry[] = [
  {
    version: "0.1.0",
    date: "2026-09-10",
    summary:
      "버전 관리·릴리즈 노트 체계를 도입한 기준 버전입니다.",
    sections: {
      added: [
        "Google OAuth 로그인 및 Google Calendar 연동",
        "칸반형 투두, 핀 메모, 북마크·폴더, 기념일/D-Day",
        "헤더 배너·테마 색상 (Cloudflare R2)",
        "날씨 위젯, 뽀모도로 타이머",
      ],
    },
  },
]

export const APP_VERSION = CHANGELOG[0]?.version ?? "0.0.0"

export const SECTION_LABELS: Record<keyof ChangelogSection, string> = {
  added: "추가됨",
  changed: "변경됨",
  deprecated: "곧 제거",
  removed: "제거됨",
  fixed: "수정됨",
  security: "보안",
}

export const SECTION_ORDER: (keyof ChangelogSection)[] = [
  "added",
  "changed",
  "deprecated",
  "removed",
  "fixed",
  "security",
]
