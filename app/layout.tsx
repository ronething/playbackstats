import type { Metadata } from 'next'
import './globals.css'
import Script from 'next/script'
import { headers } from 'next/headers'
import PromoBanner from '@/components/promo-banner'
import { getLandingContent, isLocale } from '@/lib/i18n'

export const metadata: Metadata = {
  metadataBase: new URL('https://playbackstats.com'),
  authors: [{ name: 'Playback Stats' }],
  generator: 'Next.js',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const requestHeaders = await headers()
  const requestedLocale = requestHeaders.get('x-playback-locale')
  const locale = isLocale(requestedLocale) ? requestedLocale : 'en'
  const content = getLandingContent(locale)

  return (
    <html lang={locale}>
      <head>
        <Script
          id="rybbit-analytics"
          data-site-id="a53780efe09d"
          src="https://r.analytic.app/api/script.js?siteId=a53780efe09d"
          strategy="afterInteractive"
        />
      </head>
      <body>
        <a
          href="#main-content"
          className="fixed left-4 top-4 z-[60] -translate-y-24 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-zinc-950 shadow-xl transition-transform focus:translate-y-0"
        >
          {content.nav.skipToContent}
        </a>
        <PromoBanner locale={locale} />
        {children}
      </body>
    </html>
  )
}
