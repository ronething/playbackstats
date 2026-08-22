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
import { getLandingContent, type Locale } from "@/lib/i18n"

const promiseIcons = [CalendarDays, Users, Clock3]
const discoveryIcons = [BarChart3, Repeat2, Sparkles, ShieldCheck]

interface LandingPageProps {
  locale: Locale
}

export default function LandingPage({ locale }: LandingPageProps) {
  const content = getLandingContent(locale)
  const [methodBeforeJson, methodAfterJson] = content.method.description.split("watch-history.json")

  return (
    <div className="dark min-h-screen bg-zinc-950 text-white">
      <PlaybackHeader
        activePlatform="youtube"
        guideHref="#how-to-export"
        locale={locale}
        showLanguageSwitcher
      />

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
                {content.hero.badge}
              </div>

              <h1 className="mt-7 text-balance text-4xl font-bold tracking-[-0.04em] text-white sm:text-5xl lg:text-6xl">
                {content.hero.titlePrefix}{" "}
                <span className="bg-gradient-to-r from-red-400 via-red-300 to-rose-400 bg-clip-text text-transparent">
                  {content.hero.titleHighlight}
                </span>
              </h1>
              <p className="mt-6 max-w-xl text-base leading-7 text-zinc-400 sm:text-lg sm:leading-8">
                {content.hero.description}
              </p>

              <div className="mt-9 grid gap-3 sm:grid-cols-3">
                {content.promises.map((item, index) => {
                  const Icon = promiseIcons[index]
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
                <p>{content.hero.trustLine}</p>
              </div>
            </div>

            <div className="relative lg:pl-4">
              <div className="absolute -inset-6 rounded-[2rem] bg-red-500/[0.1] blur-2xl" />
              <div className="relative rounded-[2rem] border border-white/10 bg-zinc-950/70 p-3 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-5">
                <FileUploadForm locale={locale} />
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-white/[0.07] py-20 sm:py-24" aria-labelledby="discover-title">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-300">{content.discoveries.eyebrow}</p>
              <h2 id="discover-title" className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">{content.discoveries.title}</h2>
              <p className="mt-4 text-base leading-7 text-zinc-400">{content.discoveries.description}</p>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {content.discoveries.items.map((item, index) => {
                const Icon = discoveryIcons[index]
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
              <article
                aria-labelledby="youtube-analysis-method-title"
                className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-zinc-950/80 p-6 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-8"
              >
                <div className="max-w-3xl">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-300">{content.method.eyebrow}</p>
                  <h3 id="youtube-analysis-method-title" className="mt-4 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                    {content.method.title}
                  </h3>
                  <p className="mt-4 text-sm leading-7 text-zinc-400 sm:text-base">
                    {methodBeforeJson}<code className="font-mono text-red-200">watch-history.json</code>{methodAfterJson}
                  </p>
                  <div className="mt-5 flex flex-col items-start gap-2 sm:flex-row sm:gap-5">
                    <Link
                      href="/guides/youtube-watch-history-json"
                      className="inline-flex items-center text-sm font-medium text-red-200 underline-offset-4 transition-colors hover:text-red-100 hover:underline"
                    >
                      {content.method.jsonGuide}
                      <ArrowUpRight className="ml-1.5 h-3.5 w-3.5" aria-hidden="true" />
                    </Link>
                    <Link
                      href="/guides/how-to-see-most-watched-youtube-channels"
                      className="inline-flex items-center text-sm font-medium text-red-200 underline-offset-4 transition-colors hover:text-red-100 hover:underline"
                    >
                      {content.method.channelGuide}
                      <ArrowUpRight className="ml-1.5 h-3.5 w-3.5" aria-hidden="true" />
                    </Link>
                  </div>
                </div>

                <dl className="mt-8 grid gap-3 md:grid-cols-3">
                  {content.method.details.map((item) => (
                    <div key={item.title} className="rounded-2xl bg-white/[0.04] p-5 ring-1 ring-inset ring-white/[0.06]">
                      <dt className="font-semibold text-white">{item.title}</dt>
                      <dd className="mt-2 text-sm leading-6 text-zinc-400">{item.description}</dd>
                    </div>
                  ))}
                </dl>

                <div className="mt-4 rounded-2xl border border-amber-300/15 bg-amber-300/[0.06] p-5">
                  <p className="text-sm font-semibold text-amber-100">{content.method.limitationTitle}</p>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">{content.method.limitationDescription}</p>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section id="how-to-export" className="scroll-mt-20 border-b border-white/[0.07] py-20 sm:py-24">
          <div className="mx-auto grid w-full max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-300">{content.export.eyebrow}</p>
              <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">{content.export.title}</h2>
              <p className="mt-5 max-w-xl text-base leading-7 text-zinc-400">{content.export.description}</p>
              <Button asChild className="mt-7 bg-red-500 font-semibold text-white hover:bg-red-400">
                <Link href="https://takeout.google.com/" target="_blank" rel="noopener noreferrer">
                  {content.export.action}
                  <ArrowUpRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
              <Link
                href="/guides/youtube-watch-history-json"
                className="mt-5 block text-sm text-zinc-400 underline-offset-4 transition-colors hover:text-white hover:underline"
              >
                {content.export.guideAction}
              </Link>
            </div>

            <ol className="grid gap-3 sm:grid-cols-2">
              {content.export.steps.map((step, index) => (
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
                <h2 id="privacy-title" className="mt-6 text-2xl font-bold tracking-tight sm:text-3xl">{content.privacy.title}</h2>
                <p className="mt-4 max-w-xl text-sm leading-7 text-zinc-300">{content.privacy.description}</p>
              </div>
              <div className="grid gap-px border-t border-white/10 bg-white/10 sm:grid-cols-3 lg:grid-cols-1 lg:border-l lg:border-t-0">
                {content.privacy.facts.map((fact) => (
                  <div key={fact.title} className="bg-zinc-950/90 p-5 sm:p-6">
                    <p className="text-sm font-semibold text-white">{fact.title}</p>
                    <p className="mt-1 text-xs text-zinc-500">{fact.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 sm:py-24" aria-labelledby="youtube-faq-title">
          <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-300">{content.faq.eyebrow}</p>
              <h2 id="youtube-faq-title" className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">{content.faq.title}</h2>
            </div>
            <div className="mt-10 grid gap-x-10 gap-y-8 md:grid-cols-2">
              {content.faq.items.map((faq) => (
                <article key={faq.question} className="border-t border-white/10 pt-5">
                  <h3 className="font-semibold text-white">{faq.question}</h3>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">{faq.answer}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <PlaybackFooter locale={locale} />
    </div>
  )
}
