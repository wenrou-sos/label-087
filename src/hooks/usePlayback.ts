'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useFireCommandStore } from '@/store'
import { getPlaybackStateAtTime, generatePlaybackTimeline } from '@/lib/playback-data'

const TICK_INTERVAL_MS = 50

export function usePlayback() {
  const playback = useFireCommandStore((s) => s.playback)
  const enablePlayback = useFireCommandStore((s) => s.enablePlayback)
  const disablePlayback = useFireCommandStore((s) => s.disablePlayback)
  const setPlaybackPlaying = useFireCommandStore((s) => s.setPlaybackPlaying)
  const setPlaybackTime = useFireCommandStore((s) => s.setPlaybackTime)
  const setPlaybackSpeed = useFireCommandStore((s) => s.setPlaybackSpeed)
  const setPlaybackState = useFireCommandStore((s) => s.setPlaybackState)

  const incidents = useFireCommandStore((s) => s.incidents)
  const stations = useFireCommandStore((s) => s.stations)
  const vehicles = useFireCommandStore((s) => s.vehicles)

  const intervalRef = useRef<number | null>(null)
  const lastTickRef = useRef<number>(0)

  const resolvedIncidents = incidents.filter((i) => i.status === 'resolved')

  const updateStateForTime = useCallback((timeSec: number) => {
    const timeline = useFireCommandStore.getState().playback.timeline
    if (!timeline) return
    const state = getPlaybackStateAtTime(timeline, timeSec * 1000)
    setPlaybackState(state)
  }, [setPlaybackState])

  const tick = useCallback(() => {
    const state = useFireCommandStore.getState()
    const { isPlaying, currentTime, playbackSpeed, timeline } = state.playback

    if (!isPlaying || !timeline) return

    const now = performance.now()
    const deltaSec = (now - lastTickRef.current) / 1000
    lastTickRef.current = now

    const nextTime = currentTime + deltaSec * playbackSpeed

    if (nextTime >= timeline.duration) {
      const endTime = timeline.duration
      setPlaybackTime(endTime)
      updateStateForTime(endTime)
      setPlaybackPlaying(false)
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    setPlaybackTime(nextTime)
    updateStateForTime(nextTime)
  }, [setPlaybackTime, setPlaybackPlaying, updateStateForTime])

  useEffect(() => {
    if (playback.isPlaying && playback.timeline) {
      lastTickRef.current = performance.now()
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      intervalRef.current = window.setInterval(tick, TICK_INTERVAL_MS)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [playback.isPlaying, playback.timeline, tick])

  const handlePlay = useCallback(() => {
    const state = useFireCommandStore.getState()
    if (state.playback.timeline && state.playback.currentTime >= state.playback.timeline.duration) {
      setPlaybackTime(0)
      updateStateForTime(0)
    }
    lastTickRef.current = performance.now()
    setPlaybackPlaying(true)
  }, [setPlaybackTime, setPlaybackPlaying, updateStateForTime])

  const handlePause = useCallback(() => {
    setPlaybackPlaying(false)
  }, [setPlaybackPlaying])

  const handleSeek = useCallback((time: number) => {
    setPlaybackTime(time)
    updateStateForTime(time)
  }, [setPlaybackTime, updateStateForTime])

  const handleSpeedChange = useCallback((speed: number) => {
    setPlaybackSpeed(speed)
  }, [setPlaybackSpeed])

  const handleIncidentChange = useCallback((incidentId: string) => {
    const state = useFireCommandStore.getState()
    const incident = state.incidents.find((i) => i.id === incidentId)
    if (!incident) return

    const firefighters = [
      { id: 'ff-001', name: '张伟', vehicleId: 'v-002' },
      { id: 'ff-002', name: '李强', vehicleId: 'v-002' },
      { id: 'ff-003', name: '王磊', vehicleId: 'v-004' },
      { id: 'ff-004', name: '刘洋', vehicleId: 'v-006' },
      { id: 'ff-005', name: '陈杰', vehicleId: 'v-006' },
      { id: 'ff-006', name: '赵鹏', vehicleId: 'v-004' },
    ]

    const timeline = generatePlaybackTimeline(incident, state.stations, state.vehicles, firefighters)
    const initialState = getPlaybackStateAtTime(timeline, 0)
    enablePlayback(incidentId, timeline)
    setPlaybackState(initialState)
  }, [enablePlayback, setPlaybackState])

  const handleEnablePlayback = useCallback((incidentId: string) => {
    handleIncidentChange(incidentId)
  }, [handleIncidentChange])

  const handleDisablePlayback = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    disablePlayback()
  }, [disablePlayback])

  return {
    playback,
    resolvedIncidents,
    handlePlay,
    handlePause,
    handleSeek,
    handleSpeedChange,
    handleIncidentChange,
    handleEnablePlayback,
    handleDisablePlayback,
  }
}
