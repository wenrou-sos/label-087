'use client'

import { useState } from 'react'
import type { BuildingType, FireLevel, Incident } from '@/lib/types'
import FireLevelSelector from './FireLevelSelector'
import LocationPicker from './LocationPicker'

interface IncidentFormProps {
  initialData?: Incident
  onSubmit: (data: Omit<Incident, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => void
}

const buildingOptions: { value: BuildingType; label: string }[] = [
  { value: 'residential', label: '居民住宅' },
  { value: 'factory', label: '工厂' },
  { value: 'mall', label: '商场' },
  { value: 'warehouse', label: '仓库' },
  { value: 'other', label: '其他' },
]

export default function IncidentForm({ initialData, onSubmit }: IncidentFormProps) {
  const [location, setLocation] = useState({
    address: initialData?.location.address ?? '',
    lat: initialData?.location.lat ?? 31.23,
    lng: initialData?.location.lng ?? 121.47,
  })
  const [buildingType, setBuildingType] = useState<BuildingType>(initialData?.buildingType ?? 'residential')
  const [customBuildingType, setCustomBuildingType] = useState(initialData?.customBuildingType ?? '')
  const [floor, setFloor] = useState(initialData?.floor ?? 1)
  const [isBasement, setIsBasement] = useState(initialData?.isBasement ?? false)
  const [trappedCount, setTrappedCount] = useState(initialData?.trappedCount ?? 0)
  const [trappedLocation, setTrappedLocation] = useState(initialData?.trappedLocation ?? '')
  const [fireLevel, setFireLevel] = useState<FireLevel>(initialData?.fireLevel ?? 'small')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!location.address.trim()) newErrors.address = '请输入火灾地址'
    if (buildingType === 'other' && !customBuildingType.trim()) newErrors.customBuildingType = '请输入自定义建筑类型'
    if (trappedCount > 0 && !trappedLocation.trim()) newErrors.trappedLocation = '请描述被困人员位置'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    onSubmit({
      location,
      buildingType,
      customBuildingType: buildingType === 'other' ? customBuildingType : undefined,
      floor,
      isBasement,
      trappedCount,
      trappedLocation,
      fireLevel,
    })
  }

  const inputClass = 'w-full rounded-lg border border-border bg-bg-tertiary px-3 py-2.5 text-sm text-text-primary placeholder-text-muted outline-none transition-colors focus:border-accent-blue'
  const labelClass = 'mb-1.5 block text-sm font-medium text-text-secondary'
  const errorClass = 'mt-1 text-xs text-accent-red'

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className={labelClass}>火灾地点 <span className="text-accent-red">*</span></label>
        <LocationPicker value={location} onChange={setLocation} />
        {errors.address && <p className={errorClass}>{errors.address}</p>}
      </div>

      <div>
        <label className={labelClass}>建筑类型 <span className="text-accent-red">*</span></label>
        <select
          value={buildingType}
          onChange={(e) => setBuildingType(e.target.value as BuildingType)}
          className={inputClass}
        >
          {buildingOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        {buildingType === 'other' && (
          <div className="mt-2">
            <input
              type="text"
              value={customBuildingType}
              onChange={(e) => setCustomBuildingType(e.target.value)}
              placeholder="请输入建筑类型"
              className={inputClass}
            />
            {errors.customBuildingType && <p className={errorClass}>{errors.customBuildingType}</p>}
          </div>
        )}
      </div>

      <div className="flex items-end gap-4">
        <div className="flex-1">
          <label className={labelClass}>起火楼层</label>
          <input
            type="number"
            min={1}
            value={floor}
            onChange={(e) => setFloor(parseInt(e.target.value) || 1)}
            className={inputClass}
          />
        </div>
        <label className="flex items-center gap-2 pb-2.5 text-sm text-text-secondary">
          <input
            type="checkbox"
            checked={isBasement}
            onChange={(e) => setIsBasement(e.target.checked)}
            className="h-4 w-4 rounded border-border accent-accent-blue"
          />
          地下楼层
        </label>
      </div>

      <div>
        <label className={labelClass}>被困人员数量</label>
        <input
          type="number"
          min={0}
          value={trappedCount}
          onChange={(e) => setTrappedCount(parseInt(e.target.value) || 0)}
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>被困人员位置描述</label>
        <textarea
          value={trappedLocation}
          onChange={(e) => setTrappedLocation(e.target.value)}
          placeholder="请描述被困人员所在位置"
          rows={3}
          className={`${inputClass} resize-none`}
        />
        {errors.trappedLocation && <p className={errorClass}>{errors.trappedLocation}</p>}
      </div>

      <div>
        <label className={labelClass}>火势大小评估 <span className="text-accent-red">*</span></label>
        <FireLevelSelector value={fireLevel} onChange={setFireLevel} />
      </div>

      <button
        type="submit"
        className="w-full rounded-lg bg-accent-blue px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-accent-blue/90"
      >
        {initialData ? '更新警情' : '创建警情'}
      </button>
    </form>
  )
}
