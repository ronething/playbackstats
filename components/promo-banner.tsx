import Link from "next/link"
import { ArrowUpRight, Music2 } from "lucide-react"

const MUSIC_GENERATOR_URL = "https://music-generator.net/"

export default function PromoBanner() {
  return (
    <div className="w-full border-b border-white/[0.08] bg-zinc-950 text-white">
      <Link
        href={MUSIC_GENERATOR_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="group mx-auto flex min-h-12 max-w-7xl flex-wrap items-center justify-center gap-x-2 gap-y-1 px-4 py-2 text-center text-sm transition-colors hover:bg-white/[0.04] sm:min-h-10 sm:gap-x-3 sm:text-left"
        aria-label="Create AI music and background tracks with Musefy"
      >
        <span className="inline-flex items-center gap-1.5 font-semibold text-zinc-100">
          <Music2 className="h-4 w-4" aria-hidden="true" />
          AI music for creators
        </span>
        <span className="text-zinc-200 sm:hidden">
          Create BGM for your next video.
        </span>
        <span className="hidden text-zinc-200 sm:inline">
          Generate songs, BGM, and lyrics for videos, streams, and podcasts.
        </span>
        <span className="inline-flex items-center gap-1 font-semibold text-white underline-offset-4 group-hover:underline">
          Try Musefy
          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </span>
      </Link>
    </div>
  )
}
