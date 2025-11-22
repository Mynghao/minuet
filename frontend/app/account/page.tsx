"use client"

import { useState, useEffect } from "react"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"

export default function AccountPage() {
  const [user, setUser] = useState<{ username: string; firstName: string } | null>(null)

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem("user")
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  if (!user) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "linear-gradient(135deg, #271051 0%, #2A1255 30%, #271051 70%, #0F051F 100%)" }}
      >
        <div className="text-orange-200 text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen"
      style={{ background: "linear-gradient(135deg, #271051 0%, #2A1255 30%, #271051 70%, #0F051F 100%)" }}
    >
      <Navigation />

      <main className="px-8 py-6 pb-24">
        <div className="max-w-2xl mx-auto">
          {/* Account Information */}
          <div className="border-2 border-orange-300 rounded-3xl p-8" style={{ backgroundColor: "#271051" }}>
            <h1 className="text-orange-300 text-3xl font-bold mb-8 text-center">My Account</h1>

            <div className="space-y-6">
              {/* First Name */}
              <div>
                <label className="block text-orange-300 text-lg font-bold mb-2">first name:</label>
                <div className="rounded-lg p-4 border border-orange-300" style={{ backgroundColor: "#1a0a3a" }}>
                  <span className="text-orange-200 text-lg">[{user.firstName}]</span>
                </div>
              </div>

              {/* Username */}
              <div>
                <label className="block text-orange-300 text-lg font-bold mb-2">username:</label>
                <div className="rounded-lg p-4 border border-orange-300" style={{ backgroundColor: "#1a0a3a" }}>
                  <span className="text-orange-200 text-lg">[{user.username}]</span>
                </div>
              </div>

              {/* Account Stats */}
              <div className="mt-8 pt-6 border-t border-orange-300">
                <h2 className="text-orange-300 text-xl font-bold mb-4">Account Statistics</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg p-4 text-center" style={{ backgroundColor: "#1a0a3a" }}>
                    <div className="text-orange-300 text-2xl font-bold">12</div>
                    <div className="text-orange-200 text-sm">Total Entries</div>
                  </div>
                  <div className="rounded-lg p-4 text-center" style={{ backgroundColor: "#1a0a3a" }}>
                    <div className="text-orange-300 text-2xl font-bold">8.2</div>
                    <div className="text-orange-200 text-sm">Avg Mood Score</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
