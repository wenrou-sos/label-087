'use client'

import { AlertTriangle, Truck, Users, Bell } from 'lucide-react'
import { motion } from 'framer-motion'
import { useFireCommandStore } from '@/store'
import AnimatedNumber from '@/components/ui/AnimatedNumber'

const cards = [
  {
    key: 'incidents',
    label: '活跃警情',
    icon: AlertTriangle,
    accent: 'text-accent-red',
    gradient: 'from-accent-red/10 to-transparent',
    dot: 'bg-accent-red',
    glow: 'glow-red',
  },
  {
    key: 'vehicles',
    label: '出动车辆',
    icon: Truck,
    accent: 'text-accent-blue',
    gradient: 'from-accent-blue/10 to-transparent',
    dot: 'bg-accent-blue',
    glow: 'glow-blue',
  },
  {
    key: 'personnel',
    label: '在线人员',
    icon: Users,
    accent: 'text-accent-green',
    gradient: 'from-accent-green/10 to-transparent',
    dot: 'bg-accent-green',
    glow: 'glow-green',
  },
  {
    key: 'alerts',
    label: '活跃告警',
    icon: Bell,
    accent: 'text-accent-amber',
    gradient: 'from-accent-amber/10 to-transparent',
    dot: 'bg-accent-amber',
    glow: 'glow-amber',
  },
] as const

export default function StatsCards() {
  const incidents = useFireCommandStore((s) => s.incidents)
  const vehicles = useFireCommandStore((s) => s.vehicles)
  const sensorData = useFireCommandStore((s) => s.sensorData)
  const alerts = useFireCommandStore((s) => s.alerts)

  const activeIncidents = incidents.filter((i) => i.status !== 'resolved').length
  const dispatchedVehicles = vehicles.filter((v) => v.status !== 'available').length
  const onlinePersonnel = sensorData.length
  const activeAlerts = alerts.filter((a) => !a.acknowledged).length

  const values = {
    incidents: activeIncidents,
    vehicles: dispatchedVehicles,
    personnel: onlinePersonnel,
    alerts: activeAlerts,
  }

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map((card, index) => {
        const Icon = card.icon
        return (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className={`relative overflow-hidden rounded-lg border border-border bg-bg-tertiary p-4 ${card.glow}`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient}`} />
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">{card.label}</p>
                <AnimatedNumber
                  value={values[card.key]}
                  className={`text-3xl font-bold ${card.accent}`}
                />
              </div>
              <div className={`rounded-lg p-3 ${card.accent} bg-bg-secondary/50`}>
                <Icon className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-2 flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${card.dot}`} />
              <span className="text-xs text-text-muted">实时数据</span>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
