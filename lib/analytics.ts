export const ANALYTICS_EVENTS = [
  "sample_report_opened",
  "takeout_guide_opened",
  "history_file_selected",
  "history_parse_started",
  "history_parse_succeeded",
  "history_parse_failed",
  "dashboard_viewed",
  "share_started",
  "share_completed",
  "donation_clicked",
  "pro_interest_clicked",
] as const

export type AnalyticsEvent = (typeof ANALYTICS_EVENTS)[number]

export type AnalyticsPlatform = "youtube" | "spotify"
export type AnalyticsInputFormat =
  | "youtube_json"
  | "takeout_zip"
  | "spotify_json"
  | "spotify_standard"
  | "spotify_extended"
  | "spotify_mixed"
  | "sample"
export type FileSizeBucket = "under_1_mb" | "1_10_mb" | "10_50_mb" | "50_100_mb" | "over_100_mb"
export type RecordCountBucket = "0" | "1_99" | "100_999" | "1k_9k" | "10k_99k" | "100k_plus"
export type ProcessingTimeBucket = "under_1_s" | "1_3_s" | "3_10_s" | "10_30_s" | "30_s_plus"
export type AnalyticsErrorCode =
  | "unsupported_format"
  | "malformed_json"
  | "incorrect_takeout_path"
  | "empty_history"
  | "memory_exhaustion"
  | "browser_failure"
export type AnalyticsSourcePage = "home" | "takeout_guide" | "youtube_dashboard" | "spotify"

export interface AnalyticsProperties {
  platform?: AnalyticsPlatform
  input_format?: AnalyticsInputFormat
  file_size_bucket?: FileSizeBucket
  record_count_bucket?: RecordCountBucket
  processing_time_bucket?: ProcessingTimeBucket
  error_code?: AnalyticsErrorCode
  source_page?: AnalyticsSourcePage
}

type PropertyName = keyof AnalyticsProperties
type Scalar = string | number | boolean

const EVENT_SET = new Set<string>(ANALYTICS_EVENTS)
const ALLOWED_VALUES: Record<PropertyName, ReadonlySet<string>> = {
  platform: new Set(["youtube", "spotify"]),
  input_format: new Set([
    "youtube_json",
    "takeout_zip",
    "spotify_json",
    "spotify_standard",
    "spotify_extended",
    "spotify_mixed",
    "sample",
  ]),
  file_size_bucket: new Set(["under_1_mb", "1_10_mb", "10_50_mb", "50_100_mb", "over_100_mb"]),
  record_count_bucket: new Set(["0", "1_99", "100_999", "1k_9k", "10k_99k", "100k_plus"]),
  processing_time_bucket: new Set(["under_1_s", "1_3_s", "3_10_s", "10_30_s", "30_s_plus"]),
  error_code: new Set([
    "unsupported_format",
    "malformed_json",
    "incorrect_takeout_path",
    "empty_history",
    "memory_exhaustion",
    "browser_failure",
  ]),
  source_page: new Set(["home", "takeout_guide", "youtube_dashboard", "spotify"]),
}

declare global {
  interface Window {
    plausible?: (
      event: string,
      options?: { props?: Record<string, Scalar>; callback?: (result?: unknown) => void },
    ) => void
  }
}

export function fileSizeBucket(bytes: number): FileSizeBucket {
  const megabytes = bytes / (1024 * 1024)
  if (megabytes < 1) return "under_1_mb"
  if (megabytes < 10) return "1_10_mb"
  if (megabytes < 50) return "10_50_mb"
  if (megabytes <= 100) return "50_100_mb"
  return "over_100_mb"
}

export function recordCountBucket(count: number): RecordCountBucket {
  if (count <= 0) return "0"
  if (count < 100) return "1_99"
  if (count < 1_000) return "100_999"
  if (count < 10_000) return "1k_9k"
  if (count < 100_000) return "10k_99k"
  return "100k_plus"
}

export function processingTimeBucket(milliseconds: number): ProcessingTimeBucket {
  if (milliseconds < 1_000) return "under_1_s"
  if (milliseconds < 3_000) return "1_3_s"
  if (milliseconds < 10_000) return "3_10_s"
  if (milliseconds < 30_000) return "10_30_s"
  return "30_s_plus"
}

export function sanitizeAnalyticsProperties(properties: Record<string, unknown>): Record<string, Scalar> {
  return Object.entries(ALLOWED_VALUES).reduce<Record<string, Scalar>>((safe, [key, values]) => {
    const value = properties[key]
    if (typeof value === "string" && values.has(value)) safe[key] = value
    return safe
  }, {})
}

/**
 * The runtime allowlist is intentional: callers cannot add a filename, title,
 * channel, timestamp, raw record, or account identifier to an analytics event,
 * even through an unsafe cast or a future JavaScript caller.
 */
export function trackEvent(event: AnalyticsEvent, properties: AnalyticsProperties = {}): void {
  if (typeof window === "undefined" || !EVENT_SET.has(event)) return
  const props = sanitizeAnalyticsProperties(properties as Record<string, unknown>)
  window.plausible?.(event, Object.keys(props).length > 0 ? { props } : undefined)
}
