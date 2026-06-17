'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useFireCommandStore } from '@/store'
import { getPlaybackStateAtTime, generatePlaybackTimeline } from '@/lib/playback-data'

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

  const animationFrameRef = useRef<number | null>(null)
  const lastUpdateRef = useRef<number>(0)

  const resolvedIncidents = incidents.filter((i) => i.status === 'resolved')

  const updateState = useCallback((time: number) => {
    const timeline = useFireCommandStore.getState().playback.timeline
    if (!timeline) return
    const state = getPlaybackStateAtTime(timeline, time * 1000)
    setPlaybackState(state)
  }, [setPlaybackState])

  const tick = useCallback((timestamp: number) => {
    if (!playback.isPlaying || !playback.timeline) {
      animationFrameRef.current = null
      return
    }

    const now = timestamp
    const delta = (now - lastUpdateRef.current) / 1000
    lastUpdateRef.current = now

    const nextTime = playback.currentTime + delta * playback.playbackSpeed

    if (nextTime >= playback.timeline.duration) {
      setPlaybackTime(playback.timeline.duration)
      updateState(playback.timeline.duration)
      setPlaybackPlaying(false)
      animationFrameRef.current = null
      return
    }

    setPlaybackTime(nextTime)
    updateState(nextTime)

    animationFrameRef.current = requestAnimationFrame(tick)
  }, [playback.isPlaying, playback.timeline, playback.currentTime, playback.playbackSpeed, setPlaybackTime, setPlaybackPlaying, updateState])

  useEffect(() => {
    if (playback.isPlaying && playback.timeline) {
      lastUpdateRef.current = performance.now()
      animationFrameRef.current = requestAnimationFrame(tick)
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
    }
  }, [playback.isPlaying, playback.timeline, tick])

  const handlePlay = useCallback(() => {
    if (playback.timeline && playback.currentTime >= playback.timeline.duration) {
      setPlaybackTime(0)
      updateState(0)
    }
    setPlaybackPlaying(true)
  }, [playback.timeline, playback.currentTime, setPlaybackTime, setPlaybackPlaying, updateState])

  const handlePause = useCallback(() => {
    setPlaybackPlaying(false)
  }, [setPlaybackPlaying])

  const handleSeek = useCallback((time: number) => {
    setPlaybackTime(time)
    updateState(time)
  }, [setPlaybackTime, updateState])

  const handleSpeedChange = useCallback((speed: number) => {
    setPlaybackSpeed(speed)
  }, [setPlaybackSpeed])

  const handleIncidentChange = useCallback((incidentId: string) => {
    const incident = incidents.find((i) => i.id === incidentId)
    if (!incident) return

    const firefighters = [
      { id: 'ff-001', name: '张伟', vehicleId: 'v-002' },
      { id: 'ff-002', name: '李强', vehicleId: 'v-002' },
      { id: 'ff-003', name: '王磊', vehicleId: 'v-004' },
      { id: 'ff-004', name: '刘洋', vehicleId: 'v-006' },
      { id: 'ff-005', name: '陈杰', vehicleId: 'v-006' },
      { id: 'ff-006', name: '赵鹏', vehicleId: 'v-004' },
    ]

    const timeline = generatePlaybackTimeline(incident, stations, vehicles, firefighters)
    const initialState = getPlaybackStateAtTime(timeline, 0)
    enablePlayback(incidentId, timeline)
    setPlaybackState(initialState)
  }, [incidents, stations, vehicles, enablePlayback, setPlaybackState])

  const handleEnablePlayback = useCallback((incidentId: string) => {
    handleIncidentChange(incidentId)
  }, [handleIncidentChange])

  const handleDisablePlayback = useCallback(() => {
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
