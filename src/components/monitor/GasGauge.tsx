'use client'

import { motion } from 'framer-motion'

interface GasGaugeProps {
  label: string
  value: number
  unit: string
  maxRange: number
  threshold: number
}

function getColor(value: number, threshold: number, maxRange: number): string {
  if (value < threshold * 0.8) return '#22c55e'
  if (value < threshold) return '#f59e0b'
  return '#ef4444'
}

export default function GasGauge({ label, value, unit, maxRange, threshold }: GasGaugeProps) {
  const size = 140
  const strokeWidth = 10
  const radius = (size - strokeWidth) / 2
  const cx = size / 2
  const cy = size / 2
  const startAngle = 225
  const endAngle = -45
  const totalAngle = startAngle - endAngle

  const clampedValue = Math.min(Math.max(value, 0), maxRange)
  const ratio = clampedValue / maxRange
  const valueAngle = startAngle - ratio * totalAngle

  const polarToCartesian = (angle: number) => {
    const rad = (angle * Math.PI) / 180
    return {
      x: cx + radius * Math.cos(rad),
      y: cy - radius * Math.sin(rad),
    }
  }

  const arcPath = (start: number, end: number) => {
    const s = polarToCartesian(start)
    const e = polarToCartesian(end)
    const largeArc = start - end > 180 ? 1 : 0
    return `M ${s.x} ${s.y} A ${radius} ${radius} 0 ${largeArc} 1 ${e.x} ${e.y}`
  }

  const thresholdAngle = startAngle - (threshold / maxRange) * totalAngle
  const thresholdPos = polarToCartesian(thresholdAngle)

  const color = getColor(value, threshold, maxRange)

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} className="overflow-visible">
        <path
          d={arcPath(startAngle, endAngle)}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        <motion.path
          d={arcPath(startAngle, valueAngle)}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
        <motion.circle
          cx={thresholdPos.x}
          cy={thresholdPos.y}
          r={3}
          fill="#f59e0b"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5 }}
        />
        <motion.text
          x={cx}
          y={cy - 4}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={color}
          fontSize={22}
          fontWeight="bold"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {clampedValue.toFixed(0)}
        </motion.text>
        <text
          x={cx}
          y={cy + 16}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="rgba(255,255,255,0.4)"
          fontSize={10}
        >
          {unit}
        </text>
      </svg>
      <span className="mt-1 text-xs text-text-secondary">{label}</span>
    </div>
  )
}
