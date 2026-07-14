"use client"

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Database,
  Disc3,
  Headphones,
  Info,
  ListMusic,
  Mic2,
  Play,
  Radio,
  RotateCcw,
  Shuffle,
  SkipForward,
  Sparkles,
  WifiOff,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { SpotifyAnalysis } from "@/lib/spotify-analysis"

interface SpotifyDashboardProps {
  analysis: SpotifyAnalysis
  onReset: () => void
}

const insightToneClasses: Record<SpotifyAnalysis["insights"][number]["tone"], string> = {
  green: "border-emerald-400/20 bg-emerald-400/[0.07] text-emerald-200",
  violet: "border-violet-400/20 bg-violet-400/[0.07] text-violet-200",
  amber: "border-amber-400/20 bg-amber-400/[0.07] text-amber-200",
  sky: "border-sky-400/20 bg-sky-400/[0.07] text-sky-200",
}

function formatNumber(value: number, maximumFractionDigits = 1): string {
  return value.toLocaleString(undefined, { maximumFractionDigits })
}

function formatHours(hours: number): string {
  if (hours < 1) return `${Math.round(hours * 60)} min`
  return `${formatNumber(hours)} hr`
}

function formatPercentage(value: number | undefined): string {
  if (value === undefined) return "—"
  if (value > 0 && value < 0.1) return "<0.1%"
  return `${formatNumber(value)}%`
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function formatMonth(month: string): string {
  return new Date(`${month}-01T00:00:00`).toLocaleDateString(undefined, {
    month: "short",
    year: "2-digit",
  })
}

function MonthlyTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  const item = payload[0]?.payload
  return (
    <div className="rounded-xl border border-white/10 bg-zinc-950/95 px-4 py-3 text-sm shadow-2xl backdrop-blur">
      <p className="mb-2 font-medium text-white">{formatMonth(label)}</p>
      <p className="text-[#4ade80]">{formatNumber(item.hours, 2)} listening hours</p>
      <p className="mt-1 text-zinc-400">{item.plays.toLocaleString()} qualified plays</p>
    </div>
  )
}

function RhythmTooltip({ active, payload, label, unit, formatLabel = (value: unknown) => String(value) }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-white/10 bg-zinc-950/95 px-4 py-3 text-sm shadow-2xl backdrop-blur">
      <p className="font-medium text-white">{formatLabel(label)}</p>
      <p className="mt-1 text-[#4ade80]">
        {formatNumber(Number(payload[0]?.value || 0))} {unit}
      </p>
    </div>
  )
}

