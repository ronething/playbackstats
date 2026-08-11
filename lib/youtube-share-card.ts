import type { YoutubeStats } from "@/lib/youtube-analysis"

export const YOUTUBE_SHARE_CARD_FILENAME = "playback-stats-youtube-card.png"
export const YOUTUBE_SHARE_CARD_WIDTH = 1080
export const YOUTUBE_SHARE_CARD_HEIGHT = 1350

export interface YoutubeShareCardMetric {
  label: string
  value: string
}

export interface YoutubeShareCardData {
  dateRange: string
  metrics: YoutubeShareCardMetric[]
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

export function buildYoutubeShareCardData(stats: YoutubeStats): YoutubeShareCardData {
  const historyDays = Math.max(1, stats.daysDifference)
  const dailyAverage = stats.totalVideos / historyDays
  const oldestMonth = formatMonthYear(stats.oldestDate)
  const newestMonth = formatMonthYear(stats.newestDate)

  return {
    dateRange: oldestMonth === newestMonth ? oldestMonth : `${oldestMonth} – ${newestMonth}`,
    metrics: [
      { label: "VIDEOS ANALYZED", value: stats.totalVideos.toLocaleString("en-US") },
      { label: "DAYS OF HISTORY", value: historyDays.toLocaleString("en-US") },
      { label: "UNIQUE CHANNELS", value: stats.uniqueChannels.toLocaleString("en-US") },
      {
        label: "DAILY AVERAGE",
        value: dailyAverage.toLocaleString("en-US", { maximumFractionDigits: 1 }),
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

function fitText(
  context: CanvasRenderingContext2D,
  text: string,
  maximumWidth: number,
  initialSize: number,
  minimumSize: number,
): void {
  let fontSize = initialSize
  context.font = `700 ${fontSize}px ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`
  while (fontSize > minimumSize && context.measureText(text).width > maximumWidth) {
    fontSize -= 2
    context.font = `700 ${fontSize}px ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`
  }
}

function drawPlaybackStatsLogo(context: CanvasRenderingContext2D, x: number, y: number): void {
  roundedRectangle(context, x, y, 76, 76, 18)
  context.fillStyle = "#0b1020"
  context.fill()
  context.strokeStyle = "rgba(255, 255, 255, 0.12)"
  context.lineWidth = 2
  context.stroke()

  context.beginPath()
  context.arc(x + 38, y + 38, 21, 0, Math.PI * 2)
  context.strokeStyle = "#9ae6b4"
  context.lineWidth = 5
  context.stroke()

  context.beginPath()
  context.moveTo(x + 31, y + 26)
  context.lineTo(x + 31, y + 50)
  context.lineTo(x + 52, y + 38)
  context.closePath()
  context.fillStyle = "#ffffff"
  context.fill()
}

function drawMetric(
  context: CanvasRenderingContext2D,
  metric: YoutubeShareCardMetric,
  x: number,
  y: number,
): void {
  const width = 430
  const height = 230

  roundedRectangle(context, x, y, width, height, 30)
  context.fillStyle = "rgba(255, 255, 255, 0.055)"
  context.fill()
  context.strokeStyle = "rgba(255, 255, 255, 0.1)"
  context.lineWidth = 2
  context.stroke()

  context.fillStyle = "#fca5a5"
  context.font = '700 22px ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
  context.letterSpacing = "2px"
  context.fillText(metric.label, x + 36, y + 58)
  context.letterSpacing = "0px"

  fitText(context, metric.value, width - 72, 82, 54)
  context.fillStyle = "#ffffff"
  context.fillText(metric.value, x + 36, y + 156)
}

export function renderYoutubeShareCard(
  canvas: HTMLCanvasElement,
  stats: YoutubeStats,
): void {
  canvas.width = YOUTUBE_SHARE_CARD_WIDTH
  canvas.height = YOUTUBE_SHARE_CARD_HEIGHT
  const context = canvas.getContext("2d")
  if (!context) throw new Error("This browser could not create the share card.")

  const card = buildYoutubeShareCardData(stats)
  const background = context.createLinearGradient(0, 0, YOUTUBE_SHARE_CARD_WIDTH, YOUTUBE_SHARE_CARD_HEIGHT)
  background.addColorStop(0, "#09090b")
  background.addColorStop(0.55, "#18181b")
  background.addColorStop(1, "#200a0c")
  context.fillStyle = background
  context.fillRect(0, 0, YOUTUBE_SHARE_CARD_WIDTH, YOUTUBE_SHARE_CARD_HEIGHT)

  const topGlow = context.createRadialGradient(890, 110, 10, 890, 110, 500)
  topGlow.addColorStop(0, "rgba(239, 68, 68, 0.32)")
  topGlow.addColorStop(1, "rgba(239, 68, 68, 0)")
  context.fillStyle = topGlow
  context.fillRect(350, 0, 730, 650)

  const bottomGlow = context.createRadialGradient(100, 1240, 10, 100, 1240, 430)
  bottomGlow.addColorStop(0, "rgba(154, 230, 180, 0.15)")
  bottomGlow.addColorStop(1, "rgba(154, 230, 180, 0)")
  context.fillStyle = bottomGlow
  context.fillRect(0, 790, 620, 560)

  context.fillStyle = "rgba(255, 255, 255, 0.025)"
  for (let x = 50; x < YOUTUBE_SHARE_CARD_WIDTH; x += 42) {
    for (let y = 50; y < YOUTUBE_SHARE_CARD_HEIGHT; y += 42) {
      context.beginPath()
      context.arc(x, y, 1.5, 0, Math.PI * 2)
      context.fill()
    }
  }

  drawPlaybackStatsLogo(context, 80, 70)
  context.fillStyle = "#ffffff"
  context.font = '700 29px ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
  context.fillText("Playback Stats", 178, 108)
  context.fillStyle = "#a1a1aa"
  context.font = '500 20px ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
  context.fillText("Private, local playback insights", 178, 139)

  roundedRectangle(context, 80, 220, 242, 48, 24)
  context.fillStyle = "rgba(239, 68, 68, 0.14)"
  context.fill()
  context.strokeStyle = "rgba(252, 165, 165, 0.28)"
  context.lineWidth = 2
  context.stroke()
  context.fillStyle = "#fca5a5"
  context.font = '700 18px ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
  context.letterSpacing = "2px"
  context.fillText("YOUTUBE HISTORY", 108, 251)
  context.letterSpacing = "0px"

  context.fillStyle = "#ffffff"
  context.font = '750 74px ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
  context.fillText("My playback,", 80, 365)
  context.fillText("in numbers.", 80, 449)
  context.fillStyle = "#a1a1aa"
  context.font = '500 28px ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
  context.fillText(card.dateRange, 82, 500)

  drawMetric(context, card.metrics[0], 80, 570)
  drawMetric(context, card.metrics[1], 570, 570)
  drawMetric(context, card.metrics[2], 80, 840)
  drawMetric(context, card.metrics[3], 570, 840)

  context.fillStyle = "#d4d4d8"
  context.font = '600 23px ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
  context.fillText("Generated locally from my Google Takeout export", 80, 1170)
  context.fillStyle = "#71717a"
  context.font = '500 19px ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
  context.fillText("No viewing history was uploaded to create this card.", 80, 1204)

  roundedRectangle(context, 738, 1150, 262, 74, 24)
  context.fillStyle = "rgba(255, 255, 255, 0.07)"
  context.fill()
  context.strokeStyle = "rgba(255, 255, 255, 0.11)"
  context.lineWidth = 2
  context.stroke()
  context.fillStyle = "#ffffff"
  context.font = '700 21px ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
  context.fillText("playbackstats.com", 775, 1194)

  context.fillStyle = "rgba(255, 255, 255, 0.07)"
  context.fillRect(80, 1284, 920, 2)
}

export async function createYoutubeShareCard(stats: YoutubeStats): Promise<GeneratedYoutubeShareCard> {
  const canvas = document.createElement("canvas")
  renderYoutubeShareCard(canvas, stats)
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
