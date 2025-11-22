"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface ForgotPasswordModalProps {
  onClose: () => void
}

export default function ForgotPasswordModal({ onClose }: ForgotPasswordModalProps) {
  const [name, setName] = useState("")
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Demo: redirect to home after password reset
    router.push("/home")
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-orange-200 rounded-3xl p-8 max-w-md mx-4 w-full">
        <h3 className="text-purple-900 text-xl font-medium mb-6 text-center">Reset Your Account</h3>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-purple-900 text-lg font-medium mb-2">Enter your name:</label>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="type here"
              className="w-full p-3 border-2 border-purple-900 rounded-lg bg-orange-100 text-purple-900 placeholder-purple-400 focus:border-purple-700 focus:ring-0"
              required
            />
          </div>

          <div className="flex justify-center space-x-4">
            <Button
              type="button"
              onClick={onClose}
              className="bg-transparent border-2 border-purple-900 text-purple-900 hover:bg-purple-900 hover:text-orange-200 px-6 py-2 rounded-full transition-all duration-300"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-purple-900 hover:bg-orange-300 hover:text-purple-900 text-orange-200 px-6 py-2 rounded-full transition-all duration-300"
            >
              Reset
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
