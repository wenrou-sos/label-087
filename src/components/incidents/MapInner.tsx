'use client'

import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface MapInnerProps {
  center: [number, number]
  position: [number, number] | null
  onMapClick: (lat: number, lng: number) => void
  onMarkerDrag: (lat: number, lng: number) => void
}

const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

export default function MapInner({ center, position, onMapClick, onMarkerDrag }: MapInnerProps) {
  return (
    <MapContainer center={center} zoom={12} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapClickHandler onMapClick={onMapClick} />
      {position && (
        <Marker
          position={position}
          icon={defaultIcon}
          draggable
          eventHandlers={{
            dragend(e) {
              const marker = e.target as L.Marker
              const { lat, lng } = marker.getLatLng()
              onMarkerDrag(lat, lng)
            },
          }}
        />
      )}
    </MapContainer>
  )
}
