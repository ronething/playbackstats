import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, CheckCircle2, Download, FileArchive, FolderSearch, ListChecks, ShieldCheck } from "lucide-react"

import PlaybackFooter from "@/components/playback-footer"
import PlaybackHeader from "@/components/playback-header"
import TakeoutGuideAnalytics from "@/components/takeout-guide-analytics"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Export YouTube Watch History with Google Takeout | Playback Stats",
  description: "A short Google Takeout guide for exporting YouTube watch history, finding watch-history.json, and importing it privately into Playback Stats.",
  alternates: { canonical: "https://playbackstats.com/takeout-guide" },
  openGraph: {
    type: "article",
    url: "https://playbackstats.com/takeout-guide",
    siteName: "Playback Stats",
    title: "How to export YouTube watch history with Google Takeout",
    description: "Select YouTube history, create the export, then import the ZIP or watch-history.json locally.",
  },
  robots: { index: true, follow: true },
}

const steps = [
  {
    icon: ListChecks,
    title: "Select YouTube history",
    body: "Open Google Takeout, deselect everything, select YouTube and YouTube Music, then open its included-data options and keep history selected.",
  },
  {
    icon: Download,
    title: "Create and download the export",
    body: "Choose a one-time export and a ZIP archive. Google will prepare the download and notify you when it is ready.",
  },
  {
    icon: FolderSearch,
    title: "Find the watch-history file",
    body: "Inside the archive, look for YouTube and YouTube Music/history/watch-history.json. Some older exports use YouTube/history/watch-history.json.",
  },
  {
    icon: FileArchive,
    title: "Import the ZIP or JSON",
    body: "Playback Stats can safely locate the file inside the original ZIP, or you can unzip it yourself and select watch-history.json.",
  },
]

export default function TakeoutGuidePage() {
  return (
    <div className="dark flex min-h-screen flex-col bg-zinc-950 text-white">
      <TakeoutGuideAnalytics />
      <PlaybackHeader activePlatform="youtube" />
      <main id="main-content" className="flex-1">
        <section className="border-b border-white/[0.07]">
          <div className="mx-auto w-full max-w-5xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-300">Google Takeout guide</p>
              <h1 className="mt-5 text-4xl font-bold tracking-[-0.04em] sm:text-5xl">Export the YouTube history file Playback Stats needs</h1>
              <p className="mt-6 text-base leading-8 text-zinc-400 sm:text-lg">
                You need the JSON watch-history export—not a YouTube account connection, browser history, or CSV. The four checks below keep the export small and verifiable.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild className="bg-red-500 font-semibold text-white hover:bg-red-400">
                  <Link href="https://takeout.google.com/" target="_blank" rel="noopener noreferrer">
                    Open Google Takeout <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="border-white/15 bg-white/[0.04] text-white hover:bg-white/10 hover:text-white">
                  <Link href="/#upload">Go to the analyzer</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-white/[0.07] py-16 sm:py-20" aria-labelledby="takeout-steps-title">
          <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8">
            <h2 id="takeout-steps-title" className="text-2xl font-bold tracking-tight sm:text-3xl">Four verifiable steps</h2>
            <ol className="mt-8 grid gap-4 sm:grid-cols-2">
              {steps.map((step, index) => {
                const Icon = step.icon
                return (
                  <li key={step.title} className="rounded-3xl border border-white/10 bg-white/[0.035] p-6">
                    <div className="flex items-center justify-between">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/15 text-red-300"><Icon className="h-5 w-5" aria-hidden="true" /></span>
                      <span className="font-mono text-xs text-zinc-600">0{index + 1}</span>
                    </div>
                    <h3 className="mt-6 font-semibold">{step.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-zinc-400">{step.body}</p>
                  </li>
                )
              })}
            </ol>
          </div>
        </section>

        <section className="py-16 sm:py-20">
          <div className="mx-auto grid w-full max-w-5xl gap-5 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
            <article className="rounded-3xl border border-emerald-300/15 bg-emerald-300/[0.06] p-6">
              <ShieldCheck className="h-6 w-6 text-emerald-300" aria-hidden="true" />
              <h2 className="mt-5 text-xl font-semibold">What stays on your device</h2>
              <p className="mt-3 text-sm leading-7 text-zinc-400">
                The ZIP, watch-history.json, titles, channels, timestamps, and generated dashboard never go to a file-processing endpoint. Archive inspection and extraction happen in this browser tab.
              </p>
            </article>
            <article className="rounded-3xl border border-amber-300/15 bg-amber-300/[0.06] p-6">
              <CheckCircle2 className="h-6 w-6 text-amber-200" aria-hidden="true" />
              <h2 className="mt-5 text-xl font-semibold">What the export can and cannot show</h2>
              <p className="mt-3 text-sm leading-7 text-zinc-400">
                Takeout records viewing events and timestamps, but not dependable minutes watched. Deleted, paused, or unavailable history can also be absent, so Playback Stats reports activity without inventing watch time.
              </p>
            </article>
          </div>
        </section>
      </main>
      <PlaybackFooter />
    </div>
  )
}
