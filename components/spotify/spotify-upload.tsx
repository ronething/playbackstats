"use client"

import type React from "react"

import { useRef, useState } from "react"
import {
  AlertCircle,
  CheckCircle2,
  FileJson,
  Files,
  FolderOpen,
  Loader2,
  ShieldCheck,
  UploadCloud,
  X,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  analyzeSpotifyStreams,
  mergeSpotifyStreams,
  parseSpotifyExport,
  type SpotifyAnalysis,
  type SpotifyStream,
} from "@/lib/spotify-analysis"

interface SpotifyUploadProps {
  onComplete: (analysis: SpotifyAnalysis) => void
}

interface SelectedFiles {
  files: File[]
  ignoredCount: number
}

type DirectoryInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  directory?: string
  webkitdirectory?: string
}

const directoryInputProps: DirectoryInputProps = {
  directory: "",
  webkitdirectory: "",
}

const MAX_TOTAL_BYTES = 250 * 1024 * 1024
const STREAMING_FILE_PATTERN = /(streaming[_-]?history[_-]?(audio|music)|endsong)/i

function selectStreamingFiles(fileList: FileList | File[]): SelectedFiles {
  const allFiles = Array.from(fileList)
  const jsonFiles = allFiles.filter((file) => file.name.toLocaleLowerCase().endsWith(".json"))
  const likelyStreamingFiles = jsonFiles.filter((file) =>
    STREAMING_FILE_PATTERN.test(file.webkitRelativePath || file.name),
  )
  const candidates = likelyStreamingFiles.length > 0 ? likelyStreamingFiles : jsonFiles
  const seenFiles = new Set<string>()
  const files = candidates.filter((file) => {
    const identity = [file.webkitRelativePath || file.name, file.size, file.lastModified].join("|")
    if (seenFiles.has(identity)) return false
    seenFiles.add(identity)
    return true
  })

  return {
    files,
    ignoredCount: allFiles.length - files.length,
  }
}

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

function nextFrame(): Promise<void> {
  return new Promise((resolve) => window.requestAnimationFrame(() => resolve()))
}

