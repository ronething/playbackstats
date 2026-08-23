import { ExternalLink, Play, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { SpotifyRankedTrack } from "@/lib/spotify-analysis"
import { buildSpotifySearchUrl, buildSpotifyTrackLinks } from "@/lib/spotify-links"

interface SpotifyTrackRankingRowProps {
  activeTrackId: string | null
  maxPlays: number
  onActiveTrackChange: (trackId: string | null) => void
  rank: number
  track: SpotifyRankedTrack
}

function formatHours(hours: number): string {
  if (hours < 1) return `${Math.round(hours * 60)} min`
  return `${hours.toLocaleString(undefined, { maximumFractionDigits: 1 })} hr`
}

export default function SpotifyTrackRankingRow({
  activeTrackId,
  maxPlays,
  onActiveTrackChange,
  rank,
  track,
}: SpotifyTrackRankingRowProps) {
  const links = buildSpotifyTrackLinks(track.trackUri)
  const isActive = Boolean(links && activeTrackId === links.trackId)
  const percentage = (track.plays / maxPlays) * 100

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.025] transition-colors hover:bg-white/[0.05]">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[72px] bg-[#1DB954]/[0.08]"
        style={{ width: `${Math.max(2, percentage)}%` }}
      />
      <div className="relative flex items-center gap-3 p-4">
        <span className="w-7 shrink-0 font-mono text-sm font-semibold text-[#4ade80]">
          {String(rank).padStart(2, "0")}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-white" title={track.name}>{track.name}</p>
          <p className="mt-1 truncate text-xs text-zinc-500" title={`${track.artist}${track.album ? ` · ${track.album}` : ""}`}>
            {track.artist}{track.album ? ` · ${track.album}` : ""} · {formatHours(track.hours)}
          </p>
        </div>
        <span className="hidden shrink-0 text-sm font-semibold text-zinc-200 sm:block">
          {track.plays.toLocaleString()} plays
        </span>
        {links ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-8 shrink-0 border-[#1DB954]/25 bg-[#1DB954]/10 px-2.5 text-xs text-emerald-200 hover:bg-[#1DB954]/20 hover:text-white"
            aria-expanded={isActive}
            onClick={() => onActiveTrackChange(isActive ? null : links.trackId)}
          >
            {isActive ? <X className="mr-1.5 h-3.5 w-3.5" /> : <Play className="mr-1.5 h-3.5 w-3.5" />}
            {isActive ? "Close" : "Play"}
          </Button>
        ) : (
          <a
            href={buildSpotifySearchUrl(track.name, track.artist)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-8 shrink-0 items-center rounded-md border border-white/10 bg-white/[0.04] px-2.5 text-xs text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
          >
            Search
            <ExternalLink className="ml-1.5 h-3 w-3" aria-hidden="true" />
          </a>
        )}
      </div>

      {isActive && links ? (
        <div className="relative border-t border-white/[0.07] bg-black/20 p-3">
          <iframe
            src={links.embedUrl}
            title={`Spotify player for ${track.name} by ${track.artist}`}
            width="100%"
            height="152"
            loading="lazy"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            referrerPolicy="strict-origin-when-cross-origin"
            className="rounded-xl border-0"
          />
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-zinc-500">
            <span>Player supplied by Spotify. Playback availability depends on Spotify and your region.</span>
            <a
              href={links.spotifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-zinc-400 underline-offset-4 hover:text-white hover:underline"
            >
              Open in Spotify
              <ExternalLink className="ml-1 h-3 w-3" aria-hidden="true" />
            </a>
          </div>
        </div>
      ) : null}
    </div>
  )
}
