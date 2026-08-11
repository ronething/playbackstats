import type {
  YoutubeAdvancedStats,
  YoutubeChannelCount,
  YoutubeStats,
} from "@/lib/youtube-analysis"

export const YOUTUBE_SHARE_CARD_FILENAME = "playback-stats-youtube-dna.png"
export const YOUTUBE_SHARE_CARD_WIDTH = 1080
export const YOUTUBE_SHARE_CARD_HEIGHT = 1350

const FONT_SANS = 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
const FONT_MONO = 'ui-monospace, "SFMono-Regular", Consolas, "Liberation Mono", monospace'

export interface YoutubeShareCardInput {
  stats: YoutubeStats
  advancedStats: YoutubeAdvancedStats | null
  channelCounts: YoutubeChannelCount[]
}

export interface YoutubeShareCardTrait {
  label: string
  detail: string
}

export interface YoutubeShareCardChannel {
  count: number
  name: string
  percentage: number
}

export interface YoutubeShareCardRhythm {
  label: string
  value: string
}

export interface YoutubeShareCardData {
  dailyAverage: string
  dateRange: string
  historyDays: string
  topChannels: YoutubeShareCardChannel[]
  totalViews: string
  traits: YoutubeShareCardTrait[]
  uniqueChannels: string
  viewingRhythm: YoutubeShareCardRhythm[]
}

export interface GeneratedYoutubeShareCard {
  blob: Blob
  previewUrl: string
}

function formatMonthYear(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value))
}

function formatHour(hour: number | undefined): string {
  if (hour === undefined || !Number.isFinite(hour)) return "—"
  const normalizedHour = Math.max(0, Math.min(23, Math.round(hour)))
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    hour12: true,
    timeZone: "UTC",
  }).format(new Date(Date.UTC(2026, 0, 1, normalizedHour)))
}

function buildTraits(
  advancedStats: YoutubeAdvancedStats | null,
  dailyAverage: number,
): YoutubeShareCardTrait[] {
  let timeTrait: YoutubeShareCardTrait
  if (!advancedStats) {
    timeTrait = { label: "History Explorer", detail: "A personal playback archive" }
  } else if (advancedStats.nightOwlScore > 40) {
    timeTrait = { label: "Night Owl", detail: `${advancedStats.nightOwlScore}% after 10 PM` }
  } else if (advancedStats.earlyBirdScore > 30) {
    timeTrait = { label: "Early Bird", detail: `${advancedStats.earlyBirdScore}% between 5–9 AM` }
  } else if (advancedStats.middayScore > 25) {
    timeTrait = { label: "Midday Watcher", detail: `${advancedStats.middayScore}% around lunch` }
  } else {
    timeTrait = { label: "Balanced Viewer", detail: `Peak hour: ${formatHour(advancedStats.peakHour)}` }
  }

  const intensityTrait = dailyAverage > 15
    ? { label: "Super Fan", detail: `${dailyAverage.toFixed(1)} views a day` }
    : dailyAverage > 5
      ? { label: "Regular Viewer", detail: `${dailyAverage.toFixed(1)} views a day` }
      : { label: "Casual Browser", detail: `${dailyAverage.toFixed(1)} views a day` }

  let loyaltyTrait: YoutubeShareCardTrait
  if (!advancedStats) {
    loyaltyTrait = { label: "Personal Archive", detail: "Built from local history" }
  } else if (advancedStats.topChannelPercentage > 30) {
    loyaltyTrait = { label: "Loyal Fan", detail: `${advancedStats.topChannelPercentage}% for one channel` }
  } else if (advancedStats.channelDiversity > 0.6) {
    loyaltyTrait = { label: "Content Explorer", detail: "A wide mix of channels" }
  } else {
    loyaltyTrait = { label: "Balanced Explorer", detail: "Favorites plus discoveries" }
  }

  return [timeTrait, intensityTrait, loyaltyTrait]
}

