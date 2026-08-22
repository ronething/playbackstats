import type { Metadata } from "next"
import { notFound } from "next/navigation"

import LandingPage from "@/components/landing-page"
import { isLocale, locales } from "@/lib/i18n"
import { buildLandingMetadata } from "@/lib/seo"

interface LocalizedHomeProps {
  params: Promise<{ locale: string }>
}

export function generateStaticParams() {
  return locales.filter((locale) => locale !== "en").map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: LocalizedHomeProps): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale) || locale === "en") return {}
  return buildLandingMetadata(locale)
}

export default async function LocalizedHome({ params }: LocalizedHomeProps) {
  const { locale } = await params
  if (!isLocale(locale) || locale === "en") notFound()

  return <LandingPage locale={locale} />
}
