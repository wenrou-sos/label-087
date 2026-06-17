'use client'

import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  status: string
  type: 'incident' | 'vehicle' | 'plan'
}

const incidentLabels: Record<string, string> = {
  pending: '待派遣',
  dispatched: '已派遣',
  responding: '出警中',
  on_scene: '到场',
  under_control: '已控制',
  resolved: '已结案',
}

const vehicleLabels: Record<string, string> = {
  available: '可用',
  dispatched: '已派遣',
  en_route: '途中',
  on_scene: '到场',
  returning: '返程',
}

const planLabels: Record<string, string> = {
  draft: '草稿',
  confirmed: '已确认',
  executing: '执行中',
  completed: '已完成',
}

const colorMap: Record<string, string> = {
  incident_pending: 'bg-amber-500/20 text-amber-400',
  incident_dispatched: 'bg-blue-500/20 text-blue-400',
  incident_responding: 'bg-blue-500/20 text-blue-400',
  incident_on_scene: 'bg-blue-500/20 text-blue-400',
  incident_under_control: 'bg-green-500/20 text-green-400',
  incident_resolved: 'bg-gray-500/20 text-gray-400',
  vehicle_available: 'bg-green-500/20 text-green-400',
  vehicle_dispatched: 'bg-amber-500/20 text-amber-400',
  vehicle_en_route: 'bg-blue-500/20 text-blue-400',
  vehicle_on_scene: 'bg-blue-500/20 text-blue-400',
  vehicle_returning: 'bg-gray-500/20 text-gray-400',
  plan_draft: 'bg-gray-500/20 text-gray-400',
  plan_confirmed: 'bg-blue-500/20 text-blue-400',
  plan_executing: 'bg-amber-500/20 text-amber-400',
  plan_completed: 'bg-green-500/20 text-green-400',
}

const dotColorMap: Record<string, string> = {
  incident_pending: 'bg-amber-400',
  incident_dispatched: 'bg-blue-400',
  incident_responding: 'bg-blue-400',
  incident_on_scene: 'bg-blue-400',
  incident_under_control: 'bg-green-400',
  incident_resolved: 'bg-gray-400',
  vehicle_available: 'bg-green-400',
  vehicle_dispatched: 'bg-amber-400',
  vehicle_en_route: 'bg-blue-400',
  vehicle_on_scene: 'bg-blue-400',
  vehicle_returning: 'bg-gray-400',
  plan_draft: 'bg-gray-400',
  plan_confirmed: 'bg-blue-400',
  plan_executing: 'bg-amber-400',
  plan_completed: 'bg-green-400',
}

const labelMap: Record<string, Record<string, string>> = {
  incident: incidentLabels,
  vehicle: vehicleLabels,
  plan: planLabels,
}

export default function StatusBadge({ status, type }: StatusBadgeProps) {
  const key = `${type}_${status}`
  const label = labelMap[type]?.[status] ?? status

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
        colorMap[key] ?? 'bg-gray-500/20 text-gray-400'
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', dotColorMap[key] ?? 'bg-gray-400')} />
      {label}
    </span>
  )
}
