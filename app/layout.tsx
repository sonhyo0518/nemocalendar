import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { GoogleOAuthProvider } from '@react-oauth/google'
import Script from "next/script"
import { SiteFooter } from '@/components/site-footer'

const geistSans = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
})

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
})

export const metadata: Metadata = {
  title: 'Nemo Calendar',
  description:
    '구글 캘린더와 연동되는 캘린더·투두·뽀모도로 생산성 대시보드. 일정 관리, 핀 보드, 기념일과 D-Day를 한 곳에서.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';
  return (
    <html
    lang="ko"
    suppressHydrationWarning
    className={`${geistSans.variable} ${geistMono.variable} bg-background`}
  >
    <body className="font-sans antialiased">
    <Script id="banner-boot" strategy="beforeInteractive">
      {`(function(){
        try {
          var mode = localStorage.getItem("color-mode") || "system";
          var dark = mode === "dark" || (mode === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
          var root = document.documentElement;
          root.classList.toggle("dark", dark);
          root.classList.toggle("light", !dark);

          var raw = localStorage.getItem("user");
          if (!raw) return;
          var u = JSON.parse(raw);
          if (u && u.banner_img_url) {
            document.documentElement.style.setProperty(
              "--banner-img",
              "url(" + JSON.stringify(u.banner_img_url) + ")"
            );
          }
          if (u && (u.theme_color || u.banner_color)) {
            document.documentElement.style.setProperty(
              "--banner-theme",
              u.theme_color || u.banner_color
            );
          }
        } catch (e) {}
        })();`}
    </Script>
      <GoogleOAuthProvider clientId={clientId}>
        <div className="flex min-h-svh flex-col">
          <div className="min-h-0 flex-1">{children}</div>
          <SiteFooter />
        </div>
        {process.env.NODE_ENV === "production" && <Analytics />}
      </GoogleOAuthProvider>
    </body>
  </html>
  )
}
