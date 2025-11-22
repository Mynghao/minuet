"use client"

interface TranscriptModalProps {
  onClose: () => void
}

export default function TranscriptModal({ onClose }: TranscriptModalProps) {
  const mockTranscript = `
    Today I'm feeling pretty good about the progress I've made on my project. 
    There's something really satisfying about seeing all the pieces come together, 
    even when it feels like there's still so much work ahead.

    I've been thinking a lot about balance lately - how to maintain momentum 
    without burning out. It's tricky because when I'm in the flow, I want to 
    keep going, but I know I need to pace myself for the long term.

    The weather has been beautiful, and I took a walk during lunch which really 
    helped clear my head. Sometimes the best ideas come when you're not actively 
    trying to solve problems.

    I'm excited about what tomorrow might bring, but also trying to stay present 
    and appreciate where I am right now. Growth is a process, and I'm learning 
    to be more patient with myself.
  `

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-orange-200 rounded-3xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-purple-900 text-2xl font-medium">Full Transcript</h3>
          <button
            onClick={onClose}
            className="text-purple-900 hover:text-purple-700 text-2xl font-bold transition-colors duration-200"
          >
            ×
          </button>
        </div>

        <div className="text-purple-900 leading-relaxed space-y-4">
          <p className="italic text-sm mb-4">{"<transcripted in the backend code>"}</p>

          {mockTranscript
            .trim()
            .split("\n\n")
            .map((paragraph, index) => (
              <p key={index} className="mb-4">
                {paragraph.trim()}
              </p>
            ))}
        </div>

        <div className="flex justify-center mt-8">
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