export default function SpotifyUpload({ onComplete }: SpotifyUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const directoryInputRef = useRef<HTMLInputElement>(null)
  const [selection, setSelection] = useState<SelectedFiles>({ files: [], ignoredCount: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [stage, setStage] = useState("")
  const [error, setError] = useState<string | null>(null)

  const setFiles = (files: FileList | File[]) => {
    const nextSelection = selectStreamingFiles(files)
    setError(null)

    if (nextSelection.files.length === 0) {
      setSelection({ files: [], ignoredCount: 0 })
      setError("No JSON files were found. Choose your unzipped Spotify Account Data folder or its streaming-history JSON files.")
      return
    }

    const totalBytes = nextSelection.files.reduce((sum, file) => sum + file.size, 0)
    if (totalBytes > MAX_TOTAL_BYTES) {
      setSelection({ files: [], ignoredCount: 0 })
      setError("The selected streaming-history files exceed the 250 MB local processing limit.")
      return
    }

    setSelection(nextSelection)
  }

  const clearSelection = () => {
    setSelection({ files: [], ignoredCount: 0 })
    setError(null)
    setProgress(0)
    setStage("")
    if (fileInputRef.current) fileInputRef.current.value = ""
    if (directoryInputRef.current) directoryInputRef.current.value = ""
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(false)
    if (event.dataTransfer.files.length > 0) setFiles(event.dataTransfer.files)
  }

  const processFiles = async () => {
    if (selection.files.length === 0) return

    setIsProcessing(true)
    setError(null)
    setProgress(3)
    const extended: SpotifyStream[] = []
    const standard: SpotifyStream[] = []
    let recognizedFiles = 0
    let ignoredFiles = selection.ignoredCount

    try {
      for (let index = 0; index < selection.files.length; index += 1) {
        const file = selection.files[index]
        setStage(`Reading ${file.name}`)
        setProgress(Math.round(5 + (index / selection.files.length) * 72))
        await nextFrame()

        try {
          const data: unknown = JSON.parse(await file.text())
          const parsed = parseSpotifyExport(data)
          if (parsed.extended.length + parsed.standard.length === 0) {
            ignoredFiles += 1
          } else {
            recognizedFiles += 1
            extended.push(...parsed.extended)
            standard.push(...parsed.standard)
          }
        } catch {
          ignoredFiles += 1
        }
      }

      if (extended.length + standard.length === 0) {
        throw new Error(
          "No music streaming history was found. Spotify Technical Log Information is not a listening-history export; choose Spotify Account Data instead.",
        )
      }

      setProgress(82)
      setStage("Removing overlap and duplicate records")
      await nextFrame()
      const merged = mergeSpotifyStreams(extended, standard, { recognizedFiles, ignoredFiles })

      setProgress(91)
      setStage("Building your listening story")
      await nextFrame()
      const analysis = analyzeSpotifyStreams(merged)

      setProgress(100)
      setStage("Your dashboard is ready")
      await nextFrame()
      onComplete(analysis)
    } catch (processingError) {
      const message = processingError instanceof Error
        ? processingError.message
        : "We could not analyze those files. Check that they are unmodified Spotify JSON exports."
      setError(message)
    } finally {
      setIsProcessing(false)
    }
  }

  const totalBytes = selection.files.reduce((sum, file) => sum + file.size, 0)

  return (
    <div className="space-y-4">
      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <p>{error}</p>
        </div>
      )}

      {selection.files.length === 0 ? (
        <div
          className={`rounded-3xl border border-dashed p-6 transition-all sm:p-8 ${
            isDragging
              ? "scale-[1.01] border-[#1DB954] bg-[#1DB954]/10"
              : "border-white/15 bg-white/[0.04] hover:border-white/25 hover:bg-white/[0.06]"
          }`}
          onDragEnter={(event) => {
            event.preventDefault()
            setIsDragging(true)
          }}
          onDragOver={(event) => event.preventDefault()}
          onDragLeave={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node)) setIsDragging(false)
          }}
          onDrop={handleDrop}
        >
          <div className="mx-auto flex max-w-md flex-col items-center text-center">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1DB954]/15 text-[#4ade80] ring-1 ring-inset ring-[#1DB954]/25">
              <UploadCloud className="h-8 w-8" aria-hidden="true" />
            </div>
            <h2 className="text-xl font-semibold text-white">Bring your Spotify history</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-400">
              Drop one or more JSON files here, or choose the complete unzipped export folder.
            </p>

            <div className="mt-6 flex w-full flex-col gap-3 sm:flex-row">
              <Button
                type="button"
                className="h-11 flex-1 bg-[#1DB954] font-semibold text-zinc-950 hover:bg-[#1ed760]"
                onClick={() => fileInputRef.current?.click()}
              >
                <Files className="mr-2 h-4 w-4" aria-hidden="true" />
                Choose JSON files
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-11 flex-1 border-white/15 bg-white/[0.04] text-white hover:bg-white/10 hover:text-white"
                onClick={() => directoryInputRef.current?.click()}
              >
                <FolderOpen className="mr-2 h-4 w-4" aria-hidden="true" />
                Choose export folder
              </Button>
            </div>

            <input
              ref={fileInputRef}
              className="hidden"
              type="file"
              accept=".json,application/json"
              multiple
              onChange={(event) => event.target.files && setFiles(event.target.files)}
            />
            <input
              ref={directoryInputRef}
              className="hidden"
              type="file"
              multiple
              {...directoryInputProps}
              onChange={(event) => event.target.files && setFiles(event.target.files)}
            />

            <div className="mt-5 flex items-center gap-2 text-xs text-zinc-500">
              <ShieldCheck className="h-3.5 w-3.5 text-[#4ade80]" aria-hidden="true" />
              Files stay in this browser tab and are never uploaded
            </div>
          </div>
        </div>
      ) : (
        <Card className="border-white/10 bg-zinc-900/80 text-white shadow-2xl shadow-black/20">
          <CardContent className="p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex min-w-0 items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#1DB954]/15 text-[#4ade80]">
                  <FileJson className="h-5 w-5" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold">
                    {selection.files.length} streaming {selection.files.length === 1 ? "file" : "files"}
                  </p>
                  <p className="mt-1 text-sm text-zinc-400">
                    {formatBytes(totalBytes)} selected
                    {selection.ignoredCount > 0 ? ` · ${selection.ignoredCount} other or duplicate files skipped` : ""}
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={isProcessing}
                className="shrink-0 rounded-full text-zinc-400 hover:bg-white/10 hover:text-white"
                onClick={clearSelection}
              >
                <X className="h-4 w-4" aria-hidden="true" />
                <span className="sr-only">Clear selected files</span>
              </Button>
            </div>

            <div className="mt-4 max-h-32 space-y-1 overflow-auto rounded-xl border border-white/10 bg-black/20 p-3 text-xs text-zinc-400">
              {selection.files.slice(0, 8).map((file) => (
                <div key={`${file.webkitRelativePath}-${file.name}-${file.size}`} className="flex items-center justify-between gap-4">
                  <span className="truncate">{file.webkitRelativePath || file.name}</span>
                  <span className="shrink-0 font-mono text-zinc-500">{formatBytes(file.size)}</span>
                </div>
              ))}
              {selection.files.length > 8 && <p>+ {selection.files.length - 8} more files</p>}
            </div>

            {isProcessing ? (
              <div className="mt-5 space-y-3" aria-live="polite">
                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#1DB954] to-emerald-300 transition-[width] duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex items-center justify-between gap-4 text-sm">
                  <span className="flex min-w-0 items-center gap-2 text-zinc-400">
                    {progress === 100 ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-[#4ade80]" />
                    ) : (
                      <Loader2 className="h-4 w-4 shrink-0 animate-spin text-[#4ade80]" />
                    )}
                    <span className="truncate">{stage}</span>
                  </span>
                  <span className="shrink-0 font-mono text-[#4ade80]">{progress}%</span>
                </div>
              </div>
            ) : (
              <Button
                type="button"
                className="mt-5 h-12 w-full bg-[#1DB954] text-base font-semibold text-zinc-950 hover:bg-[#1ed760]"
                onClick={processFiles}
              >
                Analyze my listening history
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      <p className="text-center text-xs leading-5 text-zinc-500">
        Best results: <strong className="font-medium text-zinc-400">Streaming_History_Audio_*.json</strong> from
        Extended Streaming History. Standard <strong className="font-medium text-zinc-400">StreamingHistory_music_*.json</strong> files also work.
      </p>
    </div>
  )
}
