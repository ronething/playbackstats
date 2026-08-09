"use client"

import { useState } from "react"
import { CheckCircle2, FileDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { trackEvent } from "@/lib/analytics"

export default function ProInterestCard() {
  const [recorded, setRecorded] = useState(false)

  const recordInterest = () => {
    trackEvent("pro_interest_clicked", {
      platform: "youtube",
      source_page: "youtube_dashboard",
    })
    setRecorded(true)
  }

  return (
    <Card className="border-violet-300/15 bg-gradient-to-br from-violet-400/[0.08] via-white/[0.035] to-transparent text-white shadow-2xl shadow-black/20">
      <CardContent className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-400/15 text-violet-200">
            <FileDown className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-200">One idea under validation</p>
            <h2 className="mt-2 text-lg font-semibold">Advanced PDF and CSV exports</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
              Would a polished, fully local export be worth a one-time upgrade? This only records aggregate interest; it does not start a purchase or send your report.
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          disabled={recorded}
          onClick={recordInterest}
          className="shrink-0 border-violet-300/20 bg-violet-300/10 text-violet-100 hover:bg-violet-300/15 hover:text-white"
        >
          {recorded ? <CheckCircle2 className="mr-2 h-4 w-4" aria-hidden="true" /> : null}
          {recorded ? "Interest recorded" : "I'd consider a one-time upgrade"}
        </Button>
      </CardContent>
    </Card>
  )
}
