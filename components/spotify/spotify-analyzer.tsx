"use client"

import { useState } from "react"
import { BarChart3, Clock3, Music2, ShieldCheck, Sparkles } from "lucide-react"

import SpotifyDashboard from "@/components/spotify/spotify-dashboard"
import SpotifyUpload from "@/components/spotify/spotify-upload"
import type { SpotifyAnalysis } from "@/lib/spotify-analysis"

const promises = [
  { icon: BarChart3, label: "7+ years", detail: "Trend lines and yearly chapters" },
  { icon: Music2, label: "Your favorites", detail: "Artists and tracks ranked clearly" },
  { icon: Clock3, label: "Your rhythm", detail: "Hours, weekdays, and streaks" },
]

export default function SpotifyAnalyzer() {
  const [analysis, setAnalysis] = useState<SpotifyAnalysis | null>(null)

  const handleComplete = (nextAnalysis: SpotifyAnalysis) => {
    setAnalysis(nextAnalysis)
    window.setTimeout(() => {
      document.getElementById("spotify-dashboard")?.scrollIntoView({ behavior: "smooth", block: "start" })
    }, 50)
  }

  const handleReset = () => {
    setAnalysis(null)
    window.setTimeout(() => {
      document.getElementById("spotify-upload")?.scrollIntoView({ behavior: "smooth", block: "start" })
    }, 50)
  }

  if (analysis) {
    return (
      <section className="mx-auto w-full max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
        <SpotifyDashboard analysis={analysis} onReset={handleReset} />
      </section>
    )
  }

  return (
    <section id="spotify-upload" className="relative overflow-hidden border-b border-white/[0.07]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-14rem] top-[-12rem] h-[32rem] w-[32rem] rounded-full bg-[#1DB954]/10 blur-[100px]" />
        <div className="absolute right-[-12rem] top-[6rem] h-[30rem] w-[30rem] rounded-full bg-emerald-300/[0.06] blur-[110px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:linear-gradient(to_bottom,black,transparent_80%)]" />
      </div>

      <div className="relative mx-auto grid min-h-[720px] w-full max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1.02fr_0.98fr] lg:px-8 lg:py-24">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#1DB954]/25 bg-[#1DB954]/10 px-3 py-1.5 text-xs font-medium text-[#4ade80]">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
            100% local — your files never leave this browser
          </div>

          <h1 className="mt-7 text-balance text-4xl font-bold tracking-[-0.04em] text-white sm:text-5xl lg:text-6xl">
            See the story behind your{" "}
            <span className="bg-gradient-to-r from-[#1ed760] via-emerald-300 to-[#1DB954] bg-clip-text text-transparent">
              Spotify listening
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-zinc-400 sm:text-lg sm:leading-8">
            Turn your Spotify streaming history into a private, interactive look at the music, people, and patterns that shaped your time.
          </p>

          <div className="mt-9 grid gap-3 sm:grid-cols-3">
            {promises.map((item) => {
              const Icon = item.icon
              return (
                <div key={item.label} className="rounded-2xl border border-white/[0.08] bg-white/[0.035] p-4 backdrop-blur">
                  <Icon className="h-4 w-4 text-[#4ade80]" aria-hidden="true" />
                  <p className="mt-4 text-sm font-semibold text-white">{item.label}</p>
                  <p className="mt-1 text-xs leading-5 text-zinc-500">{item.detail}</p>
                </div>
              )
            })}
          </div>

          <div className="mt-8 flex items-start gap-3 text-sm leading-6 text-zinc-500">
            <Sparkles className="mt-1 h-4 w-4 shrink-0 text-[#4ade80]" aria-hidden="true" />
            <p>
              No Spotify login, API key, or server upload. Insights are generated deterministically in your tab — no AI sees your track history.
            </p>
          </div>
        </div>

        <div className="relative lg:pl-4">
          <div className="absolute -inset-6 rounded-[2rem] bg-[#1DB954]/[0.1] blur-2xl" />
          <div className="relative rounded-[2rem] border border-white/10 bg-zinc-950/70 p-3 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-5">
            <SpotifyUpload onComplete={handleComplete} />
          </div>
        </div>
      </div>
    </section>
  )
}
