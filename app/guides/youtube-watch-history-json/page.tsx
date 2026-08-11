import type { Metadata } from "next"
import Link from "next/link"
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FileJson2,
  FolderArchive,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react"

import PlaybackFooter from "@/components/playback-footer"
import PlaybackHeader from "@/components/playback-header"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "YouTube watch-history.json Format & Fields | Playback Stats",
  description:
    "Learn the Google Takeout YouTube watch-history.json format, including title, titleUrl, subtitles, and time fields, with a safe example and parsing notes.",
  alternates: {
    canonical: "https://playbackstats.com/guides/youtube-watch-history-json",
  },
  openGraph: {
    type: "article",
    url: "https://playbackstats.com/guides/youtube-watch-history-json",
    siteName: "Playback Stats",
    title: "YouTube watch-history.json Format & Fields | Playback Stats",
    description:
      "Understand the fields in a Google Takeout YouTube watch-history.json file and how Playback Stats turns them into private viewing statistics.",
  },
  twitter: {
    card: "summary_large_image",
    title: "YouTube watch-history.json Format & Fields | Playback Stats",
    description:
      "A practical guide to the title, titleUrl, subtitles, and time fields in a YouTube watch-history.json export.",
  },
  robots: {
    index: true,
    follow: true,
  },
}

const exampleJson = `[
  {
    "header": "YouTube",
    "title": "Watched Example video title",
    "titleUrl": "https://www.youtube.com/watch?v=example",
    "subtitles": [
      {
        "name": "Example channel",
        "url": "https://www.youtube.com/channel/example"
      }
    ],
    "time": "2026-07-24T12:34:56.000Z",
    "products": ["YouTube"],
    "activityControls": ["YouTube watch history"]
  }
]`

const fields = [
  {
    name: "title",
    shape: "string",
    purpose: "The activity label shown in the export, usually including the video title.",
    behavior: "Used as the video label. If it is missing but titleUrl exists, the event is kept with an “Unknown Video” label.",
  },
  {
    name: "titleUrl",
    shape: "string",
    purpose: "The YouTube URL associated with the activity, when Google can provide one.",
    behavior: "Used to group repeat views of the same video. Missing URLs make reliable URL-based grouping impossible.",
  },
  {
    name: "subtitles",
    shape: "array",
    purpose: "Optional source information. A YouTube record commonly stores the channel in the first item.",
    behavior: "The first subtitles[].name value is used for channel rankings. Records without it remain usable but have no channel attribution.",
  },
  {
    name: "time",
    shape: "ISO 8601 string",
    purpose: "The timestamp attached to the activity event.",
    behavior: "Used for daily, monthly, weekday, hourly, and streak calculations when it is a valid date.",
  },
  {
    name: "header",
    shape: "string",
    purpose: "The Google product heading for the activity entry.",
    behavior: "Not needed for Playback Stats calculations.",
  },
  {
    name: "products / activityControls",
    shape: "arrays",
    purpose: "Google product and activity-setting metadata included with some records.",
    behavior: "Not needed for Playback Stats calculations.",
  },
]

const variations = [
  {
    title: "A video or channel is unavailable",
    description:
      "Deleted, private, or otherwise unavailable videos may have a generic title and no usable URL or channel. The event can still exist in the export.",
  },
  {
    title: "Channel metadata is missing",
    description:
      "The subtitles array is optional. Playback Stats can still count the event, but it cannot include that record in channel rankings without subtitles[].name.",
  },
  {
    title: "The timestamp is missing or invalid",
    description:
      "A record without a valid time value cannot contribute to timelines, hourly patterns, date ranges, or streak calculations.",
  },
]

