'use client'

import { Suspense, useState, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import MapWrapper from '@/components/map/MapWrapper'
import LayerControl from '@/components/map/LayerControl'
import MapToolbar from '@/components/map/MapToolbar'
import MapInfoPanel from '@/components/map/MapInfoPanel'
import { useFireCommandStore } from '@/store'

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

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-bg-primary">
      <div className="absolute left-0 top-0 z-[1001] flex items-center gap-3 bg-bg-secondary/90 px-4 py-2.5 backdrop-blur-sm border-b border-r border-border">
        <Link
          href="/"
          className="flex h-8 w-8 items-center justify-center rounded-md border border-border transition-colors hover:bg-bg-hover"
        >
          <ArrowLeft size={16} className="text-text-secondary" />
        </Link>
        <h1 className="text-sm font-semibold text-text-primary">数字化地图指挥</h1>
        {incidentId && (
          <span className="rounded bg-accent-red/20 px-2 py-0.5 text-xs text-accent-red">
            警情指挥中
          </span>
        )}
      </div>

      <div className="h-full w-full pt-11">
        <MapWrapper
          incidentId={incidentId}
          showWaterSources={showWaterSources}
          showAlertZones={showAlertZones}
          showRoutes={showRoutes}
          showVehicles={showVehicles}
          onMapClick={handleMapClick}
          selectedTool={selectedTool}
          onMarkerClick={(type, id) => setClickedMarker({ type, id })}
        />
      </div>

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
    </div>
  )
}
