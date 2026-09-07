"use client"

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="ko">
      <body className="bg-white text-zinc-900">
        <div style={{ maxWidth: 28 * 16, margin: "5rem auto", padding: 16, textAlign: "center" }}>
          <h1 style={{ fontSize: 20, fontWeight: 600 }}>문제가 발생했습니다</h1>
          <p style={{ marginTop: 8, fontSize: 14, color: "#71717a" }}>
            페이지를 다시 불러와 주세요.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: 24,
              height: 36,
              padding: "0 16px",
              borderRadius: 8,
              background: "#333",
              color: "#fff",
              border: "none",
              cursor: "pointer",
            }}
          >
            다시 시도
          </button>
        </div>
      </body>
    </html>
  )
}