import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart"
import type { dto } from "../../../wailsjs/go/models"

const chartConfig = {
  processed: { label: "Succeeded", color: "#10b981" },
  failed: { label: "Failed", color: "#f43f5e" },
} satisfies ChartConfig

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString("en", { month: "short", day: "numeric" })
}

export function HistoryChart({ history }: { history: dto.DailyStats[] }) {
  const data = [...history]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((d) => ({
      date: d.date,
      label: formatDate(d.date),
      processed: d.processed,
      failed: d.failed,
    }))

  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-[280px] w-full">
      <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="gradProcessed" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
            <stop offset="100%" stopColor="#10b981" stopOpacity={0.02} />
          </linearGradient>
          <linearGradient id="gradFailed" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.3} />
            <stop offset="100%" stopColor="#f43f5e" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="#2a2a2a" />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tick={{ fill: "#a3a3a3", fontSize: 11 }}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tick={{ fill: "#a3a3a3", fontSize: 11 }}
          allowDecimals={false}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              labelFormatter={(_value, payload) => {
                const item = payload?.[0]?.payload as { date?: string } | undefined
                if (!item?.date) return String(_value)
                return new Date(item.date).toLocaleDateString("en", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })
              }}
            />
          }
        />
        <ChartLegend content={<ChartLegendContent />} />
        <Area
          type="monotone"
          dataKey="processed"
          stroke="#10b981"
          strokeWidth={2}
          fill="url(#gradProcessed)"
          dot={false}
          activeDot={{ r: 4, fill: "#10b981", stroke: "#171717", strokeWidth: 2 }}
        />
        <Area
          type="monotone"
          dataKey="failed"
          stroke="#f43f5e"
          strokeWidth={2}
          fill="url(#gradFailed)"
          dot={false}
          activeDot={{ r: 4, fill: "#f43f5e", stroke: "#171717", strokeWidth: 2 }}
        />
      </AreaChart>
    </ChartContainer>
  )
}
