"use client"

import { useState } from "react"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import VoiceLogReplay from "@/components/voice-log-replay"
import ViewTranscriptButton from "@/components/view-transcript-button"
import TuneOfTheDay from "@/components/tune-of-the-day"
import DailySummary from "@/components/daily-summary"
import DailyOverview from "@/components/daily-overview"
import TodaysHue from "@/components/todays-hue"
import TranscriptModal from "@/components/transcript-modal"

export default function DailyReportPage() {
  const [showTranscript, setShowTranscript] = useState(false)

  return (
    <div
      className="min-h-screen"
      style={{ background: "linear-gradient(135deg, #271051 0%, #2A1255 30%, #271051 70%, #0F051F 100%)" }}
    >
      <Navigation />

      <main className="px-8 py-6 pb-24">
        {/* Top Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Voice Log Replay */}
            <VoiceLogReplay />

            {/* View Transcript Button */}
            <ViewTranscriptButton onClick={() => setShowTranscript(true)} />

            {/* Tune of the Day */}
            <TuneOfTheDay />
          </div>

          {/* Right Column - Summary */}
          <DailySummary />
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Overview */}
          <DailyOverview />

          {/* Today's Hue */}
          <TodaysHue />
        </div>
      </main>

      <Footer />

      {/* Transcript Modal */}
      {showTranscript && <TranscriptModal onClose={() => setShowTranscript(false)} />}

      {/* Star decoration */}
      <div className="fixed bottom-8 right-8 text-yellow-300 text-2xl animate-pulse">✦</div>
    </div>
  )
}
