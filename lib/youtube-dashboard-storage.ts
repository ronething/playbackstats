import type { YoutubeDashboardData } from "@/lib/youtube-analysis"
import type { YoutubeInputFormat } from "@/lib/youtube-import"

export interface YoutubeDashboardMetadata {
  inputFormat: YoutubeInputFormat
}

interface StoredYoutubeDashboard {
  version: 1
  data: YoutubeDashboardData
  metadata: YoutubeDashboardMetadata
}

const DASHBOARD_STORAGE_KEY = "youtubeDashboard"
const LEGACY_STORAGE_KEYS = {
  stats: "youtubeHistoryStats",
  dailyViews: "youtubeHistoryDailyViews",
  hourlyViews: "youtubeHistoryHourlyViews",
  topVideos: "youtubeHistoryTopVideos",
  channels: "youtubeHistoryChannels",
  advancedStats: "youtubeHistoryAdvancedStats",
} as const

export function saveYoutubeDashboard(
  data: YoutubeDashboardData,
  metadata: YoutubeDashboardMetadata,
): void {
  const payload: StoredYoutubeDashboard = { version: 1, data, metadata }

  // A single write avoids leaving a partially updated dashboard when storage
  // quota or browser restrictions interrupt persistence.
  sessionStorage.setItem(DASHBOARD_STORAGE_KEY, JSON.stringify(payload))
  Object.values(LEGACY_STORAGE_KEYS).forEach((key) => sessionStorage.removeItem(key))
}

export function loadYoutubeDashboard(): StoredYoutubeDashboard | null {
  const current = sessionStorage.getItem(DASHBOARD_STORAGE_KEY)
  if (current) {
    const parsed = JSON.parse(current) as StoredYoutubeDashboard
    if (parsed.version !== 1 || !parsed.data?.stats) {
      throw new Error("The stored YouTube dashboard has an unsupported format.")
    }
    return parsed
  }

  const stats = sessionStorage.getItem(LEGACY_STORAGE_KEYS.stats)
  if (!stats) return null

  return {
    version: 1,
    data: {
      stats: JSON.parse(stats),
      dailyViews: JSON.parse(sessionStorage.getItem(LEGACY_STORAGE_KEYS.dailyViews) || "[]"),
      hourlyViews: JSON.parse(sessionStorage.getItem(LEGACY_STORAGE_KEYS.hourlyViews) || "[]"),
      topVideos: JSON.parse(sessionStorage.getItem(LEGACY_STORAGE_KEYS.topVideos) || "[]"),
      channelCounts: JSON.parse(sessionStorage.getItem(LEGACY_STORAGE_KEYS.channels) || "[]"),
      advancedStats: JSON.parse(sessionStorage.getItem(LEGACY_STORAGE_KEYS.advancedStats) || "null"),
    },
    metadata: { inputFormat: "youtube_json" },
  }
}
