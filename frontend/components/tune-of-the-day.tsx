// "use client"

// import { useState } from "react"
// import { Button } from "@/components/ui/button"

// export default function TuneOfTheDay() {
//   const [isPlaying, setIsPlaying] = useState(false)

//   const togglePlayback = () => {
//     setIsPlaying(!isPlaying)
//   }

//   return (
//     <div className="border-2 border-orange-300 rounded-3xl p-6" style={{ backgroundColor: "#1a0a3a" }}>
//       <div className="flex items-start justify-between mb-4">
//         <h2 className="text-orange-300 text-xl font-medium">tune of the day</h2>

//         <div className="flex space-x-2">
//           <Button
//             onClick={togglePlayback}
//             className="w-12 h-12 rounded-full bg-pink-400 hover:bg-pink-500 text-purple-900 flex items-center justify-center transition-all duration-300"
//           >
//             {isPlaying ? "⏸" : "▶"}
//           </Button>

//           <Button
//             onClick={() => setIsPlaying(false)}
//             className="w-12 h-12 rounded-full bg-pink-400 hover:bg-pink-500 text-purple-900 flex items-center justify-center transition-all duration-300"
//           >
//             ⏹
//           </Button>
//         </div>
//       </div>

//       <div className="text-orange-200 leading-relaxed">
//         <p className="italic mb-4">
//           {"<chatbot will introduce a vibe and then give a generated song from sona- we have backend for this>"}
//         </p>

//         <div className="rounded-2xl p-4" style={{ backgroundColor: "#1a0a3a" }}>
//           <p className="mb-3">
//             Based on today's voice log, I sense a contemplative and hopeful energy. Here's a song that captures your
//             current mood:
//           </p>

//           <div className="rounded-xl p-3" style={{ backgroundColor: "#1a0a3a" }}>
//             <h3 className="font-medium text-orange-300 mb-2">"Gentle Reflections"</h3>
//             <p className="text-sm">
//               A soothing melody with soft piano and ambient sounds, perfect for your thoughtful state of mind today.
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

// "use client"

// import { useEffect, useState } from "react"
// import { Button } from "@/components/ui/button"
// import { fetchResponseById } from "@/lib/recordings"

// export default function TuneOfTheDay({ audioId }: { audioId?: string }) {
//   const [isPlaying, setIsPlaying] = useState(false)
//   const [response, setResponse] = useState("")
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState("")

//   useEffect(() => {
//     (async () => {
//       try {
//         setLoading(true)
//         let id = audioId
//         if (!id) {
//           const last = localStorage.getItem("minuet_last")
//           if (last) {
//             const parsed = JSON.parse(last)
//             id = parsed?.id || parsed?.audioId
//             if (parsed?.response) setResponse(parsed.response) // show cached immediately
//           }
//         }
//         if (!id) {
//           setResponse("(no recent recording)")
//           return
//         }
//         const resp = await fetchResponseById(id)
//         setResponse(resp || "(no response produced)")
//       } catch (e: any) {
//         console.error(e)
//         setError(e.message || "Failed to load response")
//       } finally {
//         setLoading(false)
//       }
//     })()
//   }, [audioId])

//   const togglePlayback = () => setIsPlaying((p) => !p)

//   return (
//     <div className="border-2 border-orange-300 rounded-3xl p-6" style={{ backgroundColor: "#1a0a3a" }}>
//       <div className="flex items-center justify-between mb-6">
//         <h2 className="text-orange-300 text-3xl font-semibold tracking-wide">tune of the day</h2>

//         <div className="flex space-x-2">
//           <Button
//             type="button"
//             onClick={togglePlayback}
//             className="w-12 h-12 rounded-full bg-pink-400 hover:bg-pink-500 text-purple-900 flex items-center justify-center transition-all duration-300"
//           >
//             {isPlaying ? "⏸" : "▶"}
//           </Button>
//           <Button
//             type="button"
//             onClick={() => setIsPlaying(false)}
//             className="w-12 h-12 rounded-full bg-pink-400 hover:bg-pink-500 text-purple-900 flex items-center justify-center transition-all duration-300"
//           >
//             ⏹
//           </Button>
//         </div>
//       </div>

