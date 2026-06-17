import type { BuildingType, FireLevel, IncidentStatus, VehicleType } from './types'

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  const seconds = date.getSeconds().toString().padStart(2, '0')
  return `${year}年${month}月${day}日 ${hours}:${minutes}:${seconds}`
}

export function getFireLevelColor(level: FireLevel): string {
  const colors: Record<FireLevel, string> = {
    small: '#52c41a',
    medium: '#faad14',
    large: '#fa541c',
    fierce: '#f5222d',
  }
  return colors[level]
}

export function getStatusColor(status: IncidentStatus): string {
  const colors: Record<IncidentStatus, string> = {
    pending: '#8c8c8c',
    dispatched: '#1890ff',
    responding: '#722ed1',
    on_scene: '#fa8c16',
    under_control: '#52c41a',
    resolved: '#52c41a',
  }
  return colors[status]
}

export function getVehicleTypeLabel(type: VehicleType): string {
  const labels: Record<VehicleType, string> = {
    water_tanker: '水罐车',
    ladder: '云梯车',
    rescue: '抢险救援车',
    command: '指挥车',
    foam: '泡沫车',
  }
  return labels[type]
}

export function getBuildingTypeLabel(type: BuildingType): string {
  const labels: Record<BuildingType, string> = {
    residential: '居民住宅',
    factory: '工厂',
    mall: '商场',
    warehouse: '仓库',
    other: '其他',
  }
  return labels[type]
}

export function getFireLevelLabel(level: FireLevel): string {
  const labels: Record<FireLevel, string> = {
    small: '小火',
    medium: '中火',
    large: '大火',
    fierce: '猛烈燃烧',
  }
  return labels[level]
}

export function getStatusLabel(status: IncidentStatus): string {
  const labels: Record<IncidentStatus, string> = {
    pending: '待派遣',
    dispatched: '已派遣',
    responding: '出警中',
    on_scene: '到场',
    under_control: '已控制',
    resolved: '已结案',
  }
  return labels[status]
}