export function buildYoutubeShareCardData({
  stats,
  advancedStats,
  channelCounts,
}: YoutubeShareCardInput): YoutubeShareCardData {
  const historyDays = Math.max(1, stats.daysDifference)
  const dailyAverage = stats.totalVideos / historyDays
  const oldestMonth = formatMonthYear(stats.oldestDate)
  const newestMonth = formatMonthYear(stats.newestDate)
  const topChannels = channelCounts
    .filter((channel) => channel.name.trim() && channel.count > 0)
    .slice(0, 3)
    .map((channel) => ({
      count: channel.count,
      name: channel.name.trim(),
      percentage: Math.max(1, Math.round((channel.count / Math.max(1, stats.totalVideos)) * 100)),
    }))

  return {
    dailyAverage: dailyAverage.toLocaleString("en-US", { maximumFractionDigits: 1 }),
    dateRange: oldestMonth === newestMonth ? oldestMonth : `${oldestMonth} – ${newestMonth}`,
    historyDays: historyDays.toLocaleString("en-US"),
    topChannels,
    totalViews: stats.totalVideos.toLocaleString("en-US"),
    traits: buildTraits(advancedStats, dailyAverage),
    uniqueChannels: stats.uniqueChannels.toLocaleString("en-US"),
    viewingRhythm: [
      { label: "PEAK HOUR", value: formatHour(advancedStats?.peakHour) },
      { label: "FAVORITE DAY", value: advancedStats?.favoriteDay || "—" },
      {
        label: "LONGEST STREAK",
        value: advancedStats ? `${advancedStats.longestStreak.toLocaleString("en-US")} days` : "—",
      },
    ],
  }
}

function roundedRectangle(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
): void {
  const safeRadius = Math.min(radius, width / 2, height / 2)
  context.beginPath()
  context.moveTo(x + safeRadius, y)
  context.arcTo(x + width, y, x + width, y + height, safeRadius)
  context.arcTo(x + width, y + height, x, y + height, safeRadius)
  context.arcTo(x, y + height, x, y, safeRadius)
  context.arcTo(x, y, x + width, y, safeRadius)
  context.closePath()
}

function setFont(
  context: CanvasRenderingContext2D,
  weight: number,
  size: number,
  family = FONT_SANS,
): void {
  context.font = `${weight} ${size}px ${family}`
}

function fitText(
  context: CanvasRenderingContext2D,
  text: string,
  maximumWidth: number,
  initialSize: number,
  minimumSize: number,
  weight = 700,
  family = FONT_SANS,
): void {
  let fontSize = initialSize
  setFont(context, weight, fontSize, family)
  while (fontSize > minimumSize && context.measureText(text).width > maximumWidth) {
    fontSize -= 2
    setFont(context, weight, fontSize, family)
  }
}

function drawPlaybackStatsLogo(context: CanvasRenderingContext2D, x: number, y: number): void {
  roundedRectangle(context, x, y, 64, 64, 16)
  context.fillStyle = "#0b1020"
  context.fill()
  context.strokeStyle = "rgba(255, 255, 255, 0.14)"
  context.lineWidth = 2
  context.stroke()

  context.beginPath()
  context.arc(x + 32, y + 32, 18, 0, Math.PI * 2)
  context.strokeStyle = "#9ae6b4"
  context.lineWidth = 5
  context.stroke()

  context.beginPath()
  context.moveTo(x + 26, y + 22)
  context.lineTo(x + 26, y + 42)
  context.lineTo(x + 44, y + 32)
  context.closePath()
  context.fillStyle = "#ffffff"
  context.fill()
}

function drawTraitPill(
  context: CanvasRenderingContext2D,
  label: string,
  x: number,
  y: number,
): void {
  setFont(context, 700, 17)
  context.letterSpacing = "0.8px"
  const width = Math.ceil(context.measureText(label.toUpperCase()).width) + 34
  roundedRectangle(context, x, y, width, 38, 19)
  context.fillStyle = "rgba(255, 255, 255, 0.075)"
  context.fill()
  context.strokeStyle = "rgba(255, 255, 255, 0.12)"
  context.lineWidth = 1.5
  context.stroke()
  context.fillStyle = "#e4e4e7"
  context.fillText(label.toUpperCase(), x + 17, y + 25)
  context.letterSpacing = "0px"
}

function drawTopChannelRow(
  context: CanvasRenderingContext2D,
  channel: YoutubeShareCardChannel,
  index: number,
  maximumCount: number,
  y: number,
): void {
  context.fillStyle = index === 0 ? "#fda4af" : "#71717a"
  setFont(context, 700, 18, FONT_MONO)
  context.fillText(String(index + 1).padStart(2, "0"), 62, y)

  fitText(context, channel.name, 640, 29, 20, 650)
  context.fillStyle = "#f4f4f5"
  context.fillText(channel.name, 120, y)

  context.textAlign = "right"
  setFont(context, 600, 20, FONT_MONO)
  context.fillStyle = "#a1a1aa"
  context.fillText(`${channel.count.toLocaleString("en-US")} views · ${channel.percentage}%`, 1018, y)
  context.textAlign = "left"

  roundedRectangle(context, 120, y + 22, 898, 8, 4)
  context.fillStyle = "rgba(255, 255, 255, 0.07)"
  context.fill()

  const barWidth = Math.max(20, Math.round((channel.count / Math.max(1, maximumCount)) * 898))
  roundedRectangle(context, 120, y + 22, barWidth, 8, 4)
  context.fillStyle = index === 0 ? "#fb7185" : index === 1 ? "#be5b69" : "#83424c"
  context.fill()
}

