'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, AlertOctagon } from 'lucide-react'
import { useFireCommandStore } from '@/store'

export default function AlertPanel() {
  const alerts = useFireCommandStore((s) => s.alerts)
  const acknowledgeAlert = useFireCommandStore((s) => s.acknowledgeAlert)
  const sensorData = useFireCommandStore((s) => s.sensorData)

  const activeAlerts = alerts.filter((a) => !a.acknowledged)
  const getFirefighterName = (id: string) => sensorData.find((s) => s.firefighterId === id)?.name ?? id

  const formatTime = (ts: string) =>
    new Date(ts).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })

  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {activeAlerts.length === 0 && (
        <div className="flex w-full items-center justify-center py-4 text-sm text-text-muted">
          暂无活跃告警
        </div>
      )}
      <AnimatePresence mode="popLayout">
        {activeAlerts.map((alert) => {
          const isCritical = alert.severity === 'critical'
          const Icon = isCritical ? AlertOctagon : AlertTriangle
          const iconColor = isCritical ? 'text-red-400' : 'text-amber-400'

          return (
            <motion.div
              key={alert.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className={`relative flex-shrink-0 rounded-lg border p-3 min-w-[280px] max-w-[320px] ${
                isCritical
                  ? 'border-red-500/40 bg-red-500/5'
                  : 'border-amber-500/30 bg-amber-500/5'
              } ${!alert.acknowledged ? 'animate-pulse' : ''}`}
              style={{
                animation: !alert.acknowledged
                  ? 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                  : undefined,
              }}
            >
              {!alert.acknowledged && (
                <style>{`
                  @keyframes pulse-border {
                    0%, 100% { border-color: ${isCritical ? 'rgba(239,68,68,0.4)' : 'rgba(245,158,11,0.3)'}; }
                    50% { border-color: ${isCritical ? 'rgba(239,68,68,0.9)' : 'rgba(245,158,11,0.8)'}; }
                  }
                `}</style>
              )}
              <div className="flex items-start gap-2">
                <Icon className={`h-5 w-5 flex-shrink-0 mt-0.5 ${iconColor}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-text-primary leading-relaxed">
                    {alert.message}
                  </p>
                  <div className="mt-1.5 flex items-center gap-2 text-[10px] text-text-muted">
                    <span>消防员: {getFirefighterName(alert.firefighterId)}</span>
                    <span>·</span>
                    <span className="font-mono">
                      {alert.value.toFixed(1)} / {alert.threshold.toFixed(1)}
                    </span>
                  </div>
                  <div className="mt-1.5 flex items-center justify-between">
                    <span className="text-[10px] text-text-muted">{formatTime(alert.timestamp)}</span>
                    <button
                      onClick={() => acknowledgeAlert(alert.id)}
                      className="rounded px-2 py-0.5 text-[10px] font-medium text-text-secondary transition-colors hover:bg-bg-secondary hover:text-text-primary"
                    >
                      确认
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
