import Link from "next/link"
import { ArrowUpRight, Music2 } from "lucide-react"

import { getLandingContent, type Locale } from "@/lib/i18n"

const MUSIC_GENERATOR_URL = "https://music-generator.net/?utm_source=playbackstats&utm_medium=promo_banner&utm_campaign=yt_history"

interface PromoBannerProps {
  locale?: Locale
}

export default function PromoBanner({ locale = "en" }: PromoBannerProps) {
  const content = getLandingContent(locale).promo

  return (
    <div className="w-full border-b border-white/[0.08] bg-zinc-950 text-white">
      <Link
        href={MUSIC_GENERATOR_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="group mx-auto flex min-h-12 max-w-7xl flex-wrap items-center justify-center gap-x-2 gap-y-1 px-4 py-2 text-center text-sm transition-colors hover:bg-white/[0.04] sm:min-h-10 sm:gap-x-3 sm:text-left"
        aria-label={content.ariaLabel}
      >
        <span className="inline-flex items-center gap-1.5 font-semibold text-zinc-100">
          <Music2 className="h-4 w-4" aria-hidden="true" />
          {content.label}
        </span>
        <span className="text-zinc-200 sm:hidden">
          {content.mobileDescription}
        </span>
        <span className="hidden text-zinc-200 sm:inline">
          {content.desktopDescription}
        </span>
        <span className="inline-flex items-center gap-1 font-semibold text-white underline-offset-4 group-hover:underline">
          {content.action}
          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </span>
      </Link>
    </div>
  )
}
