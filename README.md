# Playback Stats

<a href="https://www.producthunt.com/posts/yt-history?embed=true&utm_source=badge-featured&utm_medium=badge&utm_souce=badge-yt&#0045;history" target="_blank"><img src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=541313&theme=light" alt="Playback Stats on Product Hunt" width="250" height="54" /></a>

A privacy-first web app for exploring your YouTube watch history and Spotify listening history. Files are analyzed locally in your browser and are never uploaded.

[Try Playback Stats](https://playbackstats.com)

## Features

- YouTube viewing trends, top channels, repeat videos, streaks, and habits
- Spotify listening time, top artists and tracks, trends, and playback behavior
- Google Takeout and Spotify streaming-history JSON support
- Private, browser-only processing with no account connection or API key

## Run locally

```bash
git clone https://github.com/ronething/yt-history.git
cd yt-history
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000), then import a supported history export.

## Tech stack

Next.js, React, TypeScript, Tailwind CSS, and Recharts.

## Preview

![Playback Stats YouTube dashboard](images/readme.webp)
