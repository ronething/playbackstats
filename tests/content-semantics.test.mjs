import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

const youtubePage = readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8")
const spotifyPage = readFileSync(new URL("../app/spotify/page.tsx", import.meta.url), "utf8")
const spotifyAnalyzer = readFileSync(
  new URL("../components/spotify/spotify-analyzer.tsx", import.meta.url),
  "utf8",
)
const takeoutGuide = readFileSync(new URL("../app/takeout-guide/page.tsx", import.meta.url), "utf8")
const dashboardLayout = readFileSync(new URL("../app/dashboard/layout.tsx", import.meta.url), "utf8")
const robots = readFileSync(new URL("../app/robots.ts", import.meta.url), "utf8")

test("YouTube homepage does not present fabricated history as user data", () => {
  assert.doesNotMatch(youtubePage, /Your viewing history/)
  assert.doesNotMatch(youtubePage, /12,842|1,318|47 days/)
  assert.match(youtubePage, /What this YouTube history analyzer measures/)
  assert.match(youtubePage, /does not include dependable watch duration/)
})

test("Spotify page describes the input and calculations in visible content", () => {
  assert.match(spotifyAnalyzer, /Analyze your/)
  assert.match(spotifyAnalyzer, /Spotify listening history/)
  assert.match(spotifyPage, /Standard Streaming History or Extended Streaming History/)
  assert.match(spotifyPage, /separates total listening time from qualified plays/)
})

test("Takeout guide has a distinct export intent and returns to the analyzer", () => {
  assert.match(takeoutGuide, /Export the YouTube history file Playback Stats needs/)
  assert.match(takeoutGuide, /history\/watch-history\.json/)
  assert.match(takeoutGuide, /href="\/#upload"/)
  assert.doesNotMatch(takeoutGuide, /Spotify listening history/)
})

test("user dashboard stays outside the search index", () => {
  assert.match(dashboardLayout, /index: false/)
  assert.match(dashboardLayout, /follow: false/)
  assert.match(robots, /disallow: \['\/dashboard'\]/)
})
