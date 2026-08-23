import type { SpotifyAnalysis } from "@/lib/spotify-analysis"

export const SPOTIFY_SHARE_CARD_FILENAME = "playback-stats-spotify-dna.png"
export const SPOTIFY_SHARE_CARD_WIDTH = 1080
export const SPOTIFY_SHARE_CARD_HEIGHT = 1350

const FONT_SANS = 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
const FONT_MONO = 'ui-monospace, "SFMono-Regular", Consolas, "Liberation Mono", monospace'

export interface SpotifyShareCardInput {
  analysis: SpotifyAnalysis
}

export interface SpotifyShareCardTrait {
  label: string
  detail: string
}

export interface SpotifyShareCardArtist {
  hours: number
  name: string
  percentage: number
}

export interface SpotifyShareCardRhythm {
  label: string
  value: string
}

export interface SpotifyShareCardData {
  activeDays: string
  dateRange: string
  topArtists: SpotifyShareCardArtist[]
  totalHours: string
  traits: SpotifyShareCardTrait[]
  uniqueArtists: string
  uniqueTracks: string
  listeningRhythm: SpotifyShareCardRhythm[]
}

export interface GeneratedSpotifyShareCard {
  blob: Blob
  previewUrl: string
}

function formatMonthYear(value: number): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
  }).format(new Date(value))
}

function formatHour(hour: number | undefined): string {
  if (hour === undefined || !Number.isFinite(hour)) return "—"
  const normalizedHour = Math.max(0, Math.min(23, Math.round(hour)))
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    hour12: true,
  }).format(new Date(2026, 0, 1, normalizedHour))
}

function findPeakHour(analysis: SpotifyAnalysis): number | undefined {
  const peak = analysis.hourly.reduce<SpotifyAnalysis["hourly"][number] | undefined>(
    (current, item) => (!current || item.minutes > current.minutes ? item : current),
    undefined,
  )
  return peak && peak.minutes > 0 ? peak.hour : undefined
}

function findFavoriteDay(analysis: SpotifyAnalysis): string {
  const favorite = analysis.weekdays.reduce<SpotifyAnalysis["weekdays"][number] | undefined>(
    (current, item) => (!current || item.minutes > current.minutes ? item : current),
    undefined,
  )
  return favorite && favorite.minutes > 0 ? favorite.day : "—"
}

function buildTraits(analysis: SpotifyAnalysis, peakHour: number | undefined): SpotifyShareCardTrait[] {
  let timeTrait: SpotifyShareCardTrait
  if (peakHour === undefined) {
    timeTrait = { label: "History Explorer", detail: "A personal listening archive" }
  } else if (peakHour < 5) {
    timeTrait = { label: "Night Owl", detail: `Peak listening around ${formatHour(peakHour)}` }
  } else if (peakHour < 12) {
    timeTrait = { label: "Morning Listener", detail: `Peak listening around ${formatHour(peakHour)}` }
  } else if (peakHour < 18) {
    timeTrait = { label: "Afternoon Listener", detail: `Peak listening around ${formatHour(peakHour)}` }
  } else {
    timeTrait = { label: "Evening Listener", detail: `Peak listening around ${formatHour(peakHour)}` }
  }

  const dailyMinutes = analysis.summary.averageMinutesPerActiveDay
  const intensityTrait = dailyMinutes >= 180
    ? { label: "All-Day Listener", detail: `${dailyMinutes.toLocaleString("en-US", { maximumFractionDigits: 1 })} min per active day` }
    : dailyMinutes >= 60
      ? { label: "Daily Soundtrack", detail: `${dailyMinutes.toLocaleString("en-US", { maximumFractionDigits: 1 })} min per active day` }
      : { label: "Casual Listener", detail: `${dailyMinutes.toLocaleString("en-US", { maximumFractionDigits: 1 })} min per active day` }

  let discoveryTrait: SpotifyShareCardTrait
  if (analysis.summary.totalPlays === 0) {
    discoveryTrait = { label: "Personal Archive", detail: "Built from local history" }
  } else {
    const variety = Math.min(1, analysis.summary.uniqueTracks / analysis.summary.totalPlays)
    const varietyDetail = `${Math.round(variety * 100)}% track-to-play variety`
    discoveryTrait = variety >= 0.55
      ? { label: "Music Explorer", detail: varietyDetail }
      : variety <= 0.25
        ? { label: "Repeat Loyalist", detail: varietyDetail }
        : { label: "Balanced Listener", detail: varietyDetail }
  }

  return [timeTrait, intensityTrait, discoveryTrait]
}

