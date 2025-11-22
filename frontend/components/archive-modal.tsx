"use client"

interface ArchiveEntryData {
  id: string
  date: string
  summary: string
  mood: number
  hue: string
}

interface ArchiveModalProps {
  entry: ArchiveEntryData
  onClose: () => void
}

export default function ArchiveModal({ entry, onClose }: ArchiveModalProps) {
  const handlePrint = () => {
    // Placeholder for print functionality as requested
    alert("Print functionality would be implemented here")
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-orange-200 rounded-3xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-purple-900 text-2xl font-medium">{entry.date}</h3>
          <button
            onClick={onClose}
            className="text-purple-900 hover:text-purple-700 text-2xl font-bold transition-colors duration-200"
          >
            ×
          </button>
        </div>

        <div className="space-y-6">
          {/* Summary */}
          <div>
            <h4 className="text-purple-900 text-lg font-medium mb-2">Summary</h4>
            <p className="text-purple-900 leading-relaxed">{entry.summary}</p>
          </div>

          {/* Mood Score */}
          <div>
            <h4 className="text-purple-900 text-lg font-medium mb-2">Mood Score</h4>
            <div className="flex items-center space-x-2">
              <div className="flex space-x-1">
                {[...Array(10)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-4 h-4 rounded-full ${
                      i < entry.mood ? "bg-purple-900" : "bg-purple-300"
                    } transition-all duration-200`}
                  />
                ))}
              </div>
              <span className="text-purple-900 font-medium">{entry.mood}/10</span>
            </div>
          </div>

          {/* Hue */}
          <div>
            <h4 className="text-purple-900 text-lg font-medium mb-2">Daily Hue</h4>
            <div className={`w-24 h-24 rounded-full ${entry.hue} shadow-lg`} />
          </div>

          {/* Transcript Preview */}
          <div>
            <h4 className="text-purple-900 text-lg font-medium mb-2">Transcript Preview</h4>
            <div className="bg-purple-100 rounded-xl p-4">
              <p className="text-purple-900 text-sm leading-relaxed">
                "Today was a really productive day. I managed to make significant progress on my project and felt a
                sense of accomplishment. The challenges I faced earlier in the week seem more manageable now..."
              </p>
              <p className="text-purple-600 text-xs mt-2 italic">Click to view full transcript</p>
            </div>
          </div>
        </div>

        <div className="flex justify-center space-x-4 mt-8">
          <button
            onClick={handlePrint}
            className="bg-transparent border-2 border-purple-900 text-purple-900 hover:bg-purple-900 hover:text-orange-200 px-6 py-3 rounded-full text-lg transition-all duration-300"
          >
            Print
          </button>
          <button
            onClick={onClose}
            className="bg-purple-900 hover:bg-orange-300 hover:text-purple-900 text-orange-200 px-8 py-3 rounded-full text-lg transition-all duration-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
