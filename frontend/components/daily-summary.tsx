// export default function DailySummary() {
//   return (
//     <div className="bg-orange-200 rounded-3xl p-6">
//       <h2 className="text-purple-900 text-2xl font-medium mb-4">summary</h2>

//       <div className="text-purple-900 leading-relaxed">
//         <p className="italic mb-4">{"<backend code makes summary so this just outputs that>"}</p>

//         <div className="space-y-3">
//           <p>
//             Today's voice log revealed a mix of excitement and contemplation. You discussed your recent project progress
//             and shared thoughts about upcoming challenges.
//           </p>

//           <p>
//             Key themes included creativity, personal growth, and maintaining balance. Your tone suggested optimism
//             despite some underlying concerns about time management.
//           </p>

//           <p>
//             Overall sentiment: Positive with moments of introspection. Energy level: Moderate to high. Recommended
//             focus: Continue current momentum while addressing time management strategies.
//           </p>
//         </div>
//       </div>
//     </div>
//   )
// }
"use client"

import { useEffect, useState } from "react"
import { fetchSummaryById } from "@/lib/recordings"

export default function DailySummary({ id }: { id?: string }) {
  const [summary, setSummary] = useState("")
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState("")

  useEffect(() => {
    (async () => {
      try {
        setLoading(true)
        let rid = id
        if (!rid) {
          const last = localStorage.getItem("minuet_last")
          if (last) {
            const p = JSON.parse(last)
            rid = p?.id || p?.audioId
            if (!summary && p?.summary) setSummary(p.summary)
          }
        }
        if (!rid) { setSummary("(no recent recording)"); return }
        const s = await fetchSummaryById(rid)
        setSummary(s || "(no summary)")
      } catch (e: any) {
        setErr(e.message || "Failed to load summary")
      } finally {
        setLoading(false)
      }
    })()
  }, [id])

  return (
    <div className="bg-orange-200 rounded-3xl p-6 shadow-md">
      <h2 className="text-purple-900 text-3xl font-semibold mb-6 tracking-wide">Summary</h2>
      <div className="text-purple-900 text-xl leading-loose italic font-light whitespace-pre-wrap">
        {loading ? "Loading…" : err ? `Error: ${err}` : summary}
      </div>
    </div>
  )
}


