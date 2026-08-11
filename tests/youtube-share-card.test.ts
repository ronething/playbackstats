import assert from "node:assert/strict"
import test from "node:test"

import type {
  YoutubeAdvancedStats,
  YoutubeChannelCount,
  YoutubeStats,
} from "../lib/youtube-analysis.ts"
import {
  YOUTUBE_SHARE_CARD_FILENAME,
  YOUTUBE_SHARE_CARD_HEIGHT,
  YOUTUBE_SHARE_CARD_WIDTH,
  buildYoutubeShareCardData,
} from "../lib/youtube-share-card.ts"

const stats: YoutubeStats = {
  totalVideos: 11_393,
  oldestDate: "2019-01-15T07:00:00.000Z",
  newestDate: "2026-08-11T09:30:00.000Z",
  uniqueChannels: 1_842,
  daysDifference: 2_765,
}

const advancedStats: YoutubeAdvancedStats = {
  peakHour: 23,
  nightOwlScore: 48,
  earlyBirdScore: 8,
  middayScore: 6,
  dailyAverage: 4.1,
  weekendWarrior: false,
  longestStreak: 42,
  currentStreak: 3,
  maxDailyViews: 86,
  maxDailyDate: "2025-03-08",
  favoriteDay: "Sunday",
  favoriteDayPercentage: 18,
  firstVideo: {
    title: "Fixture video",
    channel: "Fixture channel",
    date: "2019-01-15T07:00:00.000Z",
    url: "https://www.youtube.com/watch?v=fixture",
  },
  topChannelPercentage: 11,
  channelDiversity: 0.82,
  loyalChannels: [],
  weekdayAvg: 3.8,
  weekendAvg: 4.7,
  weekendRatio: 1.24,
  morningCount: 1_200,
  afternoonCount: 2_300,
  eveningCount: 2_400,
  nightCount: 5_493,
}

const channelCounts: YoutubeChannelCount[] = [
  { name: "Archive Alpha", count: 1_200 },
  { name: "Night School", count: 840 },
  { name: "Longform Lab", count: 510 },
  { name: "Fourth Channel", count: 300 },
]

test("share card turns dashboard data into a personal YouTube profile", () => {
  const card = buildYoutubeShareCardData({ advancedStats, channelCounts, stats })

  assert.equal(card.dateRange, "Jan 2019 – Aug 2026")
  assert.equal(card.totalViews, "11,393")
  assert.equal(card.uniqueChannels, "1,842")
  assert.equal(card.dailyAverage, "4.1")
  assert.deepEqual(card.traits, [
    { label: "Night Owl", detail: "48% after 10 PM" },
    { label: "Casual Browser", detail: "4.1 views a day" },
    { label: "Content Explorer", detail: "A wide mix of channels" },
  ])
  assert.deepEqual(card.topChannels, [
    { name: "Archive Alpha", count: 1_200, percentage: 11 },
    { name: "Night School", count: 840, percentage: 7 },
    { name: "Longform Lab", count: 510, percentage: 4 },
  ])
  assert.deepEqual(card.viewingRhythm, [
    { label: "PEAK HOUR", value: "11 PM" },
    { label: "FAVORITE DAY", value: "Sunday" },
    { label: "LONGEST STREAK", value: "42 days" },
  ])
})

test("share card uses a social-post image size and a stable local filename", () => {
  assert.equal(YOUTUBE_SHARE_CARD_WIDTH / YOUTUBE_SHARE_CARD_HEIGHT, 4 / 5)
  assert.equal(YOUTUBE_SHARE_CARD_FILENAME, "playback-stats-youtube-dna.png")
})

test("share card handles short histories and missing channel metadata", () => {
  const card = buildYoutubeShareCardData({
    advancedStats: null,
    channelCounts: [],
    stats: {
      ...stats,
      oldestDate: "2026-08-01T00:00:00.000Z",
      newestDate: "2026-08-11T00:00:00.000Z",
    },
  })

  assert.equal(card.dateRange, "Aug 2026")
  assert.deepEqual(card.topChannels, [])
  assert.equal(card.traits[0].label, "History Explorer")
  assert.deepEqual(card.viewingRhythm.map((item) => item.value), ["—", "—", "—"])
})
