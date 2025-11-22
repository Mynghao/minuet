"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"

interface WelcomePageProps {
  onGetStarted: () => void
}

export default function WelcomePage({ onGetStarted }: WelcomePageProps) {
  const [showBackground, setShowBackground] = useState(false)
  const [showText, setShowText] = useState(false)
  const [showMinuet, setShowMinuet] = useState(false)
  const [showButton, setShowButton] = useState(false)

  useEffect(() => {
    // Staggered animations as requested
    setShowBackground(true)
    setTimeout(() => setShowText(true), 500)
    setTimeout(() => setShowMinuet(true), 1000)
    setTimeout(() => setShowButton(true), 1500)
  }, [])

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div
        className={`absolute inset-0 transition-opacity duration-1000 ${showBackground ? "opacity-100" : "opacity-0"}`}
        style={{
          backgroundImage: "url('/images/celestial-background.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />

      <div className="absolute inset-0 bg-black/20" />

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-8">
        {/* Text content */}
        <div className="text-center mb-12">
          <div
            className={`text-3xl md:text-4xl font-bold mb-4 transition-all duration-1000 ${
              showText ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
            style={{ color: "#EDC28E" }}
          >
            Spend a minute with
          </div>

          <div
            className={`relative transition-all duration-1000 ${
              showMinuet ? "opacity-100 translate-y-0 blur-0" : "opacity-0 translate-y-8 blur-sm"
            }`}
          >
            <h1
              className="text-9xl md:text-[12rem] font-script font-bold ethereal-glow"
              style={{
                color: "#FFFFFF",
                textShadow: "0 0 30px rgba(255, 255, 255, 0.8), 0 0 60px rgba(255, 255, 255, 0.4)",
              }}
            >
              minuet
            </h1>
          </div>
        </div>

        <div
          className={`transition-all duration-1000 ${
            showButton ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <Button
            onClick={onGetStarted}
            className="border-2 px-8 py-3 rounded-full text-lg font-light transition-all duration-300 transform hover:scale-105 dreamy-border magical-blur"
            style={{
              backgroundColor: "rgba(29, 10, 73, 0.8)",
              borderColor: "#EDC28E",
              color: "#EDC28E",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#EDC28E"
              e.currentTarget.style.color = "#1D0A49"
              e.currentTarget.style.boxShadow = "0 0 25px rgba(237, 194, 142, 0.5)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(29, 10, 73, 0.8)"
              e.currentTarget.style.color = "#EDC28E"
              e.currentTarget.style.boxShadow = "0 0 20px rgba(237, 194, 142, 0.1)"
            }}
          >
            get started
          </Button>
        </div>
      </div>
    </div>
  )
}