function drawBackground(context: CanvasRenderingContext2D): void {
  const background = context.createLinearGradient(0, 0, YOUTUBE_SHARE_CARD_WIDTH, YOUTUBE_SHARE_CARD_HEIGHT)
  background.addColorStop(0, "#09090b")
  background.addColorStop(0.58, "#141315")
  background.addColorStop(1, "#1c0d10")
  context.fillStyle = background
  context.fillRect(0, 0, YOUTUBE_SHARE_CARD_WIDTH, YOUTUBE_SHARE_CARD_HEIGHT)

  const topGlow = context.createRadialGradient(965, 120, 10, 965, 120, 560)
  topGlow.addColorStop(0, "rgba(225, 67, 83, 0.34)")
  topGlow.addColorStop(1, "rgba(225, 67, 83, 0)")
  context.fillStyle = topGlow
  context.fillRect(380, 0, 700, 690)

  const bottomGlow = context.createRadialGradient(80, 1280, 10, 80, 1280, 430)
  bottomGlow.addColorStop(0, "rgba(154, 230, 180, 0.12)")
  bottomGlow.addColorStop(1, "rgba(154, 230, 180, 0)")
  context.fillStyle = bottomGlow
  context.fillRect(0, 850, 580, 500)

  context.fillStyle = "rgba(255, 255, 255, 0.022)"
  for (let x = 40; x < YOUTUBE_SHARE_CARD_WIDTH; x += 38) {
    for (let y = 38; y < YOUTUBE_SHARE_CARD_HEIGHT; y += 38) {
      context.beginPath()
      context.arc(x, y, 1.4, 0, Math.PI * 2)
      context.fill()
    }
  }
}

