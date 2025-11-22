"use client"

import type React from "react"

import { Button } from "@/components/ui/button"

interface ArchiveEntryData {
  id: string
  date: string
  summary: string
  mood: number
  hue: string
}

interface ArchiveEntryProps {
  entry: ArchiveEntryData
  onClick: () => void
}

export default function ArchiveEntry({ entry, onClick }: ArchiveEntryProps) {
  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation()
    // Placeholder for download functionality
    alert(`Download report for ${entry.date}`)
  }

  return (
    <div
      onClick={onClick}
      className="border-2 border-orange-300 rounded-3xl p-6 cursor-pointer transition-all duration-300 transform hover:scale-[1.02]"
      style={{ backgroundColor: "#1a0a3a" }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#2a1a4a")}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#1a0a3a")}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Date and summary */}
          <div>
            <h3 className="text-orange-300 text-lg font-medium">{entry.date}</h3>
            <p className="text-orange-200 text-sm mt-1">{entry.summary}</p>
          </div>
        </div>

        {/* Download button */}
        <Button
          onClick={handleDownload}
          className="bg-orange-300 hover:bg-orange-400 text-purple-900 px-6 py-2 rounded-full text-sm font-medium transition-all duration-300"
        >
          download report
        </Button>
      </div>
    </div>
  )
}
