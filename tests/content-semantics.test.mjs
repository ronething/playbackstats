import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

const youtubePage = readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8")
const spotifyPage = readFileSync(new URL("../app/spotify/page.tsx", import.meta.url), "utf8")
const spotifyAnalyzer = readFileSync(
  new URL("../components/spotify/spotify-analyzer.tsx", import.meta.url),
  "utf8",
)

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
