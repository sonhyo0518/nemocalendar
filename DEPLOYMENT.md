# Nemo Calendar 배포 가이드

이 문서는 **현재 프로덕션 구성**, 선택 이유, 환경 변수·체크리스트를 정리한 것입니다.  
앱 버전·태그·CHANGELOG 절차는 [VERSIONING.md](./VERSIONING.md)가 정본입니다.

> **Canonical 위치:** 이 파일은 `nemocalendar` 레포 루트에 둡니다.
> 로컬 워크스페이스(`nemoCalendar2/`)의 루트 `DEPLOYMENT.md`는 여기로 가는 포인터입니다.

## 현재 배포 스택 (프로덕션)

| 구분 | 서비스 | URL / 비고 |
|------|--------|------------|
| Frontend | **Vercel** | https://nemocalendar.com |
| Backend | **Render** (Docker Web Service) | https://nemocalendar-api.onrender.com |
| 도메인 / DNS | **[HostingKR](https://app.hosting.kr/)** | `nemocalendar.com` 등록·네임서버 (앱 호스팅은 Vercel) |
| DB | **[TiDB Cloud](https://tidbcloud.com/)** Serverless Free Tier | MySQL 8 호환, Prisma 그대로 사용 |
| 스토리지 | **Cloudflare R2** | 배너 이미지 (`pub-….r2.dev` 또는 커스텀 공개 URL) |
| 인증 | Google OAuth + JWT | httpOnly 쿠키 (access 1h / refresh 7d) |

### GitHub 레포 ↔ 배포 Root

로컬 워크스페이스(`nemoCalendar2/`)는 형제 폴더로 붙여 두었고, **배포는 듀얼 레포**입니다.

| 역할 | GitHub | 로컬 폴더 | 플랫폼 Root |
|------|--------|-----------|-------------|
| Frontend | [sonhyo0518/nemocalendar](https://github.com/sonhyo0518/nemocalendar) | `frontend/` | Vercel → **`.`** (레포 루트 = Next 앱) |
| Backend / API | [sonhyo0518/nemocalendar-api](https://github.com/sonhyo0518/nemocalendar-api) | `backend/` | Render → **`.`** (레포 루트 = Express) |

```
[사용자]
    ↓ DNS (HostingKR → Vercel)
  Vercel (Next.js)  ·  https://nemocalendar.com
    ↓ HTTPS + credentials:include
  Render (Express, Docker)  ·  https://nemocalendar-api.onrender.com
    ↓              ↓
  TiDB Cloud    Cloudflare R2
  (MySQL 호환)   (배너 이미지)
    ↓
  Google Calendar / OAuth · WeatherAPI.com
```

프론트는 `NEXT_PUBLIC_API_URL`로 Render API를 **직접 호출**합니다.  
앱 런타임에 WebSocket·서버리스 함수·자체 크론 의존은 없습니다. (운영용 keep-alive는 GitHub Actions/UptimeRobot — 선택)

---

## 왜 이 스택인가?

프론트(CDN)·API(상시 Node)·DB·오브젝트·도메인을 **역할별로 분리**해 1인 운영 비용과 배포 독립성을 맞춘 구성입니다. 포트폴리오용 스택 선정 이유는 [프로젝트 설명.md](./프로젝트%20설명.md) 기술 스택 표도 참고하세요.

| 선택 | 이유 | 주요 대안 / 트레이드오프 |
|------|------|--------------------------|
| **Vercel** (프론트) | Next.js 16과 궁합이 가장 좋음. Git 연동·HTTPS·프리뷰 기본. 대시보드는 사실상 클라이언트 전용(`ssr: false`)이라 서버리스 한계에 덜 걸림. `@vercel/analytics` 사용 | Cloudflare Pages — Next 16 추가 설정 부담 |
| **Render Docker** (API) | Express는 쿠키·장시간 프록시가 있어 **항상 켜진 Node 프로세스**가 필요. Docker multi-stage로 Prisma 바이너리·openssl(TiDB SSL)을 재현 가능하게 묶음. 무료로 시작 가능 | OCI VM — always-on에 가깝지만 Nginx/SSL/패치 직접 운영. Render 무료는 **슬립·콜드스타트** (keep-alive로 완화) |
| **TiDB Cloud** (DB) | Prisma `provider = "mysql"` **변경 없이** 클라우드화. API와 DB 수명주기 분리. Serverless Free Tier | Neon/Supabase — Postgres라 스키마 이전 필요. Render Postgres 무료 — 90일 후 삭제. idle 시 DB cold start·SSL·IP 전체 허용 필요 |
| **HostingKR** (도메인/DNS) | `nemocalendar.com` 등록·네임서버. **앱 호스팅은 Vercel** — DNS만 HostingKR ([콘솔](https://app.hosting.kr/)) | 도메인만 다른 레지스트라로 옮겨도 동일 패턴 |
| **Cloudflare R2** (배너) | S3 호환·이그레스 부담이 작아 사용자 업로드 배너에 적합. DB에는 공개 URL만 저장 | 프론트 `next/image`는 `NEXT_PUBLIC_R2_PUBLIC_BASE_URL`로 호스트 allowlist 필요 |
| **듀얼 GitHub 레포** | 배포 타깃이 다름(Vercel vs Render). Changelog·SemVer 정본은 프론트 (`VERSIONING.md`). API는 동일 `version`만 맞춤. 로컬은 형제 폴더로 DX 확보 | 모노레포 단일 배포는 플랫폼 Root 설정이 달라짐 |

대안 비교 표는 아래 [검토했던 다른 옵션](#검토했던-다른-옵션-참고)을 참고하세요.

---

## 현재 아키텍처 (코드 기준)

| 구분 | 기술 |
|------|------|
| Frontend | Next.js 16 (App Router), 사실상 클라이언트 전용 (`ssr: false`) |
| Backend | Express 5 API (stateless) |
| DB | MySQL 8 호환 + Prisma 6 (`provider = "mysql"`) |
| 스토리지 | Cloudflare R2 (배너 이미지, S3 호환 API) |
| 인증 | Google OAuth + JWT httpOnly 쿠키 |

로컬 개발 시 프론트 `/api/*`는 Next.js rewrite로 `localhost:5000`에 전달됩니다. 프로덕션에서는 rewrite를 쓰지 않고 Render URL로 직접 호출합니다.

---

## 환경 변수

### frontend (Vercel) — [nemocalendar](https://github.com/sonhyo0518/nemocalendar)

```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
NEXT_PUBLIC_API_URL="https://nemocalendar-api.onrender.com"

# next/image remotePatterns용 — 백엔드 R2_PUBLIC_BASE_URL과 동일 origin
# 예: https://pub-xxxxxxxx.r2.dev
NEXT_PUBLIC_R2_PUBLIC_BASE_URL="https://pub-xxxxxxxx.r2.dev"
```

`NEXT_PUBLIC_*`는 **빌드 타임**에 주입됩니다. 변경 후 **Redeploy**가 필요합니다.  
`NEXT_PUBLIC_R2_PUBLIC_BASE_URL`이 없으면 `next.config.mjs`에 R2 호스트가 안 들어가 `/_next/image?url=…`가 **400**으로 실패하고 배너가 깨집니다.

로컬 `.env.local`에서는 `NEXT_PUBLIC_API_URL`을 생략해도 됩니다 (rewrite 사용). 배너를 로컬에서 `next/image`로 보려면 `NEXT_PUBLIC_R2_PUBLIC_BASE_URL`을 넣습니다.

### backend (Render) — [nemocalendar-api](https://github.com/sonhyo0518/nemocalendar-api)

```env
DATABASE_URL="mysql://USER:PASSWORD@gateway...tidbcloud.com:4000/nemocalendar?sslaccept=strict"

GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
GOOGLE_REDIRECT_URI="postmessage"

JWT_SECRET="..."
TOKEN_ENCRYPTION_KEY="..."   # 64자 hex (openssl rand -hex 32)

CORS_ORIGINS="https://nemocalendar.com"
APP_PUBLIC_URL="https://nemocalendar.com"
NODE_ENV="production"
PORT=5000

R2_ACCOUNT_ID="..."
R2_BUCKET_NAME="..."
R2_PUBLIC_BASE_URL="..."
R2_ACCESS_KEY_ID="..."
R2_SECRET_ACCESS_KEY="..."

# WeatherAPI.com (날씨 위젯)
WEATHER_API_KEY="..."
```

### Boot 필수 vs 선택

부팅 시(`assertRequiredEnv`) **없으면 프로세스 종료**:

| 필수 | 비고 |
|------|------|
| `DATABASE_URL` | TiDB: 포트 **4000**, `sslaccept=strict` |
| `JWT_SECRET` | |
| `TOKEN_ENCRYPTION_KEY` | **64자 hex**만 허용 |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` / `GOOGLE_REDIRECT_URI` | |
| `CORS_ORIGINS` | **프로덕션에서만** 필수 |

기동은 되지만 기능만 실패할 수 있는 **선택**:

| 선택 | 없으면 |
|------|--------|
| `R2_*` | 배너 업로드/삭제 실패 |
| `WEATHER_API_KEY` | 날씨 API 실패 |
| `APP_PUBLIC_URL` | OG 등에서 CORS 첫 origin으로 폴백 가능 |

---

## TiDB Cloud 설정

[TiDB Cloud](https://tidbcloud.com/)는 **MySQL 8 호환** 관리형 DB입니다. Prisma `provider = "mysql"`을 **변경하지 않고** 사용할 수 있습니다. (선택 이유는 [왜 이 스택인가?](#왜-이-스택인가) 참고)

### 1. 클러스터 생성

1. [TiDB Cloud](https://tidbcloud.com/) 가입 → **Serverless** 클러스터 생성
2. 리전 선택 (예: ap-northeast-1 — Tokyo)
3. **Connect** → Standard connection string 복사

### 2. DATABASE_URL 형식

```env
DATABASE_URL="mysql://USER:PASSWORD@gateway01...tidbcloud.com:4000/nemocalendar?sslaccept=strict"
```

| 항목 | 값 |
|------|-----|
| 포트 | **4000** (MySQL 3306 아님) |
| SSL | Public endpoint 사용 시 **`?sslaccept=strict` 필수** |
| DB 이름 | `nemocalendar` (콘솔에서 생성 후 `migrate deploy`로 스키마 반영) |

비밀번호에 `@`, `#` 등 특수문자가 있으면 **URL 인코딩**합니다.

### 3. IP Access

Render는 고정 IP가 없으므로 TiDB Cloud **Security → IP Access**에 **`0.0.0.0/0`** 을 추가합니다. (비밀번호·SSL로 보호)

로컬 PC에서 `prisma migrate`를 실행할 때는 본인 IP도 허용해야 합니다.

### 4. 스키마 반영 (Prisma Migrate)

스키마 변경은 `prisma/migrations/`에 SQL을 남기고, 공유·프로덕션 DB에는 `migrate deploy`로만 반영합니다.

로컬 `backend/.env`에 TiDB `DATABASE_URL`을 넣은 뒤:

```bash
cd backend
npx prisma generate
npm run db:migrate          # prisma migrate deploy — pending 적용
# 스키마를 바꿀 때(로컬):
# npm run db:migrate:dev -- --name <설명>
```

이미 테이블이 있는 DB에 처음 baseline만 맞출 때는 SQL을 다시 돌리지 않고 `npx prisma migrate resolve --applied <name>`을 사용합니다.

Render 빌드 단계에서는 `npx prisma generate`만 실행하고, **migration 적용은 로컬(또는 release 전 수동)에서** 수행하는 것을 권장합니다. Dockerfile에 `migrate deploy`를 넣지 않은 상태입니다.

### 5. 운영 시 주의

| 주의 | 설명 |
|------|------|
| Cold start | Serverless idle 후 첫 쿼리 지연 가능 |
| 무료 한도 | 저장·RCU/WCU 한도 내 사용 (플랜별 상이) |
| SSL 필수 | Public endpoint는 `sslaccept=strict` |

---

## Render (Backend)

| 항목 | 값 |
|------|-----|
| GitHub | [nemocalendar-api](https://github.com/sonhyo0518/nemocalendar-api) |
| Language | **Docker** |
| Root directory | **`.`** (API 레포 루트) |
| Dockerfile | `Dockerfile` (multi-stage, 로컬 워크스페이스 기준 `backend/Dockerfile`) |
| Build | Dockerfile 내 `prisma generate` + `tsc` |
| Start | `node dist/index.js` |
| Health | `GET /health` → `{ ok: true, db: true }` / DB 실패 시 `503` `{ ok: false, db: false }` |

### Render 환경 변수

위 [backend (Render)](#backend-render--nemocalendar-api) 섹션 참고.

### Docker 빌드 참고

- 프로덕션은 플랫폼 env 주입. `dotenv`는 개발(`NODE_ENV !== production`)에서만 로드하며 **devDependencies** (`omit=dev`와 일치)
- multi-stage: builder에서 `prisma generate` + `tsc`, runner는 `node dist/index.js`
- **migration은 이미지 밖**에서 `npm run db:migrate` — Dockerfile에 넣지 않음
- `openssl`, `ca-certificates` — TiDB SSL 연결용
- Native Node(비 Docker) 배포도 가능하나, 현재 프로덕션은 Docker multi-stage 기준

### Render 무료 플랜 · keep-alive

- 15분 무활동 시 **슬립** → 콜드스타트 30~60초
- **Keep-alive (임시):** UptimeRobot 또는 GitHub Actions로 `GET /health`를 **5분** 간격 ping
  - 기본 URL: `https://nemocalendar-api.onrender.com/health`
  - `/health`는 DB `SELECT 1`로 TiDB까지 워밍
  - 워크플로: API 레포 `.github/workflows/keep-alive.yml` (로컬: `backend/.github/workflows/keep-alive.yml`)
  - URL 오버라이드: repo Actions variable `API_HEALTH_URL`

---

## Vercel (Frontend)

| 항목 | 값 |
|------|-----|
| GitHub | [nemocalendar](https://github.com/sonhyo0518/nemocalendar) |
| Root directory | **`.`** (프론트 레포 루트) |
| Build command | `npm run build` |
| Install | `npm ci` |
| Analytics | 프로덕션에서 `@vercel/analytics` 자동 |

### Vercel 환경 변수

`NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_GOOGLE_CLIENT_ID`, `NEXT_PUBLIC_R2_PUBLIC_BASE_URL` — Production 필수에 가깝고, Preview에도 동일하게 두는 것을 권장합니다.

**Preview 주의:** Preview URL(`*.vercel.app`)로 로그인·쿠키를 테스트하려면 Render `CORS_ORIGINS`에 해당 origin을 추가해야 합니다. 추가하지 않으면 Production(`https://nemocalendar.com`)만 쿠키 인증이 됩니다.

---

## 도메인 / DNS (HostingKR)

커스텀 도메인 `nemocalendar.com`은 **[HostingKR](https://app.hosting.kr/)**에서 등록·DNS를 관리합니다. 프론트 앱 자체는 Vercel에 배포합니다.

| 항목 | 설정 |
|------|------|
| 등록·콘솔 | [app.hosting.kr](https://app.hosting.kr/) |
| Apex / www | Vercel 프로젝트에 도메인 연결 후, HostingKR DNS를 Vercel이 안내하는 레코드(또는 네임서버)에 맞춤 |
| Canonical | 브라우저가 쓰는 origin 하나를 정한다 (권장: `https://nemocalendar.com`). `www`를 쓰면 CORS·OAuth·`APP_PUBLIC_URL`도 **같은 문자열**로 |
| API | API 호스트는 Render(`*.onrender.com`) — 커스텀 API 도메인을 쓰지 않으면 HostingKR에 API 레코드 불필요 |

DNS만 HostingKR, 빌드·CDN·TLS는 Vercel이라는 역할 분리를 유지합니다.

---

## Cloudflare R2 (배너)

1. Cloudflare → R2 → 버킷 생성
2. **Public access** 활성화 → Public Bucket URL 확인 (`https://pub-….r2.dev` 또는 커스텀)
3. API 토큰 발급 → Render에 `R2_ACCOUNT_ID`, `R2_BUCKET_NAME`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_PUBLIC_BASE_URL` 설정
4. Vercel에 `NEXT_PUBLIC_R2_PUBLIC_BASE_URL` = **`R2_PUBLIC_BASE_URL`과 동일 origin** → **Redeploy**
5. 스모크: 배너 업로드 후 Network에서 `/_next/image?url=…`가 **400이 아닌지** 확인

DB `users.banner_img_url`에는 공개 URL 문자열이 저장됩니다. 설정 미리보기의 raw `<img>`는 보이는데 홈 배너만 깨지면 대개 4번(프론트 remotePatterns) 누락입니다.

---

## 크로스 도메인 (Vercel ↔ Render)

프론트(`nemocalendar.com`)와 API(`nemocalendar-api.onrender.com`)는 **도메인이 다릅니다.**

| 항목 | 설정 |
|------|------|
| CORS | Render `CORS_ORIGINS` = 브라우저 canonical (예: `https://nemocalendar.com`). 쉼표로 여러 origin 가능 |
| 쿠키 | `httpOnly` + `Secure` + `SameSite=None` |
| accessToken | `path=/`, maxAge 1h |
| refreshToken | `path=/api/user` (logout·refresh), maxAge 7d |
| CSRF | Origin 가드 — 쿠키가 있는 변이 요청에서 Origin이 허용 목록과 다르거나 없으면 `403 CSRF blocked` |
| trust proxy | `1` (Render 앞 프록시) |
| API 호출 | `credentials: include` |
| Google OAuth | `GOOGLE_REDIRECT_URI=postmessage` |

`www`와 apex를 섞으면 Set-Cookie는 되어도 CORS·Origin 검사에서 막힐 수 있습니다. HostingKR·Vercel·Google JS origins·`CORS_ORIGINS`·`APP_PUBLIC_URL`을 **한 canonical**로 맞추세요.

---

## Google OAuth

- **Authorized JavaScript origins:** `https://nemocalendar.com`, `http://localhost:3000` (전환기에는 `https://nemocalendar.vercel.app`도 유지 가능)
- **OAuth consent screen:** 프로덕션 게시 + [개인정보처리방침](https://nemocalendar.com/privacy)
- Calendar scope 사용 시 Google **앱 검수** 필요할 수 있음 (미검수 시 「확인하지 않은 앱」 경고)

---

## 배포 체크리스트

### TiDB Cloud

- [ ] Serverless 클러스터 생성
- [ ] `DATABASE_URL` (`?sslaccept=strict`, 포트 4000) Render·로컬 `.env`에 설정
- [ ] IP Access: `0.0.0.0/0` (Render) + 로컬 IP
- [ ] `npm run db:migrate`(`migrate deploy`)로 스키마 반영

### Render ([nemocalendar-api](https://github.com/sonhyo0518/nemocalendar-api))

- [ ] Docker Web Service, Root **`.`**
- [ ] Boot 필수 env: `DATABASE_URL`, `GOOGLE_*`, `JWT_SECRET`, `TOKEN_ENCRYPTION_KEY`, `CORS_ORIGINS`, `NODE_ENV=production`
- [ ] 기능 env: `APP_PUBLIC_URL`, `R2_*`, `WEATHER_API_KEY`
- [ ] `GOOGLE_REDIRECT_URI=postmessage`
- [ ] `GET /health` → `{ ok: true, db: true }`
- [ ] UptimeRobot 또는 Actions: `/health` 5분 ping

### Vercel ([nemocalendar](https://github.com/sonhyo0518/nemocalendar))

- [ ] Root **`.`**, `npm ci` / `npm run build`
- [ ] `NEXT_PUBLIC_API_URL` = Render URL
- [ ] `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
- [ ] `NEXT_PUBLIC_R2_PUBLIC_BASE_URL` = 백엔드 `R2_PUBLIC_BASE_URL`과 동일 origin
- [ ] env 변경 후 **Redeploy**
- [ ] 배너: Network에서 `/_next/image?url=…`가 400이 아닌지 확인

### HostingKR (도메인)

- [ ] `nemocalendar.com` DNS가 Vercel 연결 안내에 맞는지 확인 ([콘솔](https://app.hosting.kr/))
- [ ] Canonical origin이 CORS·OAuth·`APP_PUBLIC_URL`과 동일한지 확인

### Google Cloud

- [ ] JS origins에 canonical (`https://nemocalendar.com`) + 로컬
- [ ] OAuth 프로덕션 게시
- [ ] Privacy policy URL 등록

### 스모크 테스트

- [ ] Google 로그인 / 로그아웃 / 새로고침 세션 유지
- [ ] 캘린더·투두·북마크 CRUD
- [ ] 배너 업로드·표시 (R2 + `next/image`)
- [ ] Network: API 요청이 Render URL로 가는지 확인

### 릴리즈 (버전)

- [ ] 프론트·API `package.json` 버전 동일 + CHANGELOG — [VERSIONING.md](./VERSIONING.md)

---

## 검토했던 다른 옵션 (참고)

[왜 이 스택인가?](#왜-이-스택인가)의 대안 상세입니다.

### Frontend: Vercel vs Cloudflare Pages

| | Vercel | Cloudflare Pages |
|--|--------|------------------|
| Next.js 16 호환 | 최적 | 추가 설정 필요할 수 있음 |
| **현재 선택** | **Vercel** | — |

### Backend: Render vs OCI VM

| | Render | Oracle Cloud (OCI) |
|--|--------|---------------------|
| 설정 난이도 | 쉬움 (Docker) | 어려움 (VM 직접 관리) |
| 무료 티어 | 슬립·콜드스타트 | Always Free, 항상 켜짐 |
| **현재 선택** | **Render** | — |

### DB: TiDB Cloud vs 기타

**중요:** Supabase/Neon은 **PostgreSQL**입니다. Prisma `provider` 변경·스키마 마이그레이션이 필요합니다.

| DB | MySQL 호환 | 코드 변경 | 비고 |
|----|------------|-----------|------|
| **TiDB Cloud** (현재) | ✅ | **없음** | Serverless Free Tier |
| OCI VM MySQL | ✅ | 없음 | VM 직접 운영 |
| Neon / Supabase | ❌ (Postgres) | 필요 | pause/sleep 주의 |
| Render Postgres 무료 | ❌ | 필요 | **90일 후 삭제 — 비추천** |

### OCI VM + MySQL (대안 스택)

백엔드·DB를 한 VM에서 운영하면 슬립 없이 0원 운영에 가깝지만, Nginx·SSL·MySQL 설치·패치를 직접 해야 합니다. 1인 운영 부담을 줄이려고 현재는 Render + TiDB를 유지합니다.

---

## Postgres 마이그레이션 (Neon/Supabase 선택 시만)

TiDB Cloud를 쓰는 **현재 스택에서는 불필요**합니다. Postgres로 옮길 때만:

1. Prisma `provider`를 `postgresql`로 변경
2. `DATABASE_URL` 교체
3. MySQL 전용 타입 정리 (`@db.DateTime(0)`, `dbgenerated("(curdate())")` 등)
4. `npx prisma migrate dev`로 migration 생성 후 `migrate deploy`

---

## 피할 것

- **Render PostgreSQL 무료**: 90일 후 DB 삭제
- **Supabase 무료 pause 미대비**: 7일 미사용 시 프로젝트 중지
- **Vercel `/api` rewrite에만 의존**: 프로덕션은 `NEXT_PUBLIC_API_URL` 필수
- **`NEXT_PUBLIC_R2_PUBLIC_BASE_URL` 없이 `next/image` 배너**: `/_next/image` 400, 깨진 이미지 아이콘
- **TiDB 3306 포트 가정**: TiDB Cloud public endpoint는 **4000**
- **CORS / SameSite / www·apex 불일치**: Vercel↔Render 크로스 도메인에서 로그인·쿠키 실패
- **모노레포 Root를 듀얼 레포에 그대로 적용**: Vercel/Render Root는 각 레포에서 **`.`**

---

## 참고: 날씨 API

- Upstream: [WeatherAPI.com](https://www.weatherapi.com/) (`WEATHER_API_KEY` 필수에 가깝음 — 없으면 날씨 위젯 실패)
- `backend/src/controller/weather.controller.ts`의 in-memory `Map` 캐시(fresh 2h / stale 24h)는 서버 재시작 시 초기화됩니다. Render 단일 인스턴스에서는 문제 없습니다.

---

## 참고 링크

- Frontend: [sonhyo0518/nemocalendar](https://github.com/sonhyo0518/nemocalendar)
- Backend: [sonhyo0518/nemocalendar-api](https://github.com/sonhyo0518/nemocalendar-api)
- 버전·릴리즈: [VERSIONING.md](./VERSIONING.md)
- 도메인: [HostingKR](https://app.hosting.kr/)
- [TiDB Cloud](https://tidbcloud.com/)
- [TiDB Cloud + Prisma (Node.js)](https://docs.pingcap.com/tidbcloud/dev-guide-sample-application-nodejs-prisma/)
- [Vercel Documentation](https://vercel.com/docs)
- [Render Documentation](https://render.com/docs)
- [Cloudflare R2](https://developers.cloudflare.com/r2/)
