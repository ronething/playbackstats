import Link from "next/link"
import { HardDrive } from "lucide-react"

export default function PlaybackFooter() {
  return (
    <footer className="border-t border-white/[0.08] bg-zinc-950 py-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 text-sm text-zinc-500 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <div className="flex items-center gap-2">
          <HardDrive className="h-4 w-4 text-zinc-300" aria-hidden="true" />
          <span>Your history stays on your device · {new Date().getFullYear()}</span>
        </div>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <Link href="/" className="transition-colors hover:text-white">YouTube</Link>
          <Link href="/spotify" className="transition-colors hover:text-white">Spotify</Link>
          <Link href="/privacy" className="transition-colors hover:text-white">Privacy</Link>
          <Link href="/terms" className="transition-colors hover:text-white">Terms</Link>
          <Link
            href="https://github.com/ronething/yt-history"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-white"
          >
            GitHub
          </Link>
        </div>
      </div>
    </footer>
  )
}
