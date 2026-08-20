"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart"

const chartConfig = {
  vagas: {
    label: "Vagas",
    color: "var(--chart-1)",
  },
  inscritos: {
    label: "Inscritos",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig

type Ponto = { nome: string; vagas: number; inscritos: number }

export function GraficoVagas({ data }: { data: Ponto[] }) {
  return (
    <ChartContainer config={chartConfig} className="h-[280px] w-full">
      <BarChart accessibilityLayer data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="nome"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(v: string) => (v.length > 14 ? v.slice(0, 12) + "…" : v)}
        />
        <YAxis tickLine={false} axisLine={false} tickMargin={8} width={40} allowDecimals={false} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="vagas" fill="var(--color-vagas)" radius={[4, 4, 0, 0]} />
        <Bar dataKey="inscritos" fill="var(--color-inscritos)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ChartContainer>
  )
}
