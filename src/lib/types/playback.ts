import type { FireLevel, IncidentStatus, AlertType, AlertSeverity } from '../types'

export type PlaybackEventType =
  | 'vehicle_move'
  | 'firefighter_move'
  | 'fire_level_change'
  | 'status_change'
  | 'alert_trigger'
  | 'alert_clear'

export interface GeoLocation {
  lat: number
  lng: number
}

export interface GasConcentrations {
  co: number
  co2: number
  h2s: number
  ch4: number
}

export interface VehicleMovePayload {
  vehicleId: string
  name: string
  type: string
  from: GeoLocation
  to: GeoLocation
  progress: number
}

export interface FirefighterMovePayload {
  firefighterId: string
  name: string
  from: GeoLocation
  to: GeoLocation
  progress: number
  temperature: number
  heartRate: number
  gasConcentrations: GasConcentrations
}

export interface FireLevelChangePayload {
  fireLevel: FireLevel
}

export interface StatusChangePayload {
  status: IncidentStatus
}

export interface AlertTriggerPayload {
  alertId: string
  type: AlertType
  severity: AlertSeverity
  message: string
  value: number
  threshold: number
  firefighterId?: string
  vehicleId?: string
}

export interface AlertClearPayload {
  alertId: string
}

export type PlaybackEventPayload =
  | VehicleMovePayload
  | FirefighterMovePayload
  | FireLevelChangePayload
  | StatusChangePayload
  | AlertTriggerPayload
  | AlertClearPayload

export interface PlaybackEvent {
  id: string
  incidentId: string
  timestamp: number
  type: PlaybackEventType
  payload: PlaybackEventPayload
  description: string
}

export interface PlaybackMarker {
  id: string
  timestamp: number
  type: 'status_change' | 'alert'
  color: string
}

export interface TimelineMarker {
  id: string
  timestamp: number
  type: string
  color: string
}

export interface PlaybackIncident {
  id: string
  title: string
  address: string
  startAt: string
  endAt: string
}

export interface TimelineIncident {
  id: string
  title: string
  address: string
}

export interface PlaybackTimeline {
  incidentId: string
  incidents: TimelineIncident[]
  duration: number
  events: PlaybackEvent[]
  markers: TimelineMarker[]
  startTime: string
  endTime: string
}

export interface PlaybackVehicleState {
  id: string
  name: string
  type: string
  location: GeoLocation
  status: string
  progress: number
}

export interface PlaybackFirefighterState {
  id: string
  name: string
  location: GeoLocation
  temperature: number
  heartRate: number
  gasConcentrations: GasConcentrations
}

export interface PlaybackAlertState {
  alertId: string
  type: string
  severity: string
  message: string
  value: number
  threshold: number
  triggeredAt: string | number
  firefighterId?: string
  vehicleId?: string
}

export interface RouteLine {
  vehicleId: string
  points: GeoLocation[]
  progress: number
}

export interface PlaybackState {
  vehicles: PlaybackVehicleState[]
  firefighters: PlaybackFirefighterState[]
  fireLevel: FireLevel
  incidentStatus: IncidentStatus
  activeAlerts: PlaybackAlertState[]
  routeLines: RouteLine[]
  currentTime: number
}

export type { FireLevel, IncidentStatus }
