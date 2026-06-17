'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Thermometer, MapPin, Activity } from 'lucide-react'
import { useFireCommandStore } from '@/store'
import type { SensorData } from '@/lib/types'

type SortKey = 'name' | 'heartRate' | 'temperature'

function getHeartRateColor(hr: number): string {
  if (hr < 110) return 'text-green-400'
  if (hr < 140) return 'text-amber-400'
  return 'text-red-400'
}

function getHeartRateBg(hr: number): string {
  if (hr < 110) return 'bg-green-400/10'
  if (hr < 140) return 'bg-amber-400/10'
  return 'bg-red-400/10'
}

function isOnline(timestamp: string): boolean {
  const diff = Date.now() - new Date(timestamp).getTime()
  return diff < 300000
}

function formatTimestamp(timestamp: string): string {
  return new Date(timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

export default function FirefighterTracker() {
  const sensorData = useFireCommandStore((s) => s.sensorData)
  const [sortBy, setSortBy] = useState<SortKey>('name')

  const sorted = [...sensorData].sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name, 'zh-CN')
    if (sortBy === 'heartRate') return b.heartRate - a.heartRate
    return b.temperature - a.temperature
  })

  return (
    <div className="flex h-full flex-col">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text-primary">消防员实时状态</h3>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortKey)}
          className="rounded-md border border-border bg-bg-tertiary px-2 py-1 text-xs text-text-secondary outline-none focus:border-accent-blue"
        >
          <option value="name">按姓名</option>
          <option value="heartRate">按心率</option>
          <option value="temperature">按体温</option>
        </select>
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto">
        <AnimatePresence mode="popLayout">
          {sorted.map((ff) => (
            <FirefighterCard key={ff.firefighterId} ff={ff} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

function FirefighterCard({ ff }: { ff: SensorData }) {
  const online = isOnline(ff.timestamp)
  const hrColor = getHeartRateColor(ff.heartRate)
  const hrBg = getHeartRateBg(ff.heartRate)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.25 }}
      className="rounded-lg border border-border bg-bg-tertiary p-3"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-bg-secondary text-xs font-bold text-text-primary">
              {ff.name[0]}
            </div>
            <span
              className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-bg-tertiary ${online ? 'bg-green-400' : 'bg-gray-500'}`}
            />
          </div>
          <div>
            <p className="text-sm font-medium text-text-primary">{ff.name}</p>
            <p className="text-[10px] text-text-muted">{ff.firefighterId}</p>
          </div>
        </div>
        <span className={`text-[10px] ${online ? 'text-green-400' : 'text-gray-500'}`}>
          {online ? '在线' : '离线'}
        </span>
      </div>
      <div className="mt-2 grid grid-cols-3 gap-2">
        <div className={`flex items-center gap-1.5 rounded-md px-2 py-1 ${hrBg}`}>
          <Heart className={`h-3 w-3 ${hrColor}`} />
          <span className={`text-xs font-semibold ${hrColor}`}>{ff.heartRate}</span>
          <span className="text-[9px] text-text-muted">bpm</span>
        </div>
        <div className="flex items-center gap-1.5 rounded-md bg-orange-400/10 px-2 py-1">
          <Thermometer className="h-3 w-3 text-orange-400" />
          <span className="text-xs font-semibold text-orange-400">{ff.temperature.toFixed(1)}</span>
          <span className="text-[9px] text-text-muted">°C</span>
        </div>
        <div className="flex items-center gap-1.5 rounded-md bg-accent-blue/10 px-2 py-1">
          <MapPin className="h-3 w-3 text-accent-blue" />
          <span className="text-[9px] text-text-muted truncate">
            {ff.location.lat.toFixed(3)},{ff.location.lng.toFixed(3)}
          </span>
        </div>
      </div>
      <div className="mt-1.5 flex items-center gap-1 text-[9px] text-text-muted">
        <Activity className="h-2.5 w-2.5" />
        更新: {formatTimestamp(ff.timestamp)}
      </div>
    </motion.div>
  )
}
