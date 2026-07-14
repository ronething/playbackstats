import Link from "next/link"
import { Metadata } from "next"

import PlaybackFooter from "@/components/playback-footer"
import PlaybackHeader from "@/components/playback-header"

export const metadata: Metadata = {
  title: "Terms of Service | Playback Stats",
  description: "Terms of service and usage conditions for Playback Stats.",
  openGraph: {
    title: "Terms of Service | Playback Stats",
    description: "Terms of service and usage conditions for Playback Stats.",
    url: "https://playbackstats.com/terms",
  },
  twitter: {
    title: "Terms of Service | Playback Stats",
    description: "Terms of service and usage conditions for Playback Stats.",
  },
  alternates: {
    canonical: "https://playbackstats.com/terms",
  },
}

export default function TermsOfService() {
  return (
    <div className="dark flex min-h-screen flex-col bg-zinc-950 text-white">
      <PlaybackHeader />
      <main id="main-content" className="flex-1">
        <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <article className="mx-auto max-w-3xl space-y-10 text-sm leading-7 text-zinc-300 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-white [&_li]:pl-1 [&_strong]:font-semibold [&_strong]:text-white sm:text-base">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Playback Stats</p>
              <h1 className="mt-4 text-4xl font-bold tracking-[-0.04em] text-white sm:text-5xl">Terms of Service</h1>
              <p className="mt-4 text-sm text-zinc-500">Last updated: {new Date().toLocaleDateString()}</p>
            </div>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold">1. Introduction</h2>
              <p>
                Welcome to Playback Stats. By accessing or using our website, you agree to be bound by
                these Terms of Service. If you do not agree to these terms, please do not use our service.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold">2. Description of Service</h2>
              <p>
                Playback Stats provides tools for users to visualize supported YouTube and Spotify history data. The
                service processes history files locally in the user&apos;s browser to generate visualizations and insights.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold">3. User Responsibilities</h2>
              <p>By using our service, you agree to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide only history data that you are authorized to process</li>
                <li>Use the service only for personal, non-commercial purposes</li>
                <li>Not attempt to reverse engineer, modify, or manipulate the service</li>
                <li>Not use the service to violate any laws or regulations</li>
                <li>
                  Accept full responsibility for any consequences that may arise from your use of the visualizations and
                  insights provided
                </li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold">4. Intellectual Property</h2>
              <p>
                All content, features, and functionality of Playback Stats are subject to applicable copyright,
                trademark, open-source licenses, and other intellectual property laws.
              </p>
              <p>
                You are granted a limited, non-exclusive, non-transferable license to use the service for personal,
                non-commercial purposes only.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold">5. Disclaimer of Warranties</h2>
              <p>
                Playback Stats is provided &quot;as is&quot; and &quot;as available&quot; without any
                warranties of any kind, either express or implied. We do not guarantee that:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>The service will meet your specific requirements</li>
                <li>The service will be uninterrupted, timely, secure, or error-free</li>
                <li>The results obtained from using the service will be accurate or reliable</li>
                <li>Any errors in the service will be corrected</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold">6. Limitation of Liability</h2>
              <p>
                In no event shall Playback Stats, its directors, employees, partners, agents, suppliers, or
                affiliates be liable for any indirect, incidental, special, consequential, or punitive damages,
                including without limitation, loss of profits, data, use, goodwill, or other intangible losses,
                resulting from:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Your access to or use of or inability to access or use the service</li>
                <li>Any conduct or content of any third party on the service</li>
                <li>Any content obtained from the service</li>
                <li>Unauthorized access, use, or alteration of your transmissions or content</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold">7. Data Usage and Privacy</h2>
              <p>
                We process supported history files entirely in your browser and do not collect, store, or transmit
                their contents or generated insights. Limited aggregate site analytics are described in our{" "}
                <Link href="/privacy" className="font-medium text-white underline decoration-white/30 underline-offset-4 hover:decoration-white">
                  Privacy Policy
                </Link>
                .
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold">8. Changes to Terms</h2>
              <p>
                We reserve the right to modify or replace these Terms of Service at any time at our sole discretion. If
                a revision is material, we will provide at least 30 days&apos; notice prior to any new terms taking
                effect. What constitutes a material change will be determined at our sole discretion.
              </p>
              <p>
                By continuing to access or use our service after any revisions become effective, you agree to be bound
                by the revised terms. If you do not agree to the new terms, you are no longer authorized to use the
                service.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold">9. Governing Law</h2>
              <p>
                These Terms shall be governed and construed in accordance with the laws, without regard to its conflict
                of law provisions.
              </p>
              <p>
                Our failure to enforce any right or provision of these Terms will not be considered a waiver of those
                rights.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold">10. Contact Us</h2>
              <p>
                If you have any questions about these Terms, please contact us at:
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