export default function YouTubeWatchHistoryJsonGuide() {
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
                <FileJson2 className="h-3.5 w-3.5" aria-hidden="true" />
                Google Takeout field guide
              </div>
              <h1 className="mt-7 text-balance text-4xl font-bold tracking-[-0.04em] text-white sm:text-5xl lg:text-6xl">
                YouTube <span className="text-red-300">watch-history.json</span> format and fields
              </h1>
              <p className="mt-6 max-w-3xl text-base leading-8 text-zinc-400 sm:text-lg">
                Google Takeout stores YouTube watch activity as a JSON array. Each entry describes an activity event,
                its video or channel information when available, and a timestamp. This guide explains the fields
                Playback Stats can use and the details the export does not contain.
              </p>
            </div>

            <dl className="mt-12 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.035] p-5">
                <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Typical location</dt>
                <dd className="mt-3 break-words font-mono text-sm leading-6 text-zinc-200">
                  YouTube and YouTube Music/history/watch-history.json
                </dd>
              </div>
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.035] p-5">
                <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Top-level shape</dt>
                <dd className="mt-3 text-sm leading-6 text-zinc-200">An array of activity objects</dd>
              </div>
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.035] p-5">
                <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Processing</dt>
                <dd className="mt-3 text-sm leading-6 text-zinc-200">Locally in your browser</dd>
              </div>
            </dl>
          </div>
        </section>

        <article className="mx-auto w-full max-w-5xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <section aria-labelledby="example-title" className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-300">Safe example</p>
              <h2 id="example-title" className="mt-4 text-3xl font-bold tracking-tight text-white">
                What one history entry looks like
              </h2>
              <p className="mt-5 text-sm leading-7 text-zinc-400 sm:text-base">
                A typical file starts with an array and contains one object per recorded activity. This example uses
                placeholder titles and URLs; it does not contain real viewing data.
              </p>
              <div className="mt-6 flex items-start gap-3 rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.06] p-5">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" aria-hidden="true" />
                <p className="text-sm leading-6 text-zinc-300">
                  You do not need to paste or upload your history to inspect its structure. A local text editor can
                  open JSON, and Playback Stats reads the selected file only inside your browser tab.
                </p>
              </div>
            </div>

            <div className="overflow-hidden rounded-3xl border border-white/10 bg-black/40 shadow-2xl shadow-black/30">
              <div className="flex items-center gap-2 border-b border-white/[0.08] px-5 py-4">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-300/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
                <span className="ml-2 font-mono text-xs text-zinc-500">watch-history.json</span>
              </div>
              <pre className="overflow-x-auto p-5 text-xs leading-6 text-zinc-300 sm:p-7 sm:text-sm">
                <code>{exampleJson}</code>
              </pre>
            </div>
          </section>

          <section aria-labelledby="fields-title" className="mt-20 sm:mt-24">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-300">Field reference</p>
              <h2 id="fields-title" className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                How Playback Stats reads each field
              </h2>
              <p className="mt-5 text-base leading-7 text-zinc-400">
                Google may omit fields when a video, channel, or activity detail is unavailable. Playback Stats keeps
                usable records and limits each calculation to the data actually present.
              </p>
            </div>

            <div className="mt-10 overflow-hidden rounded-3xl border border-white/10">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] border-collapse text-left text-sm">
                  <thead className="bg-white/[0.05] text-xs uppercase tracking-[0.12em] text-zinc-500">
                    <tr>
                      <th scope="col" className="px-5 py-4 font-semibold">Field</th>
                      <th scope="col" className="px-5 py-4 font-semibold">Shape</th>
                      <th scope="col" className="px-5 py-4 font-semibold">What it contains</th>
                      <th scope="col" className="px-5 py-4 font-semibold">How it is used</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.08] bg-white/[0.02]">
                    {fields.map((field) => (
                      <tr key={field.name} className="align-top">
                        <th scope="row" className="px-5 py-5 font-mono font-semibold text-red-200">{field.name}</th>
                        <td className="px-5 py-5 font-mono text-xs text-zinc-500">{field.shape}</td>
                        <td className="max-w-xs px-5 py-5 leading-6 text-zinc-300">{field.purpose}</td>
                        <td className="max-w-sm px-5 py-5 leading-6 text-zinc-400">{field.behavior}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <section aria-labelledby="variations-title" className="mt-20 sm:mt-24">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-300">Common variations</p>
              <h2 id="variations-title" className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Why some records have fewer details
              </h2>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {variations.map((variation) => (
                <section key={variation.title} className="rounded-3xl border border-white/[0.08] bg-white/[0.03] p-6">
                  <TriangleAlert className="h-5 w-5 text-amber-200" aria-hidden="true" />
                  <h3 className="mt-5 font-semibold text-white">{variation.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-zinc-400">{variation.description}</p>
                </section>
              ))}
            </div>
          </section>

          <section aria-labelledby="limits-title" className="mt-20 overflow-hidden rounded-3xl border border-amber-300/15 bg-amber-300/[0.05] sm:mt-24">
            <div className="grid gap-px bg-amber-200/10 lg:grid-cols-[0.85fr_1.15fr]">
              <div className="bg-zinc-950/90 p-7 sm:p-9">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">Important limitation</p>
                <h2 id="limits-title" className="mt-4 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  An activity event is not a watch-duration record
                </h2>
                <p className="mt-5 text-sm leading-7 text-zinc-400 sm:text-base">
                  YouTube watch-history.json does not include reliable minutes watched, completion percentage, or
                  resume position for each event. It can support viewing counts and patterns, but not an accurate
                  lifetime watch-time total.
                </p>
              </div>
              <div className="bg-zinc-950/90 p-7 sm:p-9">
                <h3 className="font-semibold text-white">What the file can support</h3>
                <ul className="mt-5 space-y-3 text-sm leading-6 text-zinc-400">
                  {[
                    "Video and channel frequency when identifying fields are available",
                    "Daily, monthly, weekday, and hourly activity from valid timestamps",
                    "First and latest recorded events, busiest days, and active-day streaks",
                    "Patterns within the exported records—not activity removed or never saved by Google",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          <section aria-labelledby="next-title" className="mt-20 sm:mt-24">
            <div className="grid overflow-hidden rounded-3xl border border-red-500/20 bg-gradient-to-br from-red-500/[0.13] via-white/[0.025] to-transparent lg:grid-cols-[1fr_0.88fr]">
              <div className="p-7 sm:p-10">
                <FolderArchive className="h-7 w-7 text-red-300" aria-hidden="true" />
                <h2 id="next-title" className="mt-6 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  Ready to analyze your export?
                </h2>
                <p className="mt-4 max-w-xl text-sm leading-7 text-zinc-300 sm:text-base">
                  Select the original watch-history.json file on Playback Stats. Parsing and analysis happen locally,
                  with no YouTube login, API key, or file upload to a server.
                </p>
                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <Button asChild className="bg-red-500 font-semibold text-white hover:bg-red-400">
                    <Link href="/#upload">
                      Analyze watch history
                      <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.08] hover:text-white">
                    <Link href="/#how-to-export">Read the export steps</Link>
                  </Button>
                </div>
                <Link
                  href="/guides/how-to-see-most-watched-youtube-channels"
                  className="mt-6 inline-flex items-center text-sm font-medium text-red-200 underline-offset-4 hover:text-red-100 hover:underline"
                >
                  Learn how channel and repeat-video rankings work
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </div>
              <div className="grid gap-px border-t border-white/10 bg-white/10 sm:grid-cols-3 lg:grid-cols-1 lg:border-l lg:border-t-0">
                {[
                  ["Browser only", "No upload endpoint"],
                  ["Original JSON", "No conversion needed"],
                  ["Open source", "Inspect the parser"],
                ].map(([title, detail]) => (
                  <div key={title} className="bg-zinc-950/85 p-5 sm:p-6">
                    <p className="text-sm font-semibold text-white">{title}</p>
                    <p className="mt-1 text-xs text-zinc-500">{detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </article>
      </main>

      <PlaybackFooter />
    </div>
  )
}