//       <div className="text-orange-200 leading-relaxed">
//         {loading && <p className="italic mb-4">loading tune…</p>}
//         {error && <p className="italic mb-4 text-red-600">{error}</p>}
//         {!loading && !error && (
//           <div
//             className="rounded-2xl p-6 flex items-center justify-center min-h-[150px]"
//             style={{ backgroundColor: "#1a0a3a" }}
//           >
//             <p className="text-xl italic text-center">{response}</p>
//           </div>
//         )}
//       </div>
//     </div>
//   )
// }
"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { fetchResponseById } from "@/lib/recordings"

const SONGS = [
  "/songs/song1.mp3",
  "/songs/song2.mp3",
  "/songs/song3.mp3",
  "/songs/song4.mp3",
  "/songs/song5.mp3",
  "/songs/song6.mp3",
  "/songs/song7.mp3",
  "/songs/song8.mp3",
  "/songs/song9.mp3",
  "/songs/song10.mp3",
]

export default function TuneOfTheDay({ audioId }: { audioId?: string }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [response, setResponse] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [song, setSong] = useState<string | null>(null)

  const audioRef = useRef<HTMLAudioElement | null>(null)

  // pick a random song once on mount
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * SONGS.length)
    setSong(SONGS[randomIndex])
    audioRef.current = new Audio(SONGS[randomIndex])
  }, [])

  // fetch backend response
  useEffect(() => {
    (async () => {
      try {
        setLoading(true)
        let id = audioId
        if (!id) {
          const last = localStorage.getItem("minuet_last")
          if (last) {
            const parsed = JSON.parse(last)
            id = parsed?.id || parsed?.audioId
            if (parsed?.response) setResponse(parsed.response) // show cached immediately
          }
        }
        if (!id) {
          setResponse("(no recent recording)")
          return
        }
        const resp = await fetchResponseById(id)
        setResponse(resp || "(no response produced)")
      } catch (e: any) {
        console.error(e)
        setError(e.message || "Failed to load response")
      } finally {
        setLoading(false)
      }
    })()
  }, [audioId])

  const togglePlayback = () => {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current.play()
      setIsPlaying(true)
    }
  }

  const stopPlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    setIsPlaying(false)
  }

  return (
    <div className="border-2 border-orange-300 rounded-3xl p-6" style={{ backgroundColor: "#1a0a3a" }}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-orange-300 text-3xl font-semibold tracking-wide">tune of the day</h2>

        <div className="flex space-x-2">
          <Button
            type="button"
            onClick={togglePlayback}
            className="w-12 h-12 rounded-full bg-pink-400 hover:bg-pink-500 text-purple-900 flex items-center justify-center transition-all duration-300"
          >
            {isPlaying ? "⏸" : "▶"}
          </Button>
          <Button
            type="button"
            onClick={stopPlayback}
            className="w-12 h-12 rounded-full bg-pink-400 hover:bg-pink-500 text-purple-900 flex items-center justify-center transition-all duration-300"
          >
            ⏹
          </Button>
        </div>
      </div>

      <div className="text-orange-200 leading-relaxed">
        {loading && <p className="italic mb-4">loading tune…</p>}
        {error && <p className="italic mb-4 text-red-600">{error}</p>}
        {!loading && !error && (
          <div
            className="rounded-2xl p-6 flex flex-col items-center justify-center min-h-[150px] space-y-4"
            style={{ backgroundColor: "#1a0a3a" }}
          >
            <p className="text-xl italic text-center">{response}</p>
            {song && (
              <p className="text-sm text-orange-400 italic">🎵 playing: {song.split("/").pop()}</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
