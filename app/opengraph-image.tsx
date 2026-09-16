import { ImageResponse } from "next/og"

export const alt = "Nemo Calendar"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "72px 88px",
          background: "linear-gradient(145deg, #f7f8fa 0%, #e8eef5 48%, #dfe8f2 100%)",
          color: "#111827",
          fontFamily:
            'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 28,
          }}
        >
          <div
            style={{
              width: 112,
              height: 112,
              borderRadius: 24,
              background: "#ffffff",
              border: "3px solid #111827",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: 28,
                background: "#111827",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 18,
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 14,
                  borderRadius: 4,
                  background: "#ffffff",
                }}
              />
              <div
                style={{
                  width: 8,
                  height: 14,
                  borderRadius: 4,
                  background: "#ffffff",
                }}
              />
            </div>
            <div
              style={{
                flex: 1,
                display: "flex",
                flexWrap: "wrap",
                gap: 10,
                padding: 16,
                alignContent: "center",
                justifyContent: "center",
              }}
            >
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 999,
                    background: i === 2 ? "#2563eb" : "#cbd5e1",
                  }}
                />
              ))}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div
              style={{
                fontSize: 72,
                fontWeight: 700,
                letterSpacing: "-0.03em",
                lineHeight: 1.05,
              }}
            >
              Nemo Calendar
            </div>
            <div
              style={{
                fontSize: 30,
                color: "#4b5563",
                lineHeight: 1.35,
                maxWidth: 820,
              }}
            >
              구글 캘린더와 연동되는 캘린더·투두·뽀모도로 생산성 대시보드
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size },
  )
}
