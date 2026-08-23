export type SpotifySourceFormat = "extended" | "standard" | "mixed"

export interface SpotifyStream {
  timestamp: number
  msPlayed: number
  artist: string
  track: string
  album?: string
  trackUri?: string
  platform?: string
  reasonStart?: string
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
  trackUri?: string
  hours: number
  plays: number
}

export interface SpotifyRankedAlbum {
  name: string
  artist: string
  hours: number
  plays: number
  uniqueTracks: number
}

export type SpotifyAnalysisRange = "all" | "last12Months" | `year:${number}`

export interface SpotifyDataset {
  streams: SpotifyStream[]
  source: SpotifySourceSummary
}

export interface SpotifyComparison {
  label: string
  totalHoursChange?: number
  activeDaysChange?: number
  uniqueArtistsChange?: number
  uniqueTracksChange?: number
  skipRatePointChange?: number
}

export interface SpotifyArtistMovement {
  name: string
  currentHours: number
  previousHours: number
  changeHours: number
}

export interface SpotifyInsight {
  eyebrow: string
  title: string
  body: string
  tone: "green" | "violet" | "amber" | "sky"
}

export interface SpotifyAnalysis {
  source: SpotifySourceSummary
  range: {
    selection: SpotifyAnalysisRange
    label: string
    startAt: number
    endAt: number
  }
  comparison?: SpotifyComparison
  summary: {
    totalHours: number
    totalPlays: number
    totalEvents: number
    uniqueTracks: number
    uniqueArtists: number
    qualifiedUniqueTracks: number
    qualifiedUniqueArtists: number
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
  weekdayHours: { day: string; shortDay: string; hour: number; minutes: number; plays: number }[]
  yearly: { year: string; hours: number; plays: number; uniqueArtists: number }[]
  topArtists: SpotifyRankedArtist[]
  topTracks: SpotifyRankedTrack[]
  topAlbums: SpotifyRankedAlbum[]
  artistMovements: {
    rising: SpotifyArtistMovement[]
    cooling: SpotifyArtistMovement[]
  }
  platforms: { name: string; hours: number; share: number }[]
  platformBehavior: {
    name: string
    hours: number
    events: number
    skipRate?: number
    trackDoneRate?: number
  }[]
  behavior: {
    hasExtendedData: boolean
    skipRate?: number
    shuffleRate?: number
    offlineRate?: number
    trackDoneRate?: number
  }
  listeningPattern: {
    weekendShare: number
    weekdayShare: number
    sessionCount: number
    averageSessionMinutes: number
    longestSessionMinutes: number
    averageQualifiedTracksPerSession: number
    varietyRate: number
    repeatRate: number
  }
  peakDay: { date: string; hours: number; plays: number }
  insights: SpotifyInsight[]
}

const MIN_PLAY_MS = 30_000
const HOUR_MS = 60 * 60 * 1000
const DAY_MS = 24 * HOUR_MS
const SESSION_GAP_MS = 30 * 60 * 1000

export { mergeSpotifyStreams, parseSpotifyExport } from "./spotify-import.ts"

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

interface ResolvedSpotifyRange {
  selection: SpotifyAnalysisRange
  label: string
  startAt: number
  endAt: number
  previous?: {
    label: string
    startAt: number
    endAt: number
  }
}

function resolveSpotifyRange(dataset: SpotifyDataset, selection: SpotifyAnalysisRange): ResolvedSpotifyRange {
  const firstTimestamp = dataset.streams[0]?.timestamp
  const lastTimestamp = dataset.streams[dataset.streams.length - 1]?.timestamp
  if (firstTimestamp === undefined || lastTimestamp === undefined) {
    throw new Error("No Spotify music streaming records were found.")
  }

  if (selection === "all") {
    return {
      selection,
      label: "All time",
      startAt: firstTimestamp,
      endAt: lastTimestamp,
    }
  }

  if (selection === "last12Months") {
    const start = new Date(lastTimestamp)
    start.setFullYear(start.getFullYear() - 1)
    const previousStart = new Date(start)
    previousStart.setFullYear(previousStart.getFullYear() - 1)
    return {
      selection,
      label: "Latest 12 months",
      startAt: start.getTime(),
      endAt: lastTimestamp,
      previous: {
        label: "previous 12 months",
        startAt: previousStart.getTime(),
        endAt: start.getTime() - 1,
      },
    }
  }

  const year = Number(selection.slice("year:".length))
  if (!Number.isInteger(year) || year < 1970 || year > 9999) {
    throw new Error("The selected Spotify analysis year is invalid.")
  }
  const startAt = new Date(year, 0, 1).getTime()
  const nextYearAt = new Date(year + 1, 0, 1).getTime()
  const lastDataYear = new Date(lastTimestamp).getFullYear()
  const endAt = year === lastDataYear ? Math.min(lastTimestamp, nextYearAt - 1) : nextYearAt - 1
  const previousStartAt = new Date(year - 1, 0, 1).getTime()

  return {
    selection,
    label: String(year),
    startAt,
    endAt,
    previous: {
      label: String(year - 1),
      startAt: previousStartAt,
      endAt: Math.min(new Date(year, 0, 1).getTime() - 1, previousStartAt + (endAt - startAt)),
    },
  }
}

export function getSpotifyAvailableYears(dataset: SpotifyDataset): number[] {
  return [...new Set(dataset.streams.map((stream) => new Date(stream.timestamp).getFullYear()))]
    .sort((left, right) => right - left)
}

function analyzeSpotifyStreamList(
  streams: SpotifyStream[],
  source: SpotifySourceSummary,
  range: ResolvedSpotifyRange,
): SpotifyAnalysis {
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
  const weekdayHourMap = Array.from({ length: 7 }, () =>
    Array.from({ length: 24 }, () => ({ ms: 0, plays: 0 })),
  )
  const yearlyMap = new Map<string, { ms: number; plays: number; artists: Set<string> }>()
  const artistMap = new Map<string, { displayName: string; ms: number; plays: number; tracks: Set<string> }>()
  const trackMap = new Map<
    string,
    { name: string; artist: string; album?: string; trackUri?: string; ms: number; plays: number }
  >()
  const albumMap = new Map<
    string,
    { name: string; artist: string; ms: number; plays: number; tracks: Set<string> }
  >()
  const platformMap = new Map<string, number>()
  const platformBehaviorMap = new Map<
    string,
    { ms: number; events: number; skipped: number; skippedKnown: number; trackDone: number; reasonEndKnown: number }
  >()

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
    weekdayHourMap[weekdayIndex][date.getHours()].ms += stream.msPlayed
    weekdayHourMap[weekdayIndex][date.getHours()].plays += Number(isPlay)

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
      trackUri: stream.trackUri,
      ms: 0,
      plays: 0,
    }
    trackEntry.ms += stream.msPlayed
    trackEntry.plays += Number(isPlay)
    if (!trackEntry.trackUri && stream.trackUri) trackEntry.trackUri = stream.trackUri
    trackMap.set(trackKey, trackEntry)

