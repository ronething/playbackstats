import assert from "node:assert/strict"
import test from "node:test"

import type { YoutubeStats } from "../lib/youtube-analysis.ts"
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

test("share card exposes only aggregate YouTube statistics", () => {
  const card = buildYoutubeShareCardData(stats)

  assert.equal(card.dateRange, "Jan 2019 – Aug 2026")
  assert.deepEqual(card.metrics, [
    { label: "VIDEOS ANALYZED", value: "11,393" },
    { label: "DAYS OF HISTORY", value: "2,765" },
    { label: "UNIQUE CHANNELS", value: "1,842" },
    { label: "DAILY AVERAGE", value: "4.1" },
  ])
  assert.deepEqual(Object.keys(card).sort(), ["dateRange", "metrics"])
})

test("share card uses a social-post image size and a stable local filename", () => {
  assert.equal(YOUTUBE_SHARE_CARD_WIDTH / YOUTUBE_SHARE_CARD_HEIGHT, 4 / 5)
  assert.equal(YOUTUBE_SHARE_CARD_FILENAME, "playback-stats-youtube-card.png")
})

test("share card does not repeat the same month in a short history range", () => {
  const card = buildYoutubeShareCardData({
    ...stats,
    oldestDate: "2026-08-01T00:00:00.000Z",
    newestDate: "2026-08-11T00:00:00.000Z",
  })

  assert.equal(card.dateRange, "Aug 2026")
})
