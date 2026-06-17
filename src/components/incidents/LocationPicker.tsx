'use client'

import { useState } from 'react'
import { MapPin } from 'lucide-react'
import dynamic from 'next/dynamic'

interface LocationValue {
  address: string
  lat: number
  lng: number
}

interface LocationPickerProps {
  value: LocationValue
  onChange: (value: LocationValue) => void
}

const MapInner = dynamic(() => import('./MapInner'), { ssr: false })

export default function LocationPicker({ value, onChange }: LocationPickerProps) {
  const [addressInput, setAddressInput] = useState(value.address)

  const handleAddressChange = (address: string) => {
    setAddressInput(address)
    onChange({ ...value, address })
  }

  const handleMapClick = (lat: number, lng: number) => {
    onChange({ ...value, lat, lng })
  }

  const handleMarkerDrag = (lat: number, lng: number) => {
    onChange({ ...value, lat, lng })
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          value={addressInput}
          onChange={(e) => handleAddressChange(e.target.value)}
          placeholder="输入详细地址"
          className="w-full rounded-lg border border-border bg-bg-tertiary py-2.5 pl-10 pr-4 text-sm text-text-primary placeholder-text-muted outline-none transition-colors focus:border-accent-blue"
        />
      </div>

      <div className="h-[300px] overflow-hidden rounded-lg border border-border">
        <MapInner
          center={[value.lat || 31.23, value.lng || 121.47]}
          position={value.lat && value.lng ? [value.lat, value.lng] : null}
          onMapClick={handleMapClick}
          onMarkerDrag={handleMarkerDrag}
        />
      </div>

      <div className="flex items-center gap-4 text-xs text-text-muted">
        <span>纬度: {value.lat?.toFixed(6) || '-'}</span>
        <span>经度: {value.lng?.toFixed(6) || '-'}</span>
      </div>
    </div>
  )
}
