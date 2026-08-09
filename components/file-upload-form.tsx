"use client"

import type React from "react"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle2, FileArchive, FileJson, Loader2, ShieldCheck, Upload, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  fileSizeBucket,
  processingTimeBucket,
  recordCountBucket,
  trackEvent,
} from "@/lib/analytics"
import { analyzeYoutubeHistory, buildSampleYoutubeData } from "@/lib/youtube-analysis"
import { saveYoutubeDashboard } from "@/lib/youtube-dashboard-storage"
import {
  IMPORT_ERROR_GUIDANCE,
  YOUTUBE_IMPORT_LIMITS,
  YoutubeImportError,
  asYoutubeImportError,
  getYoutubeInputFormat,
  readYoutubeHistoryFile,
  type ImportErrorGuidance,
  type YoutubeImportErrorCode,
  type YoutubeInputFormat,
} from "@/lib/youtube-import"

interface SelectedFile {
  file: File
  inputFormat: YoutubeInputFormat
}

function nextFrame(): Promise<void> {
  return new Promise((resolve) => window.requestAnimationFrame(() => resolve()))
}

export default function FileUploadForm() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selection, setSelection] = useState<SelectedFile | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [progressStage, setProgressStage] = useState("")
  const [error, setError] = useState<ImportErrorGuidance | null>(null)

  const reportFailure = (
    code: YoutubeImportErrorCode,
    inputFormat?: YoutubeInputFormat,
    size?: number,
  ) => {
    setError(IMPORT_ERROR_GUIDANCE[code])
    trackEvent("history_parse_failed", {
      platform: "youtube",
      input_format: inputFormat,
      file_size_bucket: size === undefined ? undefined : fileSizeBucket(size),
      error_code: code,
      source_page: "home",
    })
  }

  const validateAndSetFile = (file: File) => {
    setError(null)
    let inputFormat: YoutubeInputFormat
    try {
      inputFormat = getYoutubeInputFormat(file)
    } catch (validationError) {
      const importError = asYoutubeImportError(validationError)
      setSelection(null)
      trackEvent("history_file_selected", {
        platform: "youtube",
        file_size_bucket: fileSizeBucket(file.size),
        source_page: "home",
      })
      reportFailure(importError.code, undefined, file.size)
      return
    }

    trackEvent("history_file_selected", {
      platform: "youtube",
      input_format: inputFormat,
      file_size_bucket: fileSizeBucket(file.size),
      source_page: "home",
    })
    const limit = inputFormat === "takeout_zip"
      ? YOUTUBE_IMPORT_LIMITS.archiveBytes
      : YOUTUBE_IMPORT_LIMITS.jsonBytes
    if (file.size > limit) {
      setSelection(null)
      reportFailure("memory_exhaustion", inputFormat, file.size)
      return
    }
    setSelection({ file, inputFormat })
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(false)
    const droppedFile = event.dataTransfer.files[0]
    if (droppedFile) validateAndSetFile(droppedFile)
  }

  const removeFile = () => {
    setSelection(null)
    setError(null)
    setProgress(0)
    setProgressStage("")
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const openSampleReport = () => {
    try {
      saveYoutubeDashboard(buildSampleYoutubeData(), { inputFormat: "sample", isSample: true })
      trackEvent("sample_report_opened", {
        platform: "youtube",
        input_format: "sample",
        source_page: "home",
      })
      router.push("/dashboard")
    } catch {
      reportFailure("browser_failure")
    }
  }

  const processFile = async () => {
    if (!selection) return
    const { file, inputFormat } = selection
    const startedAt = performance.now()
    const sizeBucket = fileSizeBucket(file.size)

    setIsProcessing(true)
    setError(null)
    setProgress(8)
    setProgressStage(inputFormat === "takeout_zip" ? "Checking archive safety limits..." : "Reading JSON locally...")
    trackEvent("history_parse_started", {
      platform: "youtube",
      input_format: inputFormat,
      file_size_bucket: sizeBucket,
      source_page: "home",
    })

    try {
      await nextFrame()
      const parsed = await readYoutubeHistoryFile(file)
      setProgress(58)
      setProgressStage("Building private viewing summaries...")
      await nextFrame()

      let data
      try {
        data = analyzeYoutubeHistory(parsed.records)
      } catch {
        throw new YoutubeImportError("empty_history", "No valid dated viewing records were found.")
      }

      setProgress(86)
      setProgressStage("Saving this dashboard in the current tab...")
      await nextFrame()
      try {
        saveYoutubeDashboard(data, {
          inputFormat,
          fileSizeBucket: sizeBucket,
          isSample: false,
        })
      } catch (storageError) {
        if (storageError instanceof DOMException && storageError.name === "QuotaExceededError") {
          throw new YoutubeImportError("memory_exhaustion", "The browser could not store the compact dashboard.")
        }
        throw new YoutubeImportError("browser_failure", "The browser could not store the compact dashboard.")
      }

      const elapsed = performance.now() - startedAt
      trackEvent("history_parse_succeeded", {
        platform: "youtube",
        input_format: inputFormat,
        file_size_bucket: sizeBucket,
        record_count_bucket: recordCountBucket(data.stats.totalVideos),
        processing_time_bucket: processingTimeBucket(elapsed),
        source_page: "home",
      })
      setProgress(100)
      setProgressStage("Opening your dashboard...")
      await nextFrame()
      router.push("/dashboard")
    } catch (processingError) {
      const importError = asYoutubeImportError(processingError)
      reportFailure(importError.code, inputFormat, file.size)
      setIsProcessing(false)
      setProgress(0)
      setProgressStage("")
    }
  }

  const file = selection?.file
  const isZip = selection?.inputFormat === "takeout_zip"

  return (
    <div className="w-full">
      {error && (
        <div role="alert" className="mb-4 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-100 animate-scale-in">
          <p className="font-semibold">{error.title}</p>
          <p className="mt-1 leading-6 text-red-100/80">{error.message}</p>
          <p className="mt-2 text-xs leading-5 text-zinc-400">{error.action}</p>
        </div>
      )}

      {!file ? (
        <>
          <div
            role="button"
            tabIndex={0}
            aria-label="Choose a YouTube watch history JSON file or Google Takeout ZIP"
            className={`group relative cursor-pointer rounded-3xl border border-dashed p-7 text-center transition-all duration-300 sm:p-8 ${
              isDragging
                ? "scale-[1.01] border-red-400 bg-red-500/10"
                : "border-white/15 bg-white/[0.04] hover:border-white/25 hover:bg-white/[0.06]"
            }`}
            onDragOver={(event) => {
              event.preventDefault()
              setIsDragging(true)
            }}
            onDragLeave={(event) => {
              event.preventDefault()
              if (!event.currentTarget.contains(event.relatedTarget as Node)) setIsDragging(false)
            }}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault()
                fileInputRef.current?.click()
              }
            }}
          >
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ring-1 ring-inset transition-all ${
                isDragging
                  ? "scale-105 bg-red-500/20 text-red-200 ring-red-400/35"
                  : "bg-red-500/15 text-red-300 ring-red-500/25"
              }`}>
                <Upload className="h-8 w-8 transition-transform group-hover:-translate-y-0.5" aria-hidden="true" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-semibold text-white">
                  {isDragging ? "Drop it here" : "Bring your YouTube history"}
                </h2>
                <p className="text-sm leading-6 text-zinc-400">
                  Drop the Takeout ZIP or JSON here, or <span className="font-medium text-red-300">choose a file</span>
                </p>
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-black/20 px-3 py-2 text-xs text-zinc-500">
                <FileArchive className="h-3.5 w-3.5 text-red-300" aria-hidden="true" />
                Takeout .zip or watch-history.json · up to 100 MB
              </div>
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <ShieldCheck className="h-3.5 w-3.5 text-red-300" aria-hidden="true" />
                Archive checks, extraction, and analysis stay in this tab
              </div>
            </div>
            <input
              ref={fileInputRef}
              id="file-upload"
              type="file"
              accept=".json,.zip,application/json,application/zip,application/x-zip-compressed"
              className="hidden"
              onChange={(event) => {
                const selectedFile = event.target.files?.[0]
                if (selectedFile) validateAndSetFile(selectedFile)
              }}
            />
          </div>

          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-zinc-500">
            <span>Not ready to export?</span>
            <button type="button" onClick={openSampleReport} className="font-medium text-red-300 underline-offset-4 hover:text-red-200 hover:underline">
              Preview a clearly labeled sample report
            </button>
          </div>
        </>
      ) : (
        <Card className="animate-scale-in border-white/10 bg-zinc-900/80 p-5 text-white shadow-2xl shadow-black/20">
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-4">
              <div className="relative shrink-0 rounded-xl bg-red-500/15 p-3">
                {isZip ? <FileArchive className="h-6 w-6 text-red-300" /> : <FileJson className="h-6 w-6 text-red-300" />}
                {!isProcessing && <div className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-zinc-900 bg-emerald-400" />}
              </div>
              <div className="min-w-0">
                <p className="truncate font-semibold">{file.name}</p>
                <p className="text-sm text-zinc-400">{(file.size / (1024 * 1024)).toFixed(2)} MB · processed locally</p>
              </div>
            </div>
            <Button type="button" variant="ghost" size="icon" onClick={removeFile} disabled={isProcessing} className="shrink-0 rounded-full text-zinc-400 hover:bg-white/10 hover:text-white">
              <X className="h-4 w-4" />
              <span className="sr-only">Remove file</span>
            </Button>
          </div>

          {isProcessing ? (
            <div className="mt-5 space-y-3" aria-live="polite">
              <div className="relative h-2 overflow-hidden rounded-full bg-white/10">
                <div className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-red-600 to-red-300 transition-[width] duration-300" style={{ width: `${progress}%` }} />
              </div>
              <div className="flex items-center justify-between gap-4 text-sm">
                <div className="flex min-w-0 items-center gap-2 text-zinc-400">
                  {progress < 100 ? <Loader2 className="h-4 w-4 shrink-0 animate-spin text-red-300" /> : <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />}
                  <span className="truncate">{progressStage}</span>
                </div>
                <span className="shrink-0 font-mono font-semibold text-red-300">{progress}%</span>
              </div>
            </div>
          ) : (
            <Button type="button" className="mt-5 h-12 w-full bg-red-500 text-base font-semibold text-white hover:bg-red-400" onClick={processFile}>
              Analyze my watch history
              <span className="ml-2 text-lg" aria-hidden="true">→</span>
            </Button>
          )}
        </Card>
      )}
    </div>
  )
}
