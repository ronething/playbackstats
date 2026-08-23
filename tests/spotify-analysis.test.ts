import assert from "node:assert/strict"
import test from "node:test"

import {
  analyzeSpotifyStreams,
  getSpotifyAvailableYears,
  mergeSpotifyStreams,
  parseSpotifyExport,
  type SpotifyStream,
} from "../lib/spotify-analysis.ts"

function stream(
  timestamp: string,
  overrides: Partial<SpotifyStream> = {},
): SpotifyStream {
  return {
    timestamp: new Date(timestamp).getTime(),
    msPlayed: 180_000,
    artist: "Example Artist",
    track: "Example Track",
    album: "Example Album",
    trackUri: "spotify:track:0123456789ABCDEFGHIJKL",
    platform: "iOS",
    reasonStart: "clickrow",
    reasonEnd: "trackdone",
    skipped: false,
    shuffle: false,
    offline: false,
    source: "extended",
    ...overrides,
  }
}

test("extended export parsing retains safe analysis and linking fields", () => {
  const parsed = parseSpotifyExport([
    {
      ts: "2026-01-02T03:04:05Z",
      ms_played: 180000,
      master_metadata_album_artist_name: "Example Artist",
      master_metadata_track_name: "Example Track",
      master_metadata_album_album_name: "Example Album",
      spotify_track_uri: "spotify:track:0123456789ABCDEFGHIJKL",
      platform: "iOS",
      reason_start: "clickrow",
      reason_end: "trackdone",
      skipped: false,
      shuffle: true,
      offline: false,
      ip_addr_decrypted: "192.0.2.1",
    },
    {
      ts: "2026-01-02T03:04:05Z",
      ms_played: 180000,
      episode_name: "A podcast",
      episode_show_name: "Example show",
    },
  ])

  assert.equal(parsed.extended.length, 1)
  assert.deepEqual(parsed.extended[0], {
    timestamp: Date.parse("2026-01-02T03:04:05Z"),
    msPlayed: 180000,
    artist: "Example Artist",
    track: "Example Track",
    album: "Example Album",
    trackUri: "spotify:track:0123456789ABCDEFGHIJKL",
    platform: "iOS",
    reasonStart: "clickrow",
    reasonEnd: "trackdone",
    shuffle: true,
    skipped: false,
    offline: false,
    source: "extended",
  })
  assert.equal("ip_addr_decrypted" in parsed.extended[0], false)
})

test("merge removes exact duplicate records before removing standard overlap", () => {
  const extended = stream("2025-06-01T10:00:00Z")
  const standardInside = stream("2025-06-01T10:00:00Z", {
    trackUri: undefined,
    album: undefined,
    platform: undefined,
    source: "standard",
  })
  const standardOutside = stream("2026-06-01T10:00:00Z", {
    trackUri: undefined,
    album: undefined,
    platform: undefined,
    source: "standard",
  })
  const dataset = mergeSpotifyStreams(
    [extended, { ...extended }],
    [standardInside, standardOutside, { ...standardOutside }],
    { recognizedFiles: 3, ignoredFiles: 0 },
  )

  assert.equal(dataset.source.inputRecords, 5)
  assert.equal(dataset.source.duplicateRecordsOmitted, 2)
  assert.equal(dataset.source.overlapRecordsOmitted, 1)
  assert.equal(dataset.streams.length, 2)
  assert.equal(dataset.source.format, "mixed")
})

test("analysis keeps all-event diversity separate from qualified-play variety", () => {
  const dataset = mergeSpotifyStreams([
    stream("2026-01-01T10:00:00Z", { track: "Qualified", msPlayed: 180_000 }),
    stream("2026-01-01T10:04:00Z", { track: "Qualified", msPlayed: 180_000 }),
    stream("2026-01-01T10:08:00Z", {
      track: "Short only",
      trackUri: "spotify:track:1234567890ABCDEFGHIJKL",
      msPlayed: 5_000,
    }),
  ], [], { recognizedFiles: 1, ignoredFiles: 0 })
  const analysis = analyzeSpotifyStreams(dataset)

  assert.equal(analysis.summary.uniqueTracks, 2)
  assert.equal(analysis.summary.qualifiedUniqueTracks, 1)
  assert.equal(analysis.summary.totalPlays, 2)
  assert.equal(analysis.listeningPattern.varietyRate, 50)
  assert.equal(analysis.listeningPattern.repeatRate, 50)
  assert.equal(analysis.weekdayHours.length, 168)
  assert.equal(analysis.topAlbums[0].name, "Example Album")
  assert.equal(analysis.topTracks[0].trackUri, "spotify:track:0123456789ABCDEFGHIJKL")
  assert.equal(analysis.listeningPattern.sessionCount, 1)
})

test("range analysis compares the latest 12 months with the preceding period", () => {
  const dataset = mergeSpotifyStreams([
    stream("2024-06-01T10:00:00Z", { msPlayed: 60 * 60 * 1000, artist: "Past Artist" }),
    stream("2025-06-01T10:00:00Z", { msPlayed: 2 * 60 * 60 * 1000, artist: "Current Artist" }),
    stream("2025-12-01T10:00:00Z", { msPlayed: 2 * 60 * 60 * 1000, artist: "Current Artist" }),
  ], [], { recognizedFiles: 1, ignoredFiles: 0 })
  const analysis = analyzeSpotifyStreams(dataset, "last12Months")

  assert.deepEqual(getSpotifyAvailableYears(dataset), [2025, 2024])
  assert.equal(analysis.range.label, "Latest 12 months")
  assert.equal(analysis.summary.totalHours, 4)
  assert.equal(analysis.comparison?.totalHoursChange, 300)
  assert.equal(analysis.artistMovements.rising[0].name, "Current Artist")
  assert.equal(analysis.artistMovements.cooling[0].name, "Past Artist")
})
