# Nemo Calendar — Frontend

Google 계정으로 로그인하고, Google Calendar·투두·핀보드·북마크·기념일·뽀모도로·날씨를 한 화면에서 관리하는 **Next.js 프론트엔드**입니다.

백엔드는 형제 폴더 [`../backend`](../backend) (Express, 포트 5000)입니다.

## 기술 스택

- Next.js 16, React 19, TypeScript
- Tailwind CSS 4, shadcn/ui (Base UI)
- `@react-oauth/google` — Google 로그인 / 캘린더 권한

## 필요 환경

| 항목 | 요구사항 |
| --- | --- |
| Node.js | 20.9 이상 (Next.js 16) |
| npm / pnpm | 패키지 설치용 |
| 백엔드 API | Next.js rewrite (`/api/*` → `localhost:5000`) |
| Google OAuth 클라이언트 | JS origin에 `http://localhost:3000` 등록 |

> 이 폴더는 Python 프로젝트가 아닙니다. `requirements.txt`는 Node.js 버전 안내용입니다.

## 환경 변수

`frontend/.env.local` 을 만들고 아래를 채웁니다.

```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
```

로컬 개발에서는 `NEXT_PUBLIC_API_URL`을 **설정하지 않습니다**. `next.config.mjs`의 rewrite가 `/api/*` 요청을 백엔드(`localhost:5000`)로 프록시합니다.

백엔드 환경 변수는 [`../backend/.env.example`](../backend/.env.example)을 참고하세요.

## 설치 및 실행

### Backend (`http://localhost:5000`)

```bash
cd ../backend
npm install
npx prisma generate
npx prisma db push
npm run dev
```

### Frontend (`http://localhost:3000`)

```bash
cd frontend
npm install
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 을 엽니다.

## 스크립트

- `npm run dev` — 개발 서버
- `npm run build` / `npm start` — 프로덕션 빌드·실행
- `npm run lint` — ESLint (`eslint.config.mjs`, `eslint-config-next`)

## 인증

1. Google 로그인 → `POST /api/user/google-login`
2. JWT(`accessToken`, `refreshToken`)는 **httpOnly 쿠키**로 저장됩니다.
3. `localStorage`에는 `user` 프로필만 저장합니다.
4. API 호출은 `credentials: "include"` (`lib/api.ts`의 `authFetch` / `authJson`).
5. 401 응답 시 `POST /api/user/refresh`로 쿠키 갱신 후 재시도합니다.
6. 로그아웃 → `POST /api/user/logout` (쿠키 삭제).

## 프론트가 호출하는 API

인증 API는 쿠키 기반입니다. 아래 경로는 모두 same-origin(`/api/...`)으로 호출합니다.

| Method | Path | 설명 |
| --- | --- | --- |
| POST | `/api/user/google-login` | Google 로그인 (auth code) |
| POST | `/api/user/refresh` | JWT 쿠키 갱신 |
| POST | `/api/user/logout` | 로그아웃 (쿠키 삭제) |
| GET | `/api/user/me` | 현재 사용자 |
| POST | `/api/user/connect-calendar` | Google Calendar 권한 연결 |
| POST | `/api/user/disconnect-calendar` | Google Calendar 연결 해제 |
| PATCH | `/api/user/location` | 날씨 위치 저장 |
| GET/POST/PATCH/DELETE | `/api/calendar/events` | 일정 CRUD |
| GET | `/api/calendar/calendars` | 캘린더 목록 |
| GET/POST/PATCH/DELETE | `/api/pins` | 핀보드 |
| GET/POST/PATCH/DELETE | `/api/todos` | 할 일 |
| GET/POST/PATCH/DELETE | `/api/todo-categories` | 할 일 카테고리 |
| GET/POST/PATCH/DELETE | `/api/bookmarks` | 북마크 |
| GET/POST/PATCH/DELETE | `/api/bookmark-folders` | 북마크 폴더 |
| GET/POST/PATCH/DELETE | `/api/anniversaries` | 기념일 |
| GET | `/api/weather` | 날씨 조회 |
| GET | `/api/weather/suggest` | 지역 검색 |

자세한 API는 [backend/README.md](../backend/README.md)를 참고하세요.
