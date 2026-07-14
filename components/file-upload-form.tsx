"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Upload, X, FileJson, CheckCircle2, Loader2, ShieldCheck } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

// Define interfaces for processed data
interface ProcessedVideoData {
  id: string
  title: string
  channel?: string
  time?: string
}

interface AggregatedData {
  dailyViews: { date: string; count: number }[]
  hourlyViews: { hour: number; count: number }[]
  topVideos: { id: string; title: string; channel?: string; count: number }[]
  channelCounts: { name: string; count: number }[]
  stats: {
    totalVideos: number
    oldestDate: string
    newestDate: string
    uniqueChannels: number
    daysDifference: number
  }
}

export default function FileUploadForm() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [progressStage, setProgressStage] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0]
      validateAndSetFile(droppedFile)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0])
    }
  }

  const validateAndSetFile = (file: File) => {
    setError(null)

    if (file.type !== "application/json" && !file.name.endsWith(".json")) {
      setError("Please upload a JSON file")
      return
    }

    if (file.size > 100 * 1024 * 1024) {
      // 100MB limit
      setError("File size exceeds 100MB limit")
      return
    }

    setFile(file)
  }

  const removeFile = () => {
    setFile(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // Process the raw data into aggregated statistics to reduce storage size
  const processData = (rawData: any[]): AggregatedData => {
    // ===== Helper Functions =====
    
    function calculateStreak(dailyViews: { date: string; count: number }[]): { longest: number; current: number } {
      if (dailyViews.length === 0) return { longest: 0, current: 0 }
      
      let longestStreak = 1
      let currentStreak = 1
      let maxStreak = 1
      
      const today = new Date().toISOString().split('T')[0]
      let isCurrentActive = false
      
      for (let i = 1; i < dailyViews.length; i++) {
        const prevDate = new Date(dailyViews[i - 1].date)
        const currDate = new Date(dailyViews[i].date)
        const diffDays = Math.round((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24))
        
        if (diffDays === 1) {
          currentStreak++
          maxStreak = Math.max(maxStreak, currentStreak)
        } else {
          currentStreak = 1
        }
        
        // Check if it includes today or recent
        if (dailyViews[i].date === today || i === dailyViews.length - 1) {
          const daysSinceLastView = Math.round((new Date().getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24))
          if (daysSinceLastView <= 1) {
            isCurrentActive = true
            longestStreak = currentStreak
          }
        }
      }
      
      return {
        longest: maxStreak,
        current: isCurrentActive ? longestStreak : 0
      }
    }
    
    function calculatePersonalityScores(hourlyViews: { hour: number; count: number }[]): {
      nightOwl: number
      earlyBird: number
      midday: number
    } {
      const totalViews = hourlyViews.reduce((sum, h) => sum + h.count, 0)
      if (totalViews === 0) return { nightOwl: 0, earlyBird: 0, midday: 0 }
      
      // Night owl: 22:00-6:00
      const nightViews = hourlyViews
        .filter(h => h.hour >= 22 || h.hour < 6)
        .reduce((sum, h) => sum + h.count, 0)
      
      // Early bird: 5:00-9:00
      const morningViews = hourlyViews
        .filter(h => h.hour >= 5 && h.hour < 9)
        .reduce((sum, h) => sum + h.count, 0)
      
      // Midday: 12:00-14:00
      const middayViews = hourlyViews
        .filter(h => h.hour >= 12 && h.hour < 14)
        .reduce((sum, h) => sum + h.count, 0)
      
      return {
        nightOwl: Math.round((nightViews / totalViews) * 100),
        earlyBird: Math.round((morningViews / totalViews) * 100),
        midday: Math.round((middayViews / totalViews) * 100)
      }
    }
    
    function calculateFavoriteDay(processedVideos: ProcessedVideoData[]): {
      day: string
      percentage: number
    } {
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      const dayCounts = Array(7).fill(0)
      
      processedVideos.forEach(video => {
        if (video.time) {
          const date = new Date(video.time)
          if (!isNaN(date.getTime())) {
            dayCounts[date.getDay()]++
          }
        }
      })
      
      const maxCount = Math.max(...dayCounts)
      const maxIndex = dayCounts.indexOf(maxCount)
      const totalCount = dayCounts.reduce((a, b) => a + b, 0)
      
      return {
        day: dayNames[maxIndex],
        percentage: totalCount > 0 ? Math.round((maxCount / totalCount) * 100) : 0
      }
    }
    
    function calculateWeekdayWeekendStats(processedVideos: ProcessedVideoData[]): {
      weekdayAvg: number
      weekendAvg: number
      weekendRatio: number
    } {
      const weekdayDays = new Set<string>()
      const weekendDays = new Set<string>()
      let weekdayCount = 0
      let weekendCount = 0
      
      processedVideos.forEach(video => {
        if (video.time) {
          const date = new Date(video.time)
          if (!isNaN(date.getTime())) {
            const dayOfWeek = date.getDay()
            const dateStr = date.toISOString().split('T')[0]
            
            if (dayOfWeek === 0 || dayOfWeek === 6) {
              weekendDays.add(dateStr)
              weekendCount++
            } else {
              weekdayDays.add(dateStr)
              weekdayCount++
            }
          }
        }
      })
      
      const weekdayAvg = weekdayDays.size > 0 ? weekdayCount / weekdayDays.size : 0
      const weekendAvg = weekendDays.size > 0 ? weekendCount / weekendDays.size : 0
      const weekendRatio = weekdayAvg > 0 ? weekendAvg / weekdayAvg : 0
      
      return {
        weekdayAvg: Math.round(weekdayAvg * 10) / 10,
        weekendAvg: Math.round(weekendAvg * 10) / 10,
        weekendRatio: Math.round(weekendRatio * 100) / 100
      }
    }
    
    function calculateChannelDiversity(channelCounts: { name: string; count: number }[]): number {
      const totalViews = channelCounts.reduce((sum, c) => sum + c.count, 0)
      if (totalViews === 0) return 0
      
      let entropy = 0
      channelCounts.forEach(channel => {
        const p = channel.count / totalViews
        if (p > 0) {
          entropy -= p * Math.log2(p)
        }
      })
      
      // Normalize to 0-1, assuming max entropy is log2(100) ≈ 6.64
      const maxEntropy = 6.64
      return Math.round(Math.min(1, entropy / maxEntropy) * 100) / 100
    }
    
    // ===== Original Data Processing =====
    
    // Extract only the necessary fields from each video
    const processedVideos: ProcessedVideoData[] = rawData
      .filter((item) => item && typeof item === "object" && (item.title || item.titleUrl))
      .map((item) => {
        const channel = item.subtitles && item.subtitles.length > 0 ? item.subtitles[0].name : undefined
        return {
          id: item.titleUrl || `video-${Math.random().toString(36).substring(2, 15)}`,
          title: item.title || "Unknown Video",
          channel,
          time: item.time,
        }
      })

    // Calculate daily views
    const dateMap = new Map<string, number>()
    const validDates: Date[] = []

    processedVideos.forEach((video) => {
      if (video.time) {
        try {
          const date = new Date(video.time)
          if (!isNaN(date.getTime())) {
            validDates.push(date)
            const dateString = date.toISOString().split("T")[0] // YYYY-MM-DD format
            dateMap.set(dateString, (dateMap.get(dateString) || 0) + 1)
          }
        } catch {
          // Skip invalid dates
        }
      }
    })

    // Calculate hourly views
    const hourCounts = Array(24)
      .fill(0)
      .map((_, i) => ({ hour: i, count: 0 }))

    processedVideos.forEach((video) => {
      if (video.time) {
        try {
          const date = new Date(video.time)
          if (!isNaN(date.getTime())) {
            const hour = date.getHours()
            hourCounts[hour].count += 1
          }
        } catch {
          // Skip invalid dates
        }
      }
    })

    // Calculate top videos
    const videoCounts = new Map<string, { id: string; title: string; channel?: string; count: number }>()

    processedVideos.forEach((video) => {
      if (videoCounts.has(video.id)) {
        videoCounts.get(video.id)!.count += 1
      } else {
        videoCounts.set(video.id, {
          id: video.id,
          title: video.title,
          channel: video.channel,
          count: 1,
        })
      }
    })

    const topVideos = Array.from(videoCounts.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    // Calculate channel distribution
    const channelMap = new Map<string, number>()

    processedVideos.forEach((video) => {
      if (video.channel) {
        channelMap.set(video.channel, (channelMap.get(video.channel) || 0) + 1)
      }
    })

    const channelCounts = Array.from(channelMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    // Calculate overall stats
    let oldestDate = new Date()
    let newestDate = new Date()
    let daysDifference = 1

    if (validDates.length > 0) {
      oldestDate = new Date(Math.min(...validDates.map((date) => date.getTime())))
      newestDate = new Date(Math.max(...validDates.map((date) => date.getTime())))
      daysDifference = Math.max(1, Math.ceil((newestDate.getTime() - oldestDate.getTime()) / (1000 * 60 * 60 * 24)))
    }

    // ============ Advanced Statistics Calculation ============

    // 1. Calculate streak
    const streakInfo = calculateStreak(
      Array.from(dateMap.entries())
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date))
    )

    // 2. Calculate personality scores
    const personalityScores = calculatePersonalityScores(hourCounts)

    // 3. Calculate favorite day
    const favoriteDay = calculateFavoriteDay(processedVideos)

    // 4. Calculate weekday vs weekend stats
    const weekStats = calculateWeekdayWeekendStats(processedVideos)

    // 5. Calculate channel diversity
    const channelDiversityScore = calculateChannelDiversity(
      Array.from(channelMap.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
    )

    const timeBounds = processedVideos.reduce(
      (acc, video) => {
        if (!video.time) return acc
        const timestamp = new Date(video.time).getTime()
        if (Number.isNaN(timestamp)) return acc
        if (!acc.first || timestamp < acc.first.timestamp) {
          acc.first = { video, timestamp }
        }
        return acc
      },
      {
        first: null,
      } as {
        first: { video: ProcessedVideoData; timestamp: number } | null
      }
    )

    const firstVideoSource = timeBounds.first?.video ?? processedVideos[processedVideos.length - 1]

    // 6. Find peak hour
    const peakHourData = hourCounts.reduce((max, curr) => 
      curr.count > max.count ? curr : max
    )

    // 7. Find max daily views
    const maxDailyEntry = Array.from(dateMap.entries()).reduce((max, curr) => 
      curr[1] > max[1] ? curr : max, ['', 0]
    )

    // 8. Time period statistics
    const morningCount = hourCounts
      .filter(h => h.hour >= 5 && h.hour < 12)
      .reduce((s, h) => s + h.count, 0)
    const afternoonCount = hourCounts
      .filter(h => h.hour >= 12 && h.hour < 18)
      .reduce((s, h) => s + h.count, 0)
    const eveningCount = hourCounts
      .filter(h => h.hour >= 18 && h.hour < 22)
      .reduce((s, h) => s + h.count, 0)
    const nightCount = hourCounts
      .filter(h => h.hour >= 22 || h.hour < 5)
      .reduce((s, h) => s + h.count, 0)

    // 9. Build advanced stats object
    const advancedStats = {
      // Time personality
      peakHour: peakHourData.hour,
      nightOwlScore: personalityScores.nightOwl,
      earlyBirdScore: personalityScores.earlyBird,
      middayScore: personalityScores.midday,
      
      // Viewing intensity
      dailyAverage: Math.round((processedVideos.length / daysDifference) * 10) / 10,
      weekendWarrior: weekStats.weekendRatio > 1.5,
      
      // Streak statistics
      longestStreak: streakInfo.longest,
      currentStreak: streakInfo.current,
      
      // Extreme statistics
      maxDailyViews: maxDailyEntry[1],
      maxDailyDate: maxDailyEntry[0],
      
      // Time preference
      favoriteDay: favoriteDay.day,
      favoriteDayPercentage: favoriteDay.percentage,
      
      // Time travel
      firstVideo: {
        title: firstVideoSource?.title || 'Unknown',
        channel: firstVideoSource?.channel,
        date: firstVideoSource?.time || '',
        url: firstVideoSource?.id,
      },
      
      // Channel loyalty
      topChannelPercentage: channelCounts[0] 
        ? Math.round((channelCounts[0].count / processedVideos.length) * 100) 
        : 0,
      channelDiversity: channelDiversityScore,
      loyalChannels: channelCounts
        .filter(c => (c.count / processedVideos.length) > 0.1)
        .map(c => c.name)
        .slice(0, 5),
      
      // Weekday vs weekend
      weekdayAvg: weekStats.weekdayAvg,
      weekendAvg: weekStats.weekendAvg,
      weekendRatio: weekStats.weekendRatio,
      
      // Time period distribution
      morningCount,
      afternoonCount,
      eveningCount,
      nightCount,
    }

    // 10. Store to sessionStorage
    try {
      sessionStorage.setItem('youtubeHistoryAdvancedStats', JSON.stringify(advancedStats))
    } catch (e) {
      console.error('Failed to save advanced stats:', e)
    }

    // Return aggregated data
    return {
      dailyViews: Array.from(dateMap.entries())
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date)),
      hourlyViews: hourCounts,
      topVideos,
      channelCounts,
      stats: {
        totalVideos: processedVideos.length,
        oldestDate: oldestDate.toISOString(),
        newestDate: newestDate.toISOString(),
        uniqueChannels: channelMap.size,
        daysDifference,
      },
    }
  }

  const processFile = async () => {
    if (!file) return

    setIsProcessing(true)
    setProgress(0)
    setProgressStage("Reading file...")

    try {
      const reader = new FileReader()

      reader.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 40)
          setProgress(percentComplete)
        }
      }

      reader.onload = async (event) => {
        try {
          const result = event.target?.result as string
          setProgress(45)
          setProgressStage("Parsing JSON data...")

          // Parse the JSON data
          const data = JSON.parse(result)
          setProgress(50)
          setProgressStage("Analyzing your watch history...")

          // Determine the data format and extract the array of videos
          let videoArray: any[] = []

          if (Array.isArray(data)) {
            videoArray = data
          } else if (typeof data === "object") {
            if (data.items && Array.isArray(data.items)) {
              videoArray = data.items
            } else if (data.watchHistory && Array.isArray(data.watchHistory)) {
              videoArray = data.watchHistory
            } else if (data.videos && Array.isArray(data.videos)) {
              videoArray = data.videos
            }
          }

          if (videoArray.length === 0) {
            throw new Error("Could not find video data in the file")
          }

          setProgress(60)
          setProgressStage("Crunching the numbers...")

          // Process the data to reduce its size
          const processedData = processData(videoArray)
          setProgress(80)
          setProgressStage("Preparing your dashboard...")

          // Store the processed data in sessionStorage (much smaller than the original)
          try {
            sessionStorage.setItem("youtubeHistoryStats", JSON.stringify(processedData.stats))
            sessionStorage.setItem("youtubeHistoryDailyViews", JSON.stringify(processedData.dailyViews))
            sessionStorage.setItem("youtubeHistoryHourlyViews", JSON.stringify(processedData.hourlyViews))
            sessionStorage.setItem("youtubeHistoryTopVideos", JSON.stringify(processedData.topVideos))
            sessionStorage.setItem("youtubeHistoryChannels", JSON.stringify(processedData.channelCounts))
          } catch (storageError) {
            console.error("Storage error:", storageError)
            throw new Error("Failed to store processed data. The file may be too large even after processing.")
          }

          setProgress(95)
          setProgressStage("Opening dashboard...")

          setTimeout(() => {
            router.push("/dashboard")
          }, 0)
        } catch (error: any) {
          console.error("Processing error:", error)
          setError(
            error.message ||
              "Failed to process file. Please make sure it's a valid YouTube watch history JSON file."
          )
          setIsProcessing(false)
        }
      }

      reader.onerror = () => {
        setError("Error reading file")
        setIsProcessing(false)
      }

      reader.readAsText(file)
    } catch {
      setError("An unexpected error occurred")
      setIsProcessing(false)
    }
  }

  return (
    <div className="w-full">
      {error && (
        <div className="mb-4 flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200 animate-scale-in">
          <div className="h-2 w-2 rounded-full bg-red-400" />
          {error}
        </div>
      )}

      {!file ? (
        <div
          className={`group relative cursor-pointer rounded-3xl border border-dashed p-7 text-center transition-all duration-300 sm:p-8
            ${isDragging 
              ? "scale-[1.01] border-red-400 bg-red-500/10"
              : "border-white/15 bg-white/[0.04] hover:border-white/25 hover:bg-white/[0.06]"
            }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className={`relative flex h-16 w-16 items-center justify-center rounded-2xl ring-1 ring-inset transition-all duration-300
              ${isDragging 
                ? "scale-105 bg-red-500/20 text-red-200 ring-red-400/35"
                : "bg-red-500/15 text-red-300 ring-red-500/25"
              }`}>
              <Upload className="h-8 w-8 transition-transform duration-300 group-hover:-translate-y-0.5" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-white">
                {isDragging ? "Drop it here" : "Bring your YouTube history"}
              </h2>
              <p className="text-sm leading-6 text-zinc-400">
                Drop the JSON file here, or <span className="font-medium text-red-300 group-hover:text-red-200">choose a file</span>
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-black/20 px-3 py-2 text-xs text-zinc-500">
              <FileJson className="h-3.5 w-3.5 text-red-300" />
              watch-history.json · up to 100 MB
            </div>

            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <ShieldCheck className="h-3.5 w-3.5 text-red-300" aria-hidden="true" />
              The file stays in this browser tab
            </div>
          </div>
          
          <input
            ref={fileInputRef}
            id="file-upload"
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      ) : (
        <Card className="animate-scale-in border-white/10 bg-zinc-900/80 p-5 text-white shadow-2xl shadow-black/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative rounded-xl bg-red-500/15 p-3">
                <FileJson className="h-6 w-6 text-red-300" />
                {!isProcessing && (
                  <div className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-zinc-900 bg-emerald-400" />
                )}
              </div>
              <div>
                <p className="font-semibold">{file.name}</p>
                <p className="text-sm text-zinc-400">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={removeFile} 
              disabled={isProcessing}
              className="rounded-full text-zinc-400 hover:bg-white/10 hover:text-white"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Remove file</span>
            </Button>
          </div>

          {isProcessing && (
            <div className="mt-5 space-y-3 animate-fade-in">
              <div className="relative h-2 overflow-hidden rounded-full bg-white/10">
                <div 
                  className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-red-600 to-red-300 transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-zinc-400">
                  {progress < 100 ? (
                    <Loader2 className="h-4 w-4 animate-spin text-red-300" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  )}
                  {progressStage}
                </div>
                <span className="font-mono font-semibold text-red-300">{progress}%</span>
              </div>
            </div>
          )}

          {!isProcessing && (
            <Button 
              className="mt-5 h-12 w-full bg-red-500 text-base font-semibold text-white transition-all duration-200 hover:bg-red-400 active:scale-[0.99]"
              onClick={processFile}
            >
              <span className="flex items-center gap-2">
                Analyze My Watch History
                <span className="text-lg">→</span>
              </span>
            </Button>
          )}
        </Card>
      )}
    </div>
  )
}
