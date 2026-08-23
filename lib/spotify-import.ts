import type {
  ParsedSpotifyExport,
  SpotifyDataset,
  SpotifySourceFormat,
  SpotifyStream,
} from "./spotify-analysis.ts"

interface MergeSpotifyOptions {
  recognizedFiles: number
  ignoredFiles: number
}

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
    reasonStart: stringValue(record.reason_start),
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
): SpotifyDataset {
  const seenStreams = new Set<string>()
  const deduplicate = (streams: SpotifyStream[]) => streams.filter((stream) => {
    const identity = [
      stream.source,
      stream.timestamp,
      stream.msPlayed,
      stream.artist.toLocaleLowerCase(),
      stream.track.toLocaleLowerCase(),
      stream.album?.toLocaleLowerCase() || "",
      stream.trackUri || "",
      stream.platform?.toLocaleLowerCase() || "",
      stream.reasonStart?.toLocaleLowerCase() || "",
      stream.reasonEnd?.toLocaleLowerCase() || "",
      String(stream.shuffle),
      String(stream.skipped),
      String(stream.offline),
    ].join("|")
    if (seenStreams.has(identity)) return false
    seenStreams.add(identity)
    return true
  })
  const extended = deduplicate(extendedInput)
  const standard = deduplicate(standardInput)
  const duplicateRecordsOmitted = extendedInput.length + standardInput.length - extended.length - standard.length
  let retainedStandard = standard
  let overlapRecordsOmitted = 0

  // The standard export normally overlaps the complete extended export. Keep
  // standard records only when they extend beyond the imported extended range.
  if (extended.length > 0 && retainedStandard.length > 0) {
    const { firstExtended, lastExtended } = extended.reduce(
      (range, stream) => ({
        firstExtended: Math.min(range.firstExtended, stream.timestamp),
        lastExtended: Math.max(range.lastExtended, stream.timestamp),
      }),
      { firstExtended: Number.POSITIVE_INFINITY, lastExtended: Number.NEGATIVE_INFINITY },
    )
    retainedStandard = standard.filter(
      (stream) => stream.timestamp < firstExtended || stream.timestamp > lastExtended,
    )
    overlapRecordsOmitted = standard.length - retainedStandard.length
  }

  const streams = [...extended, ...retainedStandard].sort(
    (left, right) => left.timestamp - right.timestamp,
  )
  const format: SpotifySourceFormat =
    extended.length > 0 && retainedStandard.length > 0
      ? "mixed"
      : extended.length > 0
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
      extendedRecords: extended.length,
      standardRecords: retainedStandard.length,
      duplicateRecordsOmitted,
      overlapRecordsOmitted,
    },
  }
}
