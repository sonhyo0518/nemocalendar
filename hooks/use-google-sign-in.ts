"use client"

import { useCallback, useState } from "react"
import { useGoogleLogin } from "@react-oauth/google"

import type { DashboardUser } from "@/lib/dashboard-data"
import { authJson } from "@/lib/api"
import { waitForApiHealth } from "@/lib/api-health"

type UseGoogleSignInOptions = {
  onSignedIn: (user: DashboardUser) => void
}

export function useGoogleSignIn({ onSignedIn }: UseGoogleSignInOptions) {
  const [loginStarting, setLoginStarting] = useState(false)
  const [wakingApi, setWakingApi] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(null)

  const googleLogin = useGoogleLogin({
    flow: "auth-code",
    scope: "openid email profile",
    onSuccess: async (codeResponse) => {
      setLoginStarting(true)
      setLoginError(null)
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

        if (data.error || !data.user) {
          setLoginError(data.error ?? "로그인에 실패했습니다.")
          return
        }
        onSignedIn(data.user)
      } catch (error) {
        console.error("백엔드 통신 에러:", error)
        setLoginError("서버 연결에 실패했습니다. 잠시 후 다시 시도해 주세요.")
      } finally {
        setLoginStarting(false)
      }
    },
    onError: (error) => {
      console.error("구글 Auth 에러:", error)
      setLoginStarting(false)
      setLoginError("Google 로그인에 실패했습니다.")
    },
  })

  const startLogin = useCallback(async () => {
    setLoginError(null)
    setWakingApi(true)
    setLoginStarting(true)
    try {
      const health = await waitForApiHealth()
      if (!health.ok) {
        if (health.reason === "db") {
          setLoginError(
            "데이터베이스를 준비하는 중입니다. 잠시 후 다시 시도해 주세요.",
          )
        } else if (health.reason === "timeout") {
          setLoginError(
            "서버를 깨우는 데 시간이 걸립니다. 잠시 후 다시 시도해 주세요.",
          )
        } else {
          setLoginError(
            "서버에 연결하지 못했습니다. 잠시 후 다시 시도해 주세요.",
          )
        }
        return
      }
      googleLogin()
    } catch {
      setLoginError("서버 연결에 실패했습니다. 잠시 후 다시 시도해 주세요.")
    } finally {
      setWakingApi(false)
      setLoginStarting(false)
    }
  }, [googleLogin])

  return {
    startLogin,
    loginStarting,
    wakingApi,
    loginError,
  }
}