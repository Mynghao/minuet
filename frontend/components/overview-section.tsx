// "use client"

// import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts"
// import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

// const mockData = [
//   { day: "Mon", mood: 7 },
//   { day: "Tue", mood: 5 },
//   { day: "Wed", mood: 8 },
//   { day: "Thu", mood: 6 },
//   { day: "Fri", mood: 9 },
//   { day: "Sat", mood: 7 },
//   { day: "Sun", mood: 8 },
// ]

// const chartConfig = {
//   mood: {
//     label: "Mood Score",
//     color: "#fed7aa",
//   },
// }

// export default function OverviewSection() {
//   return (
//     <div className="border-2 border-orange-300 rounded-3xl p-6" style={{ backgroundColor: "#1a0a3a" }}>
//       <h2 className="text-orange-300 text-2xl font-bold mb-6 text-center">overview</h2>

//       <div className="h-64 text-orange-200">
//         <ChartContainer config={chartConfig}>
//           <LineChart data={mockData}>
//             <CartesianGrid strokeDasharray="3 3" stroke="#fed7aa" opacity={0.2} />
//             <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#fed7aa", fontSize: 12 }} />
//             <YAxis axisLine={false} tickLine={false} tick={{ fill: "#fed7aa", fontSize: 12 }} domain={[0, 10]} />
//             <ChartTooltip
//               content={<ChartTooltipContent />}
//               cursor={{ stroke: "#fed7aa", strokeWidth: 1, strokeDasharray: "5 5" }}
//             />
//             <Line
//               type="monotone"
//               dataKey="mood"
//               stroke="#fed7aa"
//               strokeWidth={3}
//               dot={{ fill: "#fed7aa", strokeWidth: 2, r: 6 }}
//               activeDot={{ r: 8, fill: "#fb923c", stroke: "#fed7aa", strokeWidth: 2 }}
//             />
//           </LineChart>
//         </ChartContainer>
//       </div>

//       <p className="text-orange-200 text-center mt-4 italic">
//         {"<be able to insert a graph here based on data from backend>"}
//       </p>
//     </div>
//   )
// }

"use client"

import { useEffect, useState } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

type Datum = { date: string; valence?: number; arousal?: number; dominance?: number }

const chartConfig = {
  valence: { label: "Valence", color: "#fed7aa" },    // orange-200
  arousal: { label: "Arousal", color: "#c4b5fd" },    // violet-300
  dominance: { label: "Dominance", color: "#fca5a5" } // rose-300
}

