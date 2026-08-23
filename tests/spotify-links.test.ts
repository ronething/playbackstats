import assert from "node:assert/strict"
import test from "node:test"

import { buildSpotifySearchUrl, buildSpotifyTrackLinks } from "../lib/spotify-links.ts"

test("Spotify track links are derived only from strict track URIs", () => {
  assert.deepEqual(buildSpotifyTrackLinks("spotify:track:0123456789ABCDEFGHIJKL"), {
    trackId: "0123456789ABCDEFGHIJKL",
    spotifyUrl: "https://open.spotify.com/track/0123456789ABCDEFGHIJKL",
    embedUrl: "https://open.spotify.com/embed/track/0123456789ABCDEFGHIJKL?utm_source=generator",
  })
  assert.equal(buildSpotifyTrackLinks("https://example.com/track/0123456789ABCDEFGHIJKL"), null)
  assert.equal(buildSpotifyTrackLinks("spotify:album:0123456789ABCDEFGHIJKL"), null)
  assert.equal(buildSpotifyTrackLinks("spotify:track:too-short"), null)
})

test("Spotify search fallback encodes track and artist names", () => {
  assert.equal(
    buildSpotifySearchUrl("Song / Remix", "Artist & Friend"),
    "https://open.spotify.com/search/Song%20%2F%20Remix%20Artist%20%26%20Friend",
  )
})
