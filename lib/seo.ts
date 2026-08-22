import type { Metadata } from "next"

import { getLandingContent, locales, localizeHome, type Locale } from "@/lib/i18n"

const baseUrl = "https://playbackstats.com"

export function buildLandingMetadata(locale: Locale): Metadata {
  const content = getLandingContent(locale)
  const canonical = `${baseUrl}${localizeHome(locale)}`
  const languageAlternates = Object.fromEntries(
    locales.map((alternateLocale) => [alternateLocale, `${baseUrl}${localizeHome(alternateLocale)}`]),
  )

  return {
    title: content.meta.title,
    description: content.meta.description,
    alternates: {
      canonical,
      languages: {
        ...languageAlternates,
        "x-default": baseUrl,
      },
    },
    openGraph: {
      type: "website",
      url: canonical,
      title: content.meta.title,
      description: content.meta.description,
      siteName: "Playback Stats",
      locale: content.meta.ogLocale,
      alternateLocale: locales
        .filter((alternateLocale) => alternateLocale !== locale)
        .map((alternateLocale) => getLandingContent(alternateLocale).meta.ogLocale),
    },
    twitter: {
      card: "summary_large_image",
      title: content.meta.title,
      description: content.meta.description,
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}
