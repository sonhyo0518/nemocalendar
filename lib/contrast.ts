/** 배경 밝기에 따라 흰/검정 글자색 선택. hex가 아니면 흰색 fallback */
export function onColor(bg: string): "#ffffff" | "#111111" {
    const raw = bg.trim()
    const hex = raw.startsWith("#") ? raw.slice(1) : raw
    if (!/^[0-9a-fA-F]{6}$/.test(hex)) return "#ffffff"
    const r = parseInt(hex.slice(0, 2), 16)
    const g = parseInt(hex.slice(2, 4), 16)
    const b = parseInt(hex.slice(4, 6), 16)
    const yiq = (r * 299 + g * 587 + b * 114) / 1000
    return yiq >= 150 ? "#111111" : "#ffffff"
}

/** 라이트: 원색 / 다크: 어두운 색을 흰색과 섞어 카드 위에서 보이게 */
export function readableAccent(color: string): string {
  const c = color.trim()
  return `light-dark(${c}, color-mix(in srgb, ${c} 42%, white))`
}