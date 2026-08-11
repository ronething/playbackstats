import assert from "node:assert/strict"
import test from "node:test"

import { analyzeYoutubeHistory } from "../lib/youtube-analysis.ts"
import { loadYoutubeDashboard, saveYoutubeDashboard } from "../lib/youtube-dashboard-storage.ts"

class MemorySessionStorage {
  private readonly values = new Map<string, string>()

  getItem(key: string) {
    return this.values.get(key) ?? null
  }

  setItem(key: string, value: string) {
    this.values.set(key, value)
  }

  removeItem(key: string) {
    this.values.delete(key)
  }
}

test("dashboard storage writes and reads one versioned payload", () => {
  Object.assign(globalThis, { sessionStorage: new MemorySessionStorage() })
  const data = analyzeYoutubeHistory([
    {
      title: "Fixture video",
      titleUrl: "https://www.youtube.com/watch?v=fixture",
      subtitles: [{ name: "Fixture Channel" }],
      time: "2025-01-01T00:00:00.000Z",
    },
  ])

  saveYoutubeDashboard(data, { inputFormat: "takeout_zip" })
  const stored = loadYoutubeDashboard()

  assert.equal(stored?.version, 1)
  assert.equal(stored?.metadata.inputFormat, "takeout_zip")
  assert.deepEqual(stored?.data, data)
  Reflect.deleteProperty(globalThis, "sessionStorage")
})

test("dashboard storage remains compatible with existing session keys", () => {
  const storage = new MemorySessionStorage()
  Object.assign(globalThis, { sessionStorage: storage })
  storage.setItem("youtubeHistoryStats", JSON.stringify({ totalVideos: 1 }))
  storage.setItem("youtubeHistoryDailyViews", "[]")
  storage.setItem("youtubeHistoryHourlyViews", "[]")
  storage.setItem("youtubeHistoryTopVideos", "[]")
  storage.setItem("youtubeHistoryChannels", "[]")
  storage.setItem("youtubeHistoryAdvancedStats", "null")

  const stored = loadYoutubeDashboard()

  assert.equal(stored?.metadata.inputFormat, "youtube_json")
  assert.equal(stored?.data.stats.totalVideos, 1)
  Reflect.deleteProperty(globalThis, "sessionStorage")
})
