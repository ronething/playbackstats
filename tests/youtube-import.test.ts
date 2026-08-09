import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import { zipSync } from "fflate"

import { analyzeYoutubeHistory } from "../lib/youtube-analysis.ts"
import {
  YOUTUBE_IMPORT_LIMITS,
  YoutubeImportError,
  extractWatchHistoryJsonFromZip,
  inspectTakeoutZip,
  parseYoutubeJson,
} from "../lib/youtube-import.ts"

const fixtureUrls = [
  new URL("./fixtures/youtube/takeout-current.json", import.meta.url),
  new URL("./fixtures/youtube/takeout-items-wrapper.json", import.meta.url),
  new URL("./fixtures/youtube/takeout-watch-history-wrapper.json", import.meta.url),
]

test("all supported anonymized YouTube fixtures parse and analyze", () => {
  const results = fixtureUrls.map((url) => {
    const parsed = parseYoutubeJson(readFileSync(url, "utf8"))
    return analyzeYoutubeHistory(parsed.records)
  })

  assert.equal(results.length, fixtureUrls.length)
  assert.deepEqual(results.map((result) => result.stats.totalVideos), [4, 1, 1])
  assert.equal(results[0].topVideos[0].count, 2, "duplicate viewing events must remain repeat views")
  assert.equal(results[0].stats.uniqueChannels, 1, "missing channel metadata must not invalidate a record")
  assert.ok(results[0].topVideos.some((video) => video.title.includes("removed")))
  assert.ok(results[0].topVideos.some((video) => video.title.includes("匿名")))
})

test("parser returns distinct actionable error codes", () => {
  assert.throws(() => parseYoutubeJson("{"), (error: unknown) => {
    assert.ok(error instanceof YoutubeImportError)
    return error.code === "malformed_json"
  })
  assert.throws(() => parseYoutubeJson('{"account":{"name":"fixture"}}'), (error: unknown) => {
    assert.ok(error instanceof YoutubeImportError)
    return error.code === "incorrect_takeout_path"
  })
  assert.throws(() => parseYoutubeJson("[]"), (error: unknown) => {
    assert.ok(error instanceof YoutubeImportError)
    return error.code === "empty_history"
  })
})

test("Takeout ZIP extraction locates only watch-history.json and preserves local parsing", () => {
  const fixture = Uint8Array.from(readFileSync(fixtureUrls[0]))
  const archive = zipSync({
    "Takeout/YouTube and YouTube Music/history/watch-history.json": fixture,
    "Takeout/YouTube and YouTube Music/playlists/playlists.json": new TextEncoder().encode("[]"),
  })
  const extracted = extractWatchHistoryJsonFromZip(archive)
  const parsed = parseYoutubeJson(extracted)
  assert.equal(parsed.records.length, 4)
})

test("ZIP preflight rejects a declared oversized entry before decompression", () => {
  const archive = zipSync({
    "Takeout/YouTube/history/watch-history.json": new TextEncoder().encode("[]"),
  }).slice()
  const view = new DataView(archive.buffer, archive.byteOffset, archive.byteLength)
  let centralOffset = -1
  for (let offset = 0; offset <= archive.length - 4; offset += 1) {
    if (view.getUint32(offset, true) === 0x02014b50) {
      centralOffset = offset
      break
    }
  }
  assert.notEqual(centralOffset, -1)
  view.setUint32(centralOffset + 24, YOUTUBE_IMPORT_LIMITS.entryBytes + 1, true)

  assert.throws(() => inspectTakeoutZip(archive), (error: unknown) => {
    assert.ok(error instanceof YoutubeImportError)
    return error.code === "memory_exhaustion"
  })
})
