"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface LoginFormProps {
  onForgotPassword: () => void
}

export default function LoginForm({ onForgotPassword }: LoginFormProps) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Store user data in localStorage for demo purposes
    localStorage.setItem("user", JSON.stringify({ username, firstName: "Demo User" }))
    router.push("/home")
  }

  return (
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

      <div className="text-center">
        <button
          type="button"
          onClick={onForgotPassword}
          className="italic transition-colors duration-200 ethereal-glow"
          style={{ color: "#EDC28E" }} // Changed to yellow
          onMouseEnter={(e) => (e.currentTarget.style.color = "#F4AF9D")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#EDC28E")}
        >
          forgot your username or password?
        </button>
      </div>

      <div className="flex justify-center">
        <Button
          type="submit"
          className="px-8 py-3 rounded-full text-lg font-medium transition-all duration-300 transform hover:scale-105 dreamy-border magical-blur"
          style={{
            backgroundColor: "#1D0A49",
            color: "#EDC28E",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#EDC28E"
            e.currentTarget.style.color = "#1D0A49"
            e.currentTarget.style.boxShadow = "0 0 25px rgba(237, 194, 142, 0.5)"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#1D0A49"
            e.currentTarget.style.color = "#EDC28E"
            e.currentTarget.style.boxShadow = "0 0 20px rgba(237, 194, 142, 0.1)"
          }}
        >
          submit
        </Button>
      </div>
    </form>
  )
}
