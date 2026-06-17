'use client'

import { motion } from 'framer-motion'
import { useFireCommandStore } from '@/store'
import { getVehicleTypeLabel } from '@/lib/utils'
import type { VehicleType } from '@/lib/types'

const vehicleTypes: VehicleType[] = ['water_tanker', 'ladder', 'rescue', 'command', 'foam']

const typeColors: Record<VehicleType, string> = {
  water_tanker: 'bg-accent-blue',
  ladder: 'bg-accent-amber',
  rescue: 'bg-accent-red',
  command: 'bg-accent-green',
  foam: 'bg-purple-500',
}

const typeTrackColors: Record<VehicleType, string> = {
  water_tanker: 'bg-accent-blue/20',
  ladder: 'bg-accent-amber/20',
  rescue: 'bg-accent-red/20',
  command: 'bg-accent-green/20',
  foam: 'bg-purple-500/20',
}

export default function ResourceOverview() {
  const vehicles = useFireCommandStore((s) => s.vehicles)

  const vehicleStats = vehicleTypes.map((type) => {
    const typeVehicles = vehicles.filter((v) => v.type === type)
    const total = typeVehicles.length
    const available = typeVehicles.filter((v) => v.status === 'available').length
    const percentage = total > 0 ? (available / total) * 100 : 0

    return { type, total, available, percentage }
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4 }}
      className="rounded-lg border border-border bg-bg-tertiary"
    >
      <div className="border-b border-border px-4 py-3">
        <h2 className="text-base font-semibold text-text-primary">车辆资源</h2>
      </div>

      <div className="space-y-4 p-4">
        {vehicleStats.map((stat) => (
          <div key={stat.type}>
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-sm font-medium text-text-secondary">
                {getVehicleTypeLabel(stat.type)}
              </span>
              <span className="text-sm text-text-muted">
                <span className="font-medium text-text-primary">{stat.available}</span>
                <span className="mx-0.5">/</span>
                <span>{stat.total}</span>
              </span>
            </div>
            <div className={`h-2 w-full overflow-hidden rounded-full ${typeTrackColors[stat.type]}`}>
              <motion.div
                className={`h-full rounded-full ${typeColors[stat.type]}`}
                initial={{ width: 0 }}
                animate={{ width: `${stat.percentage}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
