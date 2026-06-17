'use client'

import { useEffect, useMemo } from 'react'
import L from 'leaflet'
import { MapContainer, TileLayer, Circle, Polyline, Marker, Popup, useMap } from 'react-leaflet'
import { useFireCommandStore } from '@/store'
import { getFireLevelColor, getFireLevelLabel, getStatusLabel, getVehicleTypeLabel } from '@/lib/utils'
import type { PlaybackState } from '@/lib/types/playback'

const fireIcon = L.divIcon({
  className: '',
  html: `<div style="width:18px;height:18px;border-radius:50%;background:#E53E3E;border:3px solid #fff;box-shadow:0 0 12px rgba(229,62,62,0.9);"></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
})

const vehicleIcon = L.divIcon({
  className: '',
  html: `<div style="width:16px;height:16px;border-radius:4px;background:#3B82F6;border:2px solid #fff;box-shadow:0 0 8px rgba(59,130,246,0.7);display:flex;align-items:center;justify-content:center;font-size:9px;color:#fff;">🚒</div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
})

const firefighterIcon = L.divIcon({
  className: '',
  html: `<div style="width:14px;height:14px;border-radius:50%;background:#10B981;border:2px solid #fff;box-shadow:0 0 6px rgba(16,185,129,0.7);"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
})

const alertFireIcon = L.divIcon({
  className: '',
  html: `<div style="width:14px;height:14px;border-radius:50%;background:#EF4444;border:2px solid #fff;box-shadow:0 0 8px rgba(239,68,68,0.8);animation: pulse 1s infinite;"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
})

