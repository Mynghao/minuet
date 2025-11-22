"use client"

import { useState, useEffect } from "react"
import Image from "next/image"

export default function LoadingPage() {
  const [dots, setDots] = useState("")

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => {
        if (prev === "...") return ""
        return prev + "."
      })
    }, 500)

    return () => clearInterval(interval)
  }, [])

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-8 relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #1D0A49 0%, #2A1255 30%, #1D0A49 70%, #0F051F 100%)",
      }}
    >
      <div className="absolute bottom-8 right-8 text-2xl animate-pulse ethereal-glow" style={{ color: "#EDC28E" }}>
        ✦
      </div>

      <div className="w-full h-full max-w-4xl max-h-4xl flex items-center justify-center mb-8">
        <Image
          src="/images/loading-orb.gif"
          alt="Loading orb animation"
          width={800}
          height={600}
          className="object-contain w-full h-auto max-w-full max-h-[70vh]"
          unoptimized
        />
      </div>

      {/* Loading text with animated dots */}
      <div className="text-2xl md:text-3xl font-light italic" style={{ color: "#EDC28E" }}>
        loading minuet{dots}
      </div>
    </div>
  )
}
