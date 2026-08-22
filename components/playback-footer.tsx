import Link from "next/link"
import { HardDrive } from "lucide-react"

import { cn } from "@/lib/utils"
import { getLandingContent, localizeHome, type Locale } from "@/lib/i18n"

interface PlaybackFooterProps {
  locale?: Locale
  tone?: "dark" | "light"
}

export default function PlaybackFooter({ locale = "en", tone = "dark" }: PlaybackFooterProps) {
  const content = getLandingContent(locale)
  const isLight = tone === "light"

  return (
    <footer
      className={cn(
        "border-t py-8",
        isLight
          ? "border-black/15 bg-[#f2eee5] text-[#6a6359]"
          : "border-white/[0.08] bg-zinc-950 text-zinc-500",
      )}
    >
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-5 px-5 text-sm sm:px-8 md:flex-row md:items-center md:justify-between lg:px-12 xl:px-16">
        <div className="flex items-center gap-2">
          <HardDrive className={cn("h-4 w-4", isLight ? "text-[#d52b22]" : "text-zinc-300")} aria-hidden="true" />
          <span>{content.footer.privacyStatement} · {new Date().getFullYear()}</span>
        </div>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <Link href={localizeHome(locale)} className={cn("transition-colors", isLight ? "hover:text-black" : "hover:text-white")}>YouTube</Link>
          <Link href="/spotify" className={cn("transition-colors", isLight ? "hover:text-black" : "hover:text-white")}>Spotify</Link>
          <Link href="/guides/youtube-watch-history-json" className={cn("transition-colors", isLight ? "hover:text-black" : "hover:text-white")}>{content.footer.jsonGuide}</Link>
          <Link href="/guides/how-to-see-most-watched-youtube-channels" className={cn("transition-colors", isLight ? "hover:text-black" : "hover:text-white")}>{content.footer.topChannels}</Link>
          <Link href="/privacy" className={cn("transition-colors", isLight ? "hover:text-black" : "hover:text-white")}>{content.footer.privacy}</Link>
          <Link href="/terms" className={cn("transition-colors", isLight ? "hover:text-black" : "hover:text-white")}>{content.footer.terms}</Link>
          <Link
            href="https://github.com/ronething/yt-history"
            target="_blank"
            rel="noopener noreferrer"
            className={cn("transition-colors", isLight ? "hover:text-black" : "hover:text-white")}
          >
            GitHub
          </Link>
        </div>
      </div>
    </footer>
  )
}
