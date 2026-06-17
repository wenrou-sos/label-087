'use client'

import { CheckCircle, Play, Truck } from 'lucide-react'
import { motion } from 'framer-motion'
import type { DispatchPlan } from '@/lib/types'
import { getVehicleTypeLabel } from '@/lib/utils'
import StatusBadge from '@/components/ui/StatusBadge'
import StationCard from './StationCard'
import { calculateDistance, estimateArrivalTime } from '@/lib/geo'

interface DispatchPlanCardProps {
  plan: DispatchPlan & { stations: (DispatchPlan['stations'][number] & { distance?: number; estimatedArrival?: number })[] }
  onConfirm: (planId: string) => void
  onExecute: (planId: string) => void
}

export default function DispatchPlanCard({ plan, onConfirm, onExecute }: DispatchPlanCardProps) {
  const sortedStations = [...plan.stations].sort((a, b) => {
    const dA = a.distance ?? 0
    const dB = b.distance ?? 0
    return dA - dB
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-lg border border-border bg-bg-tertiary p-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-text-primary">推荐调度方案</h3>
        <StatusBadge status={plan.status} type="plan" />
      </div>

      <div className="mt-4">
        <p className="mb-2 text-xs font-medium text-text-muted">推荐站点</p>
        <div className="flex flex-col gap-2">
          {sortedStations.map((station, index) => {
            const dist = station.distance ?? calculateDistance(0, 0, station.location.lat, station.location.lng)
            const eta = station.estimatedArrival ?? estimateArrivalTime(dist)

            return (
              <StationCard
                key={station.id}
                station={station}
                distance={dist}
                eta={eta}
                isNearest={index === 0}
              />
            )
          })}
        </div>
      </div>

      <div className="mt-4 border-t border-border pt-4">
        <p className="mb-2 text-xs font-medium text-text-muted">车辆分配</p>
        <div className="flex flex-wrap gap-2">
          {plan.vehicles.map((v) => (
            <div
              key={v.type}
              className="flex items-center gap-1.5 rounded-md bg-bg-primary px-3 py-1.5"
            >
              <Truck className="h-3.5 w-3.5 text-accent-blue" />
              <span className="text-xs text-text-secondary">
                {getVehicleTypeLabel(v.type)}
              </span>
              <span className="text-xs font-semibold text-text-primary">×{v.count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 border-t border-border pt-4">
        {plan.status === 'draft' && (
          <button
            onClick={() => onConfirm(plan.id)}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            <CheckCircle className="h-4 w-4" />
            确认方案
          </button>
        )}
        {(plan.status === 'confirmed' || plan.status === 'executing') && (
          <button
            onClick={() => onExecute(plan.id)}
            className="flex items-center gap-1.5 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-700"
          >
            <Play className="h-4 w-4" />
            执行方案
          </button>
        )}
        {plan.status === 'completed' && (
          <span className="text-sm text-green-400">方案已执行完毕</span>
        )}
      </div>
    </motion.div>
  )
}
