import type { Metadata } from "next"
import Link from "next/link"
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ExternalLink,
  FileDown,
  FileJson2,
  FolderArchive,
  ShieldCheck,
  TriangleAlert,
  Users,
  Video,
} from "lucide-react"

import PlaybackFooter from "@/components/playback-footer"
import PlaybackHeader from "@/components/playback-header"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "How to See Your Most-Watched YouTube Channels | Playback Stats",
  description:
    "Use Google Takeout to find your most-watched YouTube channels and repeat videos by recorded watch events, privately in your browser.",
  alternates: {
    canonical: "https://playbackstats.com/guides/how-to-see-most-watched-youtube-channels",
  },
  openGraph: {
    type: "article",
    url: "https://playbackstats.com/guides/how-to-see-most-watched-youtube-channels",
    siteName: "Playback Stats",
    title: "How to See Your Most-Watched YouTube Channels | Playback Stats",
    description:
      "Export your YouTube history, rank channels and repeat videos, and understand what the results mean without uploading your file.",
  },
  twitter: {
    card: "summary_large_image",
    title: "How to See Your Most-Watched YouTube Channels | Playback Stats",
    description:
      "A private, browser-based way to rank the channels and videos that appear most often in your YouTube history export.",
  },
  robots: {
    index: true,
    follow: true,
  },
}

const steps = [
  {
    icon: FileDown,
    title: "Request your YouTube data",
    description:
      "Open Google Takeout, deselect other products, and choose YouTube and YouTube Music. In the included-data options, keep history selected.",
  },
  {
    icon: FolderArchive,
    title: "Download and unzip the archive",
    description:
      "When Google finishes preparing the export, download it and open the YouTube and YouTube Music/history folder.",
  },
  {
    icon: FileJson2,
    title: "Select watch-history.json",
    description:
      "Choose the original JSON file in Playback Stats. The file is read locally in the current browser tab and is not sent to a server.",
  },
  {
    icon: BarChart3,
    title: "Review the rankings",
    description:
      "Compare the top channels and repeat videos by recorded event count, then explore timelines, streaks, and other patterns from the same export.",
  },
]

const rankingRules = [
  {
    icon: Users,
    title: "Channel ranking",
    source: "subtitles[].name",
    description:
      "Each usable record with channel metadata adds one event to that channel. Channels are sorted by event count, from highest to lowest.",
  },
  {
    icon: Video,
    title: "Repeat-video ranking",
    source: "titleUrl",
    description:
      "Records with the same video URL are grouped together. The title labels the result, while the URL provides the stable identity when available.",
  },
  {
    icon: BarChart3,
    title: "History coverage",
    source: "time",
    description:
      "Valid timestamps define the visible date range and time-based patterns. Rankings still describe the records present in the selected export.",
  },
]

const limitations = [
  "Watch history recorded while the setting was paused will not appear later in the export.",
  "Deleted history and records missing from Google’s archive cannot be reconstructed by Playback Stats.",
  "Missing subtitles[].name values prevent those events from contributing to channel rankings.",
  "Missing titleUrl values prevent reliable grouping of repeat views for the same video.",
  "The export does not include dependable watch duration, so rankings use event counts rather than minutes watched.",
]

const faqs = [
  {
    question: "Does “most-watched” mean the most minutes watched?",
    answer:
      "No. It means the highest number of recorded watch events in the export. YouTube watch-history.json does not provide reliable minutes watched for each event.",
  },
  {
    question: "Why is a channel missing from my ranking?",
    answer:
      "Some history entries do not include channel metadata, especially when a video or channel is unavailable. Those events can still count toward other totals but cannot be assigned to a channel.",
  },
  {
    question: "Can I inspect individual videos without exporting data?",
    answer:
      "Yes. Google’s YouTube History controls let you review and search individual history events. An export is useful when you want to aggregate many events into rankings and patterns.",
  },
  {
    question: "Does Playback Stats upload my YouTube history?",
    answer:
      "No. The selected JSON file is parsed inside your browser. Playback Stats has no file-upload endpoint for YouTube history and does not require a Google login or API key.",
  },
]

