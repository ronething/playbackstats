import Link from "next/link"
import { Github, Globe2, Music2, Youtube } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  getLandingContent,
  localeNames,
  locales,
  localizeHome,
  type Locale,
} from "@/lib/i18n"

type Platform = "youtube" | "spotify"
type HeaderTone = "dark" | "light"

interface PlaybackHeaderProps {
  activePlatform?: Platform
  guideHref?: string
  locale?: Locale
  showLanguageSwitcher?: boolean
  tone?: HeaderTone
}

export default function PlaybackHeader({
  activePlatform,
  guideHref,
  locale = "en",
  showLanguageSwitcher = false,
  tone = "dark",
}: PlaybackHeaderProps) {
  const content = getLandingContent(locale)
  const isLight = tone === "light"
  const platformLinks = [
    {
      id: "youtube" as const,
      href: localizeHome(locale),
      label: "YouTube",
      icon: Youtube,
      activeClass: isLight
        ? "border-black bg-[#171511] text-white"
        : "border-red-500/25 bg-red-500/15 text-red-200",
    },
    {
      id: "spotify" as const,
      href: "/spotify",
      label: "Spotify",
      icon: Music2,
      activeClass: isLight
        ? "border-black bg-[#171511] text-white"
        : "border-emerald-400/25 bg-emerald-400/15 text-emerald-200",
    },
  ]

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b backdrop-blur-xl",
        isLight
          ? "border-black/15 bg-[#f2eee5]/90 text-[#171511]"
          : "border-white/[0.08] bg-zinc-950/85 text-white",
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center gap-3 px-4 sm:px-6 lg:px-8 xl:px-12">
        <Link
          href={localizeHome(locale)}
          className="group flex min-w-0 items-center gap-2.5"
          aria-label={content.nav.homeAriaLabel}
        >
          <span
            className={cn(
              "relative flex h-8 w-8 shrink-0 items-end justify-center gap-[3px] overflow-hidden pb-2 transition-colors",
              isLight
                ? "border border-black/20 bg-[#171511]"
                : "rounded-xl border border-white/10 bg-white/[0.06] shadow-inner shadow-white/5 group-hover:bg-white/[0.1]",
            )}
          >
            <span className="h-2 w-[3px] rounded-full bg-white/45" />
            <span className="h-4 w-[3px] rounded-full bg-white" />
            <span className="h-3 w-[3px] rounded-full bg-white/65" />
          </span>
          <span
            className={cn(
              "hidden truncate text-sm font-semibold tracking-[-0.02em] min-[430px]:inline sm:text-base",
              isLight ? "text-[#171511]" : "text-white",
            )}
          >
            Playback Stats
          </span>
        </Link>

        <nav
          className="ml-auto flex min-w-0 items-center gap-2 sm:gap-3"
          aria-label={content.nav.navigationAriaLabel}
        >
          <div
            className={cn(
              "flex items-center p-1",
              isLight ? "border border-black/15 bg-white/30" : "rounded-xl border border-white/[0.08] bg-white/[0.035]",
            )}
          >
            {platformLinks.map((platform) => {
              const Icon = platform.icon
              const isActive = activePlatform === platform.id

              return (
                <Link
                  key={platform.id}
                  href={platform.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex h-8 items-center gap-1.5 border border-transparent px-2 text-xs font-medium transition-all duration-200 active:scale-[0.98] sm:px-3",
                    !isLight && "rounded-lg",
                    isLight
                      ? "text-[#6a6359] hover:bg-white/70 hover:text-black"
                      : "text-zinc-400 hover:bg-white/[0.06] hover:text-white",
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
              className={cn(
                "hidden text-sm font-medium transition-colors lg:block",
                isLight ? "text-[#6a6359] hover:text-black" : "text-zinc-400 hover:text-white",
              )}
            >
              {content.nav.guide}
            </Link>
          )}

          {showLanguageSwitcher && (
            <div
              className={cn(
                "flex items-center gap-0.5 border p-1",
                isLight ? "border-black/15 bg-white/30" : "rounded-xl border-white/10 bg-white/[0.035]",
              )}
              aria-label={content.nav.language}
            >
              <Globe2
                className={cn("mx-1 h-3.5 w-3.5", isLight ? "text-[#6a6359]" : "text-zinc-400")}
                aria-hidden="true"
              />
              {locales.map((candidate) => (
                <Link
                  key={candidate}
                  href={localizeHome(candidate)}
                  hrefLang={candidate}
                  lang={candidate}
                  title={localeNames[candidate]}
                  aria-current={candidate === locale ? "page" : undefined}
                  className={cn(
                    "flex h-7 min-w-7 items-center justify-center px-1.5 font-mono text-[10px] font-semibold uppercase transition-colors",
                    !isLight && "rounded-md",
                    candidate === locale
                      ? isLight
                        ? "bg-[#d52b22] text-white"
                        : "bg-white text-black"
                      : isLight
                        ? "text-[#6a6359] hover:bg-white/70 hover:text-black"
                        : "text-zinc-500 hover:bg-white/10 hover:text-white",
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
            className={cn(
              "hidden p-2 transition-colors md:block",
              isLight
                ? "border border-black/15 text-[#6a6359] hover:bg-[#171511] hover:text-white"
                : "rounded-xl text-zinc-400 hover:bg-white/[0.07] hover:text-white",
            )}
            aria-label={content.nav.github}
          >
            <Github className="h-4 w-4" aria-hidden="true" />
          </Link>
        </nav>
      </div>
    </header>
  )
}
