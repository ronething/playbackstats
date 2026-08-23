const SPOTIFY_TRACK_URI_PATTERN = /^spotify:track:([A-Za-z0-9]{22})$/

export interface SpotifyTrackLinks {
  trackId: string
  spotifyUrl: string
  embedUrl: string
}

export function buildSpotifyTrackLinks(trackUri: string | undefined): SpotifyTrackLinks | null {
  if (!trackUri) return null
  const match = SPOTIFY_TRACK_URI_PATTERN.exec(trackUri.trim())
  if (!match) return null

  const trackId = match[1]
  return {
    trackId,
    spotifyUrl: `https://open.spotify.com/track/${trackId}`,
    embedUrl: `https://open.spotify.com/embed/track/${trackId}?utm_source=generator`,
  }
}

export function buildSpotifySearchUrl(track: string, artist: string): string {
  return `https://open.spotify.com/search/${encodeURIComponent(`${track} ${artist}`)}`
}