export default function MostWatchedYouTubeChannelsGuide() {
  return (
    <div className="dark flex min-h-screen flex-col bg-zinc-950 text-white">
      <PlaybackHeader activePlatform="youtube" guideHref="/#how-to-export" />

      <main id="main-content" className="flex-1">
        <section className="relative overflow-hidden border-b border-white/[0.07]">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-[-14rem] top-[-16rem] h-[34rem] w-[34rem] rounded-full bg-red-500/10 blur-[110px]" />
            <div className="absolute right-[-12rem] top-[4rem] h-[28rem] w-[28rem] rounded-full bg-rose-400/[0.06] blur-[110px]" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:linear-gradient(to_bottom,black,transparent_88%)]" />
          </div>

          <div className="relative mx-auto w-full max-w-5xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
            <nav aria-label="Breadcrumb">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-sm text-zinc-500 transition-colors hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Playback Stats
              </Link>
            </nav>

            <div className="mt-12 max-w-4xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-red-500/25 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-200">
                <Users className="h-3.5 w-3.5" aria-hidden="true" />
                YouTube history guide
              </div>
              <h1 className="mt-7 text-balance text-4xl font-bold tracking-[-0.04em] text-white sm:text-5xl lg:text-6xl">
                How to see your <span className="text-red-300">most-watched YouTube channels</span>
              </h1>
              <p className="mt-6 max-w-3xl text-base leading-8 text-zinc-400 sm:text-lg">
                Export your YouTube watch history with Google Takeout, then count how often each channel and video
                appears. Playback Stats builds those rankings locally in your browser, without connecting to your
                Google account or uploading the history file.
              </p>
            </div>

            <div className="mt-10 rounded-3xl border border-red-500/20 bg-red-500/[0.07] p-6 sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-200">Quick answer</p>
              <p className="mt-4 max-w-4xl text-base leading-8 text-zinc-200 sm:text-lg">
                Download <code className="font-mono text-red-200">watch-history.json</code> from Google Takeout and
                analyze it with Playback Stats. Your top channels are ranked by recorded watch events with channel
                metadata; repeat videos are grouped by their YouTube URL. These are frequency rankings, not watch-time
                rankings.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button asChild className="bg-red-500 font-semibold text-white hover:bg-red-400">
                  <Link href="/#upload">
                    Analyze your history
                    <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.08] hover:text-white">
                  <Link href="https://takeout.google.com/" target="_blank" rel="noopener noreferrer">
                    Open Google Takeout
                    <ExternalLink className="ml-2 h-4 w-4" aria-hidden="true" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <article className="mx-auto w-full max-w-5xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <section aria-labelledby="options-title">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-300">Choose the right view</p>
              <h2 id="options-title" className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Review individual events or build a ranking
              </h2>
              <p className="mt-5 text-base leading-7 text-zinc-400">
                The right method depends on whether you are looking for one video or a pattern across your full
                available history.
              </p>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-2">
              <section className="rounded-3xl border border-white/[0.08] bg-white/[0.03] p-6 sm:p-7">
                <Video className="h-6 w-6 text-zinc-300" aria-hidden="true" />
                <h3 className="mt-5 text-lg font-semibold text-white">Find a specific history event</h3>
                <p className="mt-3 text-sm leading-7 text-zinc-400">
                  Use Google&apos;s YouTube History controls to review, search, or filter individual events by date. This
                  is useful when you already know roughly what you are looking for.
                </p>
                <Link
                  href="https://support.google.com/youtube/answer/95725"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex items-center text-sm font-medium text-zinc-300 underline-offset-4 hover:text-white hover:underline"
                >
                  Read YouTube&apos;s history instructions
                  <ExternalLink className="ml-1.5 h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </section>

              <section className="rounded-3xl border border-red-500/20 bg-red-500/[0.06] p-6 sm:p-7">
                <BarChart3 className="h-6 w-6 text-red-300" aria-hidden="true" />
                <h3 className="mt-5 text-lg font-semibold text-white">Rank channels and repeat videos</h3>
                <p className="mt-3 text-sm leading-7 text-zinc-300">
                  Use a Takeout export when you want to aggregate many recorded events. Playback Stats counts and sorts
                  the available channel and video identifiers without sending the file to a server.
                </p>
                <Link
                  href="/guides/youtube-watch-history-json"
                  className="mt-5 inline-flex items-center text-sm font-medium text-red-200 underline-offset-4 hover:text-red-100 hover:underline"
                >
                  Understand the JSON fields
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </section>
            </div>
          </section>

          <section aria-labelledby="steps-title" className="mt-20 sm:mt-24">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-300">Step by step</p>
              <h2 id="steps-title" className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Turn your Takeout archive into channel rankings
              </h2>
              <p className="mt-5 text-base leading-7 text-zinc-400">
                Google lets you choose which products and data are included in an export. Keep the archive focused on
                YouTube history so the file is easier to find and analyze.
              </p>
            </div>

            <ol className="mt-10 grid gap-4 sm:grid-cols-2">
              {steps.map((step, index) => {
                const Icon = step.icon
                return (
                  <li key={step.title} className="rounded-3xl border border-white/[0.08] bg-white/[0.03] p-6 sm:p-7">
                    <div className="flex items-center justify-between">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/[0.12] text-red-300">
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <span className="font-mono text-xs font-semibold text-zinc-600">0{index + 1}</span>
                    </div>
                    <h3 className="mt-6 text-lg font-semibold text-white">{step.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-zinc-400">{step.description}</p>
                  </li>
                )
              })}
            </ol>

            <p className="mt-6 text-sm leading-6 text-zinc-500">
              Google notes that an export may not include changes made between the time you request the download and
              the time the archive is created. See the{" "}
              <Link
                href="https://support.google.com/accounts/answer/3024190"
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-300 underline underline-offset-4 hover:text-white"
              >
                official Takeout instructions
              </Link>
              .
            </p>
          </section>

          <section aria-labelledby="ranking-title" className="mt-20 sm:mt-24">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-300">Counting method</p>
              <h2 id="ranking-title" className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                How channel and video rankings are calculated
              </h2>
              <p className="mt-5 text-base leading-7 text-zinc-400">
                Playback Stats accepts each history object that has a title or video URL as one recorded event, then
                uses the identifiers below to build comparisons.
              </p>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {rankingRules.map((rule) => {
                const Icon = rule.icon
                return (
                  <section key={rule.title} className="rounded-3xl border border-white/[0.08] bg-white/[0.03] p-6">
                    <Icon className="h-5 w-5 text-red-300" aria-hidden="true" />
                    <h3 className="mt-5 font-semibold text-white">{rule.title}</h3>
                    <code className="mt-3 inline-block rounded-lg bg-white/[0.05] px-2.5 py-1.5 font-mono text-xs text-red-200">
                      {rule.source}
                    </code>
                    <p className="mt-4 text-sm leading-7 text-zinc-400">{rule.description}</p>
                  </section>
                )
              })}
            </div>
          </section>

          <section aria-labelledby="limits-title" className="mt-20 overflow-hidden rounded-3xl border border-amber-300/15 bg-amber-300/[0.05] sm:mt-24">
            <div className="grid gap-px bg-amber-200/10 lg:grid-cols-[0.78fr_1.22fr]">
              <div className="bg-zinc-950/90 p-7 sm:p-9">
                <TriangleAlert className="h-6 w-6 text-amber-200" aria-hidden="true" />
                <h2 id="limits-title" className="mt-6 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  Why your ranking may not match your memory
                </h2>
                <p className="mt-5 text-sm leading-7 text-zinc-400 sm:text-base">
                  The result is a ranking of events present in the export—not a reconstruction of activity that Google
                  never saved, that you deleted, or that lacks enough metadata to identify a channel or video.
                </p>
              </div>
              <div className="bg-zinc-950/90 p-7 sm:p-9">
                <ul className="space-y-3 text-sm leading-6 text-zinc-400">
                  {limitations.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-amber-200" aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          <section aria-labelledby="privacy-title" className="mt-20 sm:mt-24">
            <div className="grid overflow-hidden rounded-3xl border border-emerald-400/15 bg-emerald-400/[0.05] lg:grid-cols-[0.82fr_1.18fr]">
              <div className="p-7 sm:p-9">
                <ShieldCheck className="h-7 w-7 text-emerald-300" aria-hidden="true" />
                <h2 id="privacy-title" className="mt-6 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  Your history stays on your device
                </h2>
              </div>
              <div className="border-t border-emerald-300/10 p-7 lg:border-l lg:border-t-0 sm:p-9">
                <p className="text-sm leading-7 text-zinc-300 sm:text-base">
                  Playback Stats parses watch-history.json in your browser and stores only compact dashboard data for
                  the current session. The original file is not uploaded, and there is no Google account connection,
                  API key, or server-side history database.
                </p>
              </div>
            </div>
          </section>

          <section aria-labelledby="faq-title" className="mt-20 sm:mt-24">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-300">Good to know</p>
              <h2 id="faq-title" className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Most-watched YouTube channels FAQ
              </h2>
            </div>
            <div className="mt-10 grid gap-x-10 gap-y-8 md:grid-cols-2">
              {faqs.map((faq) => (
                <section key={faq.question} className="border-t border-white/10 pt-5">
                  <h3 className="font-semibold text-white">{faq.question}</h3>
                  <p className="mt-2 text-sm leading-7 text-zinc-400">{faq.answer}</p>
                </section>
              ))}
            </div>
          </section>

          <section aria-labelledby="next-title" className="mt-20 sm:mt-24">
            <div className="rounded-3xl border border-red-500/20 bg-gradient-to-br from-red-500/[0.13] via-white/[0.025] to-transparent p-7 sm:p-10">
              <h2 id="next-title" className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Find the channels and videos you return to most
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-300 sm:text-base">
                Select your original Takeout JSON file and let the browser build your private dashboard. No sample
                data is presented as yours—the results come only from the file you choose.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Button asChild className="bg-red-500 font-semibold text-white hover:bg-red-400">
                  <Link href="/#upload">
                    Analyze watch history
                    <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.08] hover:text-white">
                  <Link href="/guides/youtube-watch-history-json">Read the JSON field guide</Link>
                </Button>
              </div>
            </div>
          </section>
        </article>
      </main>

      <PlaybackFooter />
    </div>
  )
}
