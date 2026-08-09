import assert from "node:assert/strict"
import test from "node:test"

import {
  fileSizeBucket,
  processingTimeBucket,
  recordCountBucket,
  sanitizeAnalyticsProperties,
  trackEvent,
} from "../lib/analytics.ts"

test("analytics payload keeps only approved coarse properties", () => {
  const safe = sanitizeAnalyticsProperties({
    platform: "youtube",
    input_format: "takeout_zip",
    file_size_bucket: "10_50_mb",
    record_count_bucket: "10k_99k",
    processing_time_bucket: "3_10_s",
    error_code: "malformed_json",
    source_page: "home",
    filename: "watch-history-secret.json",
    title: "private video",
    channel: "private channel",
    exact_timestamp: "2025-01-01T00:00:00Z",
    records: [{ title: "private" }],
  })

  assert.deepEqual(safe, {
    platform: "youtube",
    input_format: "takeout_zip",
    file_size_bucket: "10_50_mb",
    record_count_bucket: "10k_99k",
    processing_time_bucket: "3_10_s",
    error_code: "malformed_json",
    source_page: "home",
  })
})

test("runtime validation also drops invalid values passed through unsafe callers", () => {
  let captured: { event: string; options?: { props?: Record<string, unknown> } } | undefined
  Object.assign(globalThis, {
    window: {
      plausible: (event: string, options?: { props?: Record<string, unknown> }) => {
        captured = { event, options }
      },
    },
  })

  trackEvent("history_parse_failed", {
    platform: "youtube",
    source_page: "private/video/title" as never,
  })
  assert.equal(captured?.event, "history_parse_failed")
  assert.deepEqual(captured?.options?.props, { platform: "youtube" })
  Reflect.deleteProperty(globalThis, "window")
})

test("bucket helpers never expose exact measurements", () => {
  assert.equal(fileSizeBucket(12 * 1024 * 1024), "10_50_mb")
  assert.equal(recordCountBucket(12_345), "10k_99k")
  assert.equal(processingTimeBucket(4_321), "3_10_s")
})
