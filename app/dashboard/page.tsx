"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Calendar, Clock, Film, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import DailyViewsChart from "@/components/dashboard/daily-views-chart"
import TopVideosChart from "@/components/dashboard/top-videos-chart"
import ViewingTimeChart from "@/components/dashboard/viewing-time-chart"
import ChannelDistributionChart from "@/components/dashboard/channel-distribution-chart"
import StatsOverview from "@/components/dashboard/stats-overview"
import SocialShare from "@/components/dashboard/social-share"
import DonationBanner from "@/components/dashboard/donation-banner"
import PersonalityInsights from "@/components/dashboard/personality-insights"
import FunFacts from "@/components/dashboard/fun-facts"
import Achievements from "@/components/dashboard/achievements"
import PlaybackFooter from "@/components/playback-footer"
import PlaybackHeader from "@/components/playback-header"

// Define interfaces for the processed data
interface Stats {
  totalVideos: number
  oldestDate: string
  newestDate: string
  uniqueChannels: number
  daysDifference: number
}

interface DailyView {
  date: string
  count: number
}

interface HourlyView {
  hour: number
  count: number
}

interface TopVideo {
  id: string
  title: string
  channel?: string
  count: number
}

interface ChannelCount {
  name: string
  count: number
}

export default function DashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState<Stats | null>(null)
  const [dailyViews, setDailyViews] = useState<DailyView[]>([])
  const [hourlyViews, setHourlyViews] = useState<HourlyView[]>([])
  const [topVideos, setTopVideos] = useState<TopVideo[]>([])
  const [channelCounts, setChannelCounts] = useState<ChannelCount[]>([])
  const [advancedStats, setAdvancedStats] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      // Load the processed data from sessionStorage after the first paint.
      try {
        const statsJson = sessionStorage.getItem("youtubeHistoryStats")
        const dailyViewsJson = sessionStorage.getItem("youtubeHistoryDailyViews")
        const hourlyViewsJson = sessionStorage.getItem("youtubeHistoryHourlyViews")
        const topVideosJson = sessionStorage.getItem("youtubeHistoryTopVideos")
        const channelsJson = sessionStorage.getItem("youtubeHistoryChannels")
        const advancedStatsJson = sessionStorage.getItem("youtubeHistoryAdvancedStats")

        if (!statsJson) {
          setError("No data found. Please upload your YouTube history file.")
          setIsLoading(false)
          return
        }

        setStats(JSON.parse(statsJson))
        setDailyViews(dailyViewsJson ? JSON.parse(dailyViewsJson) : [])
        setHourlyViews(hourlyViewsJson ? JSON.parse(hourlyViewsJson) : [])
        setTopVideos(topVideosJson ? JSON.parse(topVideosJson) : [])
        setChannelCounts(channelsJson ? JSON.parse(channelsJson) : [])
        setAdvancedStats(advancedStatsJson ? JSON.parse(advancedStatsJson) : null)
        setIsLoading(false)
      } catch (err) {
        console.error("Error loading data:", err)
        setError("Failed to load the processed data. Please try uploading your file again.")
        setIsLoading(false)
      }
    })

    return () => window.cancelAnimationFrame(frameId)
  }, [])

  const handleBackToHome = () => {
    router.push("/")
  }

  if (isLoading) {
    return (
      <div className="dark flex min-h-screen flex-col bg-zinc-950 text-white">
        <PlaybackHeader activePlatform="youtube" />
        <main id="main-content" className="flex flex-1 items-center justify-center px-4 py-16">
          <div className="w-full max-w-md space-y-6 animate-fade-in" aria-live="polite">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 animate-pulse rounded-xl bg-red-500/15" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-40 animate-pulse rounded-full bg-white/10" />
                <div className="h-2 w-56 animate-pulse rounded-full bg-white/[0.06]" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="h-28 animate-pulse rounded-2xl bg-white/[0.05]" />
              <div className="h-28 animate-pulse rounded-2xl bg-white/[0.05]" />
            </div>
            <div className="h-48 animate-pulse rounded-3xl bg-white/[0.04]" />
            <div className="text-center">
              <p className="text-sm font-medium text-white">Preparing your viewing insights</p>
              <p className="mt-1 text-xs text-zinc-500">Loading the compact dashboard data from this session</p>
            </div>
          </div>
        </main>
        <PlaybackFooter />
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="dark flex min-h-screen flex-col bg-zinc-950 text-white">
        <PlaybackHeader activePlatform="youtube" />
        <main id="main-content" className="flex flex-1 items-center justify-center px-4 py-16">
          <div className="mx-auto max-w-md rounded-3xl border border-white/10 bg-white/[0.035] p-8 text-center animate-scale-in">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 text-red-300">
              <Film className="h-7 w-7" aria-hidden="true" />
            </div>
            <h1 className="mb-3 text-2xl font-bold">No dashboard data found</h1>
            <p className="mb-6 text-sm leading-6 text-zinc-400">{error}</p>
            <Button
              onClick={handleBackToHome}
              className="bg-red-500 text-white hover:bg-red-400"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Choose a history file
            </Button>
          </div>
        </main>
        <PlaybackFooter />
      </div>
    )
  }

  return (
    <div className="dark flex min-h-screen flex-col bg-zinc-950 text-white">
      <PlaybackHeader activePlatform="youtube" />

      <main id="main-content" className="relative flex-1 overflow-hidden px-4 py-10 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute left-1/2 top-[-20rem] h-[40rem] w-[60rem] -translate-x-1/2 rounded-full bg-red-500/[0.07] blur-[140px]" />
        <div className="relative mx-auto max-w-7xl space-y-8">
          <section className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-300">YouTube history</p>
              <h1 className="mt-3 text-3xl font-bold tracking-[-0.03em] text-white sm:text-4xl">Your viewing dashboard</h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-400">Patterns, favorites, and viewing rhythms built from your local export.</p>
            </div>
            <div className="flex items-center gap-2 self-start rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm sm:self-auto">
              <Film className="h-4 w-4 text-red-300" aria-hidden="true" />
              <span className="font-mono font-medium tabular-nums text-white">{stats.totalVideos.toLocaleString()}</span>
              <span className="text-zinc-500">videos analyzed</span>
            </div>
          </section>

          {/* Donation Banner */}
          <section className="animate-fade-in">
            <DonationBanner />
          </section>

          {/* Stats Overview */}
          <section className="animate-fade-in stagger-1">
            <StatsOverview stats={stats} />
          </section>

          {/* Personality Insights */}
          {advancedStats && (
            <section className="animate-fade-in stagger-2">
              <PersonalityInsights advancedStats={advancedStats} />
            </section>
          )}

          {/* Fun Facts */}
          {advancedStats && (
            <section className="animate-fade-in stagger-3">
              <FunFacts 
                advancedStats={advancedStats} 
                topChannelName={channelCounts[0]?.name}
              />
            </section>
          )}

          {/* Achievements */}
          {advancedStats && (
            <section className="animate-fade-in stagger-4">
              <Achievements 
                stats={stats}
                advancedStats={advancedStats}
              />
            </section>
          )}

          {/* Charts */}
          <section className="animate-fade-in stagger-5">
            <Tabs defaultValue="daily-views" className="space-y-6">
              <TabsList className="grid h-auto w-full grid-cols-4 rounded-xl border border-white/[0.06] bg-white/[0.04] p-1">
                <TabsTrigger 
                  value="daily-views" 
                  className="flex items-center gap-2 rounded-lg py-3 transition-all data-[state=active]:bg-white/[0.08] data-[state=active]:text-white"
                >
                  <Calendar className="h-4 w-4" />
                  <span className="hidden sm:inline">Daily Views</span>
                  <span className="sm:hidden">Daily</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="top-videos" 
                  className="flex items-center gap-2 rounded-lg py-3 transition-all data-[state=active]:bg-white/[0.08] data-[state=active]:text-white"
                >
                  <Film className="h-4 w-4" />
                  <span className="hidden sm:inline">Top Videos</span>
                  <span className="sm:hidden">Videos</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="viewing-time" 
                  className="flex items-center gap-2 rounded-lg py-3 transition-all data-[state=active]:bg-white/[0.08] data-[state=active]:text-white"
                >
                  <Clock className="h-4 w-4" />
                  <span className="hidden sm:inline">Viewing Time</span>
                  <span className="sm:hidden">Time</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="channels" 
                  className="flex items-center gap-2 rounded-lg py-3 transition-all data-[state=active]:bg-white/[0.08] data-[state=active]:text-white"
                >
                  <Users className="h-4 w-4" />
                  <span className="hidden sm:inline">Channels</span>
                  <span className="sm:hidden">Channels</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="daily-views" className="mt-6 animate-fade-in">
                <Card className="border-white/[0.08] bg-white/[0.035] shadow-2xl shadow-black/20 backdrop-blur">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl flex items-center gap-2">
                          <span className="h-6 w-1.5 rounded-full bg-red-400" />
                          Daily Viewing Activity
                        </CardTitle>
                        <CardDescription className="mt-1">
                          Track how your viewing habits change over time
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <DailyViewsChart dailyViews={dailyViews} />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="top-videos" className="mt-6 animate-fade-in">
                <Card className="border-white/[0.08] bg-white/[0.035] shadow-2xl shadow-black/20 backdrop-blur">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl flex items-center gap-2">
                          <span className="h-6 w-1.5 rounded-full bg-red-400" />
                          Most Watched Videos
                        </CardTitle>
                        <CardDescription className="mt-1">
                          Your top 10 most frequently watched videos
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <TopVideosChart topVideos={topVideos} />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="viewing-time" className="mt-6 animate-fade-in">
                <Card className="border-white/[0.08] bg-white/[0.035] shadow-2xl shadow-black/20 backdrop-blur">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl flex items-center gap-2">
                          <span className="h-6 w-1.5 rounded-full bg-red-400" />
                          Viewing Time Distribution
                        </CardTitle>
                        <CardDescription className="mt-1">
                          Discover when you watch YouTube throughout the day
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <ViewingTimeChart hourlyViews={hourlyViews} />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="channels" className="mt-6 animate-fade-in">
                <Card className="border-white/[0.08] bg-white/[0.035] shadow-2xl shadow-black/20 backdrop-blur">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl flex items-center gap-2">
                          <span className="h-6 w-1.5 rounded-full bg-red-400" />
                          Channel Distribution
                        </CardTitle>
                        <CardDescription className="mt-1">
                          See which content creators you watch the most
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <ChannelDistributionChart channelCounts={channelCounts} />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </section>

          {/* Social Share */}
          <section className="animate-fade-in stagger-6">
            <Card className="border-white/[0.08] bg-white/[0.035] shadow-2xl shadow-black/20 backdrop-blur">
              <CardContent className="pt-6">
                <SocialShare />
              </CardContent>
            </Card>
          </section>
        </div>
      </main>

      <PlaybackFooter />
    </div>
  )
}
