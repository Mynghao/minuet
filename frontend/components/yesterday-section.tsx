export default function YesterdaySection() {
  return (
    <div className="bg-orange-200 rounded-3xl p-6">
      <h2 className="text-purple-900 text-2xl font-bold mb-4">yesterday</h2>
      <div className="text-purple-900 leading-relaxed">
        <p>{"<insert summary from yesterday's voice log>"}</p>
        <br />
        <p className="italic">
          Yesterday you reflected on your goals and shared some insights about your creative process. The day seemed
          productive and fulfilling overall.
        </p>
      </div>
    </div>
  )
}
