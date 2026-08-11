"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import {
  FacebookShareButton,
  TwitterShareButton,
  WhatsappShareButton,
  FacebookIcon,
  XIcon,
  WhatsappIcon,
  RedditIcon,
} from "react-share"
import { Check, Coffee, Download, Heart, Image as ImageIcon, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { YoutubeAdvancedStats, YoutubeChannelCount, YoutubeStats } from "@/lib/youtube-analysis"
import { createYoutubeShareCard, downloadYoutubeShareCard } from "@/lib/youtube-share-card"

const SHARE_URL = "https://playbackstats.com"
const SHARE_TITLE = "I found my YouTube viewing personality with Playback Stats. What does your history say about you?"
const KOFI_URL = "https://ko-fi.com/ashing"

// Custom Reddit share button since react-share uses wrong URL (web/submit instead of reddit.com/submit)
function CustomRedditShareButton({ url, title, children }: { url: string; title: string; children: React.ReactNode }) {
  const handleClick = () => {
    const redditUrl = `https://www.reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`
    window.open(redditUrl, "_blank", "noopener,noreferrer,width=600,height=600")
  }

  return (
    <button
      onClick={handleClick}
      className="transition-transform hover:scale-110 cursor-pointer"
      aria-label="Share on Reddit"
    >
      {children}
    </button>
  )
}

interface SocialShareProps {
  advancedStats: YoutubeAdvancedStats | null
  channelCounts: YoutubeChannelCount[]
  stats: YoutubeStats
}

interface ShareCardPreview {
  blob: Blob
  url: string
}

export default function SocialShare({ advancedStats, channelCounts, stats }: SocialShareProps) {
  const [downloadState, setDownloadState] = useState<"idle" | "working" | "done" | "error">("idle")
  const [preview, setPreview] = useState<ShareCardPreview | null>(null)
  const [previewError, setPreviewError] = useState(false)

  useEffect(() => {
    let cancelled = false

    void createYoutubeShareCard({ advancedStats, channelCounts, stats })
      .then(({ blob, previewUrl }) => {
        if (cancelled) return
        setPreviewError(false)
        setPreview({ blob, url: previewUrl })
      })
      .catch((error) => {
        console.error("Share card preview failed:", error)
        if (!cancelled) setPreviewError(true)
      })

    return () => {
      cancelled = true
    }
  }, [advancedStats, channelCounts, stats])

  const handleDownload = () => {
    if (!preview) return
    setDownloadState("working")
    try {
      downloadYoutubeShareCard(preview.blob)
      setDownloadState("done")
    } catch (error) {
      console.error("Share card download failed:", error)
      setDownloadState("error")
    }
  }

  return (
    <div className="flex flex-col items-center gap-6 py-8 px-4">
      <div className="w-full max-w-3xl overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-red-500/10 via-white/[0.025] to-emerald-300/[0.06] p-5 sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="w-40 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-black/20 shadow-xl shadow-black/20 sm:w-52">
            {preview ? (
              <Image
                src={preview.url}
                alt="Preview of your locally generated YouTube DNA card"
                width={270}
                height={338}
                unoptimized
                className="h-auto w-full"
              />
            ) : (
              <div className="flex aspect-[4/5] items-center justify-center text-zinc-500">
                {previewError ? (
                  <ImageIcon className="h-6 w-6" aria-hidden="true" />
                ) : (
                  <Loader2 className="h-6 w-6 animate-spin" aria-label="Preparing share card preview" />
                )}
              </div>
            )}
          </div>
          <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-red-300/20 bg-red-500/15 text-red-200">
                <ImageIcon className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="font-semibold text-white">Your YouTube DNA card</h3>
              <p className="mt-1 max-w-md text-sm leading-6 text-zinc-400">
                Turn your history into a 4:5 PNG with your viewing personality, top channel names,
                favorite day, peak hour, and longest streak. Review the preview before sharing it.
              </p>
            </div>
            <Button
              type="button"
              onClick={handleDownload}
              disabled={!preview || downloadState === "working"}
              className="h-11 shrink-0 bg-white text-zinc-950 hover:bg-zinc-200"
            >
              {downloadState === "working" || !preview ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
              ) : downloadState === "done" ? (
                <Check className="mr-2 h-4 w-4" aria-hidden="true" />
              ) : (
                <Download className="mr-2 h-4 w-4" aria-hidden="true" />
              )}
              {!preview ? "Preparing card…" : downloadState === "done" ? "Download again" : "Download DNA card"}
            </Button>
          </div>
        </div>
        <p className={`mt-3 text-xs ${downloadState === "error" ? "text-red-300" : "text-zinc-500"}`} aria-live="polite">
          {previewError || downloadState === "error"
            ? "The browser could not download the image. Please try again."
            : downloadState === "done"
              ? "YouTube DNA card downloaded. Attach it anywhere you choose."
              : "Created entirely in this browser tab and never uploaded."}
        </p>
      </div>

      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">Share Playback Stats</h3>
        <p className="text-sm text-muted-foreground">
          These buttons share the public website only. Add your DNA card to the post if you want.
        </p>
      </div>
      
      <div className="flex flex-wrap items-center justify-center gap-3">
        <FacebookShareButton url={SHARE_URL} className="transition-transform hover:scale-110">
          <FacebookIcon size={40} round />
        </FacebookShareButton>

        <TwitterShareButton url={SHARE_URL} title={SHARE_TITLE} className="transition-transform hover:scale-110">
          <XIcon size={40} round />
        </TwitterShareButton>

        <WhatsappShareButton url={SHARE_URL} title={SHARE_TITLE} className="transition-transform hover:scale-110">
          <WhatsappIcon size={40} round />
        </WhatsappShareButton>

        <CustomRedditShareButton url={SHARE_URL} title={SHARE_TITLE}>
          <RedditIcon size={40} round />
        </CustomRedditShareButton>
      </div>

      {/* Enhanced Donation Area */}
      <div className="w-full max-w-md">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-500/10 to-pink-500/10 border-2 border-orange-500/20 p-6">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/20 to-pink-500/20 rounded-full blur-2xl" />
          
          <div className="relative space-y-4">
            <div className="text-center">
              <Coffee className="w-12 h-12 mx-auto mb-3 text-orange-500" />
              <h4 className="font-bold text-lg mb-2">Buy me a coffee</h4>
              <p className="text-sm text-muted-foreground">
                Help keep this tool free and ad-free forever
              </p>
            </div>
            
            <Button
              asChild
              className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all hover:scale-105 h-12 text-base font-semibold"
            >
              <a
                href={KOFI_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2"
              >
                <Heart className="w-5 h-5 fill-current" />
                Support on Ko-fi
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
