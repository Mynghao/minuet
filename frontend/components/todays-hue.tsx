export default function TodaysHue() {
  return (
    <div
      className="border-2 border-orange-300 rounded-3xl p-6 flex flex-col items-center justify-center"
      style={{ backgroundColor: "#1a0a3a" }}
    >
      <h2 className="text-orange-300 text-2xl font-medium mb-8">today's hue</h2>

      {/* Today's hue - keeping it consistent as requested */}
      <div className="w-48 h-48 rounded-full bg-gradient-to-br from-blue-300 via-purple-300 to-pink-300 shadow-2xl" />

      <p className="text-orange-200 text-center mt-6 italic">
        A blend of calm blues, creative purples, and warm pinks reflecting today's balanced emotional state
      </p>
    </div>
  )
}
