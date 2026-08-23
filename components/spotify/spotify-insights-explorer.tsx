import {
  ArrowDownRight,
  ArrowUpRight,
  Clock3,
  Disc3,
  Layers3,
  Repeat2,
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { SpotifyAnalysis } from "@/lib/spotify-analysis"

interface SpotifyInsightsExplorerProps {
  analysis: SpotifyAnalysis
}

function formatNumber(value: number, maximumFractionDigits = 1): string {
  return value.toLocaleString(undefined, { maximumFractionDigits })
}

function formatHours(hours: number): string {
  if (hours < 1) return `${Math.round(hours * 60)} min`
  return `${formatNumber(hours)} hr`
}

function formatChange(value: number | undefined, suffix = "%"): string {
  if (value === undefined) return "—"
  return `${value > 0 ? "+" : ""}${formatNumber(value)}${suffix}`
}

export default function SpotifyInsightsExplorer({ analysis }: SpotifyInsightsExplorerProps) {
  const { comparison, listeningPattern } = analysis
  const maxHeatMinutes = Math.max(1, ...analysis.weekdayHours.map((item) => item.minutes))
  const comparisonItems = comparison
    ? [
        { label: "Listening time", value: comparison.totalHoursChange },
        { label: "Active days", value: comparison.activeDaysChange },
        { label: "Different artists", value: comparison.uniqueArtistsChange },
        { label: "Different tracks", value: comparison.uniqueTracksChange },
      ]
    : []

  return (
    <div className="space-y-4">
      {comparison ? (
        <section aria-labelledby="spotify-period-comparison-title">
          <div className="mb-4">
            <h2 id="spotify-period-comparison-title" className="text-lg font-semibold text-white">
              How this period changed
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              Compared with {comparison.label}. Percentages use the same-length period where possible.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {comparisonItems.map((item) => {
              const positive = (item.value || 0) >= 0
              const Icon = positive ? ArrowUpRight : ArrowDownRight
              return (
                <Card key={item.label} className="border-white/10 bg-white/[0.035] text-white">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs text-zinc-500">{item.label}</p>
                      {item.value !== undefined ? (
                        <Icon
                          className={`h-4 w-4 ${positive ? "text-emerald-300" : "text-amber-300"}`}
                          aria-hidden="true"
                        />
                      ) : null}
                    </div>
                    <p className={`mt-3 text-2xl font-bold ${positive ? "text-emerald-200" : "text-amber-200"}`}>
                      {formatChange(item.value)}
                    </p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </section>
      ) : null}

      <section className="grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
        <Card className="border-white/10 bg-white/[0.035] text-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Your week, hour by hour</CardTitle>
            <p className="text-sm leading-6 text-zinc-400">
              Listening minutes across every weekday and hour in the selected period.
            </p>
          </CardHeader>
          <CardContent>
            <TooltipProvider delayDuration={100} skipDelayDuration={50}>
              <div className="overflow-x-auto pb-2">
                <div className="min-w-[760px]">
                  <div
                    className="grid items-center gap-1"
                    style={{ gridTemplateColumns: "48px repeat(24, minmax(18px, 1fr))" }}
                  >
                    <span />
                    {Array.from({ length: 24 }, (_, hour) => (
                      <span key={hour} className="text-center text-[9px] text-zinc-600">
                        {hour % 3 === 0 ? String(hour).padStart(2, "0") : ""}
                      </span>
                    ))}
                    {analysis.weekdays.map((weekday) => (
                      <div key={weekday.day} className="contents">
                        <span className="pr-2 text-xs text-zinc-500">{weekday.shortDay}</span>
                        {analysis.weekdayHours
                          .filter((item) => item.day === weekday.day)
                          .map((item) => {
                            const intensity = item.minutes / maxHeatMinutes
                            const hourLabel = `${String(item.hour).padStart(2, "0")}:00`
                            const playLabel = `${item.plays.toLocaleString()} qualified ${item.plays === 1 ? "play" : "plays"}`
                            return (
                              <Tooltip key={`${item.day}-${item.hour}`}>
                                <TooltipTrigger asChild>
                                  <button
                                    type="button"
                                    className="block aspect-square w-full cursor-default rounded-[4px] border border-white/[0.04] p-0 transition-transform hover:scale-110 hover:ring-1 hover:ring-white/40 focus-visible:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4ade80]"
                                    style={{
                                      backgroundColor: `rgba(29, 185, 84, ${0.05 + intensity * 0.9})`,
                                    }}
                                    aria-label={`${item.day} at ${hourLabel}: ${formatNumber(item.minutes)} listening minutes and ${playLabel}`}
                                  />
                                </TooltipTrigger>
                                <TooltipContent
                                  side="top"
                                  sideOffset={8}
                                  className="border-white/10 bg-zinc-900 px-3 py-2 text-white shadow-xl shadow-black/40"
                                >
                                  <p className="text-xs font-semibold text-zinc-200">{item.day} · {hourLabel}</p>
                                  <p className="mt-1 whitespace-nowrap text-xs text-zinc-400">
                                    <strong className="font-semibold text-white">{formatNumber(item.minutes)}</strong> listening minutes · {playLabel}
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            )
                          })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TooltipProvider>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/[0.035] text-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Listening shape</CardTitle>
            <p className="text-sm leading-6 text-zinc-400">
              Sessions are estimates separated by at least 30 minutes without playback.
            </p>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            {[
              {
                label: "Estimated sessions",
                value: listeningPattern.sessionCount.toLocaleString(),
                icon: Clock3,
              },
              {
                label: "Average session",
                value: `${formatNumber(listeningPattern.averageSessionMinutes)} min`,
                icon: Layers3,
              },
              {
                label: "Repeat plays",
                value: `${formatNumber(listeningPattern.repeatRate)}%`,
                icon: Repeat2,
              },
              {
                label: "Weekend listening",
                value: `${formatNumber(listeningPattern.weekendShare)}%`,
                icon: Disc3,
              },
            ].map((item) => {
              const Icon = item.icon
              return (
                <div key={item.label} className="rounded-2xl border border-white/[0.07] bg-black/10 p-4">
                  <Icon className="h-4 w-4 text-[#4ade80]" aria-hidden="true" />
                  <p className="mt-4 text-xl font-bold text-white">{item.value}</p>
                  <p className="mt-1 text-xs leading-5 text-zinc-500">{item.label}</p>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="border-white/10 bg-white/[0.035] text-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Albums you lived with</CardTitle>
            <p className="text-sm leading-6 text-zinc-400">
              Ranked by listening time. Album metadata is available in Extended Streaming History.
            </p>
          </CardHeader>
          <CardContent>
            {analysis.topAlbums.length > 0 ? (
              <div className="space-y-2">
                {analysis.topAlbums.map((album, index) => (
                  <div key={`${album.artist}-${album.name}`} className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-black/10 p-3">
                    <span className="w-6 font-mono text-xs text-[#4ade80]">{String(index + 1).padStart(2, "0")}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-white" title={album.name}>{album.name}</p>
                      <p className="mt-1 truncate text-xs text-zinc-500">
                        {album.artist} · {album.uniqueTracks.toLocaleString()} tracks
                      </p>
                    </div>
                    <span className="shrink-0 text-sm font-semibold text-zinc-300">{formatHours(album.hours)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="rounded-2xl border border-amber-300/15 bg-amber-300/[0.06] p-4 text-sm leading-6 text-amber-100">
                Album rankings need Extended Streaming History.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/[0.035] text-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Changing rotation</CardTitle>
            <p className="text-sm leading-6 text-zinc-400">
              Artists with the largest listening-time changes versus the comparison period.
            </p>
          </CardHeader>
          <CardContent>
            {comparison && (analysis.artistMovements.rising.length > 0 || analysis.artistMovements.cooling.length > 0) ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-300">Rising</p>
                  <div className="space-y-2">
                    {analysis.artistMovements.rising.map((artist) => (
                      <div key={artist.name} className="rounded-xl bg-emerald-400/[0.06] p-3 ring-1 ring-inset ring-emerald-400/10">
                        <p className="truncate text-sm font-medium text-white" title={artist.name}>{artist.name}</p>
                        <p className="mt-1 text-xs text-emerald-200">+{formatHours(artist.changeHours)}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-amber-300">Cooling</p>
                  <div className="space-y-2">
                    {analysis.artistMovements.cooling.map((artist) => (
                      <div key={artist.name} className="rounded-xl bg-amber-400/[0.06] p-3 ring-1 ring-inset ring-amber-400/10">
                        <p className="truncate text-sm font-medium text-white" title={artist.name}>{artist.name}</p>
                        <p className="mt-1 text-xs text-amber-200">{formatHours(Math.abs(artist.changeHours))} less</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="rounded-2xl border border-white/[0.07] bg-black/10 p-4 text-sm leading-6 text-zinc-500">
                Choose Latest 12 months or a year with an earlier comparison period to see artist movement.
              </p>
            )}
          </CardContent>
        </Card>
      </section>

      {analysis.platformBehavior.length > 0 ? (
        <Card className="border-white/10 bg-white/[0.035] text-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Behavior by listening surface</CardTitle>
            <p className="text-sm leading-6 text-zinc-400">
              Playback outcomes for the most-used platforms in Extended Streaming History.
            </p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px] text-left text-sm">
                <thead className="text-xs uppercase tracking-[0.12em] text-zinc-600">
                  <tr>
                    <th className="pb-3 font-medium">Platform</th>
                    <th className="pb-3 text-right font-medium">Time</th>
                    <th className="pb-3 text-right font-medium">Events</th>
                    <th className="pb-3 text-right font-medium">Skipped</th>
                    <th className="pb-3 text-right font-medium">Ended naturally</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06]">
                  {analysis.platformBehavior.map((platform) => (
                    <tr key={platform.name}>
                      <td className="max-w-[260px] truncate py-3 pr-4 text-zinc-300" title={platform.name}>{platform.name}</td>
                      <td className="py-3 text-right text-zinc-400">{formatHours(platform.hours)}</td>
                      <td className="py-3 text-right text-zinc-400">{platform.events.toLocaleString()}</td>
                      <td className="py-3 text-right text-zinc-400">
                        {platform.skipRate === undefined ? "—" : `${formatNumber(platform.skipRate)}%`}
                      </td>
                      <td className="py-3 text-right text-zinc-400">
                        {platform.trackDoneRate === undefined ? "—" : `${formatNumber(platform.trackDoneRate)}%`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
