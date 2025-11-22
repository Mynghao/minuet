"use client"

import { useRouter, usePathname } from "next/navigation"

export default function Navigation() {
  const router = useRouter()
  const pathname = usePathname()

  const navItems = [
    { name: "home", path: "/home" },
    { name: "daily report", path: "/daily-report" },
    { name: "archive", path: "/archive" },
    { name: "my account", path: "/account" },
  ]

  return (
    <nav className="py-6">
      <div className="flex space-x-1 rounded-full p-1 px-8" style={{ backgroundColor: "#F4D4A7" }}>
        {navItems.map((item) => (
          <button
            key={item.name}
            onClick={() => router.push(item.path)}
            className={`flex-1 py-3 px-6 rounded-full text-lg font-medium transition-all duration-300`}
            style={{
              backgroundColor: pathname === item.path ? "#2D1B69" : "transparent",
              color: pathname === item.path ? "#F4D4A7" : "#2D1B69",
            }}
            onMouseEnter={(e) => {
              if (pathname !== item.path) {
                e.currentTarget.style.backgroundColor = "#FF6B47"
                e.currentTarget.style.color = "#F4D4A7"
              }
            }}
            onMouseLeave={(e) => {
              if (pathname !== item.path) {
                e.currentTarget.style.backgroundColor = "transparent"
                e.currentTarget.style.color = "#2D1B69"
              }
            }}
          >
            {item.name}
          </button>
        ))}
      </div>
    </nav>
  )
}
