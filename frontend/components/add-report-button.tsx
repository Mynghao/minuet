"use client"

import { Button } from "@/components/ui/button"

interface AddReportButtonProps {
  onClick: () => void
}

export default function AddReportButton({ onClick }: AddReportButtonProps) {
  return (
    <div className="flex justify-center">
      <Button
        onClick={onClick}
        className="bg-orange-300 hover:bg-orange-400 text-purple-900 px-8 py-4 rounded-full text-lg font-medium transition-all duration-300 transform hover:scale-105"
      >
        + Add New Report
      </Button>
    </div>
  )
}
