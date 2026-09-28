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
          시행일: 2026년 8월 30일 · 개정일: 2026년 9월 28일
        </p>
      </header>

      <div className="space-y-6 text-[13px] text-muted-foreground [&_h2]:mb-2 [&_h2]:text-sm [&_h2]:font-medium [&_h2]:text-foreground [&_p]:mb-2 [&_ul]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mb-1">
        <section>
          <h2>1. 개요</h2>
          <p>
            Nemo Calendar(이하 &quot;서비스&quot;)는 Google 계정 연동을 통해
            캘린더·할 일·북마크 등 생산성 기능을 제공합니다. 본 방침은 서비스
            이용 과정에서 처리되는 개인정보 및 Google 사용자 데이터에 대해
            설명합니다.
          </p>
        </section>

        <section>
          <h2>2. 수집하는 정보</h2>
          <ul>
            <li>
              Google 로그인 시(요청 범위:{" "}
              <code className="text-foreground">openid email profile</code>
              ): Google 계정 식별자, 이메일, 이름, 프로필 사진 URL
            </li>
            <li>
              Google Calendar 연결 시(요청 범위:{" "}
              <code className="text-foreground">
                https://www.googleapis.com/auth/calendar
              </code>
              ): 캘린더 목록·일정 조회·생성·수정·삭제에 필요한 Google
              Calendar 데이터 및 OAuth refresh token(서버에서 암호화 저장).
              이 권한은 로그인과 별도로, 사용자가 「캘린더 연결」을 선택할
              때만 요청합니다.
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
            <li>
              회원 식별 및 로그인·세션 유지(이름·이메일·프로필은 화면 표시
              및 계정 식별에만 사용)
            </li>
            <li>
              Google Calendar API로 일정을 읽고 쓰는 일정 관리 기능 제공.
              캘린더 데이터는 대시보드에 표시·동기화하는 데만 사용합니다.
            </li>
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
          <h2>5. Google 사용자 데이터의 공유·전송·공개</h2>
          <p>
            Google API를 통해 취득한 사용자 데이터(계정 식별자, 이메일, 이름,
            프로필 사진 URL, Google Calendar 데이터, OAuth refresh token)의
            공유·전송·공개는 아래와 같습니다. 서비스 기능 제공·개선, 보안,
            법령 준수 목적 외에는 제3자에게 전송하거나 공개하지 않습니다.
          </p>
          <ul>
            <li>
              <strong className="font-medium text-foreground">
                Google LLC
              </strong>
              : 사용자가 동의한 OAuth 로그인 및 Google Calendar API 호출을
              위해 필요한 범위에서만 데이터를 주고받습니다.
            </li>
            <li>
              <strong className="font-medium text-foreground">
                인프라 처리자(Vercel, Render, TiDB Cloud, Cloudflare)
              </strong>
              : 웹 호스팅, API 서버, 데이터베이스, 객체 스토리지 운영을 위한
              처리 위탁입니다. 이들이 Google 사용자 데이터를 광고·판매
              목적으로 이용하도록 제공하지 않습니다.
            </li>
            <li>
              <strong className="font-medium text-foreground">
                WeatherAPI.com
              </strong>
              : 날씨 조회에 사용자가 설정한 지역명만 전달합니다. Google
              계정·Calendar·OAuth 토큰 등 Google 사용자 데이터는 전송하지
              않습니다.
            </li>
          </ul>
          <p>다음 목적으로 Google 사용자 데이터를 공유·전송·공개하지 않습니다.</p>
          <ul>
            <li>판매, 대여, 또는 데이터 브로커·정보 재판매업자에 대한 제공</li>
            <li>
              타겟·맞춤·리타겟팅·관심사 기반 광고 및 광고 플랫폼에 대한 제공
            </li>
            <li>신용평가·대출 심사 목적</li>
            <li>
              일반화된 머신러닝·인공지능 모델 학습 목적
            </li>
            <li>
              위 기능 제공·보안·법령 준수 이외의 기타 목적의 제3자 제공
            </li>
          </ul>
          <p>
            운영자는 Google 사용자 데이터를 일상적으로 열람하지 않습니다.
            보안 사고 조사, 장애 대응, 이용자의 명시적 요청이 있는 경우에
            한해 필요한 범위에서만 접근할 수 있습니다.
          </p>
        </section>

        <section>
          <h2>6. 제3자 제공 및 처리 위탁(요약)</h2>
          <ul>
            <li>Google LLC: OAuth 로그인 및 Google Calendar API</li>
            <li>
              WeatherAPI.com: 날씨 정보 조회(사용자가 설정한 지역명 기준,
              Google 사용자 데이터 미전송)
            </li>
            <li>Vercel, Render, TiDB Cloud, Cloudflare: 호스팅·DB·스토리지</li>
          </ul>
          <p>
            이용자 데이터 및 Google 사용자 데이터를 마케팅 목적으로
            제3자에게 판매하지 않습니다.
          </p>
        </section>

        <section>
          <h2>7. 보안 및 데이터 보호</h2>
          <p>
            Google 사용자 데이터를 포함한 민감 정보의 기밀성·무결성·가용성을
            보호하기 위해 다음과 같은 보안 절차와 보호 메커니즘을 적용합니다.
          </p>
          <ul>
            <li>
              서비스와 API 통신은 HTTPS(TLS)로 암호화하여 전송 구간을
              보호합니다.
            </li>
            <li>
              Google OAuth refresh token은 서버에서 암호화(AES-256-GCM)하여
              저장합니다.
            </li>
            <li>
              로그인 세션은 httpOnly 쿠키(JWT)로 관리하여 클라이언트
              스크립트의 토큰 접근을 제한합니다.
            </li>
            <li>
              데이터베이스·스토리지·서버 접근은 운영에 필요한 계정·환경으로
              제한합니다.
            </li>
            <li>
              위와 같은 기술적·관리적 조치를 통해 Google 사용자 데이터의
              무단 접근·유출·변조를 방지합니다.
            </li>
          </ul>
        </section>

        <section>
          <h2>8. 보관 기간</h2>
          <p>
            회원 정보 및 이용 데이터는 계정 삭제 요청 또는 서비스 종료 시까지
            보관합니다. 법령에 따라 보관이 필요한 경우 해당 기간 동안
            보관할 수 있습니다.
          </p>
        </section>

        <section>
          <h2>9. 이용자의 권리</h2>
          <p>
            이용자는 서비스 내 계정 메뉴의 「계정 삭제」로 회원 정보와
            서비스에 저장된 이용 데이터(할 일, 핀, 북마크, 기념일, 배너·테마·위치
            등)를 삭제할 수 있습니다. Google Calendar에 저장된 원본 일정은
            삭제되지 않습니다. 캘린더 연결 해제와 Google 계정의 앱 접근 권한
            철회는{" "}
            <a
              href="https://myaccount.google.com/permissions"
              className="text-foreground underline underline-offset-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              Google 계정 설정
            </a>
            에서도 직접 할 수 있습니다.
          </p>
        </section>

        <section>
          <h2>10. 쿠키</h2>
          <p>
            서비스는 로그인 상태 유지를 위해 httpOnly 쿠키를 사용합니다.
            브라우저에서 쿠키를 차단하면 일부 기능이 동작하지 않을 수
            있습니다.
          </p>
        </section>

        <section>
          <h2>11. 문의</h2>
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
          <h2>12. 방침 변경</h2>
          <p>
            본 방침은 서비스 또는 법령 변경에 따라 수정될 수 있으며, 변경
            시 본 페이지에 게시합니다.
          </p>
        </section>
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
