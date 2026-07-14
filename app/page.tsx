import type { Metadata } from "next"
import Link from "next/link"
import {
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  Clock3,
  History,
  Repeat2,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react"

import FileUploadForm from "@/components/file-upload-form"
import PlaybackFooter from "@/components/playback-footer"
import PlaybackHeader from "@/components/playback-header"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "YouTube Watch History Analyzer & Stats | Playback Stats",
  description:
    "Upload Google Takeout watch-history.json to analyze YouTube watch history, viewing stats, top channels, streaks, and trends—privately in your browser.",
  alternates: {
    canonical: "https://playbackstats.com/",
  },
  openGraph: {
    type: "website",
    url: "https://playbackstats.com/",
    title: "YouTube Watch History Analyzer & Stats | Playback Stats",
    description: "Analyze your YouTube watch history from Google Takeout with private viewing stats, channel rankings, streaks, and trends.",
    siteName: "Playback Stats",
  },
  twitter: {
    card: "summary_large_image",
    title: "YouTube Watch History Analyzer & Stats | Playback Stats",
    description: "Analyze your YouTube watch history from Google Takeout with private viewing stats, channel rankings, streaks, and trends.",
  },
  robots: {
    index: true,
    follow: true,
  },
}

const promises = [
  { icon: CalendarDays, label: "Your timeline", detail: "Daily activity across your export" },
  { icon: Users, label: "Your channels", detail: "Creators ranked by repeat views" },
  { icon: Clock3, label: "Your rhythm", detail: "Hours, streaks, and viewing habits" },
]

const discoveries = [
  {
    icon: BarChart3,
    title: "Viewing trends",
    description: "Follow how your viewing changes over days, months, and the full life of your Google history.",
  },
  {
    icon: Repeat2,
    title: "Repeat favorites",
    description: "Find the videos and channels you returned to, with rankings grounded in your own history.",
  },
  {
    icon: Sparkles,
    title: "Personal patterns",
    description: "See your peak hour, favorite day, longest streak, and the shape of your viewing personality.",
  },
  {
    icon: ShieldCheck,
    title: "Private by design",
    description: "The browser keeps only compact chart data. Your original Takeout file never reaches a server.",
  },
]

const exportSteps = [
  {
    title: "Open Google Takeout",
    description: "Sign in, deselect everything, then choose YouTube and YouTube Music.",
  },
  {
    title: "Keep history only",
    description: "Open the included-data options and leave only history selected before creating the export.",
  },
  {
    title: "Find the JSON file",
    description: "Unzip the download and locate history/watch-history.json inside the YouTube folder.",
  },
  {
    title: "Explore locally",
    description: "Choose that JSON file here. Parsing and analysis run inside this browser tab.",
  },
]

const faqs = [
  {
    question: "Does my YouTube history get uploaded?",
    answer: "No. The file is read and summarized locally in your browser. Playback Stats has no upload endpoint for history files.",
  },
  {
    question: "Do I need a Google or Playback Stats login?",
    answer: "No. Export the file from Google Takeout, then analyze it without connecting an account or API key.",
  },
  {
    question: "How far back will the dashboard go?",
    answer: "As far back as the valid watch records in your export. The available range depends on your Google history settings.",
  },
  {
    question: "What happens when I refresh?",
    answer: "The original file is never retained. Compact YouTube dashboard data stays only in this browser session and can be cleared by closing it.",
  },
]

