"use client"

import type React from "react"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle2, FileArchive, FileJson, Loader2, ShieldCheck, Upload, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { analyzeYoutubeHistory } from "@/lib/youtube-analysis"
import { saveYoutubeDashboard } from "@/lib/youtube-dashboard-storage"
import {
  YOUTUBE_IMPORT_LIMITS,
  YoutubeImportError,
  asYoutubeImportError,
  getYoutubeInputFormat,
  readYoutubeHistoryFile,
  type ImportErrorGuidance,
  type YoutubeImportErrorCode,
  type YoutubeInputFormat,
} from "@/lib/youtube-import"
import { getLandingContent, type Locale } from "@/lib/i18n"

interface SelectedFile {
  file: File
  inputFormat: YoutubeInputFormat
}

function nextFrame(): Promise<void> {
  return new Promise((resolve) => window.requestAnimationFrame(() => resolve()))
}

interface FileUploadFormProps {
  locale?: Locale
}

export default function FileUploadForm({ locale = "en" }: FileUploadFormProps) {
  const router = useRouter()
  const content = getLandingContent(locale).upload
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selection, setSelection] = useState<SelectedFile | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [progressStage, setProgressStage] = useState("")
  const [error, setError] = useState<ImportErrorGuidance | null>(null)

  const reportFailure = (code: YoutubeImportErrorCode) => {
    setError(content.errors[code])
  }

  const validateAndSetFile = (file: File) => {
    setError(null)
    let inputFormat: YoutubeInputFormat
    try {
      inputFormat = getYoutubeInputFormat(file)
    } catch (validationError) {
      const importError = asYoutubeImportError(validationError)
      setSelection(null)
      if (fileInputRef.current) fileInputRef.current.value = ""
      reportFailure(importError.code)
      return
    }

    const limit = inputFormat === "takeout_zip"
      ? YOUTUBE_IMPORT_LIMITS.archiveBytes
      : YOUTUBE_IMPORT_LIMITS.jsonBytes
    if (file.size > limit) {
      setSelection(null)
      if (fileInputRef.current) fileInputRef.current.value = ""
      reportFailure("memory_exhaustion")
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

  const processFile = async () => {
    if (!selection) return
    const { file, inputFormat } = selection
    setIsProcessing(true)
    setError(null)
    setProgress(8)
    setProgressStage(inputFormat === "takeout_zip" ? content.progress.archive : content.progress.json)
    try {
      await nextFrame()
      const parsed = await readYoutubeHistoryFile(file)
      setProgress(58)
      setProgressStage(content.progress.summaries)
      await nextFrame()

      let data
      try {
        data = analyzeYoutubeHistory(parsed.records)
      } catch (analysisError) {
        if (analysisError instanceof Error && analysisError.message === "No valid dated YouTube viewing records were found.") {
          throw new YoutubeImportError("empty_history", analysisError.message)
        }
        throw analysisError
      }

      setProgress(86)
      setProgressStage(content.progress.saving)
      await nextFrame()
      try {
        saveYoutubeDashboard(data, { inputFormat })
      } catch (storageError) {
        if (storageError instanceof DOMException && storageError.name === "QuotaExceededError") {
          throw new YoutubeImportError("memory_exhaustion", "The browser could not store the compact dashboard.")
        }
        throw new YoutubeImportError("browser_failure", "The browser could not store the compact dashboard.")
      }

      setProgress(100)
      setProgressStage(content.progress.opening)
      await nextFrame()
      router.push(locale === "en" ? "/dashboard" : `/dashboard?lang=${locale}`)
    } catch (processingError) {
      const importError = asYoutubeImportError(processingError)
      reportFailure(importError.code)
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
        <div role="alert" className="mb-4 border border-[#ff7770]/35 bg-[#d52b22]/15 p-4 text-sm text-red-100 animate-scale-in">
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
            aria-label={content.chooseAriaLabel}
            className={`group relative cursor-pointer border border-dashed p-6 text-center transition-all duration-300 sm:p-8 ${
              isDragging
                ? "scale-[1.01] border-[#ff7770] bg-[#d52b22]/15"
                : "border-white/20 bg-white/[0.035] hover:border-white/40 hover:bg-white/[0.055]"
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
              <div className={`flex h-14 w-14 items-center justify-center ring-1 ring-inset transition-all ${
                isDragging
                  ? "scale-105 bg-[#d52b22]/25 text-[#ffb0ab] ring-[#ff7770]/40"
                  : "bg-[#d52b22]/20 text-[#ff938d] ring-[#ff7770]/25"
              }`}>
                <Upload className="h-7 w-7 transition-transform group-hover:-translate-y-0.5" aria-hidden="true" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-semibold text-white">
                  {isDragging ? content.dropTitle : content.idleTitle}
                </h2>
                <p className="text-sm leading-6 text-zinc-400">
                  {content.descriptionStart} <span className="font-medium text-[#ff938d]">{content.chooseFile}</span>
                </p>
              </div>
              <div className="flex items-center gap-2 border border-white/10 bg-black/20 px-3 py-2 text-xs text-zinc-500">
                <FileArchive className="h-3.5 w-3.5 text-[#ff938d]" aria-hidden="true" />
                {content.formats}
              </div>
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <ShieldCheck className="h-3.5 w-3.5 text-[#ff938d]" aria-hidden="true" />
                {content.localNote}
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

        </>
      ) : (
        <Card className="animate-scale-in rounded-none border-white/15 bg-white/[0.04] p-5 text-white shadow-none">
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-4">
              <div className="relative shrink-0 bg-[#d52b22]/20 p-3">
                {isZip ? <FileArchive className="h-6 w-6 text-[#ff938d]" /> : <FileJson className="h-6 w-6 text-[#ff938d]" />}
                {!isProcessing && <div className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-zinc-900 bg-emerald-400" />}
              </div>
              <div className="min-w-0">
                <p className="truncate font-semibold">{file.name}</p>
                <p className="text-sm text-zinc-400">{(file.size / (1024 * 1024)).toFixed(2)} MB · {content.processedLocally}</p>
              </div>
            </div>
            <Button type="button" variant="ghost" size="icon" onClick={removeFile} disabled={isProcessing} className="shrink-0 rounded-full text-zinc-400 hover:bg-white/10 hover:text-white">
              <X className="h-4 w-4" />
              <span className="sr-only">{content.removeFile}</span>
            </Button>
          </div>

          {isProcessing ? (
            <div className="mt-5 space-y-3" aria-live="polite">
              <div className="relative h-2 overflow-hidden rounded-full bg-white/10">
                <div className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#d52b22] to-[#ff938d] transition-[width] duration-300" style={{ width: `${progress}%` }} />
              </div>
              <div className="flex items-center justify-between gap-4 text-sm">
                <div className="flex min-w-0 items-center gap-2 text-zinc-400">
                  {progress < 100 ? <Loader2 className="h-4 w-4 shrink-0 animate-spin text-[#ff938d]" /> : <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />}
                  <span className="truncate">{progressStage}</span>
                </div>
                <span className="shrink-0 font-mono font-semibold text-[#ff938d]">{progress}%</span>
              </div>
            </div>
          ) : (
            <Button type="button" className="mt-5 h-12 w-full rounded-none bg-[#d52b22] text-base font-semibold text-white hover:bg-[#ed4238]" onClick={processFile}>
              {content.analyze}
              <span className="ml-2 text-lg" aria-hidden="true">→</span>
            </Button>
          )}
        </Card>
      )}
    </div>
  )
}