export function renderYoutubeShareCard(
  canvas: HTMLCanvasElement,
  input: YoutubeShareCardInput,
): void {
  canvas.width = YOUTUBE_SHARE_CARD_WIDTH
  canvas.height = YOUTUBE_SHARE_CARD_HEIGHT
  const context = canvas.getContext("2d")
  if (!context) throw new Error("This browser could not create the share card.")

  const card = buildYoutubeShareCardData(input)
  drawBackground(context)

  drawPlaybackStatsLogo(context, 60, 50)
  context.fillStyle = "#ffffff"
  setFont(context, 700, 27)
  context.fillText("Playback Stats", 146, 78)
  context.fillStyle = "#8b8b93"
  setFont(context, 500, 18)
  context.fillText("Private playback insights", 146, 105)

  context.textAlign = "right"
  context.fillStyle = "#d4d4d8"
  setFont(context, 650, 19)
  context.fillText("playbackstats.com", 1020, 82)
  context.fillStyle = "#71717a"
  setFont(context, 500, 16)
  context.fillText("built locally from Google Takeout", 1020, 107)
  context.textAlign = "left"

  context.fillStyle = "rgba(255, 255, 255, 0.08)"
  context.fillRect(60, 142, 960, 2)

  context.fillStyle = "#fda4af"
  setFont(context, 700, 18)
  context.letterSpacing = "2.4px"
  context.fillText("MY YOUTUBE DNA", 60, 196)
  context.letterSpacing = "0px"
  context.fillStyle = "#71717a"
  setFont(context, 550, 19)
  context.fillText(`·  ${card.dateRange}`, 285, 196)

  fitText(context, card.totalViews, 540, 106, 72, 750, FONT_MONO)
  context.fillStyle = "#ffffff"
  context.fillText(card.totalViews, 54, 330)
  context.fillStyle = "#a1a1aa"
  setFont(context, 600, 25)
  context.fillText("watch events in my history", 62, 374)

  context.fillStyle = "#71717a"
  setFont(context, 550, 20)
  context.fillText(`${card.uniqueChannels} channels`, 62, 425)
  context.fillText(`${card.dailyAverage} views / day`, 250, 425)
  context.fillText(`${card.historyDays} days captured`, 453, 425)

  roundedRectangle(context, 655, 176, 365, 274, 34)
  const personalitySurface = context.createLinearGradient(655, 176, 1020, 450)
  personalitySurface.addColorStop(0, "rgba(225, 67, 83, 0.18)")
  personalitySurface.addColorStop(1, "rgba(255, 255, 255, 0.045)")
  context.fillStyle = personalitySurface
  context.fill()
  context.strokeStyle = "rgba(253, 164, 175, 0.25)"
  context.lineWidth = 2
  context.stroke()

  context.fillStyle = "#fda4af"
  setFont(context, 700, 16)
  context.letterSpacing = "1.8px"
  context.fillText("VIEWING PERSONALITY", 688, 219)
  context.letterSpacing = "0px"
  fitText(context, card.traits[0].label, 300, 47, 34, 760)
  context.fillStyle = "#ffffff"
  context.fillText(card.traits[0].label, 688, 283)
  context.fillStyle = "#c2c2c8"
  setFont(context, 550, 21)
  context.fillText(card.traits[0].detail, 688, 322)

  drawTraitPill(context, card.traits[1].label, 688, 350)
  drawTraitPill(context, card.traits[2].label, 688, 399)

  context.fillStyle = "rgba(255, 255, 255, 0.08)"
  context.fillRect(60, 492, 960, 2)

  context.fillStyle = "#ffffff"
  setFont(context, 700, 30)
  context.fillText("The channels I return to", 60, 548)
  context.fillStyle = "#71717a"
  setFont(context, 500, 18)
  context.fillText("Ranked by repeat viewing events", 60, 579)

  if (card.topChannels.length > 0) {
    const maximumCount = card.topChannels[0].count
    card.topChannels.forEach((channel, index) => {
      drawTopChannelRow(context, channel, index, maximumCount, 638 + index * 86)
    })
  } else {
    roundedRectangle(context, 60, 612, 960, 150, 26)
    context.fillStyle = "rgba(255, 255, 255, 0.04)"
    context.fill()
    context.fillStyle = "#a1a1aa"
    setFont(context, 550, 23)
    context.fillText("Channel names were not available in this export.", 92, 696)
  }

  context.fillStyle = "rgba(255, 255, 255, 0.08)"
  context.fillRect(60, 885, 960, 2)
  context.fillStyle = "#ffffff"
  setFont(context, 700, 30)
  context.fillText("My viewing rhythm", 60, 941)

  card.viewingRhythm.forEach((item, index) => {
    const x = 60 + index * 320
    if (index > 0) {
      context.fillStyle = "rgba(255, 255, 255, 0.09)"
      context.fillRect(x, 982, 2, 110)
    }
    context.fillStyle = "#71717a"
    setFont(context, 700, 16)
    context.letterSpacing = "1.6px"
    context.fillText(item.label, x + (index > 0 ? 34 : 0), 1009)
    context.letterSpacing = "0px"
    fitText(context, item.value, 270, 36, 25, 700)
    context.fillStyle = "#f4f4f5"
    context.fillText(item.value, x + (index > 0 ? 34 : 0), 1066)
  })

  context.fillStyle = "rgba(255, 255, 255, 0.08)"
  context.fillRect(60, 1134, 960, 2)

  context.fillStyle = "#ffffff"
  setFont(context, 700, 28)
  context.fillText("What does your YouTube history say about you?", 60, 1191)
  context.fillStyle = "#8b8b93"
  setFont(context, 500, 18)
  context.fillText("Generate your own private playback report.", 60, 1224)

  roundedRectangle(context, 725, 1162, 295, 72, 22)
  context.fillStyle = "#e14353"
  context.fill()
  context.fillStyle = "#ffffff"
  setFont(context, 700, 21)
  context.fillText("playbackstats.com  →", 758, 1207)

  context.fillStyle = "#606067"
  setFont(context, 500, 16)
  context.fillText("Generated locally. I chose to download this card.", 60, 1291)
}

export async function createYoutubeShareCard(
  input: YoutubeShareCardInput,
): Promise<GeneratedYoutubeShareCard> {
  const canvas = document.createElement("canvas")
  renderYoutubeShareCard(canvas, input)
  const previewUrl = canvas.toDataURL("image/png")
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"))
  if (!blob) throw new Error("This browser could not export the share card.")
  return { blob, previewUrl }
}

export function downloadYoutubeShareCard(blob: Blob): void {
  const objectUrl = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = objectUrl
  link.download = YOUTUBE_SHARE_CARD_FILENAME
  link.hidden = true
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1_000)
}
