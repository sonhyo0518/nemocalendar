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

/** Newest first. Keep in sync with frontend/CHANGELOG.md (released versions only). */
export const CHANGELOG: ChangelogEntry[] = [
  {
    version: "0.2.1",
    date: "2026-09-14",
    summary:
      "캘린더 연결·북마크 URL 보안 강화와 세션·날씨 검색 버그 수정입니다.",
    sections: {
      security: [
        "Google 캘린더 연결 시 로그인 계정과 동일한 Google 계정인지 검증",
        "북마크 OG 응답 크기 상한 및 favicon/preview URL http(s) 검증",
      ],
      fixed: [
        "비인증 API 401으로 로컬 세션이 지워지던 문제",
        "날씨 지역 검색 자동완성 레이스",
        "북마크 열기·미리보기에서 안전하지 않은 URL 차단",
      ],
    },
  },
  {
    version: "0.2.0",
    date: "2026-09-13",
    summary:
      "계정 삭제, 사용자용 릴리즈 노트, WeatherAPI 연동을 반영한 버전입니다.",
    sections: {
      added: [
        "사이트 푸터와 /changelog 페이지에서 사용자용 릴리즈 노트 제공",
        "계정 메뉴에서 계정 삭제(탈퇴): 서비스 데이터·배너·캘린더 연동 토큰 제거",
      ],
      changed: [
        "날씨 upstream을 Open-Meteo에서 WeatherAPI.com(WEATHER_API_KEY)으로 교체",
      ],
      fixed: [
        "호스팅(Render 공유 IP)에서 Open-Meteo 한도로 날씨 조회가 실패하던 문제",
      ],
    },
  },
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
