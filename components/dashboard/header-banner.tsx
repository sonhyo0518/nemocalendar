"use client"
import {
  CalendarDays,
  LogOut,
  Monitor,
  Moon,
  Palette,
  Settings,
  Sun,
  UserRound,
} from "lucide-react"
import { useState } from "react"
import { useColorMode } from "@/hooks/use-color-mode"
import { useGoogleLogin } from "@react-oauth/google"
import { BannerSettingsDialog } from "@/components/dashboard/banner-settings-dialog"
import { ThemeSettingsDialog } from "@/components/dashboard/theme-settings-dialog"
import type { DashboardUser } from "@/lib/dashboard-data"
import { authFetch, authJson } from "@/lib/api"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { GuestLanding } from "@/components/dashboard/guest-landing"

interface HeaderBannerProps {
  user: DashboardUser | null
  authReady?: boolean
  calendarConnected?: boolean
  onSignIn?: (user: DashboardUser) => void
  onCalendarConnected?: () => void
  onCalendarDisconnected?: () => void | Promise<void>
  onSignOut: () => void
  onBannerChange?: (patch: {
    banner_img_url?: string | null
    theme_color?: string | null
  }) => void
}

function GoogleGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.15-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.85 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.67-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06L5.85 9.9C6.71 7.31 9.14 5.38 12 5.38Z"
      />
    </svg>
  )
}

