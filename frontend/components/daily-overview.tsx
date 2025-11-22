"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Dot } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

const mockData = [
  { day: "Mon", mood: 7 },
  { day: "Tue", mood: 5 },
  { day: "Wed", mood: 8 },
  { day: "Thu", mood: 6 },
  { day: "Fri", mood: 9 },
  { day: "Sat", mood: 7 },
  { day: "Today", mood: 8.5 }, // Today's data point
]

const chartConfig = {
  mood: {
    label: "Daily Mood",
    color: "#581c87",
  },
}

export default function DailyOverview() {
  return (
    <div className="bg-orange-200 rounded-3xl p-6">
      <h2 className="text-purple-900 text-2xl font-medium mb-6">overview</h2>

      <div className="h-64 mb-4">
        <ChartContainer config={chartConfig}>
          <LineChart data={mockData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#581c87" opacity={0.2} />
            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#581c87", fontSize: 12 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: "#581c87", fontSize: 12 }} domain={[0, 10]} />
            <ChartTooltip
              content={<ChartTooltipContent />}
              cursor={{ stroke: "#581c87", strokeWidth: 1, strokeDasharray: "5 5" }}
            />
            <Line
              type="monotone"
              dataKey="mood"
              stroke="#581c87"
              strokeWidth={3}
              dot={(props) => {
                const { cx, cy, payload } = props
                const isToday = payload.day === "Today"
                return (
                  <Dot
                    cx={cx}
                    cy={cy}
                    r={isToday ? 8 : 6}
                    fill={isToday ? "#f97316" : "#581c87"}
                    stroke={isToday ? "#581c87" : "#581c87"}
                    strokeWidth={2}
                  />
                )
              }}
              activeDot={{ r: 10, fill: "#f97316", stroke: "#581c87", strokeWidth: 2 }}
            />
          </LineChart>
        </ChartContainer>
      </div>

      <p className="text-purple-900 text-center italic">
        {
          "<be able to insert a graph here based on data from backend- same one from home page except this one includes today's data>"
        }
      </p>
    </div>
  )
}
