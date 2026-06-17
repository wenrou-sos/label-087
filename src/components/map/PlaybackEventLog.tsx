'use client'

import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Truck, Users, Flame, AlertTriangle, Bell, BellOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { PlaybackEvent, PlaybackEventType } from '@/lib/types/playback'

interface PlaybackEventLogProps {
  events: PlaybackEvent[]
  currentTime: number
}

const eventTypeConfig: Record<
  PlaybackEventType,
  { icon: typeof Truck; color: string; bgColor?: string }
> = {
  vehicle_move: { icon: Truck, color: 'text-blue-400' },
  firefighter_move: { icon: Users, color: 'text-green-400' },
  fire_level_change: { icon: Flame, color: 'text-red-400' },
  status_change: { icon: AlertTriangle, color: 'text-amber-400' },
  alert_trigger: { icon: Bell, color: 'text-white', bgColor: 'bg-red-500' },
  alert_clear: { icon: BellOff, color: 'text-green-400' },
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

export default function PlaybackEventLog({ events, currentTime }: PlaybackEventLogProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [events.length])

  const visibleEvents = events.filter((e) => e.timestamp <= currentTime)

  return (
    <div ref={scrollRef} className="h-full overflow-y-auto p-2">
      <AnimatePresence initial={false}>
        {visibleEvents.length === 0 ? (
          <div className="flex h-full items-center justify-center text-xs text-text-muted">
            暂无事件
          </div>
        ) : (
          visibleEvents.map((event, index) => {
            const config = eventTypeConfig[event.type]
            const Icon = config.icon
            const isLatest = index === visibleEvents.length - 1

            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  'mb-1.5 flex items-start gap-2 rounded-md px-2 py-1.5 text-xs transition-colors',
                  isLatest ? 'bg-accent-blue/10 border border-accent-blue/30' : 'hover:bg-bg-hover'
                )}
              >
                <div
                  className={cn(
                    'mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded',
                    config.bgColor ?? 'bg-transparent'
                  )}
                >
                  <Icon size={12} className={config.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-text-muted">{formatTime(event.timestamp)}</span>
                    {isLatest && (
                      <span className="rounded bg-accent-blue/20 px-1 text-[10px] text-accent-blue">
                        最新
                      </span>
                    )}
                  </div>
                  <p className={cn('truncate', isLatest ? 'text-text-primary' : 'text-text-secondary')}>
                    {event.description}
                  </p>
                </div>
              </motion.div>
            )
          })
        )}
      </AnimatePresence>
    </div>
  )
}