export default function OverviewSection() {
  const [data, setData] = useState<Datum[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    (async () => {
      setLoading(true)
      setError(null)
      try {
        // 1) Load saved recordings list from localStorage
        const raw = localStorage.getItem("minuet_entries")
        const entries: any[] = raw ? JSON.parse(raw) : []

        // Normalize & sort
        const items = entries
          .map((e) => ({
            id: e?.id || e?.audioId,
            // fallback date if backend doesn't provide recorded_date
            fallbackDate: (e?.date || (e?.timestamp ? e.timestamp.slice(0, 10) : "") || "").slice(0, 10),
          }))
          .filter((x) => x.id) // need an id to fetch
          .sort((a, b) => a.fallbackDate.localeCompare(b.fallbackDate))

        // 2) Fetch VAD JSON for each id
        const points: Datum[] = []
        for (const it of items) {
          try {
            const r = await fetch(`/api/audio/${it.id}/vad`, { cache: "no-store" })
            if (!r.ok) continue
            const j = await r.json() as {
              vad?: { valence?: number; arousal?: number; dominance?: number }
              recorded_date?: string
            }

            const v = typeof j?.vad?.valence === "number" ? j.vad.valence : undefined
            const a = typeof j?.vad?.arousal === "number" ? j.vad.arousal : undefined
            const d = typeof j?.vad?.dominance === "number" ? j.vad.dominance : undefined

            const date = (j.recorded_date || it.fallbackDate || "").slice(0, 10)
            const hasAny = v !== undefined || a !== undefined || d !== undefined
            if (date && hasAny) {
              // ensure within [0,1]
              const clamp01 = (x: number | undefined) =>
                typeof x === "number" && isFinite(x) ? Math.max(0, Math.min(1, x)) : undefined
              points.push({
                date,
                valence: clamp01(v),
                arousal: clamp01(a),
                dominance: clamp01(d),
              })
            }
          } catch {
            // ignore individual fetch failures
          }
        }

        // 3) Merge by date in case multiple recordings on the same day: average them
        const byDate = new Map<string, { vSum: number; aSum: number; dSum: number; nV: number; nA: number; nD: number }>()
        for (const p of points) {
          const key = p.date
          if (!byDate.has(key)) byDate.set(key, { vSum: 0, aSum: 0, dSum: 0, nV: 0, nA: 0, nD: 0 })
          const acc = byDate.get(key)!
          if (typeof p.valence === "number") { acc.vSum += p.valence; acc.nV++ }
          if (typeof p.arousal === "number") { acc.aSum += p.arousal; acc.nA++ }
          if (typeof p.dominance === "number") { acc.dSum += p.dominance; acc.nD++ }
        }

        const merged: Datum[] = Array.from(byDate.entries())
          .map(([date, acc]) => ({
            date,
            valence: acc.nV ? acc.vSum / acc.nV : undefined,
            arousal: acc.nA ? acc.aSum / acc.nA : undefined,
            dominance: acc.nD ? acc.dSum / acc.nD : undefined,
          }))
          .sort((a, b) => a.date.localeCompare(b.date))

        setData(merged)
      } catch (e: any) {
        setError(e?.message || "failed to load VAD")
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  return (
    <div className="border-2 border-orange-300 rounded-3xl p-6" style={{ backgroundColor: "#1a0a3a" }}>
      <h2 className="text-orange-300 text-2xl font-bold mb-6 text-center">overview</h2>

      <div className="h-64 text-orange-200">
        {loading ? (
          <div className="h-full flex items-center justify-center italic">loading…</div>
        ) : error ? (
          <div className="h-full flex items-center justify-center italic text-red-400">{error}</div>
        ) : data.length === 0 ? (
          <div className="h-full flex items-center justify-center italic">no VAD data yet</div>
        ) : (
          <ChartContainer config={chartConfig}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#fed7aa" opacity={0.2} />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#fed7aa", fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#fed7aa", fontSize: 12 }}
                domain={[0, 1]}
                ticks={[0, 0.25, 0.5, 0.75, 1]}
              />
              <ChartTooltip
                content={<ChartTooltipContent />}
                cursor={{ stroke: "#fed7aa", strokeWidth: 1, strokeDasharray: "5 5" }}
              />
              <Line
                type="monotone"
                dataKey="valence"
                name={chartConfig.valence.label}
                stroke={chartConfig.valence.color}
                strokeWidth={3}
                dot={{ fill: chartConfig.valence.color, strokeWidth: 2, r: 5 }}
                activeDot={{ r: 7, fill: "#fb923c", stroke: "#fed7aa", strokeWidth: 2 }}
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="arousal"
                name={chartConfig.arousal.label}
                stroke={chartConfig.arousal.color}
                strokeWidth={3}
                dot={{ fill: chartConfig.arousal.color, strokeWidth: 2, r: 5 }}
                activeDot={{ r: 7, fill: "#fb923c", stroke: "#fed7aa", strokeWidth: 2 }}
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="dominance"
                name={chartConfig.dominance.label}
                stroke={chartConfig.dominance.color}
                strokeWidth={3}
                dot={{ fill: chartConfig.dominance.color, strokeWidth: 2, r: 5 }}
                activeDot={{ r: 7, fill: "#fb923c", stroke: "#fed7aa", strokeWidth: 2 }}
                connectNulls
              />
            </LineChart>
          </ChartContainer>
        )}
      </div>

      <p className="text-orange-200 text-center mt-4 italic">
        {data.length ? "valence / arousal / dominance over time" : "no points built (record a few entries first)"}
      </p>
    </div>
  )
}
