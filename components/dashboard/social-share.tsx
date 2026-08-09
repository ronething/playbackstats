"use client"

import { useState } from "react"
import { Check, Coffee, Copy, Heart, Share2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { trackEvent } from "@/lib/analytics"

const SHARE_URL = "https://playbackstats.com"
const SHARE_TITLE = "Playback Stats — private YouTube watch history insights"
const SHARE_TEXT = "Turn a Google Takeout export into private viewing insights, entirely in your browser."
const KOFI_URL = "https://ko-fi.com/ashing"

export default function SocialShare() {
  const [copied, setCopied] = useState(false)
  const [shareError, setShareError] = useState(false)

  const completeShare = () => {
    trackEvent("share_completed", {
      platform: "youtube",
      source_page: "youtube_dashboard",
    })
  }

  const copyShareLink = async () => {
    setShareError(false)
    trackEvent("share_started", {
      platform: "youtube",
      source_page: "youtube_dashboard",
    })
    try {
      await navigator.clipboard.writeText(SHARE_URL)
      completeShare()
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2_000)
    } catch {
      setShareError(true)
    }
  }

  const share = async () => {
    setShareError(false)
    trackEvent("share_started", {
      platform: "youtube",
      source_page: "youtube_dashboard",
    })
    try {
      if (!navigator.share) {
        await navigator.clipboard.writeText(SHARE_URL)
        setCopied(true)
        window.setTimeout(() => setCopied(false), 2_000)
      } else {
        await navigator.share({ title: SHARE_TITLE, text: SHARE_TEXT, url: SHARE_URL })
      }
      completeShare()
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError")) setShareError(true)
    }
  }

  return (
    <div className="flex flex-col items-center gap-7 px-4 py-8">
      <div className="max-w-xl space-y-2 text-center">
        <h3 className="text-lg font-semibold">Share the private analyzer, not your private data</h3>
        <p className="text-sm leading-6 text-muted-foreground">
          Sharing sends only the Playback Stats homepage link. Titles, channels, counts, and dashboard results are never placed in the URL.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button type="button" onClick={share} className="bg-red-500 text-white hover:bg-red-400">
          <Share2 className="mr-2 h-4 w-4" aria-hidden="true" />
          Share Playback Stats
        </Button>
        <Button type="button" variant="outline" onClick={copyShareLink} className="border-white/15 bg-white/[0.04] text-white hover:bg-white/10 hover:text-white">
          {copied ? <Check className="mr-2 h-4 w-4 text-emerald-300" aria-hidden="true" /> : <Copy className="mr-2 h-4 w-4" aria-hidden="true" />}
          {copied ? "Link copied" : "Copy link"}
        </Button>
      </div>
      {shareError && <p role="alert" className="text-sm text-red-300">Sharing was not completed. You can copy https://playbackstats.com manually.</p>}

      <div className="w-full max-w-md">
        <div className="relative overflow-hidden rounded-2xl border-2 border-orange-500/20 bg-gradient-to-r from-orange-500/10 to-pink-500/10 p-6">
          <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-gradient-to-br from-orange-500/20 to-pink-500/20 blur-2xl" />
          <div className="relative space-y-4 text-center">
            <Coffee className="mx-auto h-12 w-12 text-orange-500" aria-hidden="true" />
            <div>
              <h4 className="text-lg font-bold">Buy me a coffee</h4>
              <p className="mt-2 text-sm text-muted-foreground">Support the hosted, free, and ad-free experience.</p>
            </div>
            <Button asChild className="h-12 w-full bg-gradient-to-r from-orange-500 to-pink-500 text-base font-semibold text-white hover:from-orange-600 hover:to-pink-600">
              <a
                href={KOFI_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent("donation_clicked", { platform: "youtube", source_page: "youtube_dashboard" })}
              >
                <Heart className="mr-2 h-5 w-5 fill-current" aria-hidden="true" />
                Support on Ko-fi
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
