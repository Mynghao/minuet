"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function Footer() {
  const [showAboutUs, setShowAboutUs] = useState(false)
  const router = useRouter()

  const handleLogout = () => {
    localStorage.removeItem("user")
    router.push("/")
  }

  const handleDownloadReport = () => {
    // Placeholder for download functionality
    alert("Download functionality would be implemented here")
  }

  return (
    <>
      <footer className="fixed bottom-0 left-0 right-0 px-8 py-4" style={{ backgroundColor: "#0F051F" }}>
        <div className="flex justify-between items-center">
          <div className="text-lg font-medium text-white ethereal-glow">shortcuts</div>
          <div className="flex space-x-8">
            <button
              onClick={handleLogout}
              className="text-lg font-medium text-white ethereal-glow transition-colors duration-200"
              onMouseEnter={(e) => (e.currentTarget.style.color = "#F4AF9D")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#FFFFFF")}
            >
              log out
            </button>
            <button
              onClick={handleDownloadReport}
              className="text-lg font-medium text-white ethereal-glow transition-colors duration-200"
              onMouseEnter={(e) => (e.currentTarget.style.color = "#F4AF9D")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#FFFFFF")}
            >
              download overall report
            </button>
            <button
              onClick={() => setShowAboutUs(true)}
              className="text-lg font-medium text-white ethereal-glow transition-colors duration-200"
              onMouseEnter={(e) => (e.currentTarget.style.color = "#F4AF9D")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#FFFFFF")}
            >
              about us
            </button>
          </div>
        </div>
      </footer>

      {/* About Us Modal */}
      {showAboutUs && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="rounded-3xl p-8 max-w-md mx-4" style={{ backgroundColor: "#F4D4A7" }}>
            <h3 className="text-xl font-medium mb-4 text-center" style={{ color: "#2D1B69" }}>
              About Us
            </h3>
            <p className="mb-6 text-center leading-relaxed" style={{ color: "#2D1B69" }}>
              This app was built by first-year MIT students during HackMIT 2025! We hope to expand this project and the
              future and push it towards positive impact.
            </p>
            <div className="flex justify-center">
              <button
                onClick={() => setShowAboutUs(false)}
                className="px-6 py-2 rounded-full transition-all duration-300"
                style={{
                  backgroundColor: "#2D1B69",
                  color: "#F4D4A7",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#FF6B47"
                  e.currentTarget.style.color = "#F4D4A7"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#2D1B69"
                  e.currentTarget.style.color = "#F4D4A7"
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
