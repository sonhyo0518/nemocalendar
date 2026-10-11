import { describe, expect, it } from "vitest"
import { isSafeHttpUrl } from "@/lib/url"

describe("isSafeHttpUrl", () => {
  it("accepts http(s)", () => {
    expect(isSafeHttpUrl("https://example.com")).toBe(true)
    expect(isSafeHttpUrl("http://example.com/path")).toBe(true)
  })

  it("rejects non-http and invalid", () => {
    expect(isSafeHttpUrl("javascript:alert(1)")).toBe(false)
    expect(isSafeHttpUrl("ftp://example.com")).toBe(false)
    expect(isSafeHttpUrl("not a url")).toBe(false)
    expect(isSafeHttpUrl("")).toBe(false)
  })
})