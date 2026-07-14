export type SpotifySourceFormat = "extended" | "standard" | "mixed"

export interface SpotifyStream {
  timestamp: number
  msPlayed: number
  artist: string
  track: string
  album?: string
  trackUri?: string
  platform?: string
  reasonEnd?: string
  shuffle?: boolean
  skipped?: boolean
  offline?: boolean
  source: Exclude<SpotifySourceFormat, "mixed">
}

export interface ParsedSpotifyExport {
  extended: SpotifyStream[]
  standard: SpotifyStream[]
}

export interface SpotifySourceSummary {
  format: SpotifySourceFormat
  recognizedFiles: number
  ignoredFiles: number
  inputRecords: number
  retainedRecords: number
  extendedRecords: number
  standardRecords: number
  duplicateRecordsOmitted: number
  overlapRecordsOmitted: number
}

export interface SpotifyRankedArtist {
  name: string
  hours: number
  plays: number
  uniqueTracks: number
  share: number
}

export interface SpotifyRankedTrack {
  name: string
  artist: string
  album?: string
  hours: number
  plays: number
}

export interface SpotifyInsight {
  eyebrow: string
  title: string
  body: string
  tone: "green" | "violet" | "amber" | "sky"
}

export interface SpotifyAnalysis {
  source: SpotifySourceSummary
  summary: {
    totalHours: number
    totalPlays: number
    totalEvents: number
    uniqueTracks: number
    uniqueArtists: number
    activeDays: number
    spanDays: number
    averageMinutesPerActiveDay: number
    longestStreak: number
    firstPlayedAt: number
    lastPlayedAt: number
  }
  monthly: { month: string; hours: number; plays: number }[]
  hourly: { hour: number; minutes: number; plays: number }[]
  weekdays: { day: string; shortDay: string; minutes: number; plays: number }[]
  yearly: { year: string; hours: number; plays: number; uniqueArtists: number }[]
  topArtists: SpotifyRankedArtist[]
  topTracks: SpotifyRankedTrack[]
  platforms: { name: string; hours: number; share: number }[]
  behavior: {
    hasExtendedData: boolean
    skipRate?: number
    shuffleRate?: number
    offlineRate?: number
    trackDoneRate?: number
  }
  peakDay: { date: string; hours: number; plays: number }
  insights: SpotifyInsight[]
}

interface MergeSpotifyOptions {
  recognizedFiles: number
  ignoredFiles: number
}

interface MergedSpotifyStreams {
  streams: SpotifyStream[]
  source: SpotifySourceSummary
}

const MIN_PLAY_MS = 30_000
const HOUR_MS = 60 * 60 * 1000
const DAY_MS = 24 * HOUR_MS

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value)
}

function stringValue(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined
  const normalized = value.trim()
  return normalized || undefined
}

function booleanValue(value: unknown): boolean | undefined {
  return typeof value === "boolean" ? value : undefined
}

