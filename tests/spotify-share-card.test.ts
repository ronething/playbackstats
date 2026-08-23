import assert from "node:assert/strict"
import test from "node:test"

import type { SpotifyAnalysis } from "../lib/spotify-analysis.ts"
import {
  SPOTIFY_SHARE_CARD_FILENAME,
  SPOTIFY_SHARE_CARD_HEIGHT,
  SPOTIFY_SHARE_CARD_WIDTH,
  buildSpotifyShareCardData,
} from "../lib/spotify-share-card.ts"

const hourly = Array.from({ length: 24 }, (_, hour) => ({
  hour,
  minutes: hour === 23 ? 920 : hour === 12 ? 500 : 100,
  plays: hour === 23 ? 400 : 100,
}))

const analysis: SpotifyAnalysis = {
  source: {
    format: "extended",
    recognizedFiles: 4,
    ignoredFiles: 0,
    inputRecords: 8_500,
    retainedRecords: 8_500,
    extendedRecords: 8_500,
    standardRecords: 0,
    duplicateRecordsOmitted: 0,
    overlapRecordsOmitted: 0,
  },
  summary: {
    totalHours: 1_842.6,
    totalPlays: 8_200,
    totalEvents: 8_500,
    uniqueTracks: 3_200,
    uniqueArtists: 740,
    activeDays: 900,
    spanDays: 2_766,
    averageMinutesPerActiveDay: 122.8,
    longestStreak: 42,
    firstPlayedAt: Date.UTC(2019, 0, 15, 7),
    lastPlayedAt: Date.UTC(2026, 7, 11, 9, 30),
  },
  monthly: [],
  hourly,
  weekdays: [
    { day: "Monday", shortDay: "Mon", minutes: 1_900, plays: 1_100 },
    { day: "Tuesday", shortDay: "Tue", minutes: 1_700, plays: 1_000 },
    { day: "Wednesday", shortDay: "Wed", minutes: 1_800, plays: 1_050 },
    { day: "Thursday", shortDay: "Thu", minutes: 1_600, plays: 950 },
    { day: "Friday", shortDay: "Fri", minutes: 2_400, plays: 1_300 },
    { day: "Saturday", shortDay: "Sat", minutes: 2_700, plays: 1_400 },
    { day: "Sunday", shortDay: "Sun", minutes: 3_100, plays: 1_400 },
  ],
  yearly: [],
  topArtists: [
    { name: "Archive Alpha", hours: 180.4, plays: 920, uniqueTracks: 84, share: 9.8 },
    { name: "Night Signal", hours: 132.7, plays: 760, uniqueTracks: 65, share: 7.2 },
    { name: "Longform Echo", hours: 95.1, plays: 610, uniqueTracks: 58, share: 5.2 },
    { name: "Fourth Artist", hours: 80, plays: 500, uniqueTracks: 40, share: 4.3 },
  ],
  topTracks: [],
  platforms: [],
  behavior: {
    hasExtendedData: true,
    skipRate: 18,
    shuffleRate: 64,
    offlineRate: 12,
    trackDoneRate: 72,
  },
  peakDay: { date: "2025-03-08", hours: 13.2, plays: 180 },
  insights: [],
}

test("share card turns Spotify analysis into a personal listening profile", () => {
  const card = buildSpotifyShareCardData({ analysis })

  assert.equal(card.dateRange, "Jan 2019 – Aug 2026")
  assert.equal(card.totalHours, "1,842.6")
  assert.equal(card.uniqueArtists, "740")
  assert.equal(card.uniqueTracks, "3,200")
  assert.equal(card.activeDays, "900")
  assert.deepEqual(card.traits, [
    { label: "Evening Listener", detail: "Peak listening around 11 PM" },
    { label: "Daily Soundtrack", detail: "122.8 min per active day" },
    { label: "Balanced Listener", detail: "39% track-to-play variety" },
  ])
  assert.deepEqual(card.topArtists, [
    { name: "Archive Alpha", hours: 180.4, percentage: 10 },
    { name: "Night Signal", hours: 132.7, percentage: 7 },
    { name: "Longform Echo", hours: 95.1, percentage: 5 },
  ])
  assert.deepEqual(card.listeningRhythm, [
    { label: "PEAK HOUR", value: "11 PM" },
    { label: "FAVORITE DAY", value: "Sunday" },
    { label: "LONGEST STREAK", value: "42 days" },
  ])
})

test("share card uses a social-post image size and a stable local filename", () => {
  assert.equal(SPOTIFY_SHARE_CARD_WIDTH / SPOTIFY_SHARE_CARD_HEIGHT, 4 / 5)
  assert.equal(SPOTIFY_SHARE_CARD_FILENAME, "playback-stats-spotify-dna.png")
})

test("share card uses singular wording for a one-day listening streak", () => {
  const card = buildSpotifyShareCardData({
    analysis: {
      ...analysis,
      summary: { ...analysis.summary, longestStreak: 1 },
    },
  })

  assert.equal(card.listeningRhythm[2].value, "1 day")
})

test("share card handles histories without qualified plays or artist rankings", () => {
  const card = buildSpotifyShareCardData({
    analysis: {
      ...analysis,
      summary: {
        ...analysis.summary,
        totalPlays: 0,
        averageMinutesPerActiveDay: 0,
        longestStreak: 0,
        firstPlayedAt: Date.UTC(2026, 7, 1),
        lastPlayedAt: Date.UTC(2026, 7, 11),
      },
      hourly: analysis.hourly.map((item) => ({ ...item, minutes: 0, plays: 0 })),
      weekdays: analysis.weekdays.map((item) => ({ ...item, minutes: 0, plays: 0 })),
      topArtists: [],
    },
  })

  assert.equal(card.dateRange, "Aug 2026")
  assert.deepEqual(card.topArtists, [])
  assert.deepEqual(card.traits, [
    { label: "History Explorer", detail: "A personal listening archive" },
    { label: "Casual Listener", detail: "0 min per active day" },
    { label: "Personal Archive", detail: "Built from local history" },
  ])
  assert.deepEqual(card.listeningRhythm.map((item) => item.value), ["—", "—", "—"])
})
