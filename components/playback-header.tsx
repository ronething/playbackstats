import Link from "next/link"
import { Github, Globe2, Music2, Youtube } from "lucide-react"

import { cn } from "@/lib/utils"
import { getLandingContent, localeNames, locales, localizeHome, type Locale } from "@/lib/i18n"

type Platform = "youtube" | "spotify"

interface PlaybackHeaderProps {
  activePlatform?: Platform
  guideHref?: string
  locale?: Locale
  showLanguageSwitcher?: boolean
}

export default function PlaybackHeader({
  activePlatform,
  guideHref,
  locale = "en",
  showLanguageSwitcher = false,
}: PlaybackHeaderProps) {
  const content = getLandingContent(locale)
  const platformLinks = [
    {
      id: "youtube" as const,
      href: localizeHome(locale),
      label: "YouTube",
      icon: Youtube,
      activeClass: "border-red-500/25 bg-red-500/15 text-red-200",
    },
    {
      id: "spotify" as const,
      href: "/spotify",
      label: "Spotify",
      icon: Music2,
      activeClass: "border-emerald-400/25 bg-emerald-400/15 text-emerald-200",
    },
  ]

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.08] bg-zinc-950/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
        <Link href={localizeHome(locale)} className="group flex min-w-0 items-center gap-2.5" aria-label={content.nav.homeAriaLabel}>
          <span className="relative flex h-8 w-8 shrink-0 items-end justify-center gap-[3px] overflow-hidden rounded-xl border border-white/10 bg-white/[0.06] pb-2 shadow-inner shadow-white/5 transition-colors group-hover:bg-white/[0.1]">
            <span className="h-2 w-[3px] rounded-full bg-white/45" />
            <span className="h-4 w-[3px] rounded-full bg-white" />
            <span className="h-3 w-[3px] rounded-full bg-white/65" />
          </span>
          <span className="hidden truncate text-sm font-semibold tracking-[-0.02em] text-white min-[430px]:inline sm:text-base">
            Playback Stats
          </span>
        </Link>

        <nav className="ml-auto flex min-w-0 items-center gap-2 sm:gap-3" aria-label={content.nav.navigationAriaLabel}>
          <div className="flex items-center rounded-xl border border-white/[0.08] bg-white/[0.035] p-1">
            {platformLinks.map((platform) => {
              const Icon = platform.icon
              const isActive = activePlatform === platform.id

              return (
                <Link
                  key={platform.id}
                  href={platform.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex h-8 items-center gap-1.5 rounded-lg border border-transparent px-2 text-xs font-medium text-zinc-400 transition-all duration-200 hover:bg-white/[0.06] hover:text-white active:scale-[0.98] sm:px-3",
                    isActive && platform.activeClass,
                  )}
                >
                  <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                  <span className="hidden sm:inline">{platform.label}</span>
                  <span className="sr-only sm:hidden">{platform.label}</span>
                </Link>
              )
            })}
          </div>

          {guideHref && (
            <Link
              href={guideHref}
              className="hidden text-sm font-medium text-zinc-400 transition-colors hover:text-white lg:block"
            >
              {content.nav.guide}
            </Link>
          )}

          {showLanguageSwitcher && (
            <div
              className="flex items-center rounded-xl border border-white/[0.08] bg-white/[0.035] p-1"
              aria-label={content.nav.language}
            >
              <Globe2 className="mx-1 hidden h-3.5 w-3.5 text-zinc-400 sm:block" aria-hidden="true" />
              {locales.map((candidate) => (
                <Link
                  key={candidate}
                  href={localizeHome(candidate)}
                  hrefLang={candidate}
                  lang={candidate}
                  title={localeNames[candidate]}
                  aria-current={candidate === locale ? "page" : undefined}
                  className={cn(
                    "flex h-7 min-w-7 items-center justify-center rounded-lg px-1.5 text-[10px] font-semibold uppercase text-zinc-400 transition-colors hover:bg-white/[0.06] hover:text-white",
                    candidate === locale && "bg-white text-zinc-950 hover:bg-white hover:text-zinc-950",
                  )}
                >
                  {candidate}
                </Link>
              ))}
            </div>
          )}

          <Link
            href="https://github.com/ronething/yt-history"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden rounded-xl p-2 text-zinc-400 transition-colors hover:bg-white/[0.07] hover:text-white md:block"
            aria-label={content.nav.github}
          >
            <Github className="h-4 w-4" aria-hidden="true" />
          </Link>
        </nav>
      </div>
    </header>
  )
}
