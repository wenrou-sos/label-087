'use client'

import { Suspense, useState, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { ArrowLeft, Video, X } from 'lucide-react'
import Link from 'next/link'
import MapWrapper from '@/components/map/MapWrapper'
import LayerControl from '@/components/map/LayerControl'
import MapToolbar from '@/components/map/MapToolbar'
import MapInfoPanel from '@/components/map/MapInfoPanel'
import PlaybackControl from '@/components/map/PlaybackControl'
import PlaybackInfoOverlay from '@/components/map/PlaybackInfoOverlay'
import { useFireCommandStore } from '@/store'
import { usePlayback } from '@/hooks/usePlayback'

export default function MapCommandPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen bg-bg-primary text-text-secondary">加载中...</div>}>
      <MapCommandPageContent />
    </Suspense>
  )
}

function MapCommandPageContent() {
  const searchParams = useSearchParams()
  const incidentId = searchParams.get('incidentId') ?? undefined

  const [showWaterSources, setShowWaterSources] = useState(true)
  const [showAlertZones, setShowAlertZones] = useState(true)
  const [showRoutes, setShowRoutes] = useState(true)
  const [showVehicles, setShowVehicles] = useState(true)
  const [selectedTool, setSelectedTool] = useState<string | null>(null)
  const [clickedMarker, setClickedMarker] = useState<{ type: string; id: string } | null>(null)

  const addAnnotation = useFireCommandStore((s) => s.addAnnotation)

  const {
    playback,
    resolvedIncidents,
    handlePlay,
    handlePause,
    handleSeek,
    handleSpeedChange,
    handleIncidentChange,
    handleEnablePlayback,
    handleDisablePlayback,
  } = usePlayback()

  const handleMapClick = useCallback((lat: number, lng: number) => {
    if (!selectedTool || !incidentId) return

    const typeMap: Record<string, string> = {
      fire: 'fire_point',
      water: 'water_source',
      alert: 'alert_zone_inner',
    }

    if (typeMap[selectedTool]) {
      addAnnotation({
        id: `ann-${Date.now()}`,
        incidentId,
        type: typeMap[selectedTool] as never,
        lat,
        lng,
        radius: selectedTool === 'alert' ? 200 : undefined,
        color: selectedTool === 'fire' ? '#E53E3E' : selectedTool === 'water' ? '#3B82F6' : '#F59E0B',
        label: selectedTool === 'fire' ? '火点' : selectedTool === 'water' ? '水源' : '警戒区',
      })
    }
  }, [selectedTool, incidentId, addAnnotation])

  const handleEnterPlayback = () => {
    if (resolvedIncidents.length > 0) {
      handleEnablePlayback(resolvedIncidents[0].id)
    }
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-bg-primary">
      <div className="absolute left-0 top-0 z-[1001] flex items-center gap-3 bg-bg-secondary/90 px-4 py-2.5 backdrop-blur-sm border-b border-r border-border">
        <Link
          href="/"
          className="flex h-8 w-8 items-center justify-center rounded-md border border-border transition-colors hover:bg-bg-hover"
        >
          <ArrowLeft size={16} className="text-text-secondary" />
        </Link>
        <h1 className="text-sm font-semibold text-text-primary">
          {playback.isEnabled ? '时间线回放' : '数字化地图指挥'}
        </h1>
        {incidentId && !playback.isEnabled && (
          <span className="rounded bg-accent-red/20 px-2 py-0.5 text-xs text-accent-red">
            警情指挥中
          </span>
        )}
        {playback.isEnabled && (
          <span className="rounded bg-accent-blue/20 px-2 py-0.5 text-xs text-accent-blue">
            回放模式
          </span>
        )}
        <div className="flex-1" />
        {!playback.isEnabled && resolvedIncidents.length > 0 && (
          <button
            onClick={handleEnterPlayback}
            className="flex items-center gap-1.5 rounded-md border border-border bg-bg-tertiary px-3 py-1.5 text-xs text-text-primary transition-colors hover:bg-bg-hover"
          >
            <Video size={14} />
            进入回放
          </button>
        )}
        {playback.isEnabled && (
          <button
            onClick={handleDisablePlayback}
            className="flex items-center gap-1.5 rounded-md border border-border bg-bg-tertiary px-3 py-1.5 text-xs text-text-primary transition-colors hover:bg-bg-hover"
          >
            <X size={14} />
            退出回放
          </button>
        )}
      </div>

      <div className="h-full w-full pt-11">
        <MapWrapper
          incidentId={playback.isEnabled ? playback.selectedIncidentId || undefined : incidentId}
          showWaterSources={showWaterSources}
          showAlertZones={showAlertZones}
          showRoutes={showRoutes}
          showVehicles={showVehicles}
          onMapClick={handleMapClick}
          selectedTool={selectedTool}
          onMarkerClick={(type, id) => setClickedMarker({ type, id })}
        />
      </div>

      {!playback.isEnabled && (
        <>
          <LayerControl
            showWaterSources={showWaterSources}
            showAlertZones={showAlertZones}
            showRoutes={showRoutes}
            showVehicles={showVehicles}
            onToggleWaterSources={setShowWaterSources}
            onToggleAlertZones={setShowAlertZones}
            onToggleRoutes={setShowRoutes}
            onToggleVehicles={setShowVehicles}
          />

          <MapToolbar
            selectedTool={selectedTool}
            onToolSelect={setSelectedTool}
          />

          <MapInfoPanel
            incidentId={incidentId}
            clickedMarker={clickedMarker}
          />
        </>
      )}

      {playback.isEnabled && playback.timeline && playback.currentState && (
        <>
          <PlaybackInfoOverlay state={playback.currentState} />
          <PlaybackControl
            timeline={playback.timeline}
            isPlaying={playback.isPlaying}
            currentTime={playback.currentTime}
            playbackSpeed={playback.playbackSpeed}
            onPlay={handlePlay}
            onPause={handlePause}
            onSeek={handleSeek}
            onSpeedChange={handleSpeedChange}
            onIncidentChange={handleIncidentChange}
          />
        </>
      )}
    </div>
  )
}
