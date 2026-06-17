'use client'

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  ChevronsLeft,
  ChevronsRight,
  Clock,
  FastForward,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { PlaybackTimeline } from '@/lib/types/playback'
import PlaybackEventLog from './PlaybackEventLog'

interface PlaybackControlProps {
  timeline: PlaybackTimeline
  isPlaying: boolean
  currentTime: number
  playbackSpeed: number
  onPlay: () => void
  onPause: () => void
  onSeek: (time: number) => void
  onSpeedChange: (speed: number) => void
  onIncidentChange: (incidentId: string) => void
}

const speedOptions = [0.5, 1, 2, 4, 8]

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

export default function PlaybackControl({
  timeline,
  isPlaying,
  currentTime,
  playbackSpeed,
  onPlay,
  onPause,
  onSeek,
  onSpeedChange,
  onIncidentChange,
}: PlaybackControlProps) {
  const visibleEvents = useMemo(() => {
    return timeline.events.filter((e) => e.timestamp <= currentTime)
  }, [timeline.events, currentTime])

  const markerPositions = useMemo(() => {
    return timeline.markers.map((marker) => ({
      ...marker,
      position: (marker.timestamp / timeline.duration) * 100,
    }))
  }, [timeline.markers, timeline.duration])

  const handleRewind = () => onSeek(0)
  const handleForward = () => onSeek(timeline.duration)
  const handlePrevFrame = () => onSeek(Math.max(0, currentTime - 1))
  const handleNextFrame = () => onSeek(Math.min(timeline.duration, currentTime + 1))
  const handleTogglePlay = () => (isPlaying ? onPause() : onPlay())
  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSeek(Number(e.target.value))
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed bottom-0 left-0 right-0 z-[1000] border-t border-border bg-bg-secondary/95 backdrop-blur-md"
      >
        <div className="mx-auto max-w-7xl px-4 py-3">
          <div className="mb-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-text-secondary">事件选择:</label>
              <select
                value={timeline.incidentId}
                onChange={(e) => onIncidentChange(e.target.value)}
                className="rounded-lg border border-border bg-bg-tertiary px-3 py-1.5 text-sm text-text-primary focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue"
              >
                {timeline.incidents.map((incident) => (
                  <option key={incident.id} value={incident.id}>
                    {incident.title} - {incident.address}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2 text-sm text-text-muted">
              <Clock size={14} />
              <span>
                {formatTime(currentTime)} / {formatTime(timeline.duration)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRewind}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-bg-tertiary text-text-secondary transition-colors hover:bg-bg-hover hover:text-text-primary"
                title="跳转到开始"
              >
                <ChevronsLeft size={16} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handlePrevFrame}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-bg-tertiary text-text-secondary transition-colors hover:bg-bg-hover hover:text-text-primary"
                title="上一帧"
              >
                <SkipBack size={16} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleTogglePlay}
                className={cn(
                  'flex h-12 w-12 items-center justify-center rounded-xl border-2 text-white transition-all shadow-lg',
                  isPlaying
                    ? 'border-accent-blue/50 bg-accent-blue hover:bg-accent-blue/90'
                    : 'border-accent-green/50 bg-accent-green hover:bg-accent-green/90'
                )}
                title={isPlaying ? '暂停' : '播放'}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={isPlaying ? 'pause' : 'play'}
                    initial={{ opacity: 0, rotate: -90 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: 90 }}
                    transition={{ duration: 0.15 }}
                  >
                    {isPlaying ? <Pause size={24} /> : <Play size={24} className="ml-0.5" />}
                  </motion.div>
                </AnimatePresence>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleNextFrame}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-bg-tertiary text-text-secondary transition-colors hover:bg-bg-hover hover:text-text-primary"
                title="下一帧"
              >
                <SkipForward size={16} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleForward}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-bg-tertiary text-text-secondary transition-colors hover:bg-bg-hover hover:text-text-primary"
                title="跳转到结尾"
              >
                <ChevronsRight size={16} />
              </motion.button>
            </div>

            <div className="flex items-center gap-2">
              <FastForward size={14} className="text-text-secondary" />
              <select
                value={playbackSpeed}
                onChange={(e) => onSpeedChange(Number(e.target.value))}
                className="rounded-lg border border-border bg-bg-tertiary px-2 py-1.5 text-sm text-text-primary focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue"
              >
                {speedOptions.map((speed) => (
                  <option key={speed} value={speed}>
                    {speed}x
                  </option>
                ))}
              </select>
            </div>

            <div className="relative flex-1">
              <div className="relative h-2">
                <div className="absolute inset-0 rounded-full bg-bg-tertiary" />
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-accent-blue"
                  style={{ width: `${(currentTime / timeline.duration) * 100}%` }}
                />
                <div className="absolute inset-0 flex items-center">
                  {markerPositions.map((marker) => (
                    <div
                      key={marker.id}
                      className="absolute h-3 w-3 -translate-x-1/2 rounded-full border-2 border-bg-secondary"
                      style={{
                        left: `${marker.position}%`,
                        backgroundColor: marker.color,
                      }}
                      title={`${marker.type} at ${formatTime(marker.timestamp)}`}
                    />
                  ))}
                </div>
                <input
                  type="range"
                  min={0}
                  max={timeline.duration}
                  step={0.1}
                  value={currentTime}
                  onChange={handleProgressChange}
                  className="absolute inset-0 h-full w-full cursor-pointer appearance-none bg-transparent [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-accent-blue [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:bg-accent-blue [&::-moz-range-thumb]:shadow-lg"
                />
              </div>
            </div>

            <div className="h-32 w-80 overflow-hidden rounded-lg border border-border bg-bg-tertiary/50">
              <PlaybackEventLog events={visibleEvents} currentTime={currentTime} />
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