function ChartCard({
  title,
  description,
  children,
  className = "",
}: {
  title: string
  description: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <Card className={`border-white/10 bg-white/[0.035] text-white shadow-xl shadow-black/10 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{title}</CardTitle>
        <p className="text-sm leading-6 text-zinc-400">{description}</p>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

function RankingRow({
  rank,
  title,
  subtitle,
  value,
  percentage,
}: {
  rank: number
  title: string
  subtitle: string
  value: string
  percentage: number
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 transition-colors hover:bg-white/[0.05]">
      <div
        className="absolute inset-y-0 left-0 bg-[#1DB954]/[0.08] transition-all group-hover:bg-[#1DB954]/[0.12]"
        style={{ width: `${Math.max(2, percentage)}%` }}
      />
      <div className="relative flex items-center gap-3">
        <span className="w-7 shrink-0 font-mono text-sm font-semibold text-[#4ade80]">{String(rank).padStart(2, "0")}</span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-white" title={title}>{title}</p>
          <p className="mt-1 truncate text-xs text-zinc-500" title={subtitle}>{subtitle}</p>
        </div>
        <span className="shrink-0 text-sm font-semibold text-zinc-200">{value}</span>
      </div>
    </div>
  )
}

export default function SpotifyDashboard({ analysis, onReset }: SpotifyDashboardProps) {
  const { summary, source, behavior } = analysis
  const maxArtistHours = analysis.topArtists[0]?.hours || 1
  const maxTrackPlays = Math.max(1, ...analysis.topTracks.map((track) => track.plays))
  const monthTickInterval = Math.max(0, Math.ceil(analysis.monthly.length / 8) - 1)
  const sourceLabel = source.format === "extended"
    ? "Extended history"
    : source.format === "mixed"
      ? "Extended + newer standard history"
      : "Standard history"

  const statCards = [
    {
      label: "Listening time",
      value: formatNumber(summary.totalHours),
      suffix: "hours",
      detail: `${formatNumber(summary.totalHours / 24)} days with music`,
      icon: Headphones,
    },
    {
      label: "Qualified plays",
      value: summary.totalPlays.toLocaleString(),
      suffix: "30s+",
      detail: `${summary.totalEvents.toLocaleString()} listening events`,
      icon: Play,
    },
    {
      label: "Different tracks",
      value: summary.uniqueTracks.toLocaleString(),
      suffix: "tracks",
      detail: `${summary.activeDays.toLocaleString()} active days`,
      icon: Disc3,
    },
    {
      label: "Artist universe",
      value: summary.uniqueArtists.toLocaleString(),
      suffix: "artists",
      detail: `${summary.longestStreak} day longest streak`,
      icon: Mic2,
    },
  ]

  const behaviorCards = [
    { label: "Skip rate", value: behavior.skipRate, icon: SkipForward },
    { label: "Shuffle on", value: behavior.shuffleRate, icon: Shuffle },
    { label: "Offline", value: behavior.offlineRate, icon: WifiOff },
    { label: "Ended naturally", value: behavior.trackDoneRate, icon: CheckCircle2 },
  ]

  return (
    <div id="spotify-dashboard" className="scroll-mt-28 space-y-8 pb-20">
      <section className="flex flex-col justify-between gap-5 border-b border-white/10 pb-8 lg:flex-row lg:items-end">
        <div>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#1DB954]/25 bg-[#1DB954]/10 px-3 py-1 text-xs font-medium text-[#4ade80]">
              <Database className="h-3.5 w-3.5" aria-hidden="true" />
              {sourceLabel}
            </span>
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-zinc-400">
              {source.recognizedFiles} {source.recognizedFiles === 1 ? "file" : "files"} analyzed
            </span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Your listening, in full view</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
            {formatDate(summary.firstPlayedAt)} – {formatDate(summary.lastPlayedAt)} · Times are displayed in this browser&apos;s local timezone.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          className="w-full border-white/15 bg-white/[0.04] text-white hover:bg-white/10 hover:text-white sm:w-auto"
          onClick={onReset}
        >
          <RotateCcw className="mr-2 h-4 w-4" aria-hidden="true" />
          Analyze different files
        </Button>
      </section>

      <section aria-label="Listening summary" className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label} className="overflow-hidden border-white/10 bg-white/[0.04] text-white">
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">{stat.label}</p>
                  <Icon className="hidden h-4 w-4 shrink-0 text-[#4ade80] sm:block" aria-hidden="true" />
                </div>
                <div className="mt-4 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                  <strong className="text-2xl font-bold tracking-tight text-white sm:text-3xl">{stat.value}</strong>
                  <span className="text-xs text-[#4ade80]">{stat.suffix}</span>
                </div>
                <p className="mt-2 text-xs leading-5 text-zinc-500">{stat.detail}</p>
              </CardContent>
            </Card>
          )
        })}
      </section>

      <section aria-labelledby="listening-story-title">
        <div className="mb-4 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[#4ade80]" aria-hidden="true" />
          <h2 id="listening-story-title" className="text-sm font-semibold uppercase tracking-[0.16em] text-zinc-300">
            Your listening story
          </h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {analysis.insights.map((insight) => (
            <article key={insight.eyebrow} className={`rounded-2xl border p-5 ${insightToneClasses[insight.tone]}`}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] opacity-70">{insight.eyebrow}</p>
              <h3 className="mt-4 text-lg font-semibold leading-snug text-white">{insight.title}</h3>
              <p className="mt-2 text-sm leading-6 text-zinc-300">{insight.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <ChartCard
          className="lg:col-span-2"
          title="Listening over time"
          description="Total listening hours by month, including short listening events."
        >
          <div className="h-[310px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analysis.monthly} margin={{ top: 12, right: 8, left: -22, bottom: 0 }}>
                <defs>
                  <linearGradient id="spotifyMonthlyArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1DB954" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="#1DB954" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.07)" strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  interval={monthTickInterval}
                  tickFormatter={formatMonth}
                  tick={{ fill: "#71717a", fontSize: 11 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#71717a", fontSize: 11 }}
                  tickFormatter={(value) => `${formatNumber(Number(value), 0)}h`}
                />
                <Tooltip content={<MonthlyTooltip />} />
                <Area
                  type="monotone"
                  dataKey="hours"
                  stroke="#1DB954"
                  strokeWidth={2.5}
                  fill="url(#spotifyMonthlyArea)"
                  activeDot={{ r: 5, fill: "#4ade80", stroke: "#09090b", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard
          title="The years in music"
          description="A year-by-year view of time, qualified plays, and artist breadth."
        >
          <div className="max-h-[310px] space-y-2 overflow-auto pr-1">
            {[...analysis.yearly].reverse().map((year) => (
              <div key={year.year} className="rounded-xl border border-white/[0.07] bg-black/10 p-3">
                <div className="flex items-center justify-between gap-3">
                  <strong className="text-lg text-white">{year.year}</strong>
                  <span className="text-sm font-semibold text-[#4ade80]">{formatHours(year.hours)}</span>
                </div>
                <p className="mt-1 text-xs text-zinc-500">
                  {year.plays.toLocaleString()} plays · {year.uniqueArtists.toLocaleString()} artists
                </p>
              </div>
            ))}
          </div>
        </ChartCard>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <ChartCard
          title="Your listening clock"
          description="Total minutes by hour of day, converted to your current browser timezone."
        >
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analysis.hourly} margin={{ top: 12, right: 8, left: -25, bottom: 0 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.07)" strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="hour"
                  axisLine={false}
                  tickLine={false}
                  interval={2}
                  tickFormatter={(hour) => `${String(hour).padStart(2, "0")}:00`}
                  tick={{ fill: "#71717a", fontSize: 10 }}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#71717a", fontSize: 11 }} />
                <Tooltip
                  content={(
                    <RhythmTooltip
                      unit="minutes"
                      formatLabel={(hour: number) => `${String(hour).padStart(2, "0")}:00`}
                    />
                  )}
                  cursor={{ fill: "rgba(255,255,255,0.04)" }}
                />
                <Bar dataKey="minutes" radius={[5, 5, 0, 0]}>
                  {analysis.hourly.map((entry) => (
                    <Cell
                      key={entry.hour}
                      fill={entry.hour >= 18 || entry.hour < 5 ? "#8b5cf6" : "#1DB954"}
                      fillOpacity={0.85}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard
          title="Your week in music"
          description="Total listening minutes by weekday across the imported history."
        >
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analysis.weekdays} margin={{ top: 12, right: 8, left: -25, bottom: 0 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.07)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="shortDay" axisLine={false} tickLine={false} tick={{ fill: "#a1a1aa", fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#71717a", fontSize: 11 }} />
                <Tooltip
                  content={<RhythmTooltip unit="minutes" />}
                  cursor={{ fill: "rgba(255,255,255,0.04)" }}
                />
                <Bar dataKey="minutes" fill="#1DB954" radius={[7, 7, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <ChartCard
          title="Artists that stayed"
          description="Ranked by total listening time, not raw event count."
        >
          <div className="space-y-2">
            {analysis.topArtists.map((artist, index) => (
              <RankingRow
                key={artist.name}
                rank={index + 1}
                title={artist.name}
                subtitle={`${artist.plays.toLocaleString()} qualified plays · ${artist.uniqueTracks.toLocaleString()} tracks`}
                value={formatHours(artist.hours)}
                percentage={(artist.hours / maxArtistHours) * 100}
              />
            ))}
          </div>
        </ChartCard>

        <ChartCard
          title="Tracks on repeat"
          description="Ranked by qualified plays of 30 seconds or longer."
        >
          <div className="space-y-2">
            {analysis.topTracks.map((track, index) => (
              <RankingRow
                key={`${track.artist}-${track.name}`}
                rank={index + 1}
                title={track.name}
                subtitle={`${track.artist}${track.album ? ` · ${track.album}` : ""} · ${formatHours(track.hours)}`}
                value={`${track.plays.toLocaleString()} plays`}
                percentage={(track.plays / maxTrackPlays) * 100}
              />
            ))}
          </div>
        </ChartCard>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <ChartCard
          className="lg:col-span-2"
          title="How you press play"
          description={behavior.hasExtendedData
            ? "Behavior fields from Extended Streaming History. These describe playback events, not your personality."
            : "These fields are not included in standard Spotify account history."
          }
        >
          {behavior.hasExtendedData ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {behaviorCards.map((item) => {
                const Icon = item.icon
                return (
                  <div key={item.label} className="rounded-2xl border border-white/[0.07] bg-black/10 p-4">
                    <Icon className="h-4 w-4 text-[#4ade80]" aria-hidden="true" />
                    <p className="mt-4 text-2xl font-bold text-white">
                      {formatPercentage(item.value)}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">{item.label}</p>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="flex items-start gap-3 rounded-2xl border border-amber-300/15 bg-amber-300/[0.06] p-4 text-sm leading-6 text-amber-100">
              <Info className="mt-1 h-4 w-4 shrink-0" aria-hidden="true" />
              Upload Extended Streaming History to unlock skip, shuffle, offline, platform, album, and playback-reason insights.
            </div>
          )}
        </ChartCard>

        <ChartCard
          title="Listening surfaces"
          description="Top platforms by listening time in your extended export."
        >
          {analysis.platforms.length > 0 ? (
            <div className="space-y-4">
              {analysis.platforms.map((platform, index) => (
                <div key={platform.name}>
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="flex min-w-0 items-center gap-2 text-zinc-300">
                      {index === 0 ? <Radio className="h-3.5 w-3.5 shrink-0 text-[#4ade80]" /> : null}
                      <span className="truncate" title={platform.name}>{platform.name}</span>
                    </span>
                    <span className="shrink-0 text-zinc-500">{platform.share}%</span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-[#1DB954]" style={{ width: `${platform.share}%` }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-36 flex-col items-center justify-center text-center text-sm text-zinc-500">
              <ListMusic className="mb-3 h-5 w-5" aria-hidden="true" />
              Platform data is unavailable in this export.
            </div>
          )}
        </ChartCard>
      </section>

      <section className="grid gap-3 rounded-2xl border border-white/10 bg-white/[0.025] p-5 text-sm text-zinc-400 sm:grid-cols-3">
        <div className="flex items-start gap-3">
          <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-[#4ade80]" aria-hidden="true" />
          <p>
            Your biggest day was <strong className="font-medium text-zinc-200">{analysis.peakDay.date}</strong> with {formatHours(analysis.peakDay.hours)}.
          </p>
        </div>
        <div className="flex items-start gap-3">
          <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-[#4ade80]" aria-hidden="true" />
          <p>
            You average <strong className="font-medium text-zinc-200">{formatNumber(summary.averageMinutesPerActiveDay)} minutes</strong> per active listening day.
          </p>
        </div>
        <div className="flex items-start gap-3">
          <Database className="mt-0.5 h-4 w-4 shrink-0 text-[#4ade80]" aria-hidden="true" />
          <p>
            {source.duplicateRecordsOmitted + source.overlapRecordsOmitted > 0
              ? `${(source.duplicateRecordsOmitted + source.overlapRecordsOmitted).toLocaleString()} duplicate or overlapping records were omitted.`
              : "No duplicate or overlapping records needed to be removed."}
          </p>
        </div>
      </section>
    </div>
  )
}
