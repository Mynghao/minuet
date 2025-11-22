"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function VoiceLogReplay() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string>("")
  const [transcript, setTranscript] = useState<string>("")
  const [showTranscript, setShowTranscript] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    const lastEntry = localStorage.getItem("minuet_last")
    if (lastEntry) {
      const entry = JSON.parse(lastEntry)
      if (entry.audioData) {
        setAudioUrl(entry.audioData)
      } else if (entry.audioUrl) {
        setAudioUrl(entry.audioUrl)
      }
      setTranscript(entry.text || "")
    }
  }, [])

  const togglePlayback = () => {
    if (!audioRef.current || !audioUrl) return

    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  const stopPlayback = () => {
    if (!audioRef.current) return

    audioRef.current.pause()
    audioRef.current.currentTime = 0
    setIsPlaying(false)
  }

  const handleAudioEnded = () => {
    setIsPlaying(false)
  }

  const handleAudioPause = () => {
    setIsPlaying(false)
  }

  const handleAudioPlay = () => {
    setIsPlaying(true)
  }

  return (
    <div className="border-2 border-orange-300 rounded-3xl p-6" style={{ backgroundColor: "#1a0a3a" }}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-orange-300 text-xl font-medium">replay voice log</h2>

          <div className="flex space-x-3">
            <Button
              onClick={togglePlayback}
              disabled={!audioUrl}
              className="w-12 h-12 rounded-full bg-pink-400 hover:bg-pink-500 text-white flex items-center justify-center transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: "#d946ef", color: "#1a0a3a" }} // Darker text color for better contrast
            >
              {isPlaying ? "⏸" : "▶"}
            </Button>

            <Button
              onClick={stopPlayback}
              disabled={!audioUrl}
              className="w-12 h-12 rounded-full bg-pink-400 hover:bg-pink-500 text-white flex items-center justify-center transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: "#d946ef", color: "#1a0a3a" }} // Darker text color for better contrast
            >
              ⏹
            </Button>
          </div>
        </div>

        {audioUrl && (
          <audio
            ref={audioRef}
            src={audioUrl}
            onEnded={handleAudioEnded}
            onPause={handleAudioPause}
            onPlay={handleAudioPlay}
            style={{ display: "none" }}
          />
        )}

        {transcript && (
          <div className="space-y-2">
            <Button
              onClick={() => setShowTranscript(!showTranscript)}
              className="bg-transparent border border-orange-300 text-orange-300 hover:bg-orange-300 hover:text-purple-900 px-4 py-2 rounded-full text-sm transition-all duration-300"
            >
              {showTranscript ? "Hide" : "Show"} Transcript
            </Button>

            {showTranscript && (
              <div className="border border-orange-300 rounded-lg p-4" style={{ backgroundColor: "#2a1a4a" }}>
                {" "}
                {/* Darker, deeper color */}
                <p className="text-orange-200 whitespace-pre-wrap text-sm">{transcript}</p>
              </div>
            )}
          </div>
        )}

        {!audioUrl && (
          <p className="text-orange-200 text-sm text-center opacity-70">
            No recording available. Record an entry first.
          </p>
        )}
      </div>
    </div>
  )
}
