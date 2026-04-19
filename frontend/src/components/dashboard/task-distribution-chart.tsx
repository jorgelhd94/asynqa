import { Cell, Pie, PieChart, Label } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart"
import type { dashboard } from "../../../wailsjs/go/models"

const STATE_COLORS: Record<string, string> = {
  pending: "#a3a3a3",
  active: "#10b981",
  scheduled: "#3b82f6",
  retry: "#f59e0b",
  archived: "#f43f5e",
  completed: "#d4a843",
}

const chartConfig = {
  count: { label: "Tasks" },
  pending: { label: "Pending", color: STATE_COLORS.pending },
  active: { label: "Active", color: STATE_COLORS.active },
  scheduled: { label: "Scheduled", color: STATE_COLORS.scheduled },
  retry: { label: "Retry", color: STATE_COLORS.retry },
  archived: { label: "Archived", color: STATE_COLORS.archived },
  completed: { label: "Completed", color: STATE_COLORS.completed },
} satisfies ChartConfig

export function TaskDistributionChart({ queues }: { queues: dashboard.QueueStats[] }) {
  const totals = queues.reduce(
    (acc, q) => {
      acc.pending += q.pending
      acc.active += q.active
      acc.scheduled += q.scheduled
      acc.retry += q.retry
      acc.archived += q.archived
      acc.completed += q.completed
      return acc
    },
    { pending: 0, active: 0, scheduled: 0, retry: 0, archived: 0, completed: 0 }
  )

  const data = Object.entries(totals)
    .filter(([, v]) => v > 0)
    .map(([state, count]) => ({ state, count, fill: STATE_COLORS[state] }))

  const total = data.reduce((sum, d) => sum + d.count, 0)

  if (data.length === 0) {
    return (
      <div className="flex h-[280px] items-center justify-center text-xs text-(--color-text-muted)">
        No tasks to display
      </div>
    )
  }

  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-[280px] w-full">
      <PieChart>
        <ChartTooltip content={<ChartTooltipContent nameKey="state" hideLabel />} />
        <Pie
          data={data}
          dataKey="count"
          nameKey="state"
          innerRadius={60}
          outerRadius={90}
          strokeWidth={2}
          stroke="#171717"
          paddingAngle={2}
        >
          {data.map((entry) => (
            <Cell key={entry.state} fill={entry.fill} />
          ))}
          <Label
            content={({ viewBox }) => {
              if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                return (
                  <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                    <tspan x={viewBox.cx} y={(viewBox.cy ?? 0) - 8} className="fill-(--color-text-primary) text-2xl font-bold">
                      {total.toLocaleString()}
                    </tspan>
                    <tspan x={viewBox.cx} y={(viewBox.cy ?? 0) + 12} className="fill-(--color-text-muted) text-xs">
                      total
                    </tspan>
                  </text>
                )
              }
            }}
          />
        </Pie>
        <ChartLegend content={<ChartLegendContent nameKey="state" />} />
      </PieChart>
    </ChartContainer>
  )
}
