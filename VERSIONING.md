# Versioning & Release Tags

Nemo Calendar는 **앱 단위 단일 버전**과 **Practical App SemVer**를 사용합니다.
프론트엔드와 백엔드는 항상 같은 `MAJOR.MINOR.PATCH`를 공유합니다.

관련 문서: [CHANGELOG.md](./CHANGELOG.md)

## 문서 위치 (canonical)

| 문서 | 위치 |
| --- | --- |
| Changelog · Versioning | **이 레포** (`nemocalendar-frontend`) 루트 |
| 사용자용 릴리즈 노트 | `content/changelog.ts` → Vercel `/changelog` |
| Backend 안내 | `nemocalendar-api`의 [RELEASE.md](https://github.com/sonhyo0518/nemocalendar-api/blob/main/RELEASE.md) (이 문서로의 링크) |

로컬 워크스페이스(`nemoCalendar2/`)에서는 `frontend/CHANGELOG.md`, `frontend/VERSIONING.md`가 원본입니다.
루트에 있는 동명 파일은 포인터만 둡니다. 내용을 편집할 때는 **여기(frontend)** 만 수정하세요.

## SemVer

형식: `MAJOR.MINOR.PATCH` (예: `1.4.2`)

| 자리 | 언제 올리는가 | 예 |
| --- | --- | --- |
| **MAJOR** | 하위 호환이 깨짐 — 재로그인, API shape 변경, 데이터 이전, 강제 재연동 | JWT/쿠키 형식 변경, events API 구형식 제거 |
| **MINOR** | 호환 유지 + 기능 추가 — 선택 필드·새 UI·새 옵션 | 북마크 폴더 색, 투두 optional 필드 |
| **PATCH** | 호환 유지 + 버그/보안/성능 — 계약 동일 | 정렬 버그, 보안 CVE, 쿼리 최적화 |

한 릴리즈에 여러 종류가 섞이면 **가장 높은 자리만** 올립니다. (breaking + feat + fix → MAJOR)

`0.y.z`는 초기 구간으로, API·스키마가 아직 고정되지 않았음을 뜻합니다. 안정화 후 `1.0.0`을 선언합니다.

## 버전 파일

릴리즈 시 아래를 **동일한** `X.Y.Z`로 맞춥니다.

- 이 레포 `package.json` → `"version"` (및 `package-lock.json` 루트 version)
- API 레포(`nemocalendar-api`) `package.json` → `"version"` (및 lock 루트 version)
- `CHANGELOG.md` → `## [X.Y.Z] - YYYY-MM-DD` 섹션
- `content/changelog.ts` → 사용자용 릴리즈 노트 (`/changelog`, Unreleased 제외)

## Git 태그 규칙

| 항목 | 규칙 |
| --- | --- |
| 형식 | `v` + SemVer (`v0.1.0`, `v1.2.3`) |
| 종류 | **annotated tag**만 사용 (`-a`) |
| 대상 | 릴리즈 커밋 (CHANGELOG·version bump가 포함된 커밋) |
| 메시지 | `Release vX.Y.Z` |
| 사전 릴리즈 | `v1.1.0-alpha.1`, `v1.1.0-beta.1`, `v1.1.0-rc.1` |
| 금지 | `0.1.0`(v 없음), `ver-1.0`, `release-1`, 동일 버전의 중복 태그 |

### 태그 생성 (frontend 레포)

```bash
# 1) CHANGELOG.md의 Unreleased → [X.Y.Z]로 이동, package.json·changelog.ts 동기화 후 커밋
git add CHANGELOG.md package.json package-lock.json content/changelog.ts
git commit -m "chore(release): vX.Y.Z"

# 2) annotated tag
git tag -a "vX.Y.Z" -m "Release vX.Y.Z"

# 3) 원격 반영
git push origin HEAD
git push origin "vX.Y.Z"
```

### 태그 생성 (api 레포)

```bash
# frontend와 같은 X.Y.Z로 package.json·lock만 맞춘 뒤
git add package.json package-lock.json
git commit -m "chore(release): vX.Y.Z"
git tag -a "vX.Y.Z" -m "Release vX.Y.Z"
git push origin HEAD
git push origin "vX.Y.Z"
```

CHANGELOG·`changelog.ts`는 api 레포에 두지 않습니다. canonical은 frontend입니다.

## 듀얼 레포 릴리즈 절차

앱 버전은 `nemocalendar-frontend`와 `nemocalendar-api`가 **항상 동일**한 `X.Y.Z`입니다.
태그는 각 레포에 **같은 이름**의 annotated tag `vX.Y.Z`를 답니다. (커밋 해시는 레포마다 다름 — 정상)

### 권장 순서

1. **frontend**에서 릴리즈 내용 확정
   - `CHANGELOG.md`: `[Unreleased]` → `## [X.Y.Z] - YYYY-MM-DD`
   - `package.json` / `package-lock.json` 루트 `"version"`
   - `content/changelog.ts` (사용자용 `/changelog`, Unreleased 제외)
   - `chore(release): vX.Y.Z` 커밋 → annotated tag → `git push origin HEAD` 및 `git push origin "vX.Y.Z"`
2. **api**에서 버전만 맞춤
   - `package.json` / `package-lock.json` 루트 `"version"`을 **같은** `X.Y.Z`
   - `chore(release): vX.Y.Z` 커밋 → 동일 형식 annotated tag → push
3. **배포 확인**
   - Vercel(frontend) · Render(api)가 해당 커밋/태그와 대응하는지 확인

### 동기화 확인

```bash
# 각 레포에서
node -p "require('./package.json').version"
git show "vX.Y.Z" --no-patch
git ls-remote --tags origin "vX.Y.Z"
```

두 레포의 `package.json` version 문자열과 태그 이름·메시지(`Release vX.Y.Z`)가 같으면 동기화된 것입니다.

### 태그 확인·삭제 (실수 시, 아직 push 전)

```bash
git tag -l "v*"
git show "vX.Y.Z"
git tag -d "vX.Y.Z"
```

이미 원격에 push한 태그를 고치는 것은 피합니다. 잘못된 릴리즈는 다음 PATCH/MINOR로 정정합니다.

## 릴리즈 체크리스트

1. `CHANGELOG.md`의 `[Unreleased]`를 정리하고 빈 섹션 헤더는 삭제한다.
2. Breaking이 있으면 해당 항목 앞에 **Breaking**을 붙이고 MAJOR로 bump한다.
3. **frontend 먼저** version·CHANGELOG·`changelog.ts`·tag를 맞춘다.
4. **api**에서 동일 `X.Y.Z`로 `package.json`(및 lock)과 annotated tag를 맞춘다.
5. 날짜는 **배포일** 기준 `YYYY-MM-DD` (로컬은 UTC+9).
6. 각 레포에서 `chore(release): vX.Y.Z` 커밋 후 `vX.Y.Z` annotated tag를 단다.
7. Vercel(프론트)·Render(API) 배포가 해당 커밋/태그와 대응하는지 확인한다.
8. (선택) GitHub Release를 만들고 CHANGELOG 해당 섹션을 본문에 붙인다.

상세 순서는 위 **듀얼 레포 릴리즈 절차**를 따른다.

## CHANGELOG 카테고리

| 섹션 | 사용 |
| --- | --- |
| Added | 새 기능 |
| Changed | 기존 동작·UI 변경 (Breaking 포함 시 명시) |
| Deprecated | 곧 제거될 기능 |
| Removed | 제거된 기능 |
| Fixed | 버그 수정 |
| Security | 취약점·보안 관련 |

비어 있는 섹션은 해당 버전에서 삭제해도 됩니다. `[Unreleased]` 템플릿 섹션은 유지하는 것을 권장합니다.

## 커밋 메시지 (권장)

Conventional Commits를 권장합니다. CHANGELOG 초안을 고를 때 도움이 됩니다.

- `feat:` → 보통 MINOR
- `fix:` / `perf:` / `security:` → 보통 PATCH
- `feat!:` / `fix!:` 또는 footer `BREAKING CHANGE:` → MAJOR
- `chore(release):` → 버전 bump 전용
