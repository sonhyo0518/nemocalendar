export const DEFAULT_BANNER_COLOR = "#9FE1E7"
export const DEFAULT_ANNIV_COLOR = "#CC79A7"

/** Okabe–Ito 계열 — 색각이상자용 (첫 줄) */
export const COLORBLIND_PRESETS = [
  "#000000",
  "#E69F00",
  "#56B4E9",
  "#009E73",
  "#F0E442",
  "#0072B2",
  "#D55E00",
  "#CC79A7",
] as const

/** 파스텔톤 (둘째 줄부터) */
export const PASTEL_PRESETS = [
  "#2C2C2C",
  "#9FE1E7",
  "#A3E4D7",
  "#A8C7FA",
  "#ABEBC6",
  "#AED6F1",
  "#B2EBF2",
  "#B8E0D2",
  "#C5B8F0",
  "#C8E6C9",
  "#D5F5E3",
  "#D6EAF8",
  "#D7BDE2",
  "#E8DAEF",
  "#F5B7B1",
  "#F5C6CE",
  "#F5CBA7",
  "#F5E6A8",
  "#F8D9A8",
  "#FADBD8",
] as const

export const COLOR_PRESETS = [
  ...COLORBLIND_PRESETS,
  ...PASTEL_PRESETS,
] as const

/** todo-board 카테고리 색 선택 UI */
export const TODO_CATEGORY_COLOR_PRESETS = [
  "#A8C7FA",
  "#B8E0D2",
  "#C5B8F0",
  "#F5C6CE",
  "#F8D9A8",
  "#F5E6A8",
  "#C8E6C9",
  "#F5C6A0",
  "#B8D4E8",
  "#E8C8E0",
  "#D7CCC8",
  "#B2EBF2",
] as const