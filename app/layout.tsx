import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { GoogleOAuthProvider } from '@react-oauth/google'
import Script from "next/script"
import { SiteFooter } from '@/components/site-footer'
import { Toaster } from "@/components/ui/sonner"

const geistSans = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
})

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://nemocalendar.vercel.app'),
  title: 'Nemo Calendar',
  description:
    '구글 캘린더와 연동되는 캘린더·투두·뽀모도로 생산성 대시보드. 일정 관리, 핀 보드, 기념일과 D-Day를 한 곳에서.',
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
  openGraph: {
    title: 'Nemo Calendar',
    description:
      '구글 캘린더와 연동되는 캘린더·투두·뽀모도로 생산성 대시보드. 일정 관리, 핀 보드, 기념일과 D-Day를 한 곳에서.',
    url: 'https://nemocalendar.vercel.app',
    siteName: 'Nemo Calendar',
    locale: 'ko_KR',
    type: 'website',
    images: [
      {
        url: '/apple-icon.png',
        width: 180,
        height: 180,
        alt: 'Nemo Calendar',
      },
    ],
  },
  twitter: {
    card: 'summary', // 정사각 아이콘용 (large_image 아님)
    title: 'Nemo Calendar',
    description:
      '구글 캘린더와 연동되는 캘린더·투두·뽀모도로 생산성 대시보드.',
    images: ['/apple-icon.png'],
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
  if (process.env.NODE_ENV === 'production' && !clientId) {
    console.error(
      '[config] NEXT_PUBLIC_GOOGLE_CLIENT_ID is missing. Google login will not work.',
    );
  }
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
          var theme = u && (u.theme_color || u.banner_color);
          if (theme && /^#[0-9A-Fa-f]{6}$/.test(theme)) {
            document.documentElement.style.setProperty("--banner-theme", theme);
          }
        } catch (e) {}
        })();`}
    </Script>
    <GoogleOAuthProvider clientId={clientId}>
      <div className="flex min-h-svh flex-col">
        <div className="min-h-0 flex-1">{children}</div>
        <SiteFooter />
      </div>
      <Toaster richColors position="top-center" />
      {process.env.NODE_ENV === "production" && <Analytics />}
    </GoogleOAuthProvider>
    </body>
  </html>
  )
}