function numberValue(value: unknown): number | undefined {
  if (typeof value !== "number" && typeof value !== "string") return undefined
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

function parseTimestamp(value: unknown): number | undefined {
  if (typeof value !== "string") return undefined

  // Spotify's standard export omits a timezone and uses a space separator.
  const normalized = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(value)
    ? `${value.replace(" ", "T")}:00Z`
    : value
  const timestamp = new Date(normalized).getTime()
  return Number.isFinite(timestamp) ? timestamp : undefined
}

function normalizeExtendedRecord(record: Record<string, unknown>): SpotifyStream | null {
  if (!("ts" in record) || !("ms_played" in record)) return null

  const timestamp = parseTimestamp(record.ts)
  const msPlayed = numberValue(record.ms_played)
  const artist = stringValue(record.master_metadata_album_artist_name)
  const track = stringValue(record.master_metadata_track_name)

  // Podcast episodes and audiobook chapters share the extended export schema.
  // The music analyzer intentionally keeps only records with track metadata.
  if (timestamp === undefined || msPlayed === undefined || !artist || !track) return null

  return {
    timestamp,
    msPlayed: Math.max(0, msPlayed),
    artist,
    track,
    album: stringValue(record.master_metadata_album_album_name),
    trackUri: stringValue(record.spotify_track_uri),
    platform: stringValue(record.platform),
    reasonEnd: stringValue(record.reason_end),
    shuffle: booleanValue(record.shuffle),
    skipped: booleanValue(record.skipped),
    offline: booleanValue(record.offline),
    source: "extended",
  }
}

function normalizeStandardRecord(record: Record<string, unknown>): SpotifyStream | null {
  if (!("endTime" in record) || !("msPlayed" in record)) return null

  const timestamp = parseTimestamp(record.endTime)
  const msPlayed = numberValue(record.msPlayed)
  const artist = stringValue(record.artistName)
  const track = stringValue(record.trackName)
  if (timestamp === undefined || msPlayed === undefined || !artist || !track) return null

  return {
    timestamp,
    msPlayed: Math.max(0, msPlayed),
    artist,
    track,
    source: "standard",
  }
}

export function parseSpotifyExport(data: unknown): ParsedSpotifyExport {
  const records = Array.isArray(data)
    ? data
    : isRecord(data) && Array.isArray(data.items)
      ? data.items
      : []

  const extended: SpotifyStream[] = []
  const standard: SpotifyStream[] = []

  records.forEach((value) => {
    if (!isRecord(value)) return

    const extendedStream = normalizeExtendedRecord(value)
    if (extendedStream) {
      extended.push(extendedStream)
      return
    }

    const standardStream = normalizeStandardRecord(value)
    if (standardStream) standard.push(standardStream)
  })

  return { extended, standard }
}

export function mergeSpotifyStreams(
  extendedInput: SpotifyStream[],
  standardInput: SpotifyStream[],
  options: MergeSpotifyOptions,
): MergedSpotifyStreams {
  let retainedStandard = standardInput
  let overlapRecordsOmitted = 0

  // The standard export normally overlaps the complete extended export. Keep
  // standard records only when they extend beyond the imported extended range.
  if (extendedInput.length > 0 && retainedStandard.length > 0) {
    const { firstExtended, lastExtended } = extendedInput.reduce(
      (range, stream) => ({
        firstExtended: Math.min(range.firstExtended, stream.timestamp),
        lastExtended: Math.max(range.lastExtended, stream.timestamp),
      }),
      { firstExtended: Number.POSITIVE_INFINITY, lastExtended: Number.NEGATIVE_INFINITY },
    )
    retainedStandard = standardInput.filter(
      (stream) => stream.timestamp < firstExtended || stream.timestamp > lastExtended,
    )
    overlapRecordsOmitted = standardInput.length - retainedStandard.length
  }

  const streams = [...extendedInput, ...retainedStandard].sort(
    (left, right) => left.timestamp - right.timestamp,
  )
  const format: SpotifySourceFormat =
    extendedInput.length > 0 && retainedStandard.length > 0
      ? "mixed"
      : extendedInput.length > 0
        ? "extended"
        : "standard"

  return {
    streams,
    source: {
      format,
      recognizedFiles: options.recognizedFiles,
      ignoredFiles: options.ignoredFiles,
      inputRecords: extendedInput.length + standardInput.length,
      retainedRecords: streams.length,
      extendedRecords: extendedInput.length,
      standardRecords: retainedStandard.length,
      duplicateRecordsOmitted: 0,
      overlapRecordsOmitted,
    },
  }
}

function pad(value: number): string {
  return String(value).padStart(2, "0")
}

function dateKey(timestamp: number): string {
  const date = new Date(timestamp)
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function monthKey(timestamp: number): string {
  const date = new Date(timestamp)
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`
}

function dayNumber(key: string): number {
  const [year, month, day] = key.split("-").map(Number)
  return Date.UTC(year, month - 1, day) / DAY_MS
}

function round(value: number, digits = 1): number {
  const multiplier = 10 ** digits
  return Math.round(value * multiplier) / multiplier
}

function rate(numerator: number, denominator: number): number | undefined {
  return denominator > 0 ? round((numerator / denominator) * 100, 2) : undefined
}

function calculateLongestStreak(keys: string[]): number {
  const days = [...new Set(keys)].map(dayNumber).sort((left, right) => left - right)
  if (days.length === 0) return 0

  let longest = 1
  let current = 1
  for (let index = 1; index < days.length; index += 1) {
    if (days[index] - days[index - 1] === 1) {
      current += 1
      longest = Math.max(longest, current)
    } else {
      current = 1
    }
  }
  return longest
}

function fillMonthlySeries(
  firstTimestamp: number,
  lastTimestamp: number,
  values: Map<string, { ms: number; plays: number }>,
): SpotifyAnalysis["monthly"] {
  const first = new Date(firstTimestamp)
  const last = new Date(lastTimestamp)
  const cursor = new Date(first.getFullYear(), first.getMonth(), 1)
  const end = new Date(last.getFullYear(), last.getMonth(), 1)
  const result: SpotifyAnalysis["monthly"] = []

  while (cursor <= end) {
    const key = `${cursor.getFullYear()}-${pad(cursor.getMonth() + 1)}`
    const value = values.get(key) || { ms: 0, plays: 0 }
    result.push({ month: key, hours: round(value.ms / HOUR_MS, 2), plays: value.plays })
    cursor.setMonth(cursor.getMonth() + 1)
  }

  return result
}

export function analyzeSpotifyStreams(merged: MergedSpotifyStreams): SpotifyAnalysis {
  const { streams, source } = merged
  if (streams.length === 0) {
    throw new Error("No Spotify music streaming records were found.")
  }

  const meaningfulStreams = streams.filter((stream) => stream.msPlayed >= MIN_PLAY_MS)
  const totalMs = streams.reduce((sum, stream) => sum + stream.msPlayed, 0)
  const firstPlayedAt = streams[0].timestamp
  const lastPlayedAt = streams[streams.length - 1].timestamp

  const monthlyMap = new Map<string, { ms: number; plays: number }>()
  const dailyMap = new Map<string, { ms: number; plays: number }>()
  const hourlyMap = Array.from({ length: 24 }, (_, hour) => ({ hour, ms: 0, plays: 0 }))
  const weekdayMap = Array.from({ length: 7 }, () => ({ ms: 0, plays: 0 }))
  const yearlyMap = new Map<string, { ms: number; plays: number; artists: Set<string> }>()
  const artistMap = new Map<string, { displayName: string; ms: number; plays: number; tracks: Set<string> }>()
  const trackMap = new Map<
    string,
    { name: string; artist: string; album?: string; ms: number; plays: number }
  >()
  const platformMap = new Map<string, number>()

  streams.forEach((stream) => {
    const isPlay = stream.msPlayed >= MIN_PLAY_MS
    const month = monthKey(stream.timestamp)
    const day = dateKey(stream.timestamp)
    const date = new Date(stream.timestamp)
    const year = String(date.getFullYear())

    const monthEntry = monthlyMap.get(month) || { ms: 0, plays: 0 }
    monthEntry.ms += stream.msPlayed
    monthEntry.plays += Number(isPlay)
    monthlyMap.set(month, monthEntry)

    const dayEntry = dailyMap.get(day) || { ms: 0, plays: 0 }
    dayEntry.ms += stream.msPlayed
    dayEntry.plays += Number(isPlay)
    dailyMap.set(day, dayEntry)

    const hourEntry = hourlyMap[date.getHours()]
    hourEntry.ms += stream.msPlayed
    hourEntry.plays += Number(isPlay)

    // Convert Sunday-first Date#getDay() to Monday-first data.
    const weekdayIndex = (date.getDay() + 6) % 7
    weekdayMap[weekdayIndex].ms += stream.msPlayed
    weekdayMap[weekdayIndex].plays += Number(isPlay)

    const yearEntry = yearlyMap.get(year) || { ms: 0, plays: 0, artists: new Set<string>() }
    yearEntry.ms += stream.msPlayed
    yearEntry.plays += Number(isPlay)
    if (isPlay) yearEntry.artists.add(stream.artist)
    yearlyMap.set(year, yearEntry)

    const artistKey = stream.artist.toLocaleLowerCase()
    const artistEntry = artistMap.get(artistKey) || {
      displayName: stream.artist,
      ms: 0,
      plays: 0,
      tracks: new Set<string>(),
    }
    artistEntry.ms += stream.msPlayed
    artistEntry.plays += Number(isPlay)
    if (isPlay) artistEntry.tracks.add(stream.track.toLocaleLowerCase())
    artistMap.set(artistKey, artistEntry)

    const trackKey = stream.trackUri || `${artistKey}::${stream.track.toLocaleLowerCase()}`
    const trackEntry = trackMap.get(trackKey) || {
      name: stream.track,
      artist: stream.artist,
      album: stream.album,
      ms: 0,
      plays: 0,
    }
    trackEntry.ms += stream.msPlayed
    trackEntry.plays += Number(isPlay)
    trackMap.set(trackKey, trackEntry)

    if (stream.platform) {
      platformMap.set(stream.platform, (platformMap.get(stream.platform) || 0) + stream.msPlayed)
    }
  })

  const totalPlays = meaningfulStreams.length
  const uniqueTracks = new Set(
    streams.map(
      (stream) => stream.trackUri || `${stream.artist.toLocaleLowerCase()}::${stream.track.toLocaleLowerCase()}`,
    ),
  ).size
  const uniqueArtists = new Set(streams.map((stream) => stream.artist.toLocaleLowerCase())).size
  const activeDayKeys = [...dailyMap.entries()]
    .filter(([, value]) => value.ms > 0)
    .map(([key]) => key)
  const activeDays = activeDayKeys.length
  const spanDays = Math.max(1, dayNumber(dateKey(lastPlayedAt)) - dayNumber(dateKey(firstPlayedAt)) + 1)

  const topArtists = [...artistMap.values()]
    .sort((left, right) => right.ms - left.ms)
    .slice(0, 10)
    .map((entry) => ({
      name: entry.displayName,
      hours: round(entry.ms / HOUR_MS, 1),
      plays: entry.plays,
      uniqueTracks: entry.tracks.size,
      share: totalMs > 0 ? round((entry.ms / totalMs) * 100, 1) : 0,
    }))

  const topTracks = [...trackMap.values()]
    .sort((left, right) => right.plays - left.plays || right.ms - left.ms)
    .slice(0, 10)
    .map((entry) => ({
      name: entry.name,
      artist: entry.artist,
      album: entry.album,
      hours: round(entry.ms / HOUR_MS, 1),
      plays: entry.plays,
    }))

  const weekdays = [
    ["Monday", "Mon"],
    ["Tuesday", "Tue"],
    ["Wednesday", "Wed"],
    ["Thursday", "Thu"],
    ["Friday", "Fri"],
    ["Saturday", "Sat"],
    ["Sunday", "Sun"],
  ].map(([day, shortDay], index) => ({
    day,
    shortDay,
    minutes: round(weekdayMap[index].ms / 60_000, 1),
    plays: weekdayMap[index].plays,
  }))

  const yearly = [...yearlyMap.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([year, value]) => ({
      year,
      hours: round(value.ms / HOUR_MS, 1),
      plays: value.plays,
      uniqueArtists: value.artists.size,
    }))

  const platforms = [...platformMap.entries()]
    .sort(([, left], [, right]) => right - left)
    .slice(0, 5)
    .map(([name, ms]) => ({
      name,
      hours: round(ms / HOUR_MS, 1),
      share: totalMs > 0 ? round((ms / totalMs) * 100, 1) : 0,
    }))

  const peakDayEntry = [...dailyMap.entries()].reduce(
    (peak, entry) => (entry[1].ms > peak[1].ms ? entry : peak),
    ["", { ms: 0, plays: 0 }] as [string, { ms: number; plays: number }],
  )

  const extendedStreams = streams.filter((stream) => stream.source === "extended")
  const skippedKnown = extendedStreams.filter((stream) => stream.skipped !== undefined)
  const shuffleKnown = extendedStreams.filter((stream) => stream.shuffle !== undefined)
  const offlineKnown = extendedStreams.filter((stream) => stream.offline !== undefined)
  const reasonEndKnown = extendedStreams.filter((stream) => Boolean(stream.reasonEnd))
  const behavior: SpotifyAnalysis["behavior"] = {
    hasExtendedData: extendedStreams.length > 0,
    skipRate: rate(skippedKnown.filter((stream) => stream.skipped).length, skippedKnown.length),
    shuffleRate: rate(shuffleKnown.filter((stream) => stream.shuffle).length, shuffleKnown.length),
    offlineRate: rate(offlineKnown.filter((stream) => stream.offline).length, offlineKnown.length),
    trackDoneRate: rate(
      reasonEndKnown.filter((stream) => stream.reasonEnd?.toLocaleLowerCase() === "trackdone").length,
      reasonEndKnown.length,
    ),
  }

  const timePeriods = [
    { name: "late-night", label: "A late-night soundtrack", hours: [0, 1, 2, 3, 4] },
    { name: "morning", label: "A morning soundtrack", hours: [5, 6, 7, 8, 9, 10, 11] },
    { name: "afternoon", label: "An afternoon soundtrack", hours: [12, 13, 14, 15, 16, 17] },
    { name: "evening", label: "An evening soundtrack", hours: [18, 19, 20, 21, 22, 23] },
  ].map((period) => ({
    ...period,
    ms: period.hours.reduce((sum, hour) => sum + hourlyMap[hour].ms, 0),
  }))
  const dominantPeriod = timePeriods.reduce((best, current) => (current.ms > best.ms ? current : best))
  const dominantShare = totalMs > 0 ? Math.round((dominantPeriod.ms / totalMs) * 100) : 0
  const repeatRatio = totalPlays > 0 ? uniqueTracks / totalPlays : 0
  const discoveryTitle = repeatRatio >= 0.55
    ? "You keep the door open"
    : repeatRatio <= 0.25
      ? "You know what you love"
      : "Familiar, with room to roam"
  const discoveryBody = repeatRatio >= 0.55
    ? `${Math.round(repeatRatio * 100)}% of your qualified plays map to a different track — a broad listening mix.`
    : repeatRatio <= 0.25
      ? `Your ${totalPlays.toLocaleString()} qualified plays circle back to ${uniqueTracks.toLocaleString()} tracks.`
      : `You balance repeat favorites with discovery across ${uniqueTracks.toLocaleString()} tracks.`

  const insights: SpotifyInsight[] = [
    {
      eyebrow: "Listening clock",
      title: dominantPeriod.label,
      body: `${dominantShare}% of your listening time lands in the ${dominantPeriod.name} window.`,
      tone: "green",
    },
    {
      eyebrow: "Artist gravity",
      title: topArtists[0]?.name || "A wide-open rotation",
      body: topArtists[0]
        ? `${topArtists[0].share}% of your total listening time belongs to your top artist.`
        : "No single artist dominates your listening history.",
      tone: "violet",
    },
    {
      eyebrow: "Discovery style",
      title: discoveryTitle,
      body: discoveryBody,
      tone: "amber",
    },
    behavior.skipRate !== undefined
      ? {
          eyebrow: "Playback behavior",
          title: behavior.skipRate < 20 ? "You let songs breathe" : "Your skip reflex is active",
          body: `${round(behavior.skipRate, 1)}% of extended-history events are marked as skipped.`,
          tone: "sky",
        }
      : {
          eyebrow: "Listening cadence",
          title: `${calculateLongestStreak(activeDayKeys)} days in a row`,
          body: "That is your longest streak of days with recorded listening time.",
          tone: "sky",
        },
  ]

  return {
    source,
    summary: {
      totalHours: round(totalMs / HOUR_MS, 1),
      totalPlays,
      totalEvents: streams.length,
      uniqueTracks,
      uniqueArtists,
      activeDays,
      spanDays,
      averageMinutesPerActiveDay: activeDays > 0 ? round(totalMs / 60_000 / activeDays, 1) : 0,
      longestStreak: calculateLongestStreak(activeDayKeys),
      firstPlayedAt,
      lastPlayedAt,
    },
    monthly: fillMonthlySeries(firstPlayedAt, lastPlayedAt, monthlyMap),
    hourly: hourlyMap.map((entry) => ({
      hour: entry.hour,
      minutes: round(entry.ms / 60_000, 1),
      plays: entry.plays,
    })),
    weekdays,
    yearly,
    topArtists,
    topTracks,
    platforms,
    behavior,
    peakDay: {
      date: peakDayEntry[0],
      hours: round(peakDayEntry[1].ms / HOUR_MS, 1),
      plays: peakDayEntry[1].plays,
    },
    insights,
  }
}
