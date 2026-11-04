# 향후 개선·개발 사항

현재 기준 버전: **0.3.7**  
SemVer·태그: [VERSIONING.md](./VERSIONING.md) · 변경 이력: [CHANGELOG.md](./CHANGELOG.md)

상태는 `예정` / `진행 중` / `완료`입니다.  
한 릴리즈에 여러 종류가 섞이면 가장 높은 SemVer 자리만 올립니다.

관련 문서: [DEPLOYMENT.md](./DEPLOYMENT.md) · [프로젝트 설명.md](./프로젝트%20설명.md)

> **Canonical 위치:** 이 파일은 `nemocalendar` 레포 루트에 둡니다.
> 로컬 워크스페이스(`nemoCalendar2/`)의 루트 `ROADMAP.md`는 여기로 가는 포인터입니다.

### 규칙 (ID · 적기 · 스케줄)

- **ID 접두사**(P0/P1/P2/P3/D)는 이력용 라벨이다. **실행 위치는 섹션**만 본다.
- **새 기능·UX 아이디어**는 기본으로 [§3.1 Inbox](#31-inbox-새로-적은-것)에 한 행 추가한다. 버전·순위는 붙이지 않는다.
- 범위·의존이 정리되면 [§3.2](#32-다듬음--10-이후-minor)로 승격한다. **다음 릴리즈에 넣기로 정한 뒤**에만 [§2 스케줄](#2-미완료--스케줄된-트랙)로 옮긴다.
- 버그·보안·급함은 Inbox를 거치지 않고 §2(또는 PATCH)로 직행해도 된다.
- 미완료·백로그 표 공통 컬럼: `ID | 항목 | 내용 | 노트 | 상태` (§2 버전 표만 앞에 `순위`). `노트` = CHANGELOG 분류(Changed / Fixed / …).

---

## 1. 한눈에 (권장 진행 순서)

SI 점검(아키텍처·QA·운영) 갭을 버전 트랙에 흡수한 순서. 목표 궤적(대략): 운영·계약 보강 → 1.0 → 반응형·스케일.

```
지금(0.3.7) · [§4](#4-완료됨-버전별)
  ├─ 병행(§2.1, bump 없음): P0-1 OAuth · P1-17 BE 테스트 · P1-18 Zod 파일럿
  ├─ v0.4.0(§2.4): P3-2 → P3-1 → P3-12(TiDB UX) → P3-10 → P3-11 → P3-7 → …
  │            (P3-3·P3-9는 인스턴스 2+ 조건부 · 단일면 1.0 후로 미뤄도 됨)
  │            (P3-4 쿠키 근본은 v0.4 밖 · 1.0 전후 MAJOR/배포 — 동시 여부 결정)
  │            (운영·bump 없음: TiDB Active·IP·DATABASE_URL·health ping·실패 알림)
  ├─ (선택) v0.5.0(§2.5): P2-19 → P2-20  (마케팅/SEO 필요할 때만)
  ├─ v1.0.0(§2.6): P0-1 · P1-4 · P1-5 · D-3 · P1-14  (+P3-4 동시 여부)
  └─ 1.0 후: 반응형 잔여(P2-30 · P2-32 대안뷰) → §3.2(P2-21·3·27 · P2-5) → 스케일(P3-3·9·P3-13)
```

우선순위: **§2 목표 버전 순서**가 곧 작업 순서입니다.  
(코드 밖 작업·chore는 버전 bump 없이 병행 가능. 백로그는 스케줄에 올리지 않는 한 작업 순서가 아니다.)

---

## 2. 미완료 — 스케줄된 트랙

「이 버전에 넣기로 한 것」만 둔다. 기능 욕심·아이디어는 §3 백로그에 적는다.

### 2.1 병행 (버전 bump 없음) — 공개·문서·CI 위생

| ID | 항목 | 내용 | 노트 | 상태 |
| --- | --- | --- | --- | --- |
| P0-1 | Google OAuth 앱 검수 | 「확인하지 않은 앱」 해소, 일반 사용자 접근 | 보통 미기재 또는 Changed 한 줄 | 예정 |
| P1-17 | BE 통합 테스트 공백 | 캘린더 consent·CSRF prod 매트릭스·token-crypto·(선택) weather/R2 모킹. 0.4 작업과 병행 가능(버전 표와 섞지 않음) | (내부) | 예정 |
| P1-18 | 요청 검증 Zod 파일럿 | pin/todo 등 1~2 라우트에 스키마 도입 후 패턴 문서화. 전면 교체는 후속. 0.4와 병행 가능(버전 표와 섞지 않음) | Changed | 예정 |

---

### 2.4 목표 **v0.4.0** (MINOR) — 인프라·관측

동작은 대체로 동일, 운영/스케일. 사용자 노트는 짧게.  
순위는 **로그인·공란 체감 원인**을 앞에 두고, Redis·락·자동화는 뒤에 둔다.

**요약:** 첫 로그인·장시간 미사용 후 로드 실패·대시보드 공란 → cold start · 로그인 직후 폭주 · 크로스 사이트 쿠키 · 세션 착시 · TiDB(`P1001`). 위젯 전체 공란 UX는 v0.3.1 P2-23으로 완화. 코드 축: P3-2 · P3-1 · P3-12 · P3-10 · P3-11. 쿠키 근본은 P3-4(v0.4 밖).

#### 메모: 최초·오랜만 로그인·대시보드 공란 (당장 착수 안 함 · 이후 개선)

증상: 첫 로그인·장시간 미사용 후 로드 실패가 잦음. 로그인 UI만 보이고 위젯/캘린더가 비는 경우도 있음.  
관측 예: `POST /google-login` 200 → `GET /me` 401(이후 `refresh` 200으로 복구 가능); `pins`/`todo-categories` 500; `/health` 503; 콘솔 COOP/`window.closed`는 대개 무관 노이즈.  
*(과거)* 위젯 `Promise.all`로 일부 500이 전체 공란이 되던 UX → v0.3.1 **P2-23**(`allSettled`)로 완화. 남은 축은 cold start·쿠키·TiDB·로그인 직후 폭주.

원인 후보 (겹침):

1. **Render 슬립·콜드스타트** — 무료 플랜 ~15분 무활동 시 sleep, wake 30~60초. `/health` 워밍·`authFetch` wake 재시도는 있으나 **GET 계열만**; 로그인 `POST`는 재시도 공백. health와 로그인 클릭 레이스.
2. **로그인 직후 요청 폭주** — `/me`·weather·위젯·캘린더가 동시에 깨어난 API에 몰림. `/me` 401 → 세션 클리어 → 진행 중 fetch abort.
3. **Vercel ↔ Render 크로스 사이트 쿠키** — `SameSite=None; Secure`여도 3rd-party 제한 시 Set-Cookie 미저장 → 보호 API 401. (프론트는 `www.nemocalendar.com` 등)
4. **복귀 세션 착시** — `localStorage.user`만 남고 httpOnly 쿠키 만료 시 UI는 로그인처럼 보이다 cascade 401.
5. **TiDB 연결 불가 (`P1001`)** — Render→`gateway…tidbcloud.com:4000` 도달 실패. `/health`의 `SELECT 1` 실패(503 `db:false`) → `pins`/`todo-categories` 등 Prisma 500. 클러스터 Active·Public Endpoint·방화벽 `0.0.0.0`~`255.255.255.255`(CIDR `0.0.0.0/0` 동치)여도 간헐 단절 가능.

판별: TTFB 수십 초→cold start; `/me` 즉시 401·Cookie 없음→쿠키; `/health` `db:false` + 로그 `P1001`→TiDB; 일부 API만 500인데 화면이 통째로 비면→(과거) 위젯 `Promise.all` / (현재) P2-23 후엔 실패 위젯만.

이후 코드 개선: P3-2 · P3-1 · P3-12 · P3-10 · P3-11. 쿠키 근본은 **P3-4**(v0.4 밖 · 별도 MAJOR/배포 이슈).  
**버전 bump 없음(운영):** TiDB Active 유지, IP 전체 허용 유지, `DATABASE_URL`(4000·`sslaccept=strict`) 정합, `/health` keep-alive·**실패 알림**(Actions/UptimeRobot 등).

| 순위 | ID | 항목 | 내용 | 노트 | 상태 |
| --- | --- | --- | --- | --- | --- |
| 1 | P3-2 | 관측 가능성 | **v0.4 Done (최소):** BE 구조화 로그(`requestId` + access JSON), keep-alive/`/health` **실패 알림**(메일·Discord 등 — SaaS 불문). Render 로그로 `db:false`·`P1001` 추적 가능하면 충분. **보류:** FE+BE Sentry(또는 동급 에러 SaaS) — 1인·소규모·병목이 인프라(슬립·TiDB·쿠키)인 동안은 과함. 재현 안 되는 앱 예외가 반복될 때 재검토 | (운영) | 완료 |
| 2 | P3-1 | Render cold start | keep-alive 의존 완화(유료 always-on 또는 `/health` 5분 ping 실효 확인). 로그인 전 health/워밍 게이트·콜드스타트 UX(「서버 깨우는 중」). 필요 시 로그인 POST 제한적 재시도(code 재사용·멱등 주의). **진행:** 게이트+UX 문구 반영. 남은 선택: POST 재시도·always-on | Changed | 진행 중 |
| 3 | P3-12 | TiDB 연결 회복력 | Prisma 짧은 재시도는 0.3.1 P1-15로 반영됨. 남은 범위: `/health` db 실패 시 프론트 「DB 준비 중」·위젯 재시도 CTA. **운영 실패 알림은 P3-2** (이 항목은 UX만). 운영 체크리스트는 상기 메모 | Fixed / Changed | 예정 |
| 4 | P3-10 | Dashboard bootstrap API | 위젯 bootstrap(P1-11) 이후 잔여: 로그인 직후 `/me`·weather·캘린더 폭주 완화(단일/소수 bootstrap 또는 우선순위·순차 로딩) | Performance | 예정 |
| 5 | P3-11 | 최초·복귀 로그인 로드 안정화 | `/me` 401 시 즉시 전체 클리어·abort 연쇄 완화; refresh 실패 vs 쿠키 없음 구분; localStorage-only 착시 UX; 날씨/위젯 재시도 안내. P3-1·P3-12와 병행(쿠키 근본은 P3-4). 위젯 partial UI는 P2-23 완료. **위젯 401 오탐 토스트는 P2-33(v0.3.4)로 선반영** | Fixed / Changed | 예정 |
| 6 | P3-7 | Calendar quota 최적화 | calendarList 분리 캐시, selected fan-out 완화 (실측 후) | Performance | 예정 |
| 7 | P3-3 | 캐시 LRU → Redis | calendar/weather Map에 max size·만료 스윕 후, **인스턴스 2+** 시 Redis. **단일 인스턴스면 1.0 후로 미뤄도 됨** | Changed / Performance | 예정 |
| 8 | P1-6 | Access 무효화·blacklist | 재사용 탐지는 완료. 남은 범위: logout 후 access JWT 조기 무효화(버전 클레임/blacklist 등). 0.4 후반~1.0 전 권장 | Security | 예정 |
| 9 | P0-15 | CSRF double-submit | Origin 가드 유지 + `X-CSRF-Token`(또는 동등) defense-in-depth. 도메인/쿠키 단순화(P3-4)와 분리. 0.4 후반~1.0 전 권장 | Security | 예정 |
| 10 | P3-5 | 릴리즈 자동화 | changesets / release-please. 듀얼 레포 피로가 커질 때(1.0 후도 가능) | (내부) | 예정 |
| 11 | P3-9 | 유저 락 DB화 | `withUserLock`을 프로세스 mutex → `SELECT … FOR UPDATE`(또는 분산 락). 인스턴스 2+ 또는 sequence 유니크 도입 시. **단일면 1.0 후·P3-13과 묶어도 됨** | Fixed | 예정 |

P1-17·P1-18은 [§2.1](#21-병행-버전-bump-없음--공개문서ci-위생) 병행(bump 없음). 0.4 순위 표와 섞지 않음.

v0.4에 **넣지 않음** (별도 MAJOR / 배포 이슈):

| ID | 항목 | 비고 |
| --- | --- | --- |
| P3-4 | 도메인·쿠키 단순화 | 상기 메모 원인 3의 근본 처방. same-site(`api.` 서브도메인 또는 Vercel `/api` rewrite)로 쿠키 1st-party화. **A:** 1.0과 동시(공개 직후 401 리스크 제거) · **B:** D-3에 한계로 적고 1.x MAJOR. P0-15·v0.4.0과 묶지 말 것 |

---

### 2.5 (선택) 목표 **v0.5.0** (MINOR) — 프론트 SSR·SEO 패키지

0.3.1의 P2-15가 “최소 loading/SSR”에 그쳤고, guest 본문·메타를 **체감 큰 Changed**로 밀 때만 연다. 아니면 1.0 직전 chore로 흡수.

| 순위 | ID | 항목 | 내용 | 노트 | 상태 |
| --- | --- | --- | --- | --- | --- |
| 1 | P2-19 | Guest 랜딩 SSR/스트리밍 | 마케팅 카피·히어로를 서버 HTML로, 대시보드만 CSR | Changed / Performance | 예정 |
| 2 | P2-20 | SEO·a11y 패키지 | `canonical`, JSON-LD, skip link, sitemap `lastModified` 정합 | Changed | 예정 |

---

### 2.6 목표 **v1.0.0** (MAJOR) — 계약 선언

SI 「인수 게이트」: 공개·계약·E2E·한계 명시. UX 완성(반응형 본편)은 1.0 후에 둔다.  
**P3-4**를 1.0과 동시(A)로 갈지, D-3에만 적고 미룰지(B)는 공개 직전 결정 → [§2.4](#24-목표-v040-minor--인프라관측) 표 비고.

| ID | 항목 | 내용 | 노트 | 상태 |
| --- | --- | --- | --- | --- |
| P1-4 | E2E (Playwright) | 최소 시나리오: 로그인(OAuth 모킹)·위젯 CRUD·캘린더 consent·logout | (내부) | 예정 |
| P1-5 | API 계약 문서화 | `/api/*` 고정(OpenAPI 또는 동등), breaking = MAJOR. README 표와 동기화 | (내부) | 예정 |
| D-3 | Known limitations | OAuth·테스트 범위·콜드스타트·쿠키·TiDB·태블릿 1열·캘린더 고밀도·단일 인스턴스 캐시/락. 마케팅 1.0 ≠ SemVer 1.0. Weather/R2를 풀 SLA로 쓸지 문서에 명시 | (내부) | 예정 |
| P1-14 | Frontend 커버리지 바닥선 | CI coverage threshold(또는 핵심 util 필수 통과). **P1-16(FE CI test) 완료** | (내부) | 예정 |
| P0-1 | (§2.1과 동일) | 1.0 전 검수 권장 · 상세는 §2.1 | 보통 미기재 또는 Changed 한 줄 | 예정 |

1.0 **전** 제품: v0.3.7(P2-37) · v0.3.6(P2-36) · v0.3.5(P2-35) · v0.3.4(P2-33·25·26·31·28·32·22) 완료 → [§4](#4-완료됨-버전별). 다음은 [v0.4.0](#24-목표-v040-minor--인프라관측). (P2-24는 v0.3.2 · P2-29는 v0.3.3)  
1.0 **이후** MINOR 후보: **반응형 잔여** P2-30 · P2-32(대안뷰·게스트) → 캘린더/할 일/i18n(P2-21·3·27 · P2-5) → 스케일(P3-3·9·P3-13) → [§3.2](#32-다듬음--10-이후-minor).

---

## 3. 백로그 (버전 미정)

인프라(0.4)·계약(1.0)과 같은 릴리즈에 넣지 않는다.  
새 기능은 **§3.1에 적고**, 다듬은 뒤 §3.2 → (하기로 정하면) §2로 올린다.

### 3.1 Inbox (새로 적은 것)

아직 버전·순위를 정하지 않은 아이디어. **최신 행을 표 맨 위에** 추가한다.  
다음 빈 P2 번호 참고: **P2-38**. (P1 다음 참고: **P1-19** · P3 다음 참고: **P3-14**)

| ID | 항목 | 내용 | 노트 | 상태 |
| --- | --- | --- | --- | --- |
| P2-34 | 할 일 행 칩 radius 통일 | `TaskRow` 우선순위 `Badge`(`rounded-4xl`)를 진행·마감 칩과 같이 `rounded-md`로. 다음 할 일 UI 작업 시 흡수 가능 | Changed | 예정 |

### 3.2 다듬음 · 1.0 이후 MINOR

범위·의존이 정리된 기능 고도화. (구 「보류」)  
P2-33·25·26·31·28·32(얇게)·22는 v0.3.4 코드 완료 → [§4](#4-완료됨-버전별). P2-24는 v0.3.2 · P2-29는 v0.3.3.  
권장 순서: **반응형 잔여** P2-30 → P2-32(대안뷰) → **캘린더** → **할 일(잔여)** → **i18n** → (스케일) P3-3·9·P3-13.

주제 묶음: **반응형 잔여** → **캘린더** → **할 일(잔여)** → **i18n** → **스케일**.

| ID | 항목 | 내용 | 노트 | 상태 |
| --- | --- | --- | --- | --- |
| P2-30 | 태블릿·모바일 셸 레이아웃 | 레이아웃 분기점이 `lg`(≈1024) 한곳뿐 → 768~1023은 폰 1열+긴 위젯 스크롤. (1) `md`~`lg` 중간 그리드(aside 축소 2단 또는 위젯 2열). (2) 모바일 위젯 IA: 메인 탭 우선, 날씨·핀·기념일·뽀모도로·필터는 접기/시트/별도 진입 중 택1. (3) 브레이크포인트 정책 문서화. 터치: `dashboard-chrome`·`calendar-dashboard` `order-*`. P2-4 잔여 · 햄버거 필수 아님. P2-22(v0.3.4) 배너 레이어와 맞춤 | Changed | 예정 |
| P2-32 | 모바일 캘린더 밀도·뷰 (잔여) | **v0.3.4에서 칩 overflow 얇게 선반영 후.** 남은 범위: 어젠다/리스트 대안 뷰, 게스트 미리보기(`SCALE=0.55`)를 실기기 스택과 분리. P2-30과 병행 가능 | Changed | 예정 |
| P2-21 | 캘린더 카테고리 그룹 UI | 평탄 목록 → 그룹(1차: 내 캘린더 / 공유·구독 / 공휴일). 그룹 펼침·접힘, 그룹 표시·숨김(소속 id를 `visibleCalendarIds` 일괄). 개별 체크·색상 유지. API `accessRole` 전달 필요. 2차(선택): 사용자 정의 그룹(localStorage→필요 시 DB). Google에 커스텀 그룹 API 없음 → 앱 측 정의. **이름순만은 P2-36(§2.2 v0.3.6). 폼 「일정 카테고리」 정리는 범위 밖 — P2-29(§4 v0.3.3) 완료** | Changed | 예정 |
| P2-3 | 캘린더·위젯 고도화 | 반복/필터/알림/검색 등. P2-21과 별도이나 같은 MINOR에 묶을 수 있음. **할 일 보드(P2-24~27)는 별도 — 이 항목 범위에서 제외** | Changed | 예정 |
| P2-27 | 할 일 카테고리 DnD | 드래그로 `categoryId` 변경. API는 기존 `PATCH`로 충분. (참고: v0.3.0 P2-2는 DnD **문서 정합**이었고 UI DnD는 미구현). 상태 칸반 DnD는 범위 밖이거나 2차로 명시. 선행: v0.3.4(P2-25·26) 이후 | Changed | 예정 |
| P2-5 | i18n | 한/영, 기존 설정 덮어쓰지 않음 | Changed | 예정 |
| P3-13 | Service 계층 추출 | fat controller → `service/` (user·calendar 우선). 동작 동일 리팩터. P3-9(락 DB화)·P3-3과 1.0 후 스케일 트랙에서 묶을 수 있음. **§2 스케줄 전** | Changed | 예정 |

---

## 4. 완료됨 (버전별)

### v0.2.0 — 2026-09-13

| ID | 항목 |
| --- | --- |
| P0-2 | 계정 탈퇴·데이터 삭제 |
| P0-3 | 사용자용 릴리즈 노트 제공 (`/changelog`) |
| P0-4 | 버전·태그·듀얼 레포 절차 확립 |
| P1-1 | Prisma Migrate (`0_init`) |
| — | WeatherAPI 전환(Open-Meteo → WeatherAPI.com) |
| D-2 | DB 절차 migrate로 문서 통일 |

### v0.2.1 — 2026-09-14 (Security / Fixed)

| ID | 항목 |
| --- | --- |
| P0-5 | 캘린더 OAuth `google_id` 바인딩 |
| P0-6 | OG fetch 응답 크기 상한 |
| P0-7 | 북마크 favicon/preview http(s) 검증 |
| P0-8 | `authFetch` 401 세션 과잉 클리어 수정 |
| P0-9 | 날씨 suggest cancel 레이스 수정 |

### v0.2.2 — 2026-09-15 (Changed / Fixed / Security)

| ID | 항목 |
| --- | --- |
| P1-7 | `calendarConnected` 캐시화 (`/me` Google 조회 제거) |
| P1-8 | 캘린더 write도 `NEEDS_CALENDAR_CONSENT` 통일 |
| P1-9 | Todo update·리소스 id 검증 (400) |
| P1-10 | prod CSRF (Origin 없는 쿠키 변이 차단) |
| P1-11 | 대시보드 위젯 단일 bootstrap |

### v0.2.3 — 2026-09-16 (Fixed / Security / 내부)

| ID | 항목 |
| --- | --- |
| P1-2 | 자동 테스트 (최소) |
| P1-3 | CI 파이프라인 |
| P3-8 | sequence·seed 레이스 |
| P3-6 | OG DNS rebinding 완화 |

### v0.2.4 — 2026-09-22 (Fixed / Security)

| ID | 항목 |
| --- | --- |
| P0-10 | OG SSRF IPv4-mapped |
| P0-11 | `authFetch` 쓰기 재시도 제한 |
| P0-12 | 캘린더 「숨김」이 휴일까지 함께 사라지던 문제 수정 |

### v0.3.0 — 2026-09-28 (Fixed / Changed / Performance)

| ID | 항목 |
| --- | --- |
| P2-12 | 캘린더 숨김·월 전환 |
| P2-1 | 에러 UX (Sonner·Confirm·인라인 재시도) |
| P2-9 | 핀 행 세로 여백 |
| P2-4 | 접근성·반응형 |
| P2-10 | 캘린더 저장 지연 (`calendarList.get` 생략) |
| P2-8 | 세션·fetch 안정화 |
| P2-11 | EventForm 폼·타입 토큰 |
| P2-6 | 보드 컴포넌트 분리 |
| P2-7 | 위젯 CRUD 헬퍼 |
| P2-2 / D-1 | 투두 DnD 문서 정합 |
| D-4 | DEPLOYMENT·Docker 문서 정합 |
| P1-6 (부분) | Refresh family 재사용 탐지 (`REFRESH_REUSE`) — ROADMAP에만 남아 있던 항목, 코드에 이미 반영됨. 남은 범위(access 무효화·blacklist) → §2.4 P1-6 |

### v0.3.1 — 2026-10-11 (Fixed / Security / Changed / Performance)

| ID | 항목 |
| --- | --- |
| P0-13 | 입력·ID 검증 통일 (BigInt, due, 길이 상한) |
| P0-14 | Cookie-only auth (Bearer 제거) |
| P2-23 | 대시보드 위젯 partial failure (`allSettled`) |
| P2-13 | Confirm pending (disable / `aria-busy`) |
| P2-14 | 캘린더·탭 키보드 접근성 |
| P2-15 | 홈 첫 paint (`dynamic` loading fallback) |
| P2-16 | Banner cropper lazy |
| P1-12 | API smoke 확장 (todos·bookmarks·anniversaries, date-key) |
| P1-13 | Frontend util Vitest (`api`·`url`·`todo-view`) |
| P2-17 | 보드/컨트롤러 추가 분리 (`calendar-event-helpers` 등) |
| P1-15 | Prisma `P1001`/`P1002` 짧은 재시도 |
| P2-18 | `images.unoptimized` 완화 + R2 `remotePatterns` |
| D-5 | README·CI 버전/브랜치 정합 (`0.3.0`/`0.3.1`, CI `main` only) |

### v0.3.2 — 2026-10-28 (Fixed / Changed)

| ID | 항목 |
| --- | --- |
| P2-24 | 할 일 「오늘」 포커스 규칙 (진행 중·마감 없음 포함, 상단 카운트·뷰 정합) |

### v0.3.3 — 2026-10-28 (Changed)

| ID | 항목 |
| --- | --- |
| P2-29 | 일정 폼 카테고리 중복 제거 (캘린더 선택·`calendarColor`만; `appCategory` 쓰기 중단) |

### 내부 (0.3.3 시점, bump 없음) — 2026-10-28

| ID | 항목 |
| --- | --- |
| D-5 | 문서 버전 동기화 (README·`package.json` **0.3.3**, `/refresh` cookie-only 정합) |
| D-6 | `DEPLOYMENT`·`ROADMAP`·`프로젝트 설명` → FE 레포 canonical (루트는 포인터) |

### v0.3.4 — 2026-11-01 (Fixed / Changed)


| ID | 항목 |
| --- | --- |
| P2-33 | 위젯 로드 401 오탐 토스트 억제 (`AbortError` wake 제외) |
| P2-25 | 할 일 마감일 빠른 칩 (없음 / 오늘 / 내일 / 이번 주말) |
| P2-26 | 할 일 보기 분리 (오늘·지연·미래·마감 없음·완료·전체, 상단 카운트 연결) |
| P2-31 | 터치 타겟·호버 액션 (raw button 44×44 · `max-sm:opacity-100`) |
| P2-28 | 할 일 행 진행·마감 칩 언어 통일 |
| P2-32 | 모바일 월 캘린더 칩 overflow 얇게 (「N개 더」→ 일 다이얼로그) |
| P2-22 | 배너 이미지 수면 반사 (테마색만 있을 때 기존 gradient 유지) |

### 내부 (0.3.4 시점, bump 없음) — 2026-11-01

| ID | 항목 |
| --- | --- |
| P1-16 | Frontend CI에 Vitest (`npm test`) |

### v0.3.5 — 2026-11-04 (Fixed / Changed)

| ID | 항목 |
| --- | --- |
| P2-35 | Google 캘린더 외부 삭제 반영 (범위 교체, soft revalidate, `fresh=1`, 수동 새로고침) |

### v0.3.6 — 2026-11-04 (Changed)

| ID | 항목 |
| --- | --- |
| P2-36 | 캘린더 카테고리 이름순 (공휴일 상단 + `localeCompare("ko")`) |

### v0.3.7 — 2026-11-04 (Added / Changed)

| ID | 항목 |
| --- | --- |
| P2-37 | 릴리즈 노트 뱃지·종류 필터 (`sections` 자동, OR 필터, added/changed 소급 재분류) |

---

## 5. 완료·승격 시 기록

1. **완료:** 「§4 완료됨」표로 옮기고 날짜·버전을 적는다. §2 또는 §3에서 해당 행을 삭제한다.  
2. 사용자 노출 변경은 [CHANGELOG.md](./CHANGELOG.md) · `content/changelog.ts`에 맞춘다.  
3. **Inbox → §3.2:** 내용·노트를 채운 뒤 이동한다 (버전은 아직 붙이지 않음).  
4. **백로그(§3) → §2:** 목표 버전·순위(필요 시)를 정한 뒤에만 옮긴다.
