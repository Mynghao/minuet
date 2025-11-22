"use client"

import { useState } from "react"

export default function RecentSections() {
  const [playingTune, setPlayingTune] = useState<number | null>(null)
  const [selectedHue, setSelectedHue] = useState<number | null>(null)

  const recentHues = [
    {
      color: "bg-gradient-to-br from-blue-400 to-purple-500",
      meaning: "Calm and introspective - a day of deep thinking and peaceful reflection.",
    },
    {
      color: "bg-gradient-to-br from-purple-400 to-pink-400",
      meaning: "Creative and passionate - expressing yourself with artistic flair.",
    },
    {
      color: "bg-gradient-to-br from-indigo-400 to-blue-500",
      meaning: "Focused and determined - channeling inner strength and clarity.",
    },
    {
      color: "bg-gradient-to-br from-pink-400 to-rose-400",
      meaning: "Loving and compassionate - connecting deeply with others around you.",
    },
    {
      color: "bg-gradient-to-br from-violet-400 to-purple-500",
      meaning: "Mystical and intuitive - trusting your inner wisdom and instincts.",
    },
    {
      color: "bg-gradient-to-br from-blue-500 to-indigo-500",
      meaning: "Stable and reliable - building trust and maintaining steady progress.",
    },
    {
      color: "bg-gradient-to-br from-purple-500 to-pink-500",
      meaning: "Transformative and bold - embracing change with confidence.",
    },
    {
      color: "bg-gradient-to-br from-slate-400 to-blue-400",
      meaning: "Balanced and thoughtful - finding harmony between logic and emotion.",
    },
  ]

  const recentTunes = [
    "Peaceful Morning Melody",
    "Energetic Afternoon Beat",
    "Contemplative Evening Song",
    "Motivational Daily Anthem",
  ]

  const handleTunePlay = (index: number) => {
    if (playingTune === index) {
      setPlayingTune(null) // Stop playing
    } else {
      setPlayingTune(index) // Start playing
    }
  }

  const handleHueClick = (index: number) => {
    setSelectedHue(selectedHue === index ? null : index)
  }

  return (
    <div className="space-y-6">
      {/* Recent Hues */}
      <div className="border-2 border-orange-300 rounded-3xl p-6" style={{ backgroundColor: "#1a0a3a" }}>
        <h2 className="text-orange-300 text-2xl font-bold mb-4">recent hues</h2>
        <div className="overflow-x-auto">
          <div className="flex space-x-4 pb-2" style={{ minWidth: "fit-content" }}>
            {recentHues.map((hue, index) => (
              <div key={index} className="flex-shrink-0">
                <div
                  className={`w-16 h-16 rounded-full ${hue.color} cursor-pointer transform transition-all duration-300 hover:scale-110 hover:shadow-lg ${
                    selectedHue === index ? "ring-4 ring-orange-300 scale-110" : ""
                  }`}
                  title={`Hue from ${8 - index} days ago - Click for meaning`}
                  onClick={() => handleHueClick(index)}
                />
              </div>
            ))}
          </div>
        </div>
        {selectedHue !== null && (
          <div className="mt-4 p-4 bg-purple-800/30 rounded-lg border border-orange-300/30">
            <p className="text-orange-200 text-sm italic">{recentHues[selectedHue].meaning}</p>
          </div>
        )}
      </div>

      {/* Recent Tunes */}
      <div className="border-2 border-orange-300 rounded-3xl p-6" style={{ backgroundColor: "#1a0a3a" }}>
        <h2 className="text-orange-300 text-2xl font-bold mb-4">recent tunes</h2>
        <div className="text-orange-200 space-y-2">
          <p className="italic">{"<insert list of generated songs from previous voice logs>"}</p>
          {recentTunes.map((tune, index) => (
            <div
              key={index}
              className="flex items-center justify-between py-2 border-b border-orange-300/30 hover:bg-purple-800/50 rounded px-2 transition-all duration-200"
            >
              <span className="flex-1">{tune}</span>
              <button
                onClick={() => handleTunePlay(index)}
                className={`text-orange-300 hover:text-orange-100 transition-all duration-200 transform hover:scale-110 ${
                  playingTune === index ? "text-green-400" : ""
                }`}
                title={playingTune === index ? "Stop" : "Play"}
              >
                {playingTune === index ? "⏸" : "▶"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
