'use client'

import { useEffect, useMemo } from 'react'
import L from 'leaflet'
import { MapContainer, TileLayer, Circle, Polyline, useMap, useMapEvents } from 'react-leaflet'
import { useFireCommandStore } from '@/store'
import { generateRoutePoints } from '@/lib/geo'
import { getFireLevelColor, getFireLevelLabel, getStatusLabel, getVehicleTypeLabel } from '@/lib/utils'
import type { MapWrapperProps } from './MapWrapper'

const fireIcon = L.divIcon({
  className: '',
  html: `<div style="width:16px;height:16px;border-radius:50%;background:#E53E3E;border:2px solid #fff;box-shadow:0 0 8px rgba(229,62,62,0.8);"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
})

const hydrantIcon = L.divIcon({
  className: '',
  html: `<div style="width:12px;height:12px;border-radius:50%;background:#3B82F6;border:2px solid #fff;box-shadow:0 0 6px rgba(59,130,246,0.6);"></div>`,
  iconSize: [12, 12],
  iconAnchor: [6, 6],
})

const naturalIcon = L.divIcon({
  className: '',
  html: `<div style="width:12px;height:12px;border-radius:50%;background:#06B6D4;border:2px solid #fff;box-shadow:0 0 6px rgba(6,182,212,0.6);"></div>`,
  iconSize: [12, 12],
  iconAnchor: [6, 6],
})

const vehicleIcon = L.divIcon({
  className: '',
  html: `<div style="width:14px;height:14px;border-radius:3px;background:#3B82F6;border:2px solid #fff;box-shadow:0 0 6px rgba(59,130,246,0.5);display:flex;align-items:center;justify-content:center;font-size:8px;color:#fff;">🚒</div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
})

function MapController({ incidentId, onMapClick, selectedTool, onMarkerClick }: {
  incidentId?: string
  onMapClick?: (lat: number, lng: number) => void
  selectedTool: string | null
  onMarkerClick?: (type: string, id: string) => void
}) {
  const map = useMap()
  const incidents = useFireCommandStore((s) => s.incidents)

  useEffect(() => {
    if (incidentId) {
      const incident = incidents.find((i) => i.id === incidentId)
      if (incident) {
        map.setView([incident.location.lat, incident.location.lng], 15, { animate: true })
      }
    }
  }, [incidentId, incidents, map])

  useMapEvents({
    click(e) {
      if (selectedTool && onMapClick) {
        onMapClick(e.latlng.lat, e.latlng.lng)
      }
    },
  })

  return null
}

const activeStatuses = new Set(['pending', 'dispatched', 'responding', 'on_scene', 'under_control'])

export default function CommandMapInner({
  incidentId,
  showWaterSources,
  showAlertZones,
  showRoutes,
  showVehicles,
  onMapClick,
  selectedTool,
  onMarkerClick,
}: MapWrapperProps) {
  const incidents = useFireCommandStore((s) => s.incidents)
  const waterSources = useFireCommandStore((s) => s.waterSources)
  const vehicles = useFireCommandStore((s) => s.vehicles)
  const stations = useFireCommandStore((s) => s.stations)

  const activeIncidents = useMemo(
    () => incidents.filter((i) => activeStatuses.has(i.status)),
    [incidents]
  )

  const dispatchingVehicles = useMemo(
    () => vehicles.filter((v) => ['dispatched', 'en_route', 'on_scene'].includes(v.status)),
    [vehicles]
  )

  const routeLines = useMemo(() => {
    if (!showRoutes) return []
    const lines: { key: string; positions: [number, number][]; vehicleId: string; vehicleName: string }[] = []
    for (const incident of activeIncidents) {
      const station = stations.find((s) => {
        const stationVehicles = vehicles.filter((v) => v.stationId === s.id && ['dispatched', 'en_route'].includes(v.status))
        return stationVehicles.length > 0
      })
      if (station) {
        const routePoints = generateRoutePoints(station.location, {
          lat: incident.location.lat,
          lng: incident.location.lng,
        })
        const stationVehicles = vehicles.filter((v) => v.stationId === station.id && ['dispatched', 'en_route'].includes(v.status))
        for (const v of stationVehicles) {
          lines.push({
            key: `${incident.id}-${v.id}`,
            positions: routePoints.map((p) => [p.lat, p.lng] as [number, number]),
            vehicleId: v.id,
            vehicleName: v.name,
          })
        }
      }
    }
    return lines
  }, [showRoutes, activeIncidents, stations, vehicles])

  return (
    <MapContainer
      center={[31.23, 121.47]}
      zoom={13}
      className="h-full w-full"
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapController
        incidentId={incidentId}
        onMapClick={onMapClick}
        selectedTool={selectedTool}
        onMarkerClick={onMarkerClick}
      />

      {activeIncidents.map((incident) => (
        <div key={incident.id}>
          <Circle
            center={[incident.location.lat, incident.location.lng]}
            radius={50}
            pathOptions={{
              color: getFireLevelColor(incident.fireLevel),
              fillColor: getFireLevelColor(incident.fireLevel),
              fillOpacity: 0.6,
              weight: 2,
            }}
          />

          <Circle
            center={[incident.location.lat, incident.location.lng]}
            radius={55}
            pathOptions={{
              color: 'transparent',
              fillColor: getFireLevelColor(incident.fireLevel),
              fillOpacity: 0.3,
              weight: 0,
              className: 'animate-pulse-red',
            }}
          />
        </div>
      ))}

      {showWaterSources && waterSources.map((ws) => {
        const icon = ws.type === 'hydrant' ? hydrantIcon : naturalIcon
        return (
          <Circle
            key={ws.id}
            center={[ws.location.lat, ws.location.lng]}
            radius={20}
            pathOptions={{
              color: ws.type === 'hydrant' ? '#3B82F6' : '#06B6D4',
              fillColor: ws.type === 'hydrant' ? '#3B82F6' : '#06B6D4',
              fillOpacity: ws.status === 'available' ? 0.7 : 0.3,
              weight: 2,
            }}
          />
        )
      })}

      {showAlertZones && activeIncidents.map((incident) => (
        <div key={`alert-${incident.id}`}>
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
      ))}

      {showVehicles && dispatchingVehicles.map((vehicle) => (
        <Circle
          key={vehicle.id}
          center={[vehicle.currentLocation.lat, vehicle.currentLocation.lng]}
          radius={15}
          pathOptions={{
            color: '#3B82F6',
            fillColor: '#3B82F6',
            fillOpacity: 0.8,
            weight: 2,
          }}
        />
      ))}

      {routeLines.map((route) => (
        <Polyline
          key={route.key}
          positions={route.positions}
          pathOptions={{
            color: '#3B82F6',
            weight: 3,
            opacity: 0.7,
            dashArray: '10 6',
          }}
        />
      ))}
    </MapContainer>
  )
}
