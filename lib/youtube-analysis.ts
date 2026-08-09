export interface YoutubeStats {
  totalVideos: number
  oldestDate: string
  newestDate: string
  uniqueChannels: number
  daysDifference: number
}

export interface YoutubeDailyView {
  date: string
  count: number
}

export interface YoutubeHourlyView {
  hour: number
  count: number
}

export interface YoutubeTopVideo {
  id: string
  title: string
  channel?: string
  count: number
}

export interface YoutubeChannelCount {
  name: string
  count: number
}

export interface YoutubeAdvancedStats {
  peakHour: number
  nightOwlScore: number
  earlyBirdScore: number
  middayScore: number
  dailyAverage: number
  weekendWarrior: boolean
  longestStreak: number
  currentStreak: number
  maxDailyViews: number
  maxDailyDate: string
  favoriteDay: string
  favoriteDayPercentage: number
  firstVideo: { title: string; channel?: string; date: string; url: string }
  topChannelPercentage: number
  channelDiversity: number
  loyalChannels: string[]
  weekdayAvg: number
  weekendAvg: number
  weekendRatio: number
  morningCount: number
  afternoonCount: number
  eveningCount: number
  nightCount: number
}

export interface YoutubeDashboardData {
  dailyViews: YoutubeDailyView[]
  hourlyViews: YoutubeHourlyView[]
  topVideos: YoutubeTopVideo[]
  channelCounts: YoutubeChannelCount[]
  stats: YoutubeStats
  advancedStats: YoutubeAdvancedStats
}

interface ProcessedVideo {
  id: string
  title: string
  channel?: string
  time: string
  timestamp: number
}

function pad(value: number): string {
  return String(value).padStart(2, "0")
}

/** Dates and hours intentionally follow the visitor's browser timezone. */
function localDateKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function dayNumber(dateKey: string): number {
  const [year, month, day] = dateKey.split("-").map(Number)
  return Date.UTC(year, month - 1, day) / 86_400_000
}

function normalizedString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined
  const trimmed = value.trim()
  return trimmed || undefined
}

function normalizeRecord(value: Record<string, unknown>): ProcessedVideo | null {
  const title = normalizedString(value.title) || (normalizedString(value.titleUrl) ? "Unknown video" : undefined)
  const time = normalizedString(value.time)
  if (!title || !time) return null
  const timestamp = new Date(time).getTime()
  if (!Number.isFinite(timestamp)) return null

  const subtitles = Array.isArray(value.subtitles) ? value.subtitles : []
  const firstSubtitle = subtitles.find(
    (subtitle): subtitle is Record<string, unknown> => Boolean(subtitle) && typeof subtitle === "object" && !Array.isArray(subtitle),
  )
  const channel = normalizedString(firstSubtitle?.name)
  const titleUrl = normalizedString(value.titleUrl)
  const stableFallbackId = `missing-url:${title.toLocaleLowerCase()}::${channel?.toLocaleLowerCase() || "unknown-channel"}`

  return { id: titleUrl || stableFallbackId, title, channel, time, timestamp }
}

function calculateStreak(dailyViews: YoutubeDailyView[]): { longest: number; current: number } {
  if (dailyViews.length === 0) return { longest: 0, current: 0 }
  let longest = 1
  let running = 1
  for (let index = 1; index < dailyViews.length; index += 1) {
    if (dayNumber(dailyViews[index].date) - dayNumber(dailyViews[index - 1].date) === 1) {
      running += 1
      longest = Math.max(longest, running)
    } else {
      running = 1
    }
  }

  const lastDay = dayNumber(dailyViews.at(-1)!.date)
  const today = dayNumber(localDateKey(new Date()))
  return { longest, current: today - lastDay <= 1 ? running : 0 }
}

function percentage(part: number, total: number): number {
  return total > 0 ? Math.round((part / total) * 100) : 0
}

function channelDiversity(channelCounts: YoutubeChannelCount[]): number {
  const total = channelCounts.reduce((sum, channel) => sum + channel.count, 0)
  if (total === 0) return 0
  const entropy = channelCounts.reduce((sum, channel) => {
    const share = channel.count / total
    return sum - share * Math.log2(share)
  }, 0)
  const maximumEntropy = Math.log2(Math.max(2, channelCounts.length))
  return Math.round(Math.min(1, entropy / maximumEntropy) * 100) / 100
}

