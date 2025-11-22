"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function SignUpForm() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [firstName, setFirstName] = useState("")
  const [showExistingUserModal, setShowExistingUserModal] = useState(false)
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Check if user already exists (demo logic)
    const existingUser = localStorage.getItem("user")
    if (existingUser && JSON.parse(existingUser).username === username) {
      setShowExistingUserModal(true)
      return
    }

    // Store user data
    localStorage.setItem("user", JSON.stringify({ username, firstName }))
    router.push("/home")
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-lg font-bold mb-2" style={{ color: "#EDC28E" }}>
            username:
          </label>
          <Input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="type here"
            className="w-full p-3 border-2 rounded-lg focus:ring-0 dreamy-border magical-blur font-medium placeholder:text-yellow-600"
            style={{
              borderColor: "#705467",
              backgroundColor: "#1a0a3a", // Changed to muted purple background
              color: "#EDC28E", // Changed from dark purple to light yellow so typed text stays visible
            }}
            required
          />
        </div>

        <div>
          <label className="block text-lg font-bold mb-2" style={{ color: "#EDC28E" }}>
            password:
          </label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="type here"
            className="w-full p-3 border-2 rounded-lg focus:ring-0 dreamy-border magical-blur font-medium placeholder:text-yellow-600"
            style={{
              borderColor: "#705467",
              backgroundColor: "#1a0a3a", // Changed to muted purple background
              color: "#EDC28E", // Changed from dark purple to light yellow so typed text stays visible
            }}
            required
          />
        </div>

        <div className="flex items-end space-x-4">
          <div className="flex-1">
            <label className="block text-lg font-bold mb-2" style={{ color: "#EDC28E" }}>
              first name:
            </label>
            <Input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="type here"
              className="w-full p-3 border-2 rounded-lg focus:ring-0 dreamy-border magical-blur font-medium placeholder:text-yellow-600"
              style={{
                borderColor: "#705467",
                backgroundColor: "#1a0a3a", // Changed to muted purple background
                color: "#EDC28E", // Changed from dark purple to light yellow so typed text stays visible
              }}
              required
            />
          </div>
          <Button
            type="submit"
            className="px-8 py-3 rounded-full text-lg font-medium transition-all duration-300 transform hover:scale-105 dreamy-border magical-blur"
            style={{
              backgroundColor: "#1D0A49",
              color: "#EDC28E",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#705467"
              e.currentTarget.style.color = "#FFFFFF"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#1D0A49"
              e.currentTarget.style.color = "#EDC28E"
            }}
          >
            register!
          </Button>
        </div>
      </form>

      {/* Existing User Modal */}
      {showExistingUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="rounded-3xl p-8 max-w-sm mx-4" style={{ backgroundColor: "#F4D4A7" }}>
            <h3 className="text-xl font-medium mb-4 text-center" style={{ color: "#2D1B69" }}>
              Account Already Exists
            </h3>
            <p className="mb-6 text-center" style={{ color: "#2D1B69" }}>
              You already have an account with us. Please log in instead.
            </p>
            <div className="flex justify-center">
              <Button
                onClick={() => setShowExistingUserModal(false)}
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
                OK
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
