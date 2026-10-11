"use client"

import dynamic from "next/dynamic"

import { HomeLoadingFallback } from "@/components/dashboard/home-loading-fallback"

const CalendarDashboard = dynamic(
  () =>
    import("@/components/calendar-dashboard").then(
      (m) => m.CalendarDashboard,
    ),
  {
    ssr: false,
    loading: () => <HomeLoadingFallback />,
  },
)

export function HomeDashboard() {
  return <CalendarDashboard />
}