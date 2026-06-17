'use client'

import { MapPin, Clock, Truck } from 'lucide-react'
import { motion } from 'framer-motion'
import type { FireStation, Vehicle } from '@/lib/types'
import { getVehicleTypeLabel } from '@/lib/utils'
import StatusBadge from '@/components/ui/StatusBadge'

interface StationCardProps {
  station: FireStation
  distance: number
  eta: number
  isNearest: boolean
}

const vehicleStatusIcon: Record<string, string> = {
  available: 'text-green-400',
  dispatched: 'text-amber-400',
  en_route: 'text-blue-400',
  on_scene: 'text-blue-400',
  returning: 'text-gray-400',
}

export default function StationCard({ station, distance, eta, isNearest }: StationCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`rounded-lg border bg-bg-tertiary p-4 transition-shadow ${
        isNearest
          ? 'border-blue-500/50 shadow-[0_0_12px_rgba(59,130,246,0.25)]'
          : 'border-border'
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-semibold text-text-primary">
            {isNearest && (
              <span className="mr-1.5 inline-flex items-center rounded bg-blue-500/20 px-1.5 py-0.5 text-xs text-blue-400">
                最近
              </span>
            )}
            {station.name}
          </h3>
          <div className="mt-1 flex items-center gap-1 text-xs text-text-muted">
            <MapPin className="h-3 w-3" />
            <span className="max-w-[220px] truncate">{station.address}</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="text-sm font-semibold text-text-primary">
            {distance.toFixed(1)} km
          </span>
          <span className="flex items-center gap-1 text-xs text-text-muted">
            <Clock className="h-3 w-3" />
            约{eta}分钟
          </span>
        </div>
      </div>

      <div className="mt-3 border-t border-border pt-3">
        <p className="mb-2 text-xs text-text-muted">驻站车辆</p>
        <div className="flex flex-wrap gap-2">
          {station.vehicles.map((vehicle: Vehicle) => (
            <div
              key={vehicle.id}
              className="flex items-center gap-1.5 rounded-md bg-bg-primary px-2 py-1"
            >
              <Truck className={`h-3.5 w-3.5 ${vehicleStatusIcon[vehicle.status] ?? 'text-gray-400'}`} />
              <span className="text-xs text-text-secondary">
                {getVehicleTypeLabel(vehicle.type)}
              </span>
              <StatusBadge status={vehicle.status} type="vehicle" />
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
