import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

const youtubePage = readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8")
const spotifyPage = readFileSync(new URL("../app/spotify/page.tsx", import.meta.url), "utf8")
const spotifyAnalyzer = readFileSync(
  new URL("../components/spotify/spotify-analyzer.tsx", import.meta.url),
  "utf8",
)
const youtubeJsonGuide = readFileSync(
  new URL("../app/guides/youtube-watch-history-json/page.tsx", import.meta.url),
  "utf8",
)
const mostWatchedChannelsGuide = readFileSync(
  new URL("../app/guides/how-to-see-most-watched-youtube-channels/page.tsx", import.meta.url),
  "utf8",
)
const sitemap = readFileSync(new URL("../app/sitemap.ts", import.meta.url), "utf8")

test("YouTube homepage does not present fabricated history as user data", () => {
  assert.doesNotMatch(youtubePage, /Your viewing history/)
  assert.doesNotMatch(youtubePage, /12,842|1,318|47 days/)
  assert.match(youtubePage, /What this YouTube history analyzer measures/)
  assert.match(youtubePage, /does not include dependable watch duration/)
  assert.match(youtubePage, /href="\/guides\/youtube-watch-history-json"/)
  assert.match(youtubePage, /href="\/guides\/how-to-see-most-watched-youtube-channels"/)
})

test("Spotify page describes the input and calculations in visible content", () => {
  assert.match(spotifyAnalyzer, /Analyze your/)
  assert.match(spotifyAnalyzer, /Spotify listening history/)
  assert.match(spotifyPage, /Standard Streaming History or Extended Streaming History/)
  assert.match(spotifyPage, /separates total listening time from qualified plays/)
})

test("YouTube JSON guide documents the supported Takeout fields and limitations", () => {
  assert.match(youtubeJsonGuide, /YouTube watch-history\.json Format & Fields/)
  assert.match(youtubeJsonGuide, /watch-history\.json<\/span> format and fields/)
  assert.match(youtubeJsonGuide, /titleUrl/)
  assert.match(youtubeJsonGuide, /subtitles\[\]\.name/)
  assert.match(youtubeJsonGuide, /ISO 8601 string/)
  assert.match(youtubeJsonGuide, /does not include reliable minutes watched/)
  assert.match(youtubeJsonGuide, /placeholder titles and URLs/)
  assert.match(youtubeJsonGuide, /href="\/guides\/how-to-see-most-watched-youtube-channels"/)
  assert.match(sitemap, /guides\/youtube-watch-history-json/)
})

test("Most-watched channels guide explains frequency rankings without inventing watch time", () => {
  assert.match(mostWatchedChannelsGuide, /How to See Your Most-Watched YouTube Channels/)
  assert.match(mostWatchedChannelsGuide, /subtitles\[\]\.name/)
  assert.match(mostWatchedChannelsGuide, /titleUrl/)
  assert.match(mostWatchedChannelsGuide, /frequency rankings, not watch-time/)
  assert.match(mostWatchedChannelsGuide, /href="\/guides\/youtube-watch-history-json"/)
  assert.match(mostWatchedChannelsGuide, /href="\/#upload"/)
  assert.match(sitemap, /guides\/how-to-see-most-watched-youtube-channels/)
})
