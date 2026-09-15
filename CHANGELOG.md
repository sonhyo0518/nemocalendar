# Changelog

이 프로젝트의 모든 주목할 만한 변경 사항을 기록합니다.

형식은 [Keep a Changelog](https://keepachangelog.com/ko/1.1.0/)를 따르고,
버전은 [Semantic Versioning](https://semver.org/lang/ko/)과 [VERSIONING.md](./VERSIONING.md) 규칙을 따릅니다.

> **Canonical 위치:** 이 파일은 `nemocalendar-frontend` 레포 루트에 둡니다.
> 로컬 워크스페이스(`nemoCalendar2/`)의 루트 `CHANGELOG.md`는 여기로 가는 포인터입니다.

## [Unreleased]

### Added

### Changed
- 게스트 랜딩·개인정보처리방침에 앱 기능과 Google 데이터 이용 목적 안내를 보강하고, 개인정보처리방침·릴리즈 노트 하단에 메인 링크를 추가

### Deprecated

### Removed

### Fixed

### Security

<!--
릴리즈 시:
1. Unreleased 항목을 새 버전 섹션으로 옮긴다.
2. 날짜는 YYYY-MM-DD (UTC+9 기준 배포일 권장).
3. Breaking 변경은 Changed/Removed 상단에 **Breaking**으로 명시한다.
4. git 태그 `vX.Y.Z`를 만든다. (VERSIONING.md 참고)
-->
## [0.2.2] - 2026-09-15

### Changed

- `/me`·로그인에서 캘린더 연결 여부를 Google 실시간 조회 없이 판단
- 캘린더 미연결 시 일정 생성·수정·삭제도 `403` + `NEEDS_CALENDAR_CONSENT`로 통일
- 대시보드 위젯 초기 로딩을 단일 bootstrap으로 통합

### Fixed

- 투두 수정 시 잘못된 priority·빈 제목 검증
- 잘못된 리소스 id가 500 대신 400으로 응답

### Security

- 프로덕션에서 Origin/Referer 없는 쿠키 기반 변이 요청 CSRF 차단

## [0.2.1] - 2026-09-14

### Security

- Google 캘린더 연결 시 로그인 계정과 동일한 Google 계정인지 검증
- 북마크 OG HTML 응답 크기 상한 및 favicon/preview URL http(s) 검증

### Fixed

- 비인증 API 401 응답으로 로컬 세션이 지워지던 문제
- 날씨 지역 검색 자동완성 레이스(이전 응답이 덮어쓰던 문제)
- 북마크 열기·미리보기에서 안전하지 않은 URL 차단

## [0.2.0] - 2026-09-13

### Added

- 사이트 푸터와 `/changelog` 페이지에서 사용자용 릴리즈 노트 제공
- 계정 메뉴에서 계정 삭제(탈퇴): 서비스 데이터·배너·캘린더 연동 토큰 제거

### Changed

- 날씨 upstream을 Open-Meteo에서 WeatherAPI.com(`WEATHER_API_KEY`)으로 교체

### Fixed

- 호스팅(Render 공유 IP)에서 Open-Meteo 한도로 날씨 조회가 실패하던 문제

## [0.1.0] - 2026-09-10

초기 버전 관리·릴리즈 노트 체계를 도입한 기준점입니다.
이 시점의 제품 기능 요약은 [README.md](./README.md)를 참고하세요.

### Added

- Google OAuth 로그인 및 Google Calendar 연동
- 칸반형 투두, 핀 메모, 북마크·폴더, 기념일/D-Day
- 헤더 배너·테마 색상 (Cloudflare R2)
- 날씨 위젯, 뽀모도로 타이머
- Keep a Changelog 형식의 `CHANGELOG.md` 및 태그 규칙 (`VERSIONING.md`)
