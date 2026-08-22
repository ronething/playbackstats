import Link from "next/link"
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Clock3,
  HardDrive,
  History,
  LockKeyhole,
  Repeat2,
  ShieldCheck,
  Users,
} from "lucide-react"

import FileUploadForm from "@/components/file-upload-form"
import PlaybackFooter from "@/components/playback-footer"
import PlaybackHeader from "@/components/playback-header"
import { Button } from "@/components/ui/button"
import { getLandingContent, localizeHome, type Locale } from "@/lib/i18n"

const discoveryIcons = [BarChart3, Users, Repeat2, Clock3]

interface LandingPageProps {
  locale: Locale
}

function StructuredData({ locale }: LandingPageProps) {
  const content = getLandingContent(locale)
  const pageUrl = `https://playbackstats.com${localizeHome(locale)}`
  const data = [
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "Playback Stats",
      applicationCategory: "MultimediaApplication",
      operatingSystem: "Web",
      inLanguage: locale,
      url: pageUrl,
      description: content.meta.description,
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      featureList: content.discoveries.items.map((item) => item.title),
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      inLanguage: locale,
      mainEntity: content.faq.items.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
    },
  ]

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replaceAll("<", "\\u003c") }}
    />
  )
}

export default function LandingPage({ locale }: LandingPageProps) {
  const content = getLandingContent(locale)

  return (
    <div className="min-h-screen overflow-x-clip bg-[#f2eee5] text-[#171511] [overflow-wrap:anywhere] [hyphens:auto]">
      <StructuredData locale={locale} />
      <PlaybackHeader
        activePlatform="youtube"
        guideHref="#how-to-export"
        locale={locale}
        tone="light"
        showLanguageSwitcher
      />

      <main id="main-content">
        <section className="relative overflow-hidden border-b border-black/15">
          <div className="pointer-events-none absolute inset-0 opacity-50 [background-image:linear-gradient(to_right,rgba(23,21,17,0.07)_1px,transparent_1px),linear-gradient(to_bottom,rgba(23,21,17,0.07)_1px,transparent_1px)] [background-size:64px_64px] [mask-image:linear-gradient(to_bottom,black,transparent_88%)]" />
          <div className="relative mx-auto grid w-full max-w-[1440px] lg:grid-cols-[1.03fr_0.97fr]">
            <div className="flex min-h-[680px] min-w-0 flex-col justify-between border-black/15 px-5 py-12 sm:px-8 sm:py-16 lg:border-r lg:px-12 lg:py-20 xl:px-16">
              <div>
                <p className="flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-[#5d574e]">
                  <span className="h-2 w-2 rounded-full bg-[#ff3b30] shadow-[0_0_0_5px_rgba(255,59,48,0.14)]" />
                  {content.hero.eyebrow}
                </p>
                <h1 className="mt-8 max-w-4xl text-balance text-[clamp(2.9rem,6.4vw,6.9rem)] font-semibold leading-[0.92] tracking-[-0.065em]">
                  {content.hero.title}{" "}
                  <span className="text-[#d52b22]">{content.hero.highlight}</span>
                </h1>
                <p className="mt-8 max-w-2xl text-base leading-7 text-[#5d574e] sm:text-lg sm:leading-8">
                  {content.hero.description}
                </p>
                <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                  <Button
                    asChild
                    className="h-12 rounded-none bg-[#171511] px-6 font-semibold text-white shadow-none hover:bg-[#d52b22]"
                  >
                    <Link href="#upload">
                      {content.hero.primaryAction}
                      <ArrowDown className="ml-2 h-4 w-4" aria-hidden="true" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="h-12 rounded-none border-black/25 bg-transparent px-6 font-semibold text-[#171511] shadow-none hover:border-black hover:bg-transparent"
                  >
                    <Link href="#method">
                      {content.hero.secondaryAction}
                      <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="mt-14 flex items-center gap-3 border-t border-black/15 pt-5 text-xs font-medium text-[#5d574e]">
                <ShieldCheck className="h-4 w-4 shrink-0 text-[#d52b22]" aria-hidden="true" />
                {content.hero.trustLine}
              </div>
            </div>

            <div id="upload" className="min-w-0 scroll-mt-28 bg-[#d52b22] p-3 sm:p-5 lg:p-7">
              <div className="flex h-full min-h-[640px] flex-col bg-[#171511] p-5 text-white sm:p-8 lg:min-h-0 lg:p-10">
                <div className="flex items-start justify-between gap-6 border-b border-white/15 pb-7">
                  <div>
                    <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-[#ff938d]">
                      {content.hero.panelEyebrow}
                    </p>
                    <h2 className="mt-3 max-w-md text-2xl font-semibold tracking-[-0.035em] sm:text-3xl">
                      {content.hero.panelTitle}
                    </h2>
                    <p className="mt-3 max-w-md text-sm leading-6 text-white/55">
                      {content.hero.panelDescription}
                    </p>
                  </div>
                  <LockKeyhole className="h-6 w-6 shrink-0 text-[#ff938d]" aria-hidden="true" />
                </div>

                <div className="flex flex-1 items-center py-8">
                  <FileUploadForm locale={locale} />
                </div>

                <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 border-t border-white/15 pt-6 font-mono text-[10px] uppercase tracking-[0.16em] text-white/40">
                  <span>{content.hero.fileLabel}</span>
                  <span className="h-px bg-[linear-gradient(to_right,rgba(255,255,255,.22)_50%,transparent_50%)] bg-[length:8px_1px]" />
                  <span>{content.hero.dashboardLabel}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-black/15 bg-[#fffdf8]" aria-label={content.nav.productFacts}>
          <dl className="mx-auto grid w-full max-w-[1440px] grid-cols-2 lg:grid-cols-4">
            {content.proof.map((item, index) => (
              <div
                key={item.label}
                className={`min-h-32 px-5 py-6 sm:px-8 ${index % 2 === 0 ? "border-r border-black/15" : ""} ${index < 2 ? "border-b border-black/15 lg:border-b-0" : ""} ${index === 1 ? "lg:border-r" : ""} ${index === 2 ? "lg:border-r" : ""}`}
              >
                <dt className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[#81796d]">
                  {item.label}
                </dt>
                <dd className="mt-5 text-sm font-semibold tracking-[-0.01em] sm:text-base">{item.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="border-b border-black/15 py-20 sm:py-28" aria-labelledby="discover-title">
          <div className="mx-auto grid w-full max-w-[1440px] gap-12 px-5 sm:px-8 lg:grid-cols-[0.78fr_1.22fr] lg:px-12 xl:px-16">
            <div className="min-w-0 lg:sticky lg:top-28 lg:self-start">
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-[#d52b22]">
                {content.discoveries.eyebrow}
              </p>
              <h2 id="discover-title" className="mt-5 max-w-xl text-balance text-4xl font-semibold leading-[1.02] tracking-[-0.05em] sm:text-5xl">
                {content.discoveries.title}
              </h2>
              <p className="mt-6 max-w-lg text-base leading-7 text-[#5d574e]">
                {content.discoveries.description}
              </p>
            </div>

            <div className="grid min-w-0 gap-px overflow-hidden border border-black/15 bg-black/15 sm:grid-cols-2">
              {content.discoveries.items.map((item, index) => {
                const Icon = discoveryIcons[index]
                return (
                  <article key={item.title} className="group min-h-72 bg-[#fffdf8] p-6 transition-colors hover:bg-white sm:p-8">
                    <div className="flex items-start justify-between gap-5">
                      <span className="font-mono text-xs font-semibold text-[#81796d]">{item.index}</span>
                      <span className="flex h-10 w-10 items-center justify-center border border-black/15 bg-[#f2eee5] transition-colors group-hover:border-[#d52b22] group-hover:bg-[#d52b22] group-hover:text-white">
                        <Icon className="h-4 w-4" aria-hidden="true" />
                      </span>
                    </div>
                    <h3 className="mt-20 text-xl font-semibold tracking-[-0.025em]">{item.title}</h3>
                    <p className="mt-3 max-w-md text-sm leading-6 text-[#686056]">{item.description}</p>
                  </article>
                )
              })}
            </div>
          </div>
        </section>

        <section id="method" className="scroll-mt-20 bg-[#171511] py-20 text-white sm:py-28" aria-labelledby="method-title">
          <div className="mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-12 xl:px-16">
            <div className="grid gap-10 border-b border-white/15 pb-14 lg:grid-cols-[0.78fr_1.22fr]">
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-[#ff7770]">
                {content.method.eyebrow}
              </p>
              <div className="min-w-0">
                <h2 id="method-title" className="max-w-4xl text-balance text-4xl font-semibold leading-[1.02] tracking-[-0.05em] sm:text-6xl">
                  {content.method.title}
                </h2>
                <p className="mt-7 max-w-3xl text-base leading-7 text-white/55 sm:text-lg sm:leading-8">
                  {content.method.description}
                </p>
              </div>
            </div>

            <ol className="grid border-b border-white/15 lg:grid-cols-3">
              {content.method.steps.map((step, index) => (
                <li key={step.title} className="relative border-b border-white/15 py-9 last:border-b-0 lg:border-b-0 lg:border-r lg:px-8 lg:first:pl-0 lg:last:border-r-0 lg:last:pr-0">
                  <div className="flex items-center gap-4">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#d52b22] font-mono text-xs font-semibold">
                      {index + 1}
                    </span>
                    {index < content.method.steps.length - 1 && (
                      <span className="hidden h-px flex-1 bg-[linear-gradient(to_right,rgba(255,255,255,.28)_50%,transparent_50%)] bg-[length:8px_1px] lg:block" />
                    )}
                  </div>
                  <h3 className="mt-8 text-lg font-semibold">{step.title}</h3>
                  <p className="mt-3 max-w-sm text-sm leading-6 text-white/50">{step.description}</p>
                </li>
              ))}
            </ol>

            <div className="mt-10 grid overflow-hidden border border-[#ff7770]/40 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="bg-[#d52b22] p-7 sm:p-9">
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-white/65">
                  {content.method.limitationLabel}
                </p>
                <h3 className="mt-5 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
                  {content.method.limitationTitle}
                </h3>
                <p className="mt-5 max-w-2xl text-sm leading-7 text-white/75">
                  {content.method.limitationDescription}
                </p>
              </div>
              <div className="flex flex-col justify-center gap-4 bg-[#211f1a] p-7 sm:p-9">
                <Link href="/guides/youtube-watch-history-json" className="group flex items-center justify-between gap-4 border-b border-white/15 pb-4 text-sm font-semibold hover:text-[#ff938d]">
                  {content.method.jsonGuide}
                  <ArrowUpRight className="h-4 w-4 shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
                </Link>
                <Link href="/guides/how-to-see-most-watched-youtube-channels" className="group flex items-center justify-between gap-4 border-b border-white/15 pb-4 text-sm font-semibold hover:text-[#ff938d]">
                  {content.method.channelGuide}
                  <ArrowUpRight className="h-4 w-4 shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section id="how-to-export" className="scroll-mt-20 border-b border-black/15 bg-[#fffdf8] py-20 sm:py-28" aria-labelledby="export-title">
          <div className="mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-12 xl:px-16">
            <div className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr]">
              <div className="min-w-0">
                <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-[#d52b22]">
                  {content.export.eyebrow}
                </p>
                <h2 id="export-title" className="mt-5 max-w-xl text-balance text-4xl font-semibold leading-[1.02] tracking-[-0.05em] sm:text-5xl">
                  {content.export.title}
                </h2>
                <p className="mt-6 max-w-lg text-base leading-7 text-[#5d574e]">{content.export.description}</p>
                <Button asChild className="mt-8 h-12 rounded-none bg-[#d52b22] px-6 font-semibold text-white shadow-none hover:bg-[#171511]">
                  <Link href="https://takeout.google.com/" target="_blank" rel="noopener noreferrer">
                    {content.export.action}
                    <ArrowUpRight className="ml-2 h-4 w-4" aria-hidden="true" />
                  </Link>
                </Button>
                <Link href="/guides/youtube-watch-history-json" className="mt-5 block text-sm font-medium text-[#5d574e] underline decoration-black/20 underline-offset-4 transition-colors hover:text-black">
                  {content.export.guideAction}
                </Link>
              </div>

              <ol className="min-w-0 border-t border-black/20">
                {content.export.steps.map((step, index) => (
                  <li key={step.title} className="grid gap-5 border-b border-black/20 py-7 sm:grid-cols-[5rem_0.7fr_1.3fr] sm:items-start">
                    <span className="font-mono text-xs font-semibold text-[#d52b22]">0{index + 1}</span>
                    <h3 className="font-semibold tracking-[-0.015em]">{step.title}</h3>
                    <p className="text-sm leading-6 text-[#686056]">{step.description}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <section className="border-b border-black/15 bg-[#f2eee5] py-20 sm:py-28" aria-labelledby="privacy-title">
          <div className="mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-12 xl:px-16">
            <div className="grid overflow-hidden border border-black/20 lg:grid-cols-[1.12fr_0.88fr]">
              <div className="relative overflow-hidden bg-[#ffd84d] p-7 sm:p-10 lg:p-14">
                <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full border-[40px] border-black/[0.06]" />
                <LockKeyhole className="h-7 w-7" aria-hidden="true" />
                <p className="mt-10 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-black/55">
                  {content.privacy.eyebrow}
                </p>
                <h2 id="privacy-title" className="mt-5 max-w-2xl text-balance text-4xl font-semibold leading-[1.02] tracking-[-0.05em] sm:text-5xl">
                  {content.privacy.title}
                </h2>
                <p className="mt-6 max-w-2xl text-base leading-7 text-black/65">{content.privacy.description}</p>
              </div>
              <dl className="grid gap-px bg-black/20">
                {content.privacy.facts.map((fact, index) => (
                  <div key={fact.title} className="grid grid-cols-[auto_1fr] gap-5 bg-[#fffdf8] p-6 sm:p-8">
                    <span className="font-mono text-xs font-semibold text-[#d52b22]">0{index + 1}</span>
                    <div>
                      <dt className="font-semibold">{fact.title}</dt>
                      <dd className="mt-2 text-sm leading-6 text-[#686056]">{fact.description}</dd>
                    </div>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>

        <section className="border-b border-black/15 bg-[#fffdf8] py-20 sm:py-28" aria-labelledby="faq-title">
          <div className="mx-auto grid w-full max-w-[1440px] gap-12 px-5 sm:px-8 lg:grid-cols-[0.78fr_1.22fr] lg:px-12 xl:px-16">
            <div>
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-[#d52b22]">
                {content.faq.eyebrow}
              </p>
              <h2 id="faq-title" className="mt-5 max-w-xl text-balance text-4xl font-semibold leading-[1.02] tracking-[-0.05em] sm:text-5xl">
                {content.faq.title}
              </h2>
            </div>
            <div className="border-t border-black/20">
              {content.faq.items.map((item, index) => (
                <details key={item.question} className="group border-b border-black/20">
                  <summary className="flex cursor-pointer list-none items-start gap-5 py-6 marker:hidden">
                    <span className="mt-0.5 font-mono text-xs font-semibold text-[#d52b22]">0{index + 1}</span>
                    <span className="flex-1 font-semibold tracking-[-0.015em]">{item.question}</span>
                    <span className="relative mt-1 h-4 w-4 shrink-0 before:absolute before:left-0 before:top-1/2 before:h-px before:w-4 before:bg-black after:absolute after:left-1/2 after:top-0 after:h-4 after:w-px after:bg-black after:transition-transform group-open:after:scale-y-0" />
                  </summary>
                  <p className="pb-7 pl-10 pr-8 text-sm leading-7 text-[#686056]">{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#d52b22] text-white">
          <div className="mx-auto grid min-h-[430px] w-full max-w-[1440px] lg:grid-cols-[1fr_auto]">
              <div className="flex min-w-0 flex-col justify-center px-5 py-16 sm:px-8 lg:px-12 xl:px-16">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-white/65">
                {content.finalCta.eyebrow}
              </p>
              <h2 className="mt-5 max-w-4xl text-balance text-4xl font-semibold leading-[1] tracking-[-0.05em] sm:text-6xl">
                {content.finalCta.title}
              </h2>
              <p className="mt-6 max-w-2xl text-base leading-7 text-white/70">{content.finalCta.description}</p>
              <Button asChild className="mt-8 h-12 w-fit rounded-none bg-white px-6 font-semibold text-[#171511] shadow-none hover:bg-[#ffd84d]">
                <Link href="#upload">
                  {content.finalCta.action}
                  <ArrowUpRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
            </div>
            <div className="hidden w-80 border-l border-white/20 p-10 lg:flex lg:flex-col lg:justify-between">
              <History className="h-8 w-8 text-white/80" aria-hidden="true" />
              <div className="space-y-3">
                {[74, 48, 88, 62, 36].map((width, index) => (
                  <div key={width} className="flex items-center gap-3">
                    <span className="font-mono text-[9px] text-white/50">0{index + 1}</span>
                    <span className="h-2 bg-white/70" style={{ width: `${width}%` }} />
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.18em] text-white/50">
                <HardDrive className="h-3.5 w-3.5" aria-hidden="true" />
                {content.finalCta.localPrivate}
              </div>
            </div>
          </div>
        </section>
      </main>

      <PlaybackFooter locale={locale} tone="light" />
    </div>
  )
}