    if (stream.album) {
      const albumKey = `${artistKey}::${stream.album.toLocaleLowerCase()}`
      const albumEntry = albumMap.get(albumKey) || {
        name: stream.album,
        artist: stream.artist,
        ms: 0,
        plays: 0,
        tracks: new Set<string>(),
      }
      albumEntry.ms += stream.msPlayed
      albumEntry.plays += Number(isPlay)
      if (isPlay) albumEntry.tracks.add(trackKey)
      albumMap.set(albumKey, albumEntry)
    }

    if (stream.platform) {
      platformMap.set(stream.platform, (platformMap.get(stream.platform) || 0) + stream.msPlayed)
      const platformBehaviorEntry = platformBehaviorMap.get(stream.platform) || {
        ms: 0,
        events: 0,
        skipped: 0,
        skippedKnown: 0,
        trackDone: 0,
        reasonEndKnown: 0,
      }
      platformBehaviorEntry.ms += stream.msPlayed
      platformBehaviorEntry.events += 1
      if (stream.skipped !== undefined) {
        platformBehaviorEntry.skippedKnown += 1
        platformBehaviorEntry.skipped += Number(stream.skipped)
      }
      if (stream.reasonEnd) {
        platformBehaviorEntry.reasonEndKnown += 1
        platformBehaviorEntry.trackDone += Number(stream.reasonEnd.toLocaleLowerCase() === "trackdone")
      }
      platformBehaviorMap.set(stream.platform, platformBehaviorEntry)
    }
  })

  const totalPlays = meaningfulStreams.length
  const uniqueTracks = new Set(
    streams.map(
      (stream) => stream.trackUri || `${stream.artist.toLocaleLowerCase()}::${stream.track.toLocaleLowerCase()}`,
    ),
  ).size
  const uniqueArtists = new Set(streams.map((stream) => stream.artist.toLocaleLowerCase())).size
  const qualifiedUniqueTracks = new Set(
    meaningfulStreams.map(
      (stream) => stream.trackUri || `${stream.artist.toLocaleLowerCase()}::${stream.track.toLocaleLowerCase()}`,
    ),
  ).size
  const qualifiedUniqueArtists = new Set(
    meaningfulStreams.map((stream) => stream.artist.toLocaleLowerCase()),
  ).size
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
      trackUri: entry.trackUri,
      hours: round(entry.ms / HOUR_MS, 1),
      plays: entry.plays,
    }))

  const topAlbums = [...albumMap.values()]
    .sort((left, right) => right.ms - left.ms || right.plays - left.plays)
    .slice(0, 8)
    .map((entry) => ({
      name: entry.name,
      artist: entry.artist,
      hours: round(entry.ms / HOUR_MS, 1),
      plays: entry.plays,
      uniqueTracks: entry.tracks.size,
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

  const weekdayHours = weekdays.flatMap((weekday, weekdayIndex) =>
    weekdayHourMap[weekdayIndex].map((value, hour) => ({
      day: weekday.day,
      shortDay: weekday.shortDay,
      hour,
      minutes: round(value.ms / 60_000, 1),
      plays: value.plays,
    })),
  )

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

  const platformBehavior = [...platformBehaviorMap.entries()]
    .sort(([, left], [, right]) => right.ms - left.ms)
    .slice(0, 5)
    .map(([name, value]) => ({
      name,
      hours: round(value.ms / HOUR_MS, 1),
      events: value.events,
      skipRate: rate(value.skipped, value.skippedKnown),
      trackDoneRate: rate(value.trackDone, value.reasonEndKnown),
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

  const sessions: { lastEnd: number; listenedMs: number; qualifiedTracks: number }[] = []
  streams.forEach((stream) => {
    const estimatedStart = Math.max(0, stream.timestamp - stream.msPlayed)
    const currentSession = sessions[sessions.length - 1]
    if (!currentSession || estimatedStart - currentSession.lastEnd > SESSION_GAP_MS) {
      sessions.push({
        lastEnd: stream.timestamp,
        listenedMs: stream.msPlayed,
        qualifiedTracks: Number(stream.msPlayed >= MIN_PLAY_MS),
      })
      return
    }
    currentSession.lastEnd = Math.max(currentSession.lastEnd, stream.timestamp)
    currentSession.listenedMs += stream.msPlayed
    currentSession.qualifiedTracks += Number(stream.msPlayed >= MIN_PLAY_MS)
  })
  const weekendMs = weekdayMap[5].ms + weekdayMap[6].ms
  const weekendShare = totalMs > 0 ? round((weekendMs / totalMs) * 100, 1) : 0
  const varietyRate = totalPlays > 0 ? round((qualifiedUniqueTracks / totalPlays) * 100, 1) : 0
  const listeningPattern: SpotifyAnalysis["listeningPattern"] = {
    weekendShare,
    weekdayShare: round(Math.max(0, 100 - weekendShare), 1),
    sessionCount: sessions.length,
    averageSessionMinutes: sessions.length > 0
      ? round(sessions.reduce((sum, session) => sum + session.listenedMs, 0) / 60_000 / sessions.length, 1)
      : 0,
    longestSessionMinutes: round(
      sessions.reduce((longest, session) => Math.max(longest, session.listenedMs), 0) / 60_000,
      1,
    ),
    averageQualifiedTracksPerSession: sessions.length > 0
      ? round(sessions.reduce((sum, session) => sum + session.qualifiedTracks, 0) / sessions.length, 1)
      : 0,
    varietyRate,
    repeatRate: round(Math.max(0, 100 - varietyRate), 1),
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
  const repeatRatio = totalPlays > 0 ? qualifiedUniqueTracks / totalPlays : 0
  const discoveryTitle = repeatRatio >= 0.55
    ? "You keep the door open"
    : repeatRatio <= 0.25
      ? "You know what you love"
      : "Familiar, with room to roam"
  const discoveryBody = repeatRatio >= 0.55
    ? `${Math.round(repeatRatio * 100)}% of your qualified plays map to a different track — a broad listening mix.`
    : repeatRatio <= 0.25
      ? `Your ${totalPlays.toLocaleString()} qualified plays circle back to ${qualifiedUniqueTracks.toLocaleString()} tracks.`
      : `You balance repeat favorites with discovery across ${qualifiedUniqueTracks.toLocaleString()} qualified tracks.`

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
    range: {
      selection: range.selection,
      label: range.label,
      startAt: range.startAt,
      endAt: range.endAt,
    },
    summary: {
      totalHours: round(totalMs / HOUR_MS, 1),
      totalPlays,
      totalEvents: streams.length,
      uniqueTracks,
      uniqueArtists,
      qualifiedUniqueTracks,
      qualifiedUniqueArtists,
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
    weekdayHours,
    yearly,
    topArtists,
    topTracks,
    topAlbums,
    artistMovements: { rising: [], cooling: [] },
    platforms,
    platformBehavior,
    behavior,
    listeningPattern,
    peakDay: {
      date: peakDayEntry[0],
      hours: round(peakDayEntry[1].ms / HOUR_MS, 1),
      plays: peakDayEntry[1].plays,
    },
    insights,
  }
}

function percentageChange(current: number, previous: number): number | undefined {
  if (previous <= 0) return undefined
  return round(((current - previous) / previous) * 100, 1)
}

function buildArtistMovements(
  currentStreams: SpotifyStream[],
  previousStreams: SpotifyStream[],
): SpotifyAnalysis["artistMovements"] {
  const aggregate = (streams: SpotifyStream[]) => {
    const artists = new Map<string, { name: string; ms: number }>()
    streams.forEach((stream) => {
      const key = stream.artist.toLocaleLowerCase()
      const entry = artists.get(key) || { name: stream.artist, ms: 0 }
      entry.ms += stream.msPlayed
      artists.set(key, entry)
    })
    return artists
  }
  const current = aggregate(currentStreams)
  const previous = aggregate(previousStreams)
  const movements = [...new Set([...current.keys(), ...previous.keys()])].map((key) => {
    const currentEntry = current.get(key)
    const previousEntry = previous.get(key)
    const currentHours = (currentEntry?.ms || 0) / HOUR_MS
    const previousHours = (previousEntry?.ms || 0) / HOUR_MS
    return {
      name: currentEntry?.name || previousEntry?.name || key,
      currentHours: round(currentHours, 1),
      previousHours: round(previousHours, 1),
      changeHours: round(currentHours - previousHours, 1),
    }
  })

  return {
    rising: movements
      .filter((movement) => movement.changeHours > 0 && movement.currentHours >= 0.1)
      .sort((left, right) => right.changeHours - left.changeHours)
      .slice(0, 3),
    cooling: movements
      .filter((movement) => movement.changeHours < 0 && movement.previousHours >= 0.1)
      .sort((left, right) => left.changeHours - right.changeHours)
      .slice(0, 3),
  }
}

export function analyzeSpotifyStreams(
  dataset: SpotifyDataset,
  selection: SpotifyAnalysisRange = "all",
): SpotifyAnalysis {
  const range = resolveSpotifyRange(dataset, selection)
  const currentStreams = dataset.streams.filter(
    (stream) => stream.timestamp >= range.startAt && stream.timestamp <= range.endAt,
  )
  const analysis = analyzeSpotifyStreamList(currentStreams, dataset.source, range)

  if (!range.previous) return analysis
  const previousStreams = dataset.streams.filter(
    (stream) => stream.timestamp >= range.previous!.startAt && stream.timestamp <= range.previous!.endAt,
  )
  if (previousStreams.length === 0) return analysis

  const previousAnalysis = analyzeSpotifyStreamList(previousStreams, dataset.source, {
    selection,
    label: range.previous.label,
    startAt: range.previous.startAt,
    endAt: range.previous.endAt,
  })
  analysis.comparison = {
    label: range.previous.label,
    totalHoursChange: percentageChange(analysis.summary.totalHours, previousAnalysis.summary.totalHours),
    activeDaysChange: percentageChange(analysis.summary.activeDays, previousAnalysis.summary.activeDays),
    uniqueArtistsChange: percentageChange(
      analysis.summary.uniqueArtists,
      previousAnalysis.summary.uniqueArtists,
    ),
    uniqueTracksChange: percentageChange(analysis.summary.uniqueTracks, previousAnalysis.summary.uniqueTracks),
    skipRatePointChange: analysis.behavior.skipRate !== undefined && previousAnalysis.behavior.skipRate !== undefined
      ? round(analysis.behavior.skipRate - previousAnalysis.behavior.skipRate, 1)
      : undefined,
  }
  analysis.artistMovements = buildArtistMovements(currentStreams, previousStreams)
  return analysis
}