export function analyzeYoutubeHistory(rawData: Record<string, unknown>[]): YoutubeDashboardData {
  // Each retained row is a viewing event. Duplicate rows are deliberately not
  // removed because repeat views are the input for rankings and activity counts.
  const videos = rawData.map(normalizeRecord).filter((video): video is ProcessedVideo => Boolean(video))
  if (videos.length === 0) throw new Error("No valid dated YouTube viewing records were found.")

  const dateMap = new Map<string, number>()
  const hourCounts = Array.from({ length: 24 }, (_, hour) => ({ hour, count: 0 }))
  const videoMap = new Map<string, YoutubeTopVideo>()
  const channelMap = new Map<string, number>()
  const weekdayCounts = Array(7).fill(0) as number[]
  const weekdayDates = new Set<string>()
  const weekendDates = new Set<string>()
  let weekdayViews = 0
  let weekendViews = 0

  for (const video of videos) {
    const date = new Date(video.timestamp)
    const dateKey = localDateKey(date)
    const day = date.getDay()
    dateMap.set(dateKey, (dateMap.get(dateKey) || 0) + 1)
    hourCounts[date.getHours()].count += 1
    weekdayCounts[day] += 1

    if (day === 0 || day === 6) {
      weekendDates.add(dateKey)
      weekendViews += 1
    } else {
      weekdayDates.add(dateKey)
      weekdayViews += 1
    }

    const countedVideo = videoMap.get(video.id)
    if (countedVideo) countedVideo.count += 1
    else videoMap.set(video.id, { id: video.id, title: video.title, channel: video.channel, count: 1 })
    if (video.channel) channelMap.set(video.channel, (channelMap.get(video.channel) || 0) + 1)
  }

  const dailyViews = [...dateMap.entries()]
    .map(([date, count]) => ({ date, count }))
    .sort((left, right) => left.date.localeCompare(right.date))
  const allChannelCounts = [...channelMap.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((left, right) => right.count - left.count || left.name.localeCompare(right.name))
  const channelCounts = allChannelCounts.slice(0, 10)
  const topVideos = [...videoMap.values()]
    .sort((left, right) => right.count - left.count || left.title.localeCompare(right.title))
    .slice(0, 10)

  const timestamps = videos.map((video) => video.timestamp)
  const oldestTimestamp = Math.min(...timestamps)
  const newestTimestamp = Math.max(...timestamps)
  const daysDifference = Math.max(1, Math.ceil((newestTimestamp - oldestTimestamp) / 86_400_000))
  const streak = calculateStreak(dailyViews)
  const totalViews = videos.length
  const nightCount = hourCounts.filter(({ hour }) => hour >= 22 || hour < 5).reduce((sum, item) => sum + item.count, 0)
  const morningCount = hourCounts.filter(({ hour }) => hour >= 5 && hour < 12).reduce((sum, item) => sum + item.count, 0)
  const afternoonCount = hourCounts.filter(({ hour }) => hour >= 12 && hour < 18).reduce((sum, item) => sum + item.count, 0)
  const eveningCount = hourCounts.filter(({ hour }) => hour >= 18 && hour < 22).reduce((sum, item) => sum + item.count, 0)
  const earlyBirdCount = hourCounts.filter(({ hour }) => hour >= 5 && hour < 9).reduce((sum, item) => sum + item.count, 0)
  const middayCount = hourCounts.filter(({ hour }) => hour >= 12 && hour < 14).reduce((sum, item) => sum + item.count, 0)
  const peakHour = hourCounts.reduce((peak, item) => item.count > peak.count ? item : peak)
  const maxDaily = dailyViews.reduce((maximum, item) => item.count > maximum.count ? item : maximum)
  const favoriteDayIndex = weekdayCounts.indexOf(Math.max(...weekdayCounts))
  const favoriteDay = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][favoriteDayIndex]
  const weekdayAverage = weekdayDates.size > 0 ? weekdayViews / weekdayDates.size : 0
  const weekendAverage = weekendDates.size > 0 ? weekendViews / weekendDates.size : 0
  const weekendRatio = weekdayAverage > 0 ? weekendAverage / weekdayAverage : 0
  const firstVideo = videos.reduce((earliest, video) => video.timestamp < earliest.timestamp ? video : earliest)

  return {
    dailyViews,
    hourlyViews: hourCounts,
    topVideos,
    channelCounts,
    stats: {
      totalVideos: totalViews,
      oldestDate: new Date(oldestTimestamp).toISOString(),
      newestDate: new Date(newestTimestamp).toISOString(),
      uniqueChannels: channelMap.size,
      daysDifference,
    },
    advancedStats: {
      peakHour: peakHour.hour,
      nightOwlScore: percentage(nightCount, totalViews),
      earlyBirdScore: percentage(earlyBirdCount, totalViews),
      middayScore: percentage(middayCount, totalViews),
      dailyAverage: Math.round((totalViews / daysDifference) * 10) / 10,
      weekendWarrior: weekendRatio > 1.5,
      longestStreak: streak.longest,
      currentStreak: streak.current,
      maxDailyViews: maxDaily.count,
      maxDailyDate: maxDaily.date,
      favoriteDay,
      favoriteDayPercentage: percentage(weekdayCounts[favoriteDayIndex], totalViews),
      firstVideo: { title: firstVideo.title, channel: firstVideo.channel, date: firstVideo.time, url: firstVideo.id },
      topChannelPercentage: channelCounts[0] ? percentage(channelCounts[0].count, totalViews) : 0,
      channelDiversity: channelDiversity(allChannelCounts),
      loyalChannels: allChannelCounts
        .filter((channel) => channel.count / totalViews > 0.1)
        .map((channel) => channel.name)
        .slice(0, 5),
      weekdayAvg: Math.round(weekdayAverage * 10) / 10,
      weekendAvg: Math.round(weekendAverage * 10) / 10,
      weekendRatio: Math.round(weekendRatio * 100) / 100,
      morningCount,
      afternoonCount,
      eveningCount,
      nightCount,
    },
  }
}

export function buildSampleYoutubeData(): YoutubeDashboardData {
  const channels = ["Sample Learning", "Sample Studio", "Sample Kitchen", "Sample Science"]
  const records = Array.from({ length: 48 }, (_, index) => {
    const channel = channels[index % channels.length]
    const videoNumber = (index % 12) + 1
    const date = new Date(Date.UTC(2025, 0, 2 + Math.floor(index / 3), 7 + (index * 5) % 17, 15))
    return {
      title: `Sample video ${videoNumber}`,
      titleUrl: `https://www.youtube.com/watch?v=sample-${videoNumber}`,
      subtitles: [{ name: channel }],
      time: date.toISOString(),
      products: ["YouTube"],
    }
  })
  return analyzeYoutubeHistory(records)
}
