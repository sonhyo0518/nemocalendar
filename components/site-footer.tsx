import Link from "next/link"

const linkClassName =
  "text-[10px] leading-none text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"

export function SiteFooter() {
  return (
    <footer className="shrink-0 border-t border-border/40 bg-background/80 px-4 py-2 text-center backdrop-blur-sm">
      <nav
        className="inline-flex items-center gap-x-2"
        aria-label="사이트 정보"
      >
        <Link href="/privacy" className={linkClassName}>
          개인정보처리방침
        </Link>
        <span className="text-[10px] text-muted-foreground/50" aria-hidden>
          |
        </span>
        <Link href="/changelog" className={linkClassName}>
          릴리즈 노트
        </Link>
      </nav>
    </footer>
  )
}
