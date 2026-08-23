"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import { Check, Download, Image as ImageIcon, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { SpotifyAnalysis } from "@/lib/spotify-analysis"
import { createSpotifyShareCard, downloadSpotifyShareCard } from "@/lib/spotify-share-card"

interface SpotifyDnaCardProps {
  analysis: SpotifyAnalysis
}

interface ShareCardPreview {
  blob: Blob
  url: string
}

export default function SpotifyDnaCard({ analysis }: SpotifyDnaCardProps) {
  const [downloadState, setDownloadState] = useState<"idle" | "working" | "done" | "error">("idle")
  const [preview, setPreview] = useState<ShareCardPreview | null>(null)
  const [previewError, setPreviewError] = useState(false)

  useEffect(() => {
    let cancelled = false

    void createSpotifyShareCard({ analysis })
      .then(({ blob, previewUrl }) => {
        if (cancelled) return
        setPreview({ blob, url: previewUrl })
      })
      .catch((error) => {
        console.error("Spotify share card preview failed:", error)
        if (!cancelled) setPreviewError(true)
      })

    return () => {
      cancelled = true
    }
  }, [analysis])

  const handleDownload = () => {
    if (!preview) return
    setDownloadState("working")
    try {
      downloadSpotifyShareCard(preview.blob)
      setDownloadState("done")
    } catch (error) {
      console.error("Spotify share card download failed:", error)
      setDownloadState("error")
    }
  }

  return (
    <section aria-labelledby="spotify-dna-title" className="overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-[#1DB954]/10 via-white/[0.025] to-violet-400/[0.07] p-5 sm:p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <div className="w-40 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-black/20 shadow-xl shadow-black/20 sm:w-52">
          {preview ? (
            <Image
              src={preview.url}
              alt="Preview of your locally generated Spotify DNA card"
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
                <Loader2 className="h-6 w-6 animate-spin" aria-label="Preparing Spotify DNA card preview" />
              )}
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-[#1DB954]/25 bg-[#1DB954]/15 text-[#4ade80]">
              <ImageIcon className="h-5 w-5" aria-hidden="true" />
            </div>
            <h2 id="spotify-dna-title" className="font-semibold text-white">Your Spotify DNA card</h2>
            <p className="mt-1 max-w-md text-sm leading-6 text-zinc-400">
              Turn your listening history into a 4:5 PNG with your listening personality, top artists,
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

      <p
        className={`mt-3 text-xs ${previewError || downloadState === "error" ? "text-red-300" : "text-zinc-500"}`}
        aria-live="polite"
      >
        {previewError || downloadState === "error"
          ? "The browser could not download the image. Please try again."
          : downloadState === "done"
            ? "Spotify DNA card downloaded. Attach it anywhere you choose."
            : "Created entirely in this browser tab and never uploaded."}
      </p>
    </section>
  )
}
