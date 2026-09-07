import Link from "next/link"

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-20 text-center">
      <p className="text-xs font-medium tracking-wide text-muted-foreground">
        404
      </p>
      <h1 className="mt-2 text-xl font-semibold tracking-tight text-foreground">
        페이지를 찾을 수 없습니다
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        요청하신 주소가 없거나 이동되었을 수 있습니다.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/80"
      >
        홈으로 돌아가기
      </Link>
    </div>
  )
}