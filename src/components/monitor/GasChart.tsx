'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'

interface GasDataPoint {
  time: string
  co: number
  co2: number
  h2s: number
  ch4: number
}

interface GasChartProps {
  data: GasDataPoint[]
}

const THRESHOLDS = {
  co: 50,
  co2: 1000,
  h2s: 10,
  ch4: 25,
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) => {
  if (!active || !payload) return null
  return (
    <div className="rounded-lg border border-border bg-bg-tertiary px-3 py-2 shadow-lg">
      <p className="mb-1 text-xs text-text-muted">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} className="text-xs" style={{ color: entry.color }}>
          {entry.name}: {entry.value.toFixed(1)}
        </p>
      ))}
    </div>
  )
}

export default function GasChart({ data }: GasChartProps) {
  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis
            dataKey="time"
            tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: 11, paddingTop: 4 }}
            formatter={(value: string) => <span style={{ color: 'rgba(255,255,255,0.7)' }}>{value}</span>}
          />
          <ReferenceLine y={THRESHOLDS.co} stroke="#ef4444" strokeDasharray="4 4" strokeOpacity={0.5} />
          <ReferenceLine y={THRESHOLDS.h2s} stroke="#f59e0b" strokeDasharray="4 4" strokeOpacity={0.5} />
          <Line type="monotone" dataKey="co" name="CO" stroke="#ef4444" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="co2" name="CO₂" stroke="#3b82f6" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="h2s" name="H₂S" stroke="#f59e0b" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="ch4" name="CH₄" stroke="#a855f7" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
