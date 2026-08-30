import Link from "next/link"

export function SiteFooter() {
  return (
    <footer className="shrink-0 border-t border-border/40 bg-background/80 px-4 py-2 text-center backdrop-blur-sm">
      <Link
        href="/privacy"
        className="text-[10px] leading-none text-muted-foreground/50 underline-offset-2 hover:text-muted-foreground/70 hover:underline"
      >
        개인정보처리방침
      </Link>
    </footer>
  )
}
