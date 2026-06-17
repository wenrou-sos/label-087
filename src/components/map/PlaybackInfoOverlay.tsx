'use client'

import { motion } from 'framer-motion'
import { Clock, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getFireLevelColor, getFireLevelLabel } from '@/lib/utils'
import StatusBadge from '@/components/ui/StatusBadge'
import type { PlaybackState } from '@/lib/types/playback'

interface PlaybackInfoOverlayProps {
  state: PlaybackState
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

export default function PlaybackInfoOverlay({ state }: PlaybackInfoOverlayProps) {
  const activeAlertsCount = state.activeAlerts?.length || 0

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="absolute right-4 top-20 z-[1000] w-64 rounded-lg border border-border bg-bg-secondary/95 p-3 shadow-lg backdrop-blur-md"
    >
      <h3 className="mb-3 text-xs font-semibold text-text-muted uppercase tracking-wider">
        回放状态
      </h3>

      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-sm text-text-secondary">事件状态</span>
          <StatusBadge status={state.incidentStatus} type="incident" />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-text-secondary">火势等级</span>
          <div className="flex items-center gap-2">
            <span
              className={cn('h-2.5 w-2.5 rounded-full')}
              style={{ backgroundColor: getFireLevelColor(state.fireLevel) }}
            />
            <span className="text-sm text-text-primary">
              {getFireLevelLabel(state.fireLevel)}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-text-secondary">活动告警</span>
          <div
            className={cn(
              'flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium',
              activeAlertsCount > 0
                ? 'bg-red-500/20 text-red-400'
                : 'bg-green-500/20 text-green-400'
            )}
          >
            <AlertTriangle size={12} />
            {activeAlertsCount} 个
          </div>
        </div>

        <div className="border-t border-border pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-text-secondary">
              <Clock size={14} />
              <span className="text-sm">当前时间</span>
            </div>
            <span className="font-mono text-sm text-text-primary">
              {formatTime(state.currentTime)}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
