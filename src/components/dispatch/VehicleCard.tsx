'use client'

import { Truck, Navigation } from 'lucide-react'
import { motion } from 'framer-motion'
import type { Vehicle } from '@/lib/types'
import { getVehicleTypeLabel } from '@/lib/utils'
import StatusBadge from '@/components/ui/StatusBadge'

interface VehicleCardProps {
  vehicle: Vehicle
}

const statusColorMap: Record<string, string> = {
  available: 'bg-green-400',
  dispatched: 'bg-amber-400',
  en_route: 'bg-blue-400',
  on_scene: 'bg-blue-400',
  returning: 'bg-gray-400',
}

const progressColorMap: Record<string, string> = {
  en_route: 'bg-blue-500',
  on_scene: 'bg-blue-500',
}

const activeStatuses = new Set(['dispatched', 'en_route', 'on_scene'])

export default function VehicleCard({ vehicle }: VehicleCardProps) {
  const isActive = activeStatuses.has(vehicle.status)
  const showProgress = vehicle.status === 'en_route' || vehicle.status === 'on_scene'
  const progressPercent = vehicle.estimatedArrival
    ? Math.min(100, Math.max(10, 100 - (vehicle.estimatedArrival / 30) * 100))
    : 50

  return (
    <motion.div
      initial={{ opacity: 0, x: 8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25 }}
      className="rounded-lg border border-border bg-bg-tertiary p-3"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Truck className="h-4 w-4 text-text-secondary" />
            {isActive && (
              <span
                className={`absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full ${statusColorMap[vehicle.status]} animate-pulse`}
              />
            )}
          </div>
          <span className="text-sm font-medium text-text-primary">{vehicle.name}</span>
          <span className="text-xs text-text-muted">({getVehicleTypeLabel(vehicle.type)})</span>
        </div>
        <StatusBadge status={vehicle.status} type="vehicle" />
      </div>

      {showProgress && (
        <div className="mt-2">
          <div className="flex items-center justify-between text-xs text-text-muted">
            <span>预计到达</span>
            <span>{vehicle.estimatedArrival ? `${vehicle.estimatedArrival}分钟` : '--'}</span>
          </div>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-bg-primary">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className={`h-full rounded-full ${progressColorMap[vehicle.status] ?? 'bg-blue-500'}`}
            />
          </div>
        </div>
      )}

      <div className="mt-2 flex items-center gap-1.5 rounded bg-bg-primary px-2 py-1.5">
        <Navigation className="h-3 w-3 text-text-muted" />
        <span className="text-xs text-text-muted">
          {vehicle.currentLocation.lat.toFixed(4)}, {vehicle.currentLocation.lng.toFixed(4)}
        </span>
        <div className="ml-auto h-3 w-3 rounded-full border border-border bg-bg-tertiary">
          <div className="m-auto mt-0.5 h-1.5 w-1.5 rounded-full bg-accent-blue" />
        </div>
      </div>
    </motion.div>
  )
}
