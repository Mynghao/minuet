"use client"

import { useState } from "react"
import LoginForm from "@/components/login-form"
import SignUpForm from "@/components/signup-form"
import ForgotPasswordModal from "@/components/forgot-password-modal"

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login")
  const [showForgotPassword, setShowForgotPassword] = useState(false)

  return (
    <div
      className="min-h-screen flex items-center justify-center px-8 relative overflow-hidden"
      style={{
        backgroundImage: "url('/images/ombre-background.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="w-full max-w-md">
        {/* Tab buttons */}
        <div className="flex mb-8 rounded-full overflow-hidden">
          <button
            onClick={() => setActiveTab("login")}
            className={`flex-1 py-4 px-6 text-lg font-medium transition-all duration-300 ${
              activeTab === "login" ? "text-white font-bold" : "text-gray-300 hover:text-white"
            }`}
            style={{
              backgroundColor: activeTab === "login" ? "#1a0a3a" : "#705467",
              color: activeTab === "login" ? "#EDC28E" : "#EDC28E",
            }}
          >
            log in
          </button>
          <button
            onClick={() => setActiveTab("signup")}
            className={`flex-1 py-4 px-6 text-lg font-medium transition-all duration-300 ${
              activeTab === "signup" ? "text-white font-bold" : "text-gray-300 hover:text-white"
            }`}
            style={{
              backgroundColor: activeTab === "signup" ? "#1a0a3a" : "#705467",
              color: activeTab === "signup" ? "#EDC28E" : "#EDC28E",
            }}
          >
            sign up
          </button>
        </div>

        {/* Form content */}
        <div className="rounded-3xl p-8" style={{ backgroundColor: "#1a0a3a" }}>
          {activeTab === "login" ? <LoginForm onForgotPassword={() => setShowForgotPassword(true)} /> : <SignUpForm />}
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && <ForgotPasswordModal onClose={() => setShowForgotPassword(false)} />}
    </div>
  )
}
