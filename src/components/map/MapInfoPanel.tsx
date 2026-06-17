'use client'

import { useFireCommandStore } from '@/store'
import { getFireLevelColor, getFireLevelLabel, getStatusLabel, getVehicleTypeLabel } from '@/lib/utils'

interface MapInfoPanelProps {
  incidentId?: string
  clickedMarker: { type: string; id: string } | null
}

export default function MapInfoPanel({ incidentId, clickedMarker }: MapInfoPanelProps) {
  const incidents = useFireCommandStore((s) => s.incidents)
  const waterSources = useFireCommandStore((s) => s.waterSources)
  const vehicles = useFireCommandStore((s) => s.vehicles)

  const incident = incidentId
    ? incidents.find((i) => i.id === incidentId)
    : null

  const clickedIncident = clickedMarker?.type === 'incident'
    ? incidents.find((i) => i.id === clickedMarker.id)
    : null

  const clickedWaterSource = clickedMarker?.type === 'water'
    ? waterSources.find((w) => w.id === clickedMarker.id)
    : null

  const clickedVehicle = clickedMarker?.type === 'vehicle'
    ? vehicles.find((v) => v.id === clickedMarker.id)
    : null

  const displayIncident = incident || clickedIncident

  if (!displayIncident && !clickedWaterSource && !clickedVehicle) {
    return null
  }

  return (
    <div className="absolute bottom-4 left-4 z-[1000] w-72 rounded-lg border border-border bg-bg-secondary/90 p-3 backdrop-blur-sm">
      {displayIncident && (
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: getFireLevelColor(displayIncident.fireLevel) }}
            />
            <span className="text-sm font-semibold text-text-primary truncate">
              {displayIncident.location.address}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
            <div className="text-text-muted">火势等级</div>
            <div className="text-text-primary">{getFireLevelLabel(displayIncident.fireLevel)}</div>
            <div className="text-text-muted">状态</div>
            <div className="text-text-primary">{getStatusLabel(displayIncident.status)}</div>
            <div className="text-text-muted">被困人数</div>
            <div className="text-accent-red">{displayIncident.trappedCount}人</div>
            <div className="text-text-muted">楼层</div>
            <div className="text-text-primary">{displayIncident.floor}层</div>
          </div>
        </div>
      )}

      {clickedWaterSource && (
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: clickedWaterSource.type === 'hydrant' ? '#3B82F6' : '#06B6D4' }}
            />
            <span className="text-sm font-semibold text-text-primary truncate">
              {clickedWaterSource.name}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
            <div className="text-text-muted">类型</div>
            <div className="text-text-primary">
              {clickedWaterSource.type === 'hydrant' ? '消火栓' : clickedWaterSource.type === 'natural' ? '天然水源' : '池塘'}
            </div>
            <div className="text-text-muted">状态</div>
            <div className={clickedWaterSource.status === 'available' ? 'text-accent-green' : 'text-accent-red'}>
              {clickedWaterSource.status === 'available' ? '可用' : '不可用'}
            </div>
          </div>
        </div>
      )}

      {clickedVehicle && (
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-accent-blue" />
            <span className="text-sm font-semibold text-text-primary truncate">
              {clickedVehicle.name}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
            <div className="text-text-muted">车型</div>
            <div className="text-text-primary">{getVehicleTypeLabel(clickedVehicle.type)}</div>
            <div className="text-text-muted">状态</div>
            <div className="text-text-primary">{getStatusLabel(clickedVehicle.status as never)}</div>
            {clickedVehicle.estimatedArrival && (
              <>
                <div className="text-text-muted">预计到达</div>
                <div className="text-accent-amber">{clickedVehicle.estimatedArrival}分钟</div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
