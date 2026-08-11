import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import { zipSync } from "fflate"

import { analyzeYoutubeHistory } from "../lib/youtube-analysis.ts"
import {
  YOUTUBE_IMPORT_LIMITS,
  YoutubeImportError,
  asYoutubeImportError,
  extractWatchHistoryJsonFromZip,
  getYoutubeInputFormat,
  inspectTakeoutZip,
  parseYoutubeJson,
  readYoutubeHistoryFile,
} from "../lib/youtube-import.ts"

const fixtureUrls = [
  new URL("./fixtures/youtube/takeout-current.json", import.meta.url),
  new URL("./fixtures/youtube/takeout-items-wrapper.json", import.meta.url),
  new URL("./fixtures/youtube/takeout-watch-history-wrapper.json", import.meta.url),
]

function zipWithHistory(path = "Takeout/YouTube and YouTube Music/history/watch-history.json") {
  return zipSync({
    [path]: Uint8Array.from(readFileSync(fixtureUrls[0])),
    "Takeout/YouTube and YouTube Music/playlists/playlists.json": new TextEncoder().encode("[]"),
  })
}

function youtubeSearchHistoryFixture() {
  const records = [
    "https://www.youtube.com/results?search_query=fixture-one",
    "https://www.youtube.com/watch?v=clicked-search-result",
    "https://www.youtube.com/results?search_query=fixture-two",
    "https://www.youtube.com/results?search_query=fixture-three",
  ].map((titleUrl, index) => ({
    header: "YouTube",
    title: `Fixture search activity ${index + 1}`,
    titleUrl,
    time: new Date(Date.UTC(2025, 0, 1, index)).toISOString(),
    products: ["YouTube"],
  }))

  return new TextEncoder().encode(JSON.stringify(records))
}

test("supported anonymized YouTube fixtures parse and analyze", () => {
  const results = fixtureUrls.map((url) => {
    const parsed = parseYoutubeJson(readFileSync(url, "utf8"))
    return analyzeYoutubeHistory(parsed.records)
  })

  assert.deepEqual(results.map((result) => result.stats.totalVideos), [4, 1, 1])
  assert.equal(results[0].topVideos[0].count, 2, "duplicate viewing events remain repeat views")
  assert.equal(results[0].stats.uniqueChannels, 1, "missing channel metadata does not invalidate a record")
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

test("file extensions take precedence over unreliable browser MIME types", () => {
  assert.equal(getYoutubeInputFormat({ name: "watch-history.json", type: "application/zip" }), "youtube_json")
  assert.equal(getYoutubeInputFormat({ name: "takeout.zip", type: "application/json" }), "takeout_zip")
})

test("Takeout ZIP extraction locates only watch-history.json", async () => {
  const extracted = await extractWatchHistoryJsonFromZip(zipWithHistory())
  const parsed = parseYoutubeJson(extracted)
  assert.equal(parsed.records.length, 4)
})

test("Takeout ZIP extraction supports localized watch-history filenames", async () => {
  const localizedPaths = [
    "Takeout/YouTube en YouTube Music/geschiedenis/kijkgeschiedenis.json",
    "Takeout/YouTube und YouTube Music/Verlauf/Wiedergabeverlauf.json",
    "Takeout/YouTube 和 YouTube Music/记录/观看记录.json",
  ]

  for (const path of localizedPaths) {
    const extracted = await extractWatchHistoryJsonFromZip(zipWithHistory(path))
    assert.equal(parseYoutubeJson(extracted).records.length, 4)
  }
})

test("localized history detection ignores YouTube search history", async () => {
  const fixture = Uint8Array.from(readFileSync(fixtureUrls[0]))
  const archive = zipSync({
    "Takeout/YouTube und YouTube Music/Verlauf/Suchverlauf.json": youtubeSearchHistoryFixture(),
    "Takeout/YouTube und YouTube Music/Verlauf/Wiedergabeverlauf.json": fixture,
  })

  const extracted = await extractWatchHistoryJsonFromZip(archive)
  assert.equal(parseYoutubeJson(extracted).records.length, 4)
})

test("ZIP extraction rejects search history without viewing events", async () => {
  const archive = zipSync({
    "Takeout/YouTube en YouTube Music/geschiedenis/zoekgeschiedenis.json": youtubeSearchHistoryFixture(),
  })

  await assert.rejects(extractWatchHistoryJsonFromZip(archive), (error: unknown) => {
    assert.ok(error instanceof YoutubeImportError)
    return error.code === "incorrect_takeout_path"
  })
})

test("browser file reader accepts both Takeout ZIP and JSON inputs", async () => {
  const zipResult = await readYoutubeHistoryFile(
    new File([zipWithHistory()], "takeout.zip", { type: "application/zip" }),
  )
  const jsonResult = await readYoutubeHistoryFile(
    new File([Uint8Array.from(readFileSync(fixtureUrls[0]))], "watch-history.json", { type: "application/json" }),
  )

  assert.equal(zipResult.inputFormat, "takeout_zip")
  assert.equal(jsonResult.inputFormat, "youtube_json")
  assert.equal(zipResult.records.length, 4)
  assert.equal(jsonResult.records.length, 4)
})

test("ZIP extraction rejects multiple possible watch-history files", async () => {
  const fixture = Uint8Array.from(readFileSync(fixtureUrls[0]))
  const archive = zipSync({
    "Takeout/YouTube/history/watch-history.json": fixture,
    "Takeout/YouTube and YouTube Music/history/watch-history.json": fixture,
  })

  await assert.rejects(extractWatchHistoryJsonFromZip(archive), (error: unknown) => {
    assert.ok(error instanceof YoutubeImportError)
    return error.code === "incorrect_takeout_path"
  })
})

test("ZIP preflight rejects a declared oversized entry before decompression", () => {
  const archive = zipWithHistory().slice()
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

test("ZIP extraction rejects conflicting local and central compression methods", async () => {
  const archive = zipWithHistory().slice()
  const [entry] = inspectTakeoutZip(archive)
  const view = new DataView(archive.buffer, archive.byteOffset, archive.byteLength)
  const replacementMethod = entry.compressionMethod === 0 ? 8 : 0
  view.setUint16(entry.localHeaderOffset + 8, replacementMethod, true)

  await assert.rejects(extractWatchHistoryJsonFromZip(archive), (error: unknown) => {
    assert.ok(error instanceof YoutubeImportError)
    return error.code === "unsupported_format"
  })
})

test("large valid histories calculate date bounds without spreading timestamp arrays", () => {
  const totalRecords = 120_000
  const records = Array.from({ length: totalRecords }, (_, index) => ({
    title: `Fixture video ${index % 10}`,
    titleUrl: `https://www.youtube.com/watch?v=fixture-${index % 10}`,
    time: new Date(Date.UTC(2020, 0, 1) + index * 60_000).toISOString(),
  }))

  const analysis = analyzeYoutubeHistory(records)
  assert.equal(analysis.stats.totalVideos, totalRecords)
  assert.equal(analysis.stats.oldestDate, "2020-01-01T00:00:00.000Z")
  assert.equal(analysis.stats.newestDate, "2020-03-24T07:59:00.000Z")
})

test("memory-related runtime failures keep an actionable error code", () => {
  assert.equal(asYoutubeImportError(new RangeError("allocation failed")).code, "memory_exhaustion")
})
