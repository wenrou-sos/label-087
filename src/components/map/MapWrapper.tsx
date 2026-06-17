'use client'

import dynamic from 'next/dynamic'

const CommandMapInner = dynamic(() => import('./CommandMapInner'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-bg-primary">
      <span className="text-text-secondary text-sm">地图加载中...</span>
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
  return <CommandMapInner {...props} />
}