export function buildSpotifyShareCardData({
  analysis,
}: SpotifyShareCardInput): SpotifyShareCardData {
  const { summary } = analysis
  const oldestMonth = formatMonthYear(summary.firstPlayedAt)
  const newestMonth = formatMonthYear(summary.lastPlayedAt)
  const peakHour = findPeakHour(analysis)
  const topArtists = analysis.topArtists
    .filter((artist) => artist.name.trim() && artist.hours > 0)
    .slice(0, 3)
    .map((artist) => ({
      hours: artist.hours,
      name: artist.name.trim(),
      percentage: Math.max(1, Math.round(artist.share)),
    }))

  return {
    activeDays: summary.activeDays.toLocaleString("en-US"),
    dateRange: oldestMonth === newestMonth ? oldestMonth : `${oldestMonth} – ${newestMonth}`,
    topArtists,
    totalHours: summary.totalHours.toLocaleString("en-US", { maximumFractionDigits: 1 }),
    traits: buildTraits(analysis, peakHour),
    uniqueArtists: summary.uniqueArtists.toLocaleString("en-US"),
    uniqueTracks: summary.uniqueTracks.toLocaleString("en-US"),
    listeningRhythm: [
      { label: "PEAK HOUR", value: formatHour(peakHour) },
      { label: "FAVORITE DAY", value: findFavoriteDay(analysis) },
      {
        label: "LONGEST STREAK",
        value: summary.longestStreak > 0
          ? `${summary.longestStreak.toLocaleString("en-US")} ${summary.longestStreak === 1 ? "day" : "days"}`
          : "—",
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
  context.strokeStyle = "#4ade80"
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
  roundedRectangle(context, x, y, Math.min(width, 298), 38, 19)
  context.fillStyle = "rgba(255, 255, 255, 0.075)"
  context.fill()
  context.strokeStyle = "rgba(255, 255, 255, 0.12)"
  context.lineWidth = 1.5
  context.stroke()
  context.fillStyle = "#e4e4e7"
  context.fillText(label.toUpperCase(), x + 17, y + 25, 264)
  context.letterSpacing = "0px"
}

function drawTopArtistRow(
  context: CanvasRenderingContext2D,
  artist: SpotifyShareCardArtist,
  index: number,
  maximumHours: number,
  y: number,
): void {
  context.fillStyle = index === 0 ? "#86efac" : "#71717a"
  setFont(context, 700, 18, FONT_MONO)
  context.fillText(String(index + 1).padStart(2, "0"), 62, y)

  fitText(context, artist.name, 640, 29, 20, 650)
  context.fillStyle = "#f4f4f5"
  context.fillText(artist.name, 120, y)

  context.textAlign = "right"
  setFont(context, 600, 20, FONT_MONO)
  context.fillStyle = "#a1a1aa"
  context.fillText(`${artist.hours.toLocaleString("en-US", { maximumFractionDigits: 1 })} hr · ${artist.percentage}%`, 1018, y)
  context.textAlign = "left"

  roundedRectangle(context, 120, y + 22, 898, 8, 4)
  context.fillStyle = "rgba(255, 255, 255, 0.07)"
  context.fill()

  const barWidth = Math.max(20, Math.round((artist.hours / Math.max(0.1, maximumHours)) * 898))
  roundedRectangle(context, 120, y + 22, barWidth, 8, 4)
  context.fillStyle = index === 0 ? "#22c55e" : index === 1 ? "#198f49" : "#126437"
  context.fill()
}

function drawBackground(context: CanvasRenderingContext2D): void {
  const background = context.createLinearGradient(0, 0, SPOTIFY_SHARE_CARD_WIDTH, SPOTIFY_SHARE_CARD_HEIGHT)
  background.addColorStop(0, "#09090b")
  background.addColorStop(0.58, "#0d1510")
  background.addColorStop(1, "#07180d")
  context.fillStyle = background
  context.fillRect(0, 0, SPOTIFY_SHARE_CARD_WIDTH, SPOTIFY_SHARE_CARD_HEIGHT)

  const topGlow = context.createRadialGradient(965, 120, 10, 965, 120, 560)
  topGlow.addColorStop(0, "rgba(29, 185, 84, 0.36)")
  topGlow.addColorStop(1, "rgba(29, 185, 84, 0)")
  context.fillStyle = topGlow
  context.fillRect(380, 0, 700, 690)

  const bottomGlow = context.createRadialGradient(80, 1280, 10, 80, 1280, 430)
  bottomGlow.addColorStop(0, "rgba(139, 92, 246, 0.14)")
  bottomGlow.addColorStop(1, "rgba(139, 92, 246, 0)")
  context.fillStyle = bottomGlow
  context.fillRect(0, 850, 580, 500)

  context.fillStyle = "rgba(255, 255, 255, 0.022)"
  for (let x = 40; x < SPOTIFY_SHARE_CARD_WIDTH; x += 38) {
    for (let y = 38; y < SPOTIFY_SHARE_CARD_HEIGHT; y += 38) {
      context.beginPath()
      context.arc(x, y, 1.4, 0, Math.PI * 2)
      context.fill()
    }
  }
}

export function renderSpotifyShareCard(
  canvas: HTMLCanvasElement,
  input: SpotifyShareCardInput,
): void {
  canvas.width = SPOTIFY_SHARE_CARD_WIDTH
  canvas.height = SPOTIFY_SHARE_CARD_HEIGHT
  const context = canvas.getContext("2d")
  if (!context) throw new Error("This browser could not create the share card.")

  const card = buildSpotifyShareCardData(input)
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
  context.fillText("playbackstats.com/spotify", 1020, 82)
  context.fillStyle = "#71717a"
  setFont(context, 500, 16)
  context.fillText("built locally from Spotify data", 1020, 107)
  context.textAlign = "left"

  context.fillStyle = "rgba(255, 255, 255, 0.08)"
  context.fillRect(60, 142, 960, 2)

  context.fillStyle = "#86efac"
  setFont(context, 700, 18)
  context.letterSpacing = "2.4px"
  context.fillText("MY SPOTIFY DNA", 60, 196)
  context.letterSpacing = "0px"
  context.fillStyle = "#71717a"
  setFont(context, 550, 19)
  context.fillText(`·  ${card.dateRange}`, 272, 196)

  fitText(context, card.totalHours, 540, 106, 72, 750, FONT_MONO)
  context.fillStyle = "#ffffff"
  context.fillText(card.totalHours, 54, 330)
  context.fillStyle = "#a1a1aa"
  setFont(context, 600, 25)
  context.fillText("listening hours in my history", 62, 374)

  context.fillStyle = "#71717a"
  setFont(context, 550, 20)
  context.fillText(`${card.uniqueArtists} artists`, 62, 425)
  context.fillText(`${card.uniqueTracks} tracks`, 245, 425)
  context.fillText(`${card.activeDays} active days`, 422, 425)

  roundedRectangle(context, 655, 176, 365, 274, 34)
  const personalitySurface = context.createLinearGradient(655, 176, 1020, 450)
  personalitySurface.addColorStop(0, "rgba(29, 185, 84, 0.2)")
  personalitySurface.addColorStop(1, "rgba(255, 255, 255, 0.045)")
  context.fillStyle = personalitySurface
  context.fill()
  context.strokeStyle = "rgba(134, 239, 172, 0.25)"
  context.lineWidth = 2
  context.stroke()

  context.fillStyle = "#86efac"
  setFont(context, 700, 16)
  context.letterSpacing = "1.8px"
  context.fillText("LISTENING PERSONALITY", 688, 219)
  context.letterSpacing = "0px"
  fitText(context, card.traits[0].label, 300, 47, 32, 760)
  context.fillStyle = "#ffffff"
  context.fillText(card.traits[0].label, 688, 283)
  context.fillStyle = "#c2c2c8"
  fitText(context, card.traits[0].detail, 300, 21, 17, 550)
  context.fillText(card.traits[0].detail, 688, 322)

  drawTraitPill(context, card.traits[1].label, 688, 350)
  drawTraitPill(context, card.traits[2].label, 688, 399)

  context.fillStyle = "rgba(255, 255, 255, 0.08)"
  context.fillRect(60, 492, 960, 2)

  context.fillStyle = "#ffffff"
  setFont(context, 700, 30)
  context.fillText("The artists I return to", 60, 548)
  context.fillStyle = "#71717a"
  setFont(context, 500, 18)
  context.fillText("Ranked by total listening time", 60, 579)

  if (card.topArtists.length > 0) {
    const maximumHours = card.topArtists[0].hours
    card.topArtists.forEach((artist, index) => {
      drawTopArtistRow(context, artist, index, maximumHours, 638 + index * 86)
    })
  } else {
    roundedRectangle(context, 60, 612, 960, 150, 26)
    context.fillStyle = "rgba(255, 255, 255, 0.04)"
    context.fill()
    context.fillStyle = "#a1a1aa"
    setFont(context, 550, 23)
    context.fillText("Artist names were not available in this export.", 92, 696)
  }

  context.fillStyle = "rgba(255, 255, 255, 0.08)"
  context.fillRect(60, 885, 960, 2)
  context.fillStyle = "#ffffff"
  setFont(context, 700, 30)
  context.fillText("My listening rhythm", 60, 941)

  card.listeningRhythm.forEach((item, index) => {
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
  context.fillText("What does your Spotify history say about you?", 60, 1191)
  context.fillStyle = "#8b8b93"
  setFont(context, 500, 18)
  context.fillText("Generate your own private playback report.", 60, 1224)

  roundedRectangle(context, 700, 1162, 320, 72, 22)
  context.fillStyle = "#1DB954"
  context.fill()
  context.fillStyle = "#07180d"
  setFont(context, 750, 20)
  context.fillText("playbackstats.com/spotify  →", 724, 1207)

  context.fillStyle = "#606067"
  setFont(context, 500, 16)
  context.fillText("Generated locally. I chose to download this card.", 60, 1291)
}

export async function createSpotifyShareCard(
  input: SpotifyShareCardInput,
): Promise<GeneratedSpotifyShareCard> {
  const canvas = document.createElement("canvas")
  renderSpotifyShareCard(canvas, input)
  const previewUrl = canvas.toDataURL("image/png")
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"))
  if (!blob) throw new Error("This browser could not export the share card.")
  return { blob, previewUrl }
}

export function downloadSpotifyShareCard(blob: Blob): void {
  const objectUrl = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = objectUrl
  link.download = SPOTIFY_SHARE_CARD_FILENAME
  link.hidden = true
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1_000)
}
