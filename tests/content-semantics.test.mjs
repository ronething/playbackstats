import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

const youtubePage = readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8")
const youtubeLanding = readFileSync(new URL("../components/landing-page.tsx", import.meta.url), "utf8")
const localizedContent = readFileSync(new URL("../lib/i18n.ts", import.meta.url), "utf8")
const youtubeSource = `${youtubePage}\n${youtubeLanding}\n${localizedContent}`
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
  assert.doesNotMatch(youtubeSource, /Your viewing history/)
  assert.doesNotMatch(youtubeSource, /12,842|1,318|47 days/)
  assert.match(youtubeSource, /From export to insight/)
  assert.match(youtubeSource, /do not include dependable minutes watched/)
  assert.match(youtubeSource, /Google Takeout ZIP or watch-history\.json/)
  assert.match(youtubeSource, /How do I see my YouTube stats as a viewer\?/)
  assert.match(youtubeSource, /YouTube History was paused/)
  assert.match(youtubeSource, /Google removed through auto-delete/)
  assert.match(youtubeSource, /href="\/guides\/youtube-watch-history-json"/)
  assert.match(youtubeSource, /href="\/guides\/how-to-see-most-watched-youtube-channels"/)
})

test("Spotify page describes the input and calculations in visible content", () => {
  assert.match(spotifyAnalyzer, /Analyze your/)
  assert.match(spotifyAnalyzer, /Spotify listening history/)
  assert.match(spotifyPage, /Standard Streaming History or Extended Streaming History/)
  assert.match(spotifyPage, /separates total listening time from qualified plays/)
  assert.match(spotifyPage, /Can I see Spotify stats without logging in\?/)
  assert.match(spotifyPage, /How far back will my Spotify stats go\?/)
  assert.match(spotifyPage, /What happens to my Spotify stats when I refresh\?/)
})

test("Sitemap uses stable page-specific modification dates", () => {
  assert.doesNotMatch(sitemap, /new Date|currentDate/)
  assert.equal((sitemap.match(/lastModified:/g) ?? []).length, 8)
  assert.match(sitemap, /lastModified: "2026-08-22"/)
  assert.match(sitemap, /lastModified: "2026-08-11"/)
  assert.match(sitemap, /lastModified: "2025-05-04"/)
})

test("Localized homepages provide distinct content and language targeting", () => {
  const localizedPage = readFileSync(new URL("../app/[locale]/page.tsx", import.meta.url), "utf8")
  const seo = readFileSync(new URL("../lib/seo.ts", import.meta.url), "utf8")
  const layout = readFileSync(new URL("../app/layout.tsx", import.meta.url), "utf8")
  const header = readFileSync(new URL("../components/playback-header.tsx", import.meta.url), "utf8")

  assert.match(localizedContent, /YouTube-Wiedergabeverlauf analysieren/)
  assert.match(localizedContent, /Analyser l’historique YouTube/)
  assert.match(localizedPage, /generateStaticParams/)
  assert.match(seo, /"x-default"/)
  assert.match(seo, /alternateLocale/)
  assert.doesNotMatch(seo, /keywords/)
  assert.match(layout, /<html lang=\{locale\}>/)
  assert.match(header, /hrefLang=\{candidate\}/)
  assert.match(sitemap, /url: `\$\{baseUrl\}\/de`/)
  assert.match(sitemap, /url: `\$\{baseUrl\}\/fr`/)
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
