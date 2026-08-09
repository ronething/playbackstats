import type { AnalyticsInputFormat, FileSizeBucket } from "@/lib/analytics"
import type { YoutubeDashboardData } from "@/lib/youtube-analysis"

export interface YoutubeDashboardMetadata {
  inputFormat: AnalyticsInputFormat
  fileSizeBucket?: FileSizeBucket
  isSample: boolean
}

const STORAGE_KEYS = {
  stats: "youtubeHistoryStats",
  dailyViews: "youtubeHistoryDailyViews",
  hourlyViews: "youtubeHistoryHourlyViews",
  topVideos: "youtubeHistoryTopVideos",
  channels: "youtubeHistoryChannels",
  advancedStats: "youtubeHistoryAdvancedStats",
  metadata: "youtubeHistoryImportMetadata",
} as const

export function saveYoutubeDashboard(
  data: YoutubeDashboardData,
  metadata: YoutubeDashboardMetadata,
): void {
  sessionStorage.setItem(STORAGE_KEYS.stats, JSON.stringify(data.stats))
  sessionStorage.setItem(STORAGE_KEYS.dailyViews, JSON.stringify(data.dailyViews))
  sessionStorage.setItem(STORAGE_KEYS.hourlyViews, JSON.stringify(data.hourlyViews))
  sessionStorage.setItem(STORAGE_KEYS.topVideos, JSON.stringify(data.topVideos))
  sessionStorage.setItem(STORAGE_KEYS.channels, JSON.stringify(data.channelCounts))
  sessionStorage.setItem(STORAGE_KEYS.advancedStats, JSON.stringify(data.advancedStats))
  sessionStorage.setItem(STORAGE_KEYS.metadata, JSON.stringify(metadata))
}

export function loadYoutubeDashboard(): { data: YoutubeDashboardData; metadata: YoutubeDashboardMetadata } | null {
  const stats = sessionStorage.getItem(STORAGE_KEYS.stats)
  if (!stats) return null

  const metadata = sessionStorage.getItem(STORAGE_KEYS.metadata)
  return {
    data: {
      stats: JSON.parse(stats),
      dailyViews: JSON.parse(sessionStorage.getItem(STORAGE_KEYS.dailyViews) || "[]"),
      hourlyViews: JSON.parse(sessionStorage.getItem(STORAGE_KEYS.hourlyViews) || "[]"),
      topVideos: JSON.parse(sessionStorage.getItem(STORAGE_KEYS.topVideos) || "[]"),
      channelCounts: JSON.parse(sessionStorage.getItem(STORAGE_KEYS.channels) || "[]"),
      advancedStats: JSON.parse(sessionStorage.getItem(STORAGE_KEYS.advancedStats) || "null"),
    },
    metadata: metadata
      ? JSON.parse(metadata)
      : { inputFormat: "youtube_json", isSample: false },
  }
}