export function HeaderBanner({
  user,
  authReady = true,
  calendarConnected = false,
  onSignIn,
  onCalendarConnected,
  onCalendarDisconnected,
  onSignOut,
  onBannerChange,
}: HeaderBannerProps) {
  const [themeOpen, setThemeOpen] = useState(false)
  const [bannerOpen, setBannerOpen] = useState(false)
  const { mode, setMode } = useColorMode()

  const handleGoogleLogin = useGoogleLogin({
    flow: "auth-code",
    scope: "openid email profile",
    onSuccess: async (codeResponse) => {
      try {
        const data = await authJson<{
          user: DashboardUser
          error?: string
        }>("/api/user/google-login", {
          auth: false,
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: codeResponse.code }),
          credentials: "include",
        })
        
        // JWT는 httpOnly 쿠키로 설정됨
        try {
          localStorage.setItem(
            "user",
            JSON.stringify({
              name: data.user.name,
              email: data.user.email,
              profile_img_url: data.user.profile_img_url ?? null,
              banner_img_url: data.user.banner_img_url ?? null,
              theme_color: data.user.theme_color ?? null,
              location: data.user.location ?? null,
              calendarConnected: Boolean(data.user.calendarConnected),
            }),
          )
        } catch {
          // private mode — 세션은 쿠키로 유지될 수 있음
        }
        onSignIn?.(data.user)
      } catch (error) {
        console.error("백엔드 통신 에러:", error)
        alert("서버 연결 실패")
      }
    },
    onError: (error) => console.error("구글 Auth 에러:", error),
  })

  const handleConnectCalendar = useGoogleLogin({
    flow: "auth-code",
    scope: "https://www.googleapis.com/auth/calendar",
    ...({
      access_type: "offline",
      prompt: "consent",
    } as object),
    onSuccess: async (codeResponse) => {
      try {
        const response = await authFetch("/api/user/connect-calendar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: codeResponse.code }),
          onUnauthorized: onSignOut,
        })
        const data = await response.json()

        if (!response.ok) {
          if (data.code === "NO_REFRESH_TOKEN") {
            alert(
              "캘린더 권한 토큰을 받지 못했습니다. Google 계정에서 앱 액세스를 삭제한 뒤 다시 연결해주세요.",
            )
          } else {
            alert(`캘린더 연결 실패: ${data.error || "오류가 발생했습니다."}`)
          }
          return
        }

        alert("Google 캘린더가 연결되었습니다.")
        onCalendarConnected?.()
      } catch (error) {
        console.error("캘린더 연결 에러:", error)
        alert("캘린더 연결 실패")
      }
    },
    onError: (error) => console.error("캘린더 Auth 에러:", error),
  })

  return (
    <>
      <header
        className={
          user
            ? "relative flex items-center justify-between gap-4 py-5 sm:py-7 md:py-8"
            : "relative flex items-center justify-between gap-4 py-3 sm:py-4"
        }
      >
        <div className="flex items-center gap-3">
        <span className="flex size-9 items-center justify-center rounded-lg bg-theme text-theme-foreground shadow-sm backdrop-blur">
            <CalendarDays className="size-4" />
          </span>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground text-balance sm:text-2xl">
              Nemo Calendar
            </h1>
          </div>
        </div>

        {!authReady ? (
          <div className="h-9 w-28 animate-pulse rounded-md bg-muted/80" />
        ) : user ? (
          <div className="flex items-center gap-2">
            {!calendarConnected && (
              <Button
                variant="outline"
                onClick={() => {
                  if (calendarConnected) return
                  handleConnectCalendar()
                }}
                className="bg-card/80 backdrop-blur"
              >
                캘린더 연결
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <button
                    type="button"
                    className="inline-flex size-8 max-sm:size-11 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-border bg-card/80 p-0 leading-none shadow-sm backdrop-blur transition-colors hover:bg-card"
                    aria-label="계정 메뉴"
                  />
                }
              >
                <Avatar className="size-full after:border-0">
                  <AvatarImage
                    src={user.profile_img_url || "/images/avatar.png"}
                    alt={user.name}
                  />
                  <AvatarFallback>{user.name.slice(0, 1)}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-foreground">
                        {user.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {user.email}
                      </span>
                    </div>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <UserRound />
                    프로필
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setThemeOpen(true)}>
                    <Palette />
                    테마색 변경
                  </DropdownMenuItem>
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      {mode === "dark" ? (
                        <Moon />
                      ) : mode === "light" ? (
                        <Sun />
                      ) : (
                        <Monitor />
                      )}
                      화면
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="min-w-36">
                      <DropdownMenuRadioGroup
                        value={mode}
                        onValueChange={(value) =>
                          setMode(value as "light" | "dark" | "system")
                        }
                      >
                        <DropdownMenuRadioItem value="system">
                          <Monitor />
                          시스템
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="light">
                          <Sun />
                          라이트
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="dark">
                          <Moon />
                          다크
                        </DropdownMenuRadioItem>
                      </DropdownMenuRadioGroup>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                  <DropdownMenuItem onClick={() => setBannerOpen(true)}>
                    <Settings />
                    배너 변경
                  </DropdownMenuItem>
                  {calendarConnected && onCalendarDisconnected ? (
                  <DropdownMenuItem onClick={() => onCalendarDisconnected()}>
                    <CalendarDays />
                    캘린더 연결 해제
                  </DropdownMenuItem>
                ) : null}
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={onSignOut}>
                  <LogOut />
                  로그아웃
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <Button
            variant="outline"
            onClick={handleGoogleLogin}
            className="bg-card/80 backdrop-blur"
          >
            <GoogleGlyph />
            Google로 로그인
          </Button>
        )}
      </header>
      {!user && authReady ? (
        <GuestLanding onStart={handleGoogleLogin} />
      ) : null}
      {user ? (
        <>
          <ThemeSettingsDialog
            open={themeOpen}
            onOpenChange={setThemeOpen}
            themeColor={user.theme_color}
            onThemeChange={(patch) => onBannerChange?.(patch)}
            onUnauthorized={() => {
              setThemeOpen(false)
              onSignOut?.()
            }}
          />
          <BannerSettingsDialog
            open={bannerOpen}
            onOpenChange={setBannerOpen}
            bannerImgUrl={user.banner_img_url}
            themeColor={user.theme_color}
            onBannerChange={(patch) => onBannerChange?.(patch)}
            onUnauthorized={() => {
              setBannerOpen(false)
              onSignOut?.()
            }}
          />
        </>
      ) : null}
    </>
  )
}
