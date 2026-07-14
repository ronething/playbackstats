import type { Metadata } from "next"
import Link from "next/link"
import {
  ArrowUpRight,
  BarChart3,
  Clock3,
  HeartPulse,
  ShieldCheck,
  Sparkles,
} from "lucide-react"

import PlaybackFooter from "@/components/playback-footer"
import PlaybackHeader from "@/components/playback-header"
import SpotifyAnalyzer from "@/components/spotify/spotify-analyzer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Spotify History Analyzer | Private Listening Stats",
  description:
    "Analyze your Spotify streaming history locally. Explore listening time, top artists, tracks, trends, and playback habits without uploading your data.",
  alternates: {
    canonical: "https://playbackstats.com/spotify",
  },
  openGraph: {
    type: "website",
    url: "https://playbackstats.com/spotify",
    siteName: "Playback Stats",
    title: "Spotify History Analyzer | Private Listening Stats",
    description:
      "Turn your Spotify streaming history into private charts and personal listening insights — all in your browser.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Spotify History Analyzer | Private Listening Stats",
    description: "Private, local Spotify listening analysis with charts, rankings, and personal insights.",
  },
  robots: {
    index: true,
    follow: true,
  },
}

const discoveries = [
  {
    icon: Clock3,
    title: "The shape of your time",
    description: "Follow listening hours across months, years, weekdays, and every hour on the clock.",
  },
  {
    icon: BarChart3,
    title: "Favorites with context",
    description: "See artists ranked by time and tracks ranked by qualified 30-second plays.",
  },
  {
    icon: Sparkles,
    title: "A story grounded in data",
    description: "Get concise local insights about your rhythm, discovery mix, streaks, and repeat favorites.",
  },
  {
    icon: HeartPulse,
    title: "How you listen",
    description: "Extended exports reveal skip, shuffle, offline, platform, and natural-ending patterns.",
  },
]

const exportSteps = [
  {
    title: "Request your data",
    description: "Open Spotify Account Privacy and request Extended Streaming History for the fullest analysis.",
  },
  {
    title: "Download and unzip",
    description: "When Spotify sends the archive, download it and unzip the folder on your device.",
  },
  {
    title: "Choose the history files",
    description: "Select all Streaming_History_Audio_*.json files, or choose the entire unzipped Account Data folder.",
  },
  {
    title: "Explore locally",
    description: "The browser keeps only safe listening fields in memory and builds your dashboard in this tab.",
  },
]

const faqs = [
  {
    question: "Does my Spotify data get uploaded?",
    answer:
      "No. JSON parsing and analysis happen inside this browser tab. There is no file-upload API, account connection, or server-side storage.",
  },
  {
    question: "Which export should I use?",
    answer:
      "Extended Streaming History is recommended because it covers the lifetime of your account and includes album, platform, skip, shuffle, and offline fields. Standard music history is supported as a smaller fallback.",
  },
  {
    question: "Should I select Technical Log Information?",
    answer:
      "No. Technical logs contain device, network, authentication, and diagnostic events, not the listening history needed here. The folder picker automatically skips them when possible.",
  },
  {
    question: "Why are plays marked 30s+?",
    answer:
      "The dashboard uses a transparent 30-second threshold for its qualified-play rankings. Total listening hours still include every music listening event in the import.",
  },
]

