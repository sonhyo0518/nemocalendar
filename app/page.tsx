"use client"

import dynamic from "next/dynamic"

const CalendarDashboard = dynamic(
  () =>
    import("@/components/calendar-dashboard").then(
      (m) => m.CalendarDashboard,
    ),
  { ssr: false },
)

export default function Page() {
  return <CalendarDashboard />
}