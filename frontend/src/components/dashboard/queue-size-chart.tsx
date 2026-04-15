import {
  Bar,
  BarChart,
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
  pending: { label: "Pending", color: "#a3a3a3" },
  active: { label: "Active", color: "#10b981" },
  scheduled: { label: "Scheduled", color: "#3b82f6" },
  retry: { label: "Retry", color: "#f59e0b" },
  archived: { label: "Archived", color: "#f43f5e" },
} satisfies ChartConfig

export function QueueSizeChart({ queues }: { queues: dto.QueueStats[] }) {
  const data = queues.map((q) => ({
    name: q.queue,
    pending: q.pending,
    active: q.active,
    scheduled: q.scheduled,
    retry: q.retry,
    archived: q.archived,
  }))

  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-[280px] w-full">
      <BarChart data={data} barGap={2}>
        <CartesianGrid vertical={false} stroke="#2a2a2a" />
        <XAxis
          dataKey="name"
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
          content={<ChartTooltipContent />}
          cursor={{ fill: "rgba(212, 168, 67, 0.06)" }}
        />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="pending" stackId="a" fill="var(--color-pending)" radius={[0, 0, 0, 0]} />
        <Bar dataKey="active" stackId="a" fill="var(--color-active)" />
        <Bar dataKey="scheduled" stackId="a" fill="var(--color-scheduled)" />
        <Bar dataKey="retry" stackId="a" fill="var(--color-retry)" />
        <Bar dataKey="archived" stackId="a" fill="var(--color-archived)" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ChartContainer>
  )
}
