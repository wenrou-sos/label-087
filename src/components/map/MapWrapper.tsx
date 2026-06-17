'use client'

import dynamic from 'next/dynamic'
import { useFireCommandStore } from '@/store'

const CommandMapInner = dynamic(() => import('./CommandMapInner'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-bg-primary">
      <span className="text-text-secondary text-sm">地图加载中...</span>
    </div>
  ),
})

const PlaybackMapInner = dynamic(() => import('./PlaybackMapInner'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-bg-primary">
      <span className="text-text-secondary text-sm">回放地图加载中...</span>
    </div>
  ),
})

export interface MapWrapperProps {
  incidentId?: string
  showWaterSources: boolean
  showAlertZones: boolean
  showRoutes: boolean
  showVehicles: boolean
  onMapClick?: (lat: number, lng: number) => void
  selectedTool: string | null
  onMarkerClick?: (type: string, id: string) => void
}

export default function MapWrapper(props: MapWrapperProps) {
  const isPlaybackEnabled = useFireCommandStore((s) => s.playback.isEnabled)

  if (isPlaybackEnabled) {
    return <PlaybackMapInner />
  }

  return <CommandMapInner {...props} />
}