function DashboardPreview() {
  const bars = [34, 52, 41, 67, 49, 76, 58, 82, 64, 91, 73, 96]

  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-zinc-950/80 p-4 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-5">
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
        <div>
          <p className="text-xs font-medium text-zinc-500">Dashboard preview</p>
          <p className="mt-1 text-sm font-semibold text-white">Your viewing history</p>
        </div>
        <span className="rounded-lg border border-red-500/20 bg-red-500/10 px-2.5 py-1 font-mono text-[10px] text-red-200">
          LOCAL DATA
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-white/[0.04] p-4 ring-1 ring-inset ring-white/[0.06]">
          <p className="text-[11px] text-zinc-500">Videos watched</p>
          <p className="mt-3 font-mono text-2xl font-semibold tracking-tight text-white">12,842</p>
          <p className="mt-1 text-[11px] text-zinc-600">across 6.4 years</p>
        </div>
        <div className="rounded-2xl bg-white/[0.04] p-4 ring-1 ring-inset ring-white/[0.06]">
          <p className="text-[11px] text-zinc-500">Unique channels</p>
          <p className="mt-3 font-mono text-2xl font-semibold tracking-tight text-white">1,318</p>
          <p className="mt-1 text-[11px] text-zinc-600">from your export</p>
        </div>
      </div>

      <div className="mt-3 rounded-2xl bg-white/[0.04] p-4 ring-1 ring-inset ring-white/[0.06]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] text-zinc-500">Viewing activity</p>
            <p className="mt-1 text-sm font-medium text-white">A year in motion</p>
          </div>
          <span className="font-mono text-[10px] text-zinc-600">JAN — DEC</span>
        </div>
        <div className="mt-6 flex h-28 items-end gap-2" aria-hidden="true">
          {bars.map((height, index) => (
            <span
              key={`${height}-${index}`}
              className="flex-1 rounded-t bg-gradient-to-t from-red-700/55 to-red-400 transition-opacity hover:opacity-80"
              style={{ height: `${height}%` }}
            />
          ))}
        </div>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-2xl bg-red-500/[0.08] p-4 ring-1 ring-inset ring-red-500/15">
          <p className="text-[11px] text-red-200/60">Peak viewing window</p>
          <p className="mt-2 font-mono text-lg font-semibold text-white">21:00 — 22:00</p>
        </div>
        <div className="rounded-2xl bg-white/[0.04] p-4 ring-1 ring-inset ring-white/[0.06]">
          <p className="text-[11px] text-zinc-500">Longest streak</p>
          <p className="mt-2 font-mono text-lg font-semibold text-white">47 days</p>
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <div className="dark min-h-screen bg-zinc-950 text-white">
      <PlaybackHeader activePlatform="youtube" guideHref="#how-to-export" />

      <main id="main-content">
        <section id="upload" className="relative scroll-mt-20 overflow-hidden border-b border-white/[0.07]">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-[-14rem] top-[-12rem] h-[32rem] w-[32rem] rounded-full bg-red-500/10 blur-[100px]" />
            <div className="absolute right-[-12rem] top-[8rem] h-[28rem] w-[28rem] rounded-full bg-rose-400/[0.06] blur-[110px]" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:linear-gradient(to_bottom,black,transparent_82%)]" />
          </div>

          <div className="relative mx-auto grid min-h-[720px] w-full max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1.02fr_0.98fr] lg:px-8 lg:py-24">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-red-500/25 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-200">
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                100% local — your file never leaves this browser
              </div>

              <h1 className="mt-7 text-balance text-4xl font-bold tracking-[-0.04em] text-white sm:text-5xl lg:text-6xl">
                Analyze your{" "}
                <span className="bg-gradient-to-r from-red-400 via-red-300 to-rose-400 bg-clip-text text-transparent">
                  YouTube watch history
                </span>
              </h1>
              <p className="mt-6 max-w-xl text-base leading-7 text-zinc-400 sm:text-lg sm:leading-8">
                Upload your Google Takeout watch-history.json to explore viewing stats, top channels, routines, and repeat favorites without sending the file to a server.
              </p>

              <div className="mt-9 grid gap-3 sm:grid-cols-3">
                {promises.map((item) => {
                  const Icon = item.icon
                  return (
                    <div key={item.label} className="rounded-2xl border border-white/[0.08] bg-white/[0.035] p-4 backdrop-blur">
                      <Icon className="h-4 w-4 text-red-300" aria-hidden="true" />
                      <p className="mt-4 text-sm font-semibold text-white">{item.label}</p>
                      <p className="mt-1 text-xs leading-5 text-zinc-500">{item.detail}</p>
                    </div>
                  )
                })}
              </div>

              <div className="mt-8 flex items-start gap-3 text-sm leading-6 text-zinc-500">
                <History className="mt-1 h-4 w-4 shrink-0 text-red-300" aria-hidden="true" />
                <p>No YouTube login, API key, or server upload. Your browser builds a compact dashboard from the exported JSON.</p>
              </div>
            </div>

            <div className="relative lg:pl-4">
              <div className="absolute -inset-6 rounded-[2rem] bg-red-500/[0.1] blur-2xl" />
              <div className="relative rounded-[2rem] border border-white/10 bg-zinc-950/70 p-3 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-5">
                <FileUploadForm />
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-white/[0.07] py-20 sm:py-24" aria-labelledby="discover-title">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-300">Inside your history</p>
              <h2 id="discover-title" className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">YouTube watch history stats, with context</h2>
              <p className="mt-4 text-base leading-7 text-zinc-400">
                This YouTube history analyzer turns your export into patterns you can scan, compare, and understand.
              </p>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {discoveries.map((item) => {
                const Icon = item.icon
                return (
                  <article key={item.title} className="rounded-3xl border border-white/[0.08] bg-white/[0.03] p-6 transition-colors hover:bg-white/[0.05] sm:p-7">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/[0.12] text-red-300">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <h3 className="mt-6 text-lg font-semibold text-white">{item.title}</h3>
                    <p className="mt-2 max-w-lg text-sm leading-6 text-zinc-400">{item.description}</p>
                  </article>
                )
              })}
            </div>

            <div className="relative mt-4">
              <div className="absolute -inset-6 rounded-[2rem] bg-red-500/[0.06] blur-2xl" />
              <DashboardPreview />
            </div>
          </div>
        </section>

        <section id="how-to-export" className="scroll-mt-20 border-b border-white/[0.07] py-20 sm:py-24">
          <div className="mx-auto grid w-full max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-300">Bring your own data</p>
              <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">How to export YouTube history</h2>
              <p className="mt-5 max-w-xl text-base leading-7 text-zinc-400">
                Google Takeout lets you download watch history without granting this site access to your account.
              </p>
              <Button asChild className="mt-7 bg-red-500 font-semibold text-white hover:bg-red-400">
                <Link href="https://takeout.google.com/" target="_blank" rel="noopener noreferrer">
                  Open Google Takeout
                  <ArrowUpRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
            </div>

            <ol className="grid gap-3 sm:grid-cols-2">
              {exportSteps.map((step, index) => (
                <li key={step.title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                  <span className="font-mono text-xs font-semibold text-red-300">0{index + 1}</span>
                  <h3 className="mt-4 font-semibold text-white">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">{step.description}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="border-b border-white/[0.07] py-20 sm:py-24" aria-labelledby="privacy-title">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid overflow-hidden rounded-3xl border border-red-500/20 bg-gradient-to-br from-red-500/[0.12] via-white/[0.025] to-transparent lg:grid-cols-[1fr_0.9fr]">
              <div className="p-7 sm:p-10">
                <ShieldCheck className="h-7 w-7 text-red-300" aria-hidden="true" />
                <h2 id="privacy-title" className="mt-6 text-2xl font-bold tracking-tight sm:text-3xl">Personal data should stay personal</h2>
                <p className="mt-4 max-w-xl text-sm leading-7 text-zinc-300">
                  The original Takeout file is read locally and never sent to Playback Stats. Only compact dashboard summaries are stored for the current browser session.
                </p>
              </div>
              <div className="grid gap-px border-t border-white/10 bg-white/10 sm:grid-cols-3 lg:grid-cols-1 lg:border-l lg:border-t-0">
                {[
                  ["Browser only", "No upload endpoint"],
                  ["Session only", "Close to clear"],
                  ["Open source", "Inspect every rule"],
                ].map(([title, detail]) => (
                  <div key={title} className="bg-zinc-950/90 p-5 sm:p-6">
                    <p className="text-sm font-semibold text-white">{title}</p>
                    <p className="mt-1 text-xs text-zinc-500">{detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 sm:py-24" aria-labelledby="youtube-faq-title">
          <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-300">Good to know</p>
              <h2 id="youtube-faq-title" className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">YouTube history analyzer FAQ</h2>
            </div>
            <div className="mt-10 grid gap-x-10 gap-y-8 md:grid-cols-2">
              {faqs.map((faq) => (
                <article key={faq.question} className="border-t border-white/10 pt-5">
                  <h3 className="font-semibold text-white">{faq.question}</h3>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">{faq.answer}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <PlaybackFooter />
    </div>
  )
}
