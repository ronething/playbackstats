import { NextRequest, NextResponse } from "next/server"

import { isLocale } from "@/lib/i18n"

export function proxy(request: NextRequest) {
  const firstSegment = request.nextUrl.pathname.split("/")[1]
  const locale = isLocale(firstSegment) ? firstSegment : "en"
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set("x-playback-locale", locale)

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.svg|robots.txt|sitemap.xml).*)"],
}