export default function SpotifyPage() {
  return (
    <div className="dark min-h-screen bg-zinc-950 text-white">
      <PlaybackHeader activePlatform="spotify" guideHref="#how-to-export" />

      <main id="main-content">
        <SpotifyAnalyzer />

        <section className="border-b border-white/[0.07] py-20 sm:py-24" aria-labelledby="discover-title">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#4ade80]">Inside your history</p>
              <h2 id="discover-title" className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                More than a top-ten list
              </h2>
              <p className="mt-4 text-base leading-7 text-zinc-400">
                Spotify&apos;s export is a timeline. This analyzer turns it into context you can scan, compare, and understand.
              </p>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {discoveries.map((item) => {
                const Icon = item.icon
                return (
                  <Card key={item.title} className="border-white/10 bg-white/[0.035] text-white">
                    <CardHeader className="pb-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1DB954]/[0.12] text-[#4ade80]">
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <CardTitle className="pt-4 text-lg">{item.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm leading-6 text-zinc-400">{item.description}</p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </section>

        <section id="how-to-export" className="scroll-mt-20 border-b border-white/[0.07] py-20 sm:py-24">
          <div className="mx-auto grid w-full max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#4ade80]">Bring your own data</p>
              <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">How to export Spotify history</h2>
              <p className="mt-5 text-base leading-7 text-zinc-400">
                Extended Streaming History covers the lifetime of your account. Spotify prepares it separately from the smaller account-data package.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row lg:flex-col lg:items-start">
                <Button asChild className="bg-[#1DB954] font-semibold text-zinc-950 hover:bg-[#1ed760]">
                  <Link href="https://www.spotify.com/account/privacy/" target="_blank" rel="noopener noreferrer">
                    Open Spotify Account Privacy
                    <ArrowUpRight className="ml-2 h-4 w-4" aria-hidden="true" />
                  </Link>
                </Button>
                <Link
                  href="https://support.spotify.com/article/understanding-your-data/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sm text-zinc-400 underline-offset-4 hover:text-white hover:underline"
                >
                  Read Spotify&apos;s data guide
                  <ArrowUpRight className="ml-1.5 h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </div>
            </div>

            <ol className="grid gap-3 sm:grid-cols-2">
              {exportSteps.map((step, index) => (
                <li key={step.title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                  <span className="font-mono text-xs font-semibold text-[#4ade80]">0{index + 1}</span>
                  <h3 className="mt-4 font-semibold text-white">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">{step.description}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="border-b border-white/[0.07] py-20 sm:py-24" aria-labelledby="privacy-title">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid overflow-hidden rounded-3xl border border-[#1DB954]/20 bg-gradient-to-br from-[#1DB954]/[0.12] via-white/[0.03] to-transparent lg:grid-cols-[1fr_0.9fr]">
              <div className="p-7 sm:p-10">
                <ShieldCheck className="h-7 w-7 text-[#4ade80]" aria-hidden="true" />
                <h2 id="privacy-title" className="mt-6 text-2xl font-bold tracking-tight sm:text-3xl">
                  Personal data should stay personal
                </h2>
                <p className="mt-4 max-w-xl text-sm leading-7 text-zinc-300">
                  The parser allowlists only listening fields. It never keeps IP addresses, usernames, country codes, search queries, user agents, or technical-log payloads.
                </p>
              </div>
              <div className="grid gap-px border-t border-white/10 bg-white/10 sm:grid-cols-3 lg:grid-cols-1 lg:border-l lg:border-t-0">
                {[
                  ["Browser only", "No upload endpoint"],
                  ["Memory only", "Refresh to clear"],
                  ["Open source", "Inspect every rule"],
                ].map(([title, detail]) => (
                  <div key={title} className="bg-zinc-950/85 p-5 sm:p-6">
                    <p className="text-sm font-semibold text-white">{title}</p>
                    <p className="mt-1 text-xs text-zinc-500">{detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 sm:py-24" aria-labelledby="spotify-faq-title">
          <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#4ade80]">Good to know</p>
              <h2 id="spotify-faq-title" className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                Before you analyze
              </h2>
            </div>
            <div className="mt-10 space-y-3">
              {faqs.map((faq) => (
                <Card key={faq.question} className="border-white/10 bg-white/[0.03] text-white">
                  <CardContent className="p-5 sm:p-6">
                    <h3 className="font-semibold">{faq.question}</h3>
                    <p className="mt-2 text-sm leading-6 text-zinc-400">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      <PlaybackFooter />
    </div>
  )
}
