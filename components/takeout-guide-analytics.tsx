"use client"

import { useEffect, useRef } from "react"

import { trackEvent } from "@/lib/analytics"

export default function TakeoutGuideAnalytics() {
  const tracked = useRef(false)

  useEffect(() => {
    if (tracked.current) return
    tracked.current = true
    trackEvent("takeout_guide_opened", {
      platform: "youtube",
      source_page: "takeout_guide",
    })
  }, [])

  return null
}
