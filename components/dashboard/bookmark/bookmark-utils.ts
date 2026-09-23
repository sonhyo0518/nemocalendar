import { isSafeHttpUrl } from "@/lib/url"

export const DND_TYPE = "application/x-nemo-bookmark-id"
export const PREVIEW_DELAY_MS = 700

export function normalizeUrl(raw: string) {
  const t = raw.trim()
  if (!t) return ""
  if (/^https?:\/\//i.test(t)) return t
  return `https://${t}`
}

export function faviconFor(url: string, faviconUrl?: string | null) {
  if (faviconUrl && isSafeHttpUrl(faviconUrl)) return faviconUrl
  try {
    const host = new URL(url).hostname
    return `https://www.google.com/s2/favicons?domain=${host}&sz=32`
  } catch {
    return null
  }
}

export function displayHost(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "")
  } catch {
    return url
  }
}