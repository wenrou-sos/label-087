export type BuildingType = 'residential' | 'factory' | 'mall' | 'warehouse' | 'other'

export type FireLevel = 'small' | 'medium' | 'large' | 'fierce'

export type IncidentStatus = 'pending' | 'dispatched' | 'responding' | 'on_scene' | 'under_control' | 'resolved'

export type VehicleType = 'water_tanker' | 'ladder' | 'rescue' | 'command' | 'foam'

export type VehicleStatus = 'available' | 'dispatched' | 'en_route' | 'on_scene' | 'returning'

export type DispatchPlanStatus = 'draft' | 'confirmed' | 'executing' | 'completed'

export type WaterSourceType = 'hydrant' | 'natural' | 'pond' | 'other'

export type WaterSourceStatus = 'available' | 'unavailable'

export type AlertType = 'temperature' | 'gas' | 'heartRate'

export type AlertSeverity = 'warning' | 'critical'

export type FireCauseCategory = 'electrical' | 'arson' | 'chemical' | 'natural' | 'cooking' | 'smoking' | 'other'

export type MapAnnotationType = 'fire_point' | 'water_source' | 'alert_zone_inner' | 'alert_zone_outer' | 'route'

export interface GeoLocation {
  lat: number
  lng: number
}

export interface Incident {
  id: string
  location: {
    address: string
    lat: number
    lng: number
  }
  buildingType: BuildingType
  customBuildingType?: string
  floor: number
  isBasement: boolean
  trappedCount: number
  trappedLocation: string
  fireLevel: FireLevel
  status: IncidentStatus
  createdAt: string
  updatedAt: string
}

export interface Vehicle {
  id: string
  stationId: string
  name: string
  type: VehicleType
  status: VehicleStatus
  currentLocation: GeoLocation
  estimatedArrival?: number
}

export interface FireStation {
  id: string
  name: string
  location: GeoLocation
  address: string
  vehicles: Vehicle[]
}

export interface DispatchPlan {
  id: string
  incidentId: string
  stations: FireStation[]
  vehicles: {
    vehicleId: string
    type: VehicleType
    count: number
  }[]
  createdAt: string
  status: DispatchPlanStatus
}

export interface WaterSource {
  id: string
  name: string
  type: WaterSourceType
  location: GeoLocation
  status: WaterSourceStatus
}

export interface GasConcentrations {
  co: number
  co2: number
  h2s: number
  ch4: number
}

export interface SensorData {
  firefighterId: string
  name: string
  location: GeoLocation
  temperature: number
  gasConcentrations: GasConcentrations
  heartRate: number
  timestamp: string
}

export interface Alert {
  id: string
  type: AlertType
  severity: AlertSeverity
  message: string
  firefighterId: string
  value: number
  threshold: number
  timestamp: string
  acknowledged: boolean
}

export interface PostIncidentReport {
  id: string
  incidentId: string
  propertyLoss: number
  casualtyInfo: {
    deaths: number
    injuries: number
    rescued: number
  }
  fireCause: {
    category: FireCauseCategory
    description: string
  }
  summary: string
  createdAt: string
  updatedAt: string
}

export interface MapAnnotation {
  id: string
  incidentId: string
  type: MapAnnotationType
  lat: number
  lng: number
  radius?: number
  points?: GeoLocation[]
  color: string
  label: string
}
