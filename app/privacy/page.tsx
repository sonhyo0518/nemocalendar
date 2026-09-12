import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "개인정보처리방침 | Nemo Calendar",
  description: "Nemo Calendar 개인정보처리방침",
}

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-2xl px-4 py-10 text-sm leading-relaxed text-foreground">
      <header className="mb-8 border-b border-border pb-4">
        <Link
          href="/"
          className="mb-4 inline-block text-xs text-muted-foreground hover:text-foreground"
        >
          ← Nemo Calendar
        </Link>
        <h1 className="text-xl font-semibold tracking-tight">
          개인정보처리방침
        </h1>
        <p className="mt-2 text-xs text-muted-foreground">
          시행일: 2026년 8월 30일
        </p>
      </header>

      <div className="space-y-6 text-[13px] text-muted-foreground [&_h2]:mb-2 [&_h2]:text-sm [&_h2]:font-medium [&_h2]:text-foreground [&_p]:mb-2 [&_ul]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mb-1">
        <section>
          <h2>1. 개요</h2>
          <p>
            Nemo Calendar(이하 &quot;서비스&quot;)는 Google 계정 연동을 통해
            캘린더·할 일·북마크 등 생산성 기능을 제공합니다. 본 방침은 서비스
            이용 과정에서 처리되는 개인정보에 대해 설명합니다.
          </p>
        </section>

        <section>
          <h2>2. 수집하는 정보</h2>
          <ul>
            <li>
              Google 로그인 시: Google 계정 식별자, 이메일, 이름, 프로필
              사진 URL
            </li>
            <li>
              Google Calendar 연동 시: 캘린더 일정 조회·생성·수정·삭제에
              필요한 Google Calendar 데이터 및 OAuth refresh token(암호화
              저장)
            </li>
            <li>
              서비스 이용 시: 할 일, 핀 메모, 북마크, 기념일, 위치(날씨),
              배너 이미지·테마 설정 등 사용자가 입력·업로드한 데이터
            </li>
            <li>
              기술 정보: 인증을 위한 httpOnly 쿠키(JWT), 서비스 운영에
              필요한 접속 로그(호스팅 사업자 측)
            </li>
          </ul>
        </section>

        <section>
          <h2>3. 정보의 이용 목적</h2>
          <ul>
            <li>회원 식별 및 로그인·세션 유지</li>
            <li>Google Calendar 연동 및 일정 관리 기능 제공</li>
            <li>투두, 북마크, 기념일 등 대시보드 기능 제공</li>
            <li>날씨 위젯 제공(사용자가 설정한 지역 기준)</li>
            <li>서비스 안정성·보안 유지</li>
          </ul>
        </section>

        <section>
          <h2>4. 정보의 보관 및 저장 위치</h2>
          <p>
            계정 및 이용 데이터는 클라우드 데이터베이스(TiDB Cloud)에
            저장됩니다. 배너 이미지는 Cloudflare R2에 저장될 수 있습니다.
            인증 토큰은 httpOnly 쿠키로 관리되며, Google refresh token은
            서버에서 암호화하여 저장합니다.
          </p>
        </section>

        <section>
          <h2>5. 제3자 제공 및 처리 위탁</h2>
          <ul>
            <li>Google LLC: OAuth 로그인 및 Google Calendar API</li>
            <li>WeatherAPI.com: 날씨 정보 조회(사용자가 설정한 지역명 기준)</li>
            <li>Vercel, Render, TiDB Cloud, Cloudflare: 호스팅·DB·스토리지</li>
          </ul>
          <p>
            이용자 데이터를 마케팅 목적으로 제3자에게 판매하지 않습니다.
          </p>
        </section>

        <section>
          <h2>6. 보관 기간</h2>
          <p>
            회원 정보 및 이용 데이터는 계정 삭제 요청 또는 서비스 종료 시까지
            보관합니다. 법령에 따라 보관이 필요한 경우 해당 기간 동안
            보관할 수 있습니다.
          </p>
        </section>

        <section>
          <h2>7. 이용자의 권리</h2>
          <p>
            이용자는 Google 계정 연동 해제, 캘린더 연결 해제, 데이터 삭제
            등을 요청할 수 있습니다. Google 계정의 앱 접근 권한은 Google
            계정 설정에서 직접 철회할 수 있습니다.
          </p>
        </section>

        <section>
          <h2>8. 쿠키</h2>
          <p>
            서비스는 로그인 상태 유지를 위해 httpOnly 쿠키를 사용합니다.
            브라우저에서 쿠키를 차단하면 일부 기능이 동작하지 않을 수
            있습니다.
          </p>
        </section>

        <section>
          <h2>9. 문의</h2>
          <p>
            개인정보 처리와 관련한 문의는 서비스 GitHub 저장소 이슈 또는
            운영자 이메일(
            <a
              href="mailto:sonhg0518@gmail.com"
              className="text-foreground underline underline-offset-2"
            >
              sonhg0518@gmail.com
            </a>
            )로 연락해 주세요.
          </p>
        </section>

        <section>
          <h2>10. 방침 변경</h2>
          <p>
            본 방침은 서비스 또는 법령 변경에 따라 수정될 수 있으며, 변경
            시 본 페이지에 게시합니다.
          </p>
        </section>
      </div>
    </article>
  )
}
