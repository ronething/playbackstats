import type { Metadata } from 'next'
import './globals.css'
import Script from 'next/script'
import PromoBanner from '@/components/promo-banner'

export const metadata: Metadata = {
  metadataBase: new URL('https://playbackstats.com'),
  authors: [{ name: 'Playback Stats' }],
  generator: 'Next.js',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <Script
          defer
          data-domain="playbackstats.com"
          src="https://plausible.vibecodinghub.org/js/script.file-downloads.outbound-links.js"
        />
        <Script id="plausible-custom">
          {`window.plausible = window.plausible || function() { (window.plausible.q = window.plausible.q || []).push(arguments) }`}
        </Script>
      </head>
      <body>
        <a
          href="#main-content"
          className="fixed left-4 top-4 z-[60] -translate-y-24 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-zinc-950 shadow-xl transition-transform focus:translate-y-0"
        >
          Skip to content
        </a>
        <PromoBanner />
        {children}
      </body>
    </html>
  )
}
