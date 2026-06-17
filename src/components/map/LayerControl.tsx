'use client'

import { useState } from 'react'
import { Layers, Flame, Droplets, Shield, Route, Truck } from 'lucide-react'

interface LayerControlProps {
  showWaterSources: boolean
  showAlertZones: boolean
  showRoutes: boolean
  showVehicles: boolean
  onToggleWaterSources: (v: boolean) => void
  onToggleAlertZones: (v: boolean) => void
  onToggleRoutes: (v: boolean) => void
  onToggleVehicles: (v: boolean) => void
}

const layers = [
  { key: 'fire', label: '火点标注', icon: Flame, alwaysOn: true },
  { key: 'water', label: '水源标注', icon: Droplets, alwaysOn: false },
  { key: 'alert', label: '警戒范围', icon: Shield, alwaysOn: false },
  { key: 'route', label: '救援路线', icon: Route, alwaysOn: false },
  { key: 'vehicle', label: '车辆位置', icon: Truck, alwaysOn: false },
] as const

export default function LayerControl({
  showWaterSources,
  showAlertZones,
  showRoutes,
  showVehicles,
  onToggleWaterSources,
  onToggleAlertZones,
  onToggleRoutes,
  onToggleVehicles,
}: LayerControlProps) {
  const [collapsed, setCollapsed] = useState(false)

  const toggleValues: Record<string, boolean> = {
    fire: true,
    water: showWaterSources,
    alert: showAlertZones,
    route: showRoutes,
    vehicle: showVehicles,
  }

  const toggleHandlers: Record<string, ((v: boolean) => void) | null> = {
    fire: null,
    water: onToggleWaterSources,
    alert: onToggleAlertZones,
    route: onToggleRoutes,
    vehicle: onToggleVehicles,
  }

  return (
    <div className="absolute right-4 top-4 z-[1000] flex flex-col items-end gap-2">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-bg-secondary/90 backdrop-blur-sm transition-colors hover:bg-bg-hover"
      >
        <Layers size={18} className="text-text-secondary" />
      </button>

      {!collapsed && (
        <div className="w-52 rounded-lg border border-border bg-bg-secondary/90 p-3 backdrop-blur-sm">
          <h3 className="mb-2 text-xs font-semibold text-text-muted uppercase tracking-wider">图层控制</h3>
          <div className="flex flex-col gap-2">
            {layers.map((layer) => {
              const Icon = layer.icon
              const checked = toggleValues[layer.key]
              const handler = toggleHandlers[layer.key]

              return (
                <label
                  key={layer.key}
                  className="flex items-center justify-between gap-2 rounded px-2 py-1.5 transition-colors hover:bg-bg-hover"
                >
                  <span className="flex items-center gap-2 text-sm text-text-primary">
                    <Icon size={14} className="text-text-secondary" />
                    {layer.label}
                  </span>
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={layer.alwaysOn}
                    onChange={(e) => handler?.(e.target.checked)}
                    className="h-4 w-4 rounded border-border accent-accent-blue disabled:opacity-50"
                  />
                </label>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
