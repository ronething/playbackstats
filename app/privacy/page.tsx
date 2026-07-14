import { Metadata } from "next"

import PlaybackFooter from "@/components/playback-footer"
import PlaybackHeader from "@/components/playback-header"

export const metadata: Metadata = {
  title: "Privacy Policy | Playback Stats",
  description: "Privacy and local data-processing practices for Playback Stats.",
  openGraph: {
    title: "Privacy Policy | Playback Stats",
    description: "Privacy and local data-processing practices for Playback Stats.",
    url: "https://playbackstats.com/privacy",
  },
  twitter: {
    title: "Privacy Policy | Playback Stats",
    description: "Privacy and local data-processing practices for Playback Stats.",
  },
  alternates: {
    canonical: "https://playbackstats.com/privacy",
  },
}

export default function PrivacyPolicy() {
  return (
    <div className="dark flex min-h-screen flex-col bg-zinc-950 text-white">
      <PlaybackHeader />
      <main id="main-content" className="flex-1">
        <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <article className="mx-auto max-w-3xl space-y-10 text-sm leading-7 text-zinc-300 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-white [&_li]:pl-1 [&_strong]:font-semibold [&_strong]:text-white sm:text-base">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Playback Stats</p>
              <h1 className="mt-4 text-4xl font-bold tracking-[-0.04em] text-white sm:text-5xl">Privacy Policy</h1>
              <p className="mt-4 text-sm text-zinc-500">Last updated: {new Date().toLocaleDateString()}</p>
            </div>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold">Introduction</h2>
              <p>
                Playback Stats helps you visualize personal YouTube and Spotify history. This policy explains which
                data stays in your browser and which limited site-level analytics may be collected.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold">Data Collection and Processing</h2>
              <p>
                <strong>Client-Side Processing Only:</strong> Our service operates entirely within your web browser.
                When you select a supported YouTube or Spotify history file:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>The file is processed locally on your device</li>
                <li>Your selected history file is never sent to our servers</li>
                <li>We do not store or transmit its titles, artists, playback records, or generated insights</li>
                <li>
                  The data is temporarily stored in your browser&apos;s memory only for the duration of your session
                </li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold">Information Usage</h2>
              <p>
                File contents are used only to calculate the visualizations shown in your current browser session.
                Spotify parsing uses a field allowlist and ignores account, IP address, location, and technical-log data.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold">Site Analytics</h2>
              <p>
                The website may use aggregate analytics for page views, file-download events, and outbound-link
                events. Uploaded history contents, file contents, analysis results, track titles, and artist names are
                not included in those analytics events.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold">Third-Party Services</h2>
              <p>
                History processing and visualization happen locally in your browser. Links to services such as
                Spotify, Google, GitHub, or other external sites are governed by those services&apos; own privacy policies.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold">Data Security</h2>
              <p>
                Since your data never leaves your device, the security of your data depends on your own device&apos;s
                security. We recommend:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Using up-to-date browsers with strong security features</li>
                <li>Ensuring your device has proper security measures in place</li>
                <li>Closing the browser tab when you&apos;re done using our service</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold">Changes to This Privacy Policy</h2>
              <p>
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the
                new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any
                changes.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold">Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy, please contact us at:
                support@playbackstats.com
              </p>
            </section>
          </article>
        </div>
      </main>
      <PlaybackFooter />
    </div>
  )
}
