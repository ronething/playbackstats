"use client"

import { useState, useEffect } from "react"
import { Coffee, X, Heart, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { trackEvent } from "@/lib/analytics"

const KOFI_URL = "https://ko-fi.com/ashing"
const BANNER_DISMISSED_KEY = "yt-history-donation-banner-dismissed"
const DISMISS_DURATION = 24 * 60 * 60 * 1000

export default function DonationBanner() {
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    const dismissedAt = localStorage.getItem(BANNER_DISMISSED_KEY)
    if (dismissedAt) {
      const timeSinceDismissed = Date.now() - parseInt(dismissedAt)
      if (timeSinceDismissed < DISMISS_DURATION) {
        return
      }
    }

    const timer = setTimeout(() => {
      setIsVisible(true)
      setTimeout(() => setIsAnimating(true), 100)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  const handleDismiss = () => {
    setIsAnimating(false)
    setTimeout(() => {
      setIsVisible(false)
      localStorage.setItem(BANNER_DISMISSED_KEY, Date.now().toString())
    }, 300)
  }

  const handleSupport = () => {
    trackEvent("donation_clicked", {
      platform: "youtube",
      source_page: "youtube_dashboard",
    })
    window.open(KOFI_URL, '_blank', 'noopener,noreferrer')
    handleDismiss()
  }

  if (!isVisible) return null

  return (
    <div 
      className={`
        relative overflow-hidden rounded-2xl border border-orange-500/20 shadow-xl
        bg-gradient-to-r from-orange-50 via-red-50 to-pink-50 
        dark:from-orange-950/30 dark:via-red-950/30 dark:to-pink-950/30
        transition-all duration-300 ease-out
        ${isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}
      `}
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-orange-500/10 to-pink-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-red-500/10 to-orange-500/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
      
      <div className="relative flex items-center justify-between gap-4 p-4 md:p-6">
        <div className="flex items-center gap-4 flex-1">
          <div className="hidden sm:flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-pink-500 shadow-lg shrink-0">
            <Coffee className="w-7 h-7 text-white" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-orange-500" />
              <h3 className="font-bold text-lg bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                Enjoying your insights?
              </h3>
            </div>
            <p className="text-sm text-muted-foreground">
              This tool is <span className="font-semibold text-foreground">100% free</span> and built with love. 
              Support development with a coffee! ☕
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            onClick={handleSupport}
            className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all hover:scale-105 gap-2"
          >
            <Heart className="w-4 h-4 fill-current" />
            <span className="hidden sm:inline">Support</span>
            <span className="sm:hidden">Support</span>
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDismiss}
            className="rounded-full hover:bg-muted"
          >
            <X className="w-4 h-4" />
            <span className="sr-only">Dismiss</span>
          </Button>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500" />
    </div>
  )
}
