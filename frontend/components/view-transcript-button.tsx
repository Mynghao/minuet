// "use client"

// import { Button } from "@/components/ui/button"

// interface ViewTranscriptButtonProps {
//   onClick: () => void
// }

// export default function ViewTranscriptButton({ onClick }: ViewTranscriptButtonProps) {
//   return (
//     <Button
//       onClick={onClick}
//       className="w-full bg-orange-200 hover:bg-orange-300 text-purple-900 py-4 rounded-3xl text-xl font-medium transition-all duration-300"
//     >
//       view transcript
//     </Button>
//   )
// }
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { fetchTranscriptById } from "@/lib/recordings"

type Props = {
  audioId?: string // optional; will fall back to localStorage.minue t_last
}

export default function ViewTranscriptButton({ audioId }: Props) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [transcript, setTranscript] = useState("")

  async function handleClick() {
    // Resolve an id: prop → localStorage
    let id = audioId
    if (!id) {
      const last = localStorage.getItem("minuet_last")
      if (last) {
        const p = JSON.parse(last)
        id = p?.id || p?.audioId
      }
    }
    if (!id) {
      setError("No recording found. Make a recording first.")
      setOpen(true)
      return
    }

    // If opening for the first time, fetch
    if (!open || !transcript) {
      try {
        setLoading(true)
        setError("")
        const text = await fetchTranscriptById(id)
        setTranscript(text || "(no transcript)")
      } catch (e: any) {
        console.error(e)
        setError(e?.message || "Failed to fetch transcript")
      } finally {
        setLoading(false)
      }
    }

    setOpen((v) => !v)
  }

  return (
    <div className="w-full relative z-10">
      <Button
        type="button"
        onClick={handleClick}
        className="w-full bg-orange-200 hover:bg-orange-300 text-purple-900 py-4 rounded-3xl text-xl font-medium transition-all duration-300"
      >
        {open ? "hide transcript" : "view transcript"}
      </Button>

      {open && (
        <div className="mt-4 bg-white/95 border border-orange-300 rounded-2xl p-4 text-purple-900 text-lg leading-relaxed whitespace-pre-wrap shadow-sm">
          {loading && <p className="italic">loading transcript…</p>}
          {error && <p className="text-red-600">{error}</p>}
          {!loading && !error && transcript}
        </div>
      )}
    </div>
  )
}