function MapController({ incident }: { incident: any }) {
  const map = useMap()

  useEffect(() => {
    if (incident) {
      map.setView([incident.location.lat, incident.location.lng], 15, { animate: true })
    }
  }, [incident, map])

  return null
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

export default function PlaybackMapInner() {
  const playback = useFireCommandStore((s) => s.playback)
  const incidents = useFireCommandStore((s) => s.incidents)
  const waterSources = useFireCommandStore((s) => s.waterSources)

  const incident = useMemo(() => {
    if (!playback.selectedIncidentId) return null
    return incidents.find((i) => i.id === playback.selectedIncidentId) || null
  }, [playback.selectedIncidentId, incidents])

  const state = playback.currentState

  const fireRadius = useMemo(() => {
    if (!state?.fireLevel) return 30
    const radiusMap: Record<string, number> = {
      small: 30,
      medium: 50,
      large: 80,
      fierce: 120,
    }
    return radiusMap[state.fireLevel] || 50
  }, [state?.fireLevel])

  const routeLines = useMemo(() => {
    if (!state?.routeLines) return []
    return state.routeLines.map((route) => {
      const progress = route.progress || 0
      const totalPoints = route.points.length
      const completedPoints = Math.floor(totalPoints * progress)
      const completed = route.points.slice(0, completedPoints + 1)
      const remaining = route.points.slice(Math.max(0, completedPoints - 1))
      return {
        ...route,
        completed: completed.map((p) => [p.lat, p.lng] as [number, number]),
        remaining: remaining.map((p) => [p.lat, p.lng] as [number, number]),
      }
    })
  }, [state?.routeLines])

  if (!playback.isEnabled || !playback.timeline || !incident) {
    return null
  }

  return (
    <MapContainer
      center={[incident.location.lat, incident.location.lng]}
      zoom={15}
      className="h-full w-full"
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapController incident={incident} />

      <div>
        <Circle
          center={[incident.location.lat, incident.location.lng]}
          radius={fireRadius}
          pathOptions={{
            color: state?.fireLevel ? getFireLevelColor(state.fireLevel as any) : '#E53E3E',
            fillColor: state?.fireLevel ? getFireLevelColor(state.fireLevel as any) : '#E53E3E',
            fillOpacity: 0.6,
            weight: 3,
          }}
        />

        <Circle
          center={[incident.location.lat, incident.location.lng]}
          radius={fireRadius + 20}
          pathOptions={{
            color: 'transparent',
            fillColor: state?.fireLevel ? getFireLevelColor(state.fireLevel as any) : '#E53E3E',
            fillOpacity: 0.2,
            weight: 0,
            className: 'animate-pulse-red',
          }}
        />

        <Marker
          position={[incident.location.lat, incident.location.lng]}
          icon={fireIcon}
        >
          <Popup>
            <div className="text-sm">
              <div className="font-semibold text-text-primary">{incident.location.address}</div>
              <div className="text-text-secondary text-xs mt-1">
                火势等级: {state?.fireLevel ? getFireLevelLabel(state.fireLevel as any) : getFireLevelLabel(incident.fireLevel)}
              </div>
              <div className="text-text-secondary text-xs">
                当前状态: {state?.incidentStatus ? getStatusLabel(state.incidentStatus as any) : getStatusLabel(incident.status)}
              </div>
            </div>
          </Popup>
        </Marker>
      </div>

      <div>
        <Circle
          center={[incident.location.lat, incident.location.lng]}
          radius={200}
          pathOptions={{
            color: '#E53E3E',
            fillColor: '#E53E3E',
            fillOpacity: 0.12,
            weight: 2,
            dashArray: '8 4',
          }}
        />
        <Circle
          center={[incident.location.lat, incident.location.lng]}
          radius={500}
          pathOptions={{
            color: '#F59E0B',
            fillColor: '#F59E0B',
            fillOpacity: 0.06,
            weight: 1.5,
            dashArray: '8 4',
          }}
        />
      </div>

      {waterSources.map((ws) => (
        <Circle
          key={ws.id}
          center={[ws.location.lat, ws.location.lng]}
          radius={18}
          pathOptions={{
            color: ws.type === 'hydrant' ? '#3B82F6' : '#06B6D4',
            fillColor: ws.type === 'hydrant' ? '#3B82F6' : '#06B6D4',
            fillOpacity: ws.status === 'available' ? 0.7 : 0.3,
            weight: 2,
          }}
        />
      ))}

      {routeLines.map((route) => (
        <div key={route.vehicleId}>
          {route.completed.length > 1 && (
            <Polyline
              positions={route.completed}
              pathOptions={{
                color: '#3B82F6',
                weight: 4,
                opacity: 0.9,
              }}
            />
          )}
          {route.remaining.length > 1 && (
            <Polyline
              positions={route.remaining}
              pathOptions={{
                color: '#64748B',
                weight: 3,
                opacity: 0.4,
                dashArray: '8 6',
              }}
            />
          )}
        </div>
      ))}

      {state?.vehicles?.map((vehicle) => {
        const hasAlert = state.activeAlerts?.some((a) => a.alertId && a.alertId.includes(vehicle.id))
        return (
          <Marker
            key={vehicle.id}
            position={[vehicle.location.lat, vehicle.location.lng]}
            icon={hasAlert ? alertFireIcon : vehicleIcon}
          >
            <Popup>
              <div className="text-sm">
                <div className="font-semibold text-text-primary">{vehicle.name}</div>
                <div className="text-text-secondary text-xs mt-1">
                  类型: {getVehicleTypeLabel(vehicle.type as any)}
                </div>
                <div className="text-text-secondary text-xs">
                  状态: {getStatusLabel(vehicle.status as any)}
                </div>
                <div className="text-text-secondary text-xs">
                  进度: {Math.round((vehicle.progress || 0) * 100)}%
                </div>
                {hasAlert && (
                  <div className="text-accent-red text-xs mt-1">⚠ 有告警</div>
                )}
              </div>
            </Popup>
          </Marker>
        )
      })}

      {state?.firefighters?.map((ff) => {
        const hasAlert = state.activeAlerts?.some((a) => a.firefighterId === ff.id)
        const isHighTemp = (ff.temperature || 37) > 50
        const isHighHeart = (ff.heartRate || 80) > 140
        const isHighGas = (ff.gasConcentrations?.co || 0) > 30
        const hasVitalAlert = hasAlert || isHighTemp || isHighHeart || isHighGas
        return (
          <Marker
            key={ff.id}
            position={[ff.location.lat, ff.location.lng]}
            icon={hasVitalAlert ? alertFireIcon : firefighterIcon}
          >
            <Popup>
              <div className="text-sm">
                <div className="font-semibold text-text-primary">{ff.name}</div>
                <div className="text-text-secondary text-xs mt-1">
                  体温: {ff.temperature?.toFixed(1)}°C
                </div>
                <div className="text-text-secondary text-xs">
                  心率: {ff.heartRate} bpm
                </div>
                <div className="text-text-secondary text-xs">
                  CO浓度: {ff.gasConcentrations?.co?.toFixed(1)} ppm
                </div>
                {isHighTemp && (
                  <div className="text-accent-red text-xs">⚠ 体温过高</div>
                )}
                {isHighHeart && (
                  <div className="text-accent-red text-xs">⚠ 心率过快</div>
                )}
                {isHighGas && (
                  <div className="text-accent-red text-xs">⚠ CO浓度超标</div>
                )}
              </div>
            </Popup>
          </Marker>
        )
      })}

      <div className="absolute left-4 top-4 z-[1000] bg-bg-secondary/95 backdrop-blur-sm border border-border rounded-md p-3 text-xs">
        <div className="font-semibold text-text-primary mb-2">图例</div>
        <div className="space-y-1.5 text-text-secondary">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-accent-red"></div>
            <span>火点</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-accent-blue"></div>
            <span>救援车辆</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-accent-green"></div>
            <span>消防员</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-accent-cyan"></div>
            <span>水源</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-accent-red animate-pulse"></div>
            <span>告警状态</span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <div className="w-6 h-1 bg-accent-blue"></div>
            <span>已行驶路线</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-1 bg-slate-500" style={{ backgroundImage: 'repeating-linear-gradient(90deg, #64748B 0px, #64748B 4px, transparent 4px, transparent 8px)' }}></div>
            <span>计划路线</span>
          </div>
        </div>
      </div>
    </MapContainer>
  )
}
