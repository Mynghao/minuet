"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import WelcomePage from "@/components/welcome-page"
import LoadingPage from "@/components/loading-page"

export default function Home() {
  const [showLoading, setShowLoading] = useState(false)
  const router = useRouter()

  const handleGetStarted = () => {
    setShowLoading(true)
    // Show loading for at least 4 seconds as requested
    setTimeout(() => {
      router.push("/auth")
    }, 4000)
  }

  if (showLoading) {
    return <LoadingPage />
  }

  return <WelcomePage onGetStarted={handleGetStarted} />
}
