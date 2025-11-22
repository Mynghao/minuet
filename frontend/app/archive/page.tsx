"use client"

import { useState } from "react"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import ArchiveEntry from "@/components/archive-entry"
import ArchiveModal from "@/components/archive-modal"
import AddReportButton from "@/components/add-report-button"

interface ArchiveEntryData {
  id: string
  date: string
  summary: string
  mood: number
  hue: string
}

export default function ArchivePage() {
  const [selectedEntry, setSelectedEntry] = useState<ArchiveEntryData | null>(null)

  // Mock archive data - in real app this would come from backend
  const archiveEntries: ArchiveEntryData[] = [
    {
      id: "1",
      date: "Saturday, September 14th",
      summary: "Reflected on project progress and personal growth goals",
      mood: 8,
      hue: "bg-gradient-to-br from-blue-400 to-purple-400",
    },
    {
      id: "2",
      date: "Friday, September 13th",
      summary: "Discussed creative challenges and breakthrough moments",
      mood: 7,
      hue: "bg-gradient-to-br from-green-400 to-teal-400",
    },
    {
      id: "3",
      date: "Thursday, September 12th",
      summary: "Explored work-life balance and time management strategies",
      mood: 6,
      hue: "bg-gradient-to-br from-orange-400 to-red-400",
    },
    {
      id: "4",
      date: "Wednesday, September 11th",
      summary: "Shared thoughts on collaboration and team dynamics",
      mood: 9,
      hue: "bg-gradient-to-br from-purple-400 to-pink-400",
    },
    {
      id: "5",
      date: "Tuesday, September 10th",
      summary: "Contemplated future aspirations and current priorities",
      mood: 7,
      hue: "bg-gradient-to-br from-yellow-400 to-orange-400",
    },
  ]

  const handleAddReport = () => {
    // In real app, this would create a new report entry
    alert("Add new report functionality would be implemented here")
  }

  return (
    <div
      className="min-h-screen"
      style={{ background: "linear-gradient(135deg, #271051 0%, #2A1255 30%, #271051 70%, #0F051F 100%)" }}
    >
      <Navigation />

      <main className="px-8 py-6 pb-24">
        <div className="max-w-4xl mx-auto">
          {/* Add Report Button */}
          <div className="mb-8">
            <AddReportButton onClick={handleAddReport} />
          </div>

          {/* Archive Entries */}
          <div className="space-y-4">
            {archiveEntries.map((entry) => (
              <ArchiveEntry key={entry.id} entry={entry} onClick={() => setSelectedEntry(entry)} />
            ))}
          </div>
        </div>
      </main>

      <Footer />

      {/* Archive Detail Modal */}
      {selectedEntry && <ArchiveModal entry={selectedEntry} onClose={() => setSelectedEntry(null)} />}

      {/* Star decoration */}
      <div className="fixed bottom-8 right-8 text-yellow-300 text-2xl animate-pulse">✦</div>
    </div>
  )
}
