import type {
  PlaybackTimeline,
  PlaybackEvent,
  PlaybackState,
  PlaybackVehicleState,
  PlaybackFirefighterState,
  PlaybackAlertState,
  PlaybackEventType,
  PlaybackEventPayload,
  VehicleMovePayload,
  FirefighterMovePayload,
  FireLevelChangePayload,
  StatusChangePayload,
  AlertTriggerPayload,
  AlertClearPayload,
  GeoLocation,
  FireLevel,
  IncidentStatus,
  TimelineMarker,
  TimelineIncident,
  RouteLine,
} from './types/playback'
import { generateRoutePoints } from './geo'
import { incidents, fireStations, vehicles as mockVehicles } from './mock-data'
import type { Incident, FireStation, Vehicle } from './types'

interface Firefighter {
  id: string
  name: string
  vehicleId: string
}

const firefighters: Firefighter[] = [
  { id: 'ff-001', name: '张伟', vehicleId: 'v-002' },
  { id: 'ff-002', name: '李强', vehicleId: 'v-002' },
  { id: 'ff-003', name: '王刚', vehicleId: 'v-004' },
  { id: 'ff-004', name: '刘洋', vehicleId: 'v-006' },
  { id: 'ff-005', name: '陈明', vehicleId: 'v-006' },
  { id: 'ff-006', name: '赵鹏', vehicleId: 'v-004' },
]

const fireLevelLabels: Record<FireLevel, string> = {
  small: '小型',
  medium: '中型',
  large: '大型',
  fierce: '猛烈',
}

const statusLabels: Record<IncidentStatus, string> = {
  pending: '待处理',
  dispatched: '已调派',
  responding: '响应中',
  on_scene: '已到达',
  under_control: '已控制',
  resolved: '已完成',
}

const eventColors: Record<string, string> = {
  vehicle_move: '#3b82f6',
  firefighter_move: '#22c55e',
  fire_level_change: '#ef4444',
  status_change: '#f59e0b',
  alert_trigger: '#dc2626',
  alert_clear: '#16a34a',
}

function interpolateLocation(from: GeoLocation, to: GeoLocation, progress: number): GeoLocation {
  return {
    lat: from.lat + (to.lat - from.lat) * progress,
    lng: from.lng + (to.lng - from.lng) * progress,
  }
}

function generateEventDescription(type: string, payload: PlaybackEventPayload): string {
  switch (type) {
    case 'vehicle_move': {
      const p = payload as VehicleMovePayload
      if (p.progress < 0.01) return `${p.name} 从消防站出发`
      if (p.progress >= 1) return `${p.name} 到达事故现场`
      return `${p.name} 正在前往现场 (${Math.round(p.progress * 100)}%)`
    }
    case 'firefighter_move': {
      const p = payload as FirefighterMovePayload
      return `${p.name} 移动中，体温 ${p.temperature}°C，心率 ${p.heartRate}bpm`
    }
    case 'fire_level_change': {
      const p = payload as FireLevelChangePayload
      return `火势等级变更为 ${fireLevelLabels[p.fireLevel]}`
    }
    case 'status_change': {
      const p = payload as StatusChangePayload
      return `事件状态变更为 ${statusLabels[p.status]}`
    }
    case 'alert_trigger': {
      const p = payload as AlertTriggerPayload
      return p.message
    }
    case 'alert_clear': {
      return `警报已解除`
    }
    default:
      return '事件更新'
  }
}

function createEvent(
  id: string,
  incidentId: string,
  timestamp: number,
  type: PlaybackEventType,
  payload: PlaybackEventPayload
): PlaybackEvent {
  return {
    id,
    incidentId,
    timestamp,
    type,
    payload,
    description: generateEventDescription(type, payload),
  }
}

function generateVehicleMoveEvents(
  incidentId: string,
  vehicle: Vehicle,
  station: FireStation,
  incidentLocation: GeoLocation,
  startTimeSec: number,
  startOffsetSec: number,
  durationSec: number,
  eventIdPrefix: string
): { events: PlaybackEvent[]; routePoints: GeoLocation[] } {
  const events: PlaybackEvent[] = []
  const routePoints = generateRoutePoints(station.location, incidentLocation)
  const steps = 10

  for (let i = 0; i <= steps; i++) {
    const progress = i / steps
    const offsetSec = startOffsetSec + durationSec * progress
    const timestamp = startTimeSec + offsetSec
    const currentPoint = routePoints[Math.min(i, routePoints.length - 1)]
    const nextPoint = routePoints[Math.min(i + 1, routePoints.length - 1)]

    const payload: VehicleMovePayload = {
      vehicleId: vehicle.id,
      name: vehicle.name,
      type: vehicle.type,
      from: currentPoint,
      to: nextPoint,
      progress,
    }

    events.push(
      createEvent(
        `${eventIdPrefix}-vehicle-${vehicle.id}-${i}`,
        incidentId,
        timestamp,
        'vehicle_move',
        payload
      )
    )
  }

  return { events, routePoints }
}

function generateFirefighterEvents(
  incidentId: string,
  firefighter: Firefighter,
  fireLocation: GeoLocation,
  startTimeSec: number,
  startOffsetSec: number,
  durationSec: number,
  eventIdPrefix: string
): PlaybackEvent[] {
  const events: PlaybackEvent[] = []
  const steps = 15

  const basePositions: GeoLocation[] = [
    { lat: fireLocation.lat + 0.002, lng: fireLocation.lng - 0.001 },
    { lat: fireLocation.lat - 0.001, lng: fireLocation.lng + 0.002 },
    { lat: fireLocation.lat + 0.001, lng: fireLocation.lng + 0.0015 },
    { lat: fireLocation.lat - 0.0015, lng: fireLocation.lng - 0.0005 },
  ]

  const firefighterIndex = parseInt(firefighter.id.split('-')[1]) % basePositions.length
  const basePos = basePositions[firefighterIndex]

  for (let i = 0; i <= steps; i++) {
    const progress = i / steps
    const offsetSec = startOffsetSec + durationSec * progress
    const timestamp = startTimeSec + offsetSec

    const wanderOffset = {
      lat: Math.sin(progress * Math.PI * 2 + firefighterIndex) * 0.0008,
      lng: Math.cos(progress * Math.PI * 1.5 + firefighterIndex) * 0.0008,
    }

    const currentPos = {
      lat: basePos.lat + wanderOffset.lat,
      lng: basePos.lng + wanderOffset.lng,
    }

    const prevProgress = Math.max(0, (i - 1) / steps)
    const prevPos = {
      lat: basePos.lat + Math.sin(prevProgress * Math.PI * 2 + firefighterIndex) * 0.0008,
      lng: basePos.lng + Math.cos(prevProgress * Math.PI * 1.5 + firefighterIndex) * 0.0008,
    }

    const phaseProgress = progress
    let tempBase = 36.5
    let hrBase = 85
    let coBase = 15
    let co2Base = 450
    let h2sBase = 3
    let ch4Base = 12

    if (phaseProgress > 0.3 && phaseProgress < 0.7) {
      tempBase = 38.5 + Math.sin(phaseProgress * Math.PI) * 3
      hrBase = 110 + Math.sin(phaseProgress * Math.PI) * 30
      coBase = 40 + Math.sin(phaseProgress * Math.PI) * 40
      co2Base = 900 + Math.sin(phaseProgress * Math.PI) * 500
      h2sBase = 7 + Math.sin(phaseProgress * Math.PI) * 5
      ch4Base = 25 + Math.sin(phaseProgress * Math.PI) * 20
    }

    const payload: FirefighterMovePayload = {
      firefighterId: firefighter.id,
      name: firefighter.name,
      from: prevPos,
      to: currentPos,
      progress,
      temperature: +(tempBase + (Math.random() - 0.5) * 1.5).toFixed(1),
      heartRate: Math.round(hrBase + (Math.random() - 0.5) * 15),
      gasConcentrations: {
        co: Math.round(coBase + (Math.random() - 0.5) * 15),
        co2: Math.round(co2Base + (Math.random() - 0.5) * 200),
        h2s: +(h2sBase + (Math.random() - 0.5) * 3).toFixed(1),
        ch4: Math.round(ch4Base + (Math.random() - 0.5) * 10),
      },
    }

    events.push(
      createEvent(
        `${eventIdPrefix}-ff-${firefighter.id}-${i}`,
        incidentId,
        timestamp,
        'firefighter_move',
        payload
      )
    )
  }

  return events
}

export function generatePlaybackTimeline(
  incident: Incident,
  stations: FireStation[],
  vehicles: Vehicle[],
  ffs: Firefighter[] = firefighters
): PlaybackTimeline {
  const events: PlaybackEvent[] = []
  const startTimeSec = 0
  const eventIdPrefix = `evt-${incident.id}`

  const assignedVehicles = vehicles.slice(0, 4)
  const assignedStations = assignedVehicles.map((v) =>
    stations.find((s) => s.id === v.stationId)!
  )

  const phase1Start = 0
  const phase1End = 5 * 60
  const phase2Start = 5 * 60
  const phase2End = 15 * 60
  const phase3Start = 15 * 60
  const phase3End = 25 * 60
  const phase4Start = 25 * 60
  const phase4End = 40 * 60
  const phase5Start = 40 * 60
  const phase5End = 55 * 60
  const phase6Start = 55 * 60
  const phase6End = 65 * 60

  const routeCache = new Map<string, GeoLocation[]>()

  assignedVehicles.forEach((vehicle, idx) => {
    const station = assignedStations[idx]
    const routePoints = generateRoutePoints(station.location, incident.location)
    routeCache.set(vehicle.id, routePoints)

    events.push(
      createEvent(
        `${eventIdPrefix}-vehicle-${vehicle.id}-init`,
        incident.id,
        phase1Start,
        'vehicle_move',
        {
          vehicleId: vehicle.id,
          name: vehicle.name,
          type: vehicle.type,
          from: station.location,
          to: station.location,
          progress: 0,
        } as VehicleMovePayload
      )
    )
  })

  ffs.forEach((ff) => {
    const vehicle = assignedVehicles.find((v) => v.id === ff.vehicleId)
    const station = vehicle
      ? assignedStations[assignedVehicles.indexOf(vehicle)]
      : assignedStations[0]
    events.push(
      createEvent(
        `${eventIdPrefix}-ff-${ff.id}-init`,
        incident.id,
        phase1Start,
        'firefighter_move',
        {
          firefighterId: ff.id,
          name: ff.name,
          from: station.location,
          to: station.location,
          progress: 0,
          temperature: 36.5,
          heartRate: 75,
          gasConcentrations: { co: 0, co2: 400, h2s: 0, ch4: 0 },
        } as FirefighterMovePayload
      )
    )
  })

  events.push(
    createEvent(
      `${eventIdPrefix}-status-000`,
      incident.id,
      phase1Start,
      'status_change',
      { status: 'pending' } as StatusChangePayload
    )
  )

  events.push(
    createEvent(
      `${eventIdPrefix}-firelevel-000`,
      incident.id,
      phase1Start,
      'fire_level_change',
      { fireLevel: 'small' } as FireLevelChangePayload
    )
  )

  events.push(
    createEvent(
      `${eventIdPrefix}-status-001`,
      incident.id,
      phase1Start + 30,
      'status_change',
      { status: 'dispatched' } as StatusChangePayload
    )
  )

  events.push(
    createEvent(
      `${eventIdPrefix}-firelevel-001`,
      incident.id,
      phase1Start + 60,
      'fire_level_change',
      { fireLevel: 'medium' } as FireLevelChangePayload
    )
  )

  assignedVehicles.slice(0, 2).forEach((vehicle, idx) => {
    const station = assignedStations[idx]
    const { events: moveEvents, routePoints } = generateVehicleMoveEvents(
      incident.id,
      vehicle,
      station,
      incident.location,
      startTimeSec,
      phase1Start + 60 + idx * 30,
      phase2End - (phase1Start + 60 + idx * 30),
      `${eventIdPrefix}-phase1`
    )
    events.push(...moveEvents)
    routeCache.set(vehicle.id, routePoints)
  })

  assignedVehicles.slice(2, 4).forEach((vehicle, idx) => {
    const station = assignedStations[idx + 2]
    const { events: moveEvents, routePoints } = generateVehicleMoveEvents(
      incident.id,
      vehicle,
      station,
      incident.location,
      startTimeSec,
      phase2Start + idx * 120,
      phase3End - (phase2Start + idx * 120),
      `${eventIdPrefix}-phase2`
    )
    events.push(...moveEvents)
    routeCache.set(vehicle.id, routePoints)
  })

  events.push(
    createEvent(
      `${eventIdPrefix}-alert-001`,
      incident.id,
      phase2Start + 300,
      'alert_trigger',
      {
        alertId: 'alert-play-001',
        firefighterId: 'ff-001',
        type: 'temperature',
        severity: 'warning',
        message: '消防员张伟体温升高，请注意监测',
        value: 38.5,
        threshold: 38.0,
      } as AlertTriggerPayload
    )
  )

  events.push(
    createEvent(
      `${eventIdPrefix}-alert-002`,
      incident.id,
      phase2Start + 480,
      'alert_trigger',
      {
        alertId: 'alert-play-002',
        firefighterId: 'ff-002',
        type: 'gas',
        severity: 'critical',
        message: '消防员李强CO浓度严重超标，请立即撤离！',
        value: 85,
        threshold: 50,
      } as AlertTriggerPayload
    )
  )

  events.push(
    createEvent(
      `${eventIdPrefix}-status-002`,
      incident.id,
      phase3Start + 60,
      'status_change',
      { status: 'on_scene' } as StatusChangePayload
    )
  )

  events.push(
    createEvent(
      `${eventIdPrefix}-firelevel-002`,
      incident.id,
      phase3Start + 300,
      'fire_level_change',
      { fireLevel: 'large' } as FireLevelChangePayload
    )
  )

  ffs.slice(0, 4).forEach((ff, idx) => {
    const ffEvents = generateFirefighterEvents(
      incident.id,
      ff,
      incident.location,
      startTimeSec,
      phase3Start + 120 + idx * 60,
      phase5End - (phase3Start + 120 + idx * 60),
      `${eventIdPrefix}-phase3-ff${idx}`
    )
    events.push(...ffEvents)
  })

  ffs.slice(4, 6).forEach((ff, idx) => {
    const ffEvents = generateFirefighterEvents(
      incident.id,
      ff,
      incident.location,
      startTimeSec,
      phase4Start + idx * 120,
      phase5End - (phase4Start + idx * 120),
      `${eventIdPrefix}-phase4-ff${idx + 4}`
    )
    events.push(...ffEvents)
  })

  events.push(
    createEvent(
      `${eventIdPrefix}-alert-003`,
      incident.id,
      phase5Start + 120,
      'alert_clear',
      { alertId: 'alert-play-001' } as AlertClearPayload
    )
  )

  events.push(
    createEvent(
      `${eventIdPrefix}-alert-004`,
      incident.id,
      phase5Start + 300,
      'alert_clear',
      { alertId: 'alert-play-002' } as AlertClearPayload
    )
  )

  events.push(
    createEvent(
      `${eventIdPrefix}-firelevel-003`,
      incident.id,
      phase5Start + 480,
      'fire_level_change',
      { fireLevel: 'medium' } as FireLevelChangePayload
    )
  )

  events.push(
    createEvent(
      `${eventIdPrefix}-status-003`,
      incident.id,
      phase5Start + 600,
      'status_change',
      { status: 'under_control' } as StatusChangePayload
    )
  )

  events.push(
    createEvent(
      `${eventIdPrefix}-firelevel-004`,
      incident.id,
      phase6Start + 120,
      'fire_level_change',
      { fireLevel: 'small' } as FireLevelChangePayload
    )
  )

  events.push(
    createEvent(
      `${eventIdPrefix}-status-004`,
      incident.id,
      phase6Start + 300,
      'status_change',
      { status: 'resolved' } as StatusChangePayload
    )
  )

  assignedVehicles.forEach((vehicle, idx) => {
    const station = assignedStations[idx]
    const { events: returnEvents } = generateVehicleMoveEvents(
      incident.id,
      vehicle,
      { ...station, location: incident.location },
      station.location,
      startTimeSec,
      phase6Start + 300 + idx * 60,
      phase6End - (phase6Start + 300 + idx * 60),
      `${eventIdPrefix}-return-${idx}`
    )
    events.push(...returnEvents)
  })

  events.sort((a, b) => a.timestamp - b.timestamp)

  const markers: TimelineMarker[] = []
  const markerTypes = ['status_change', 'fire_level_change', 'alert_trigger', 'alert_clear']
  let markerCounter = 0

  for (const event of events) {
    if (markerTypes.includes(event.type)) {
      markers.push({
        id: `marker-${markerCounter++}`,
        timestamp: event.timestamp,
        type: event.type === 'alert_trigger' || event.type === 'alert_clear' ? 'alert' : event.type,
        color: eventColors[event.type] || '#888',
      })
    }
  }

  const timelineIncidents: TimelineIncident[] = incidents.map((inc) => ({
    id: inc.id,
    title: `${fireLevelLabels[inc.fireLevel]}火灾`,
    address: inc.location.address,
  }))

  const startTime = new Date(incident.createdAt)
  const endTime = new Date(startTime.getTime() + phase6End * 1000)

  return {
    incidentId: incident.id,
    incidents: timelineIncidents,
    duration: phase6End,
    events,
    markers,
    startTime: startTime.toISOString(),
    endTime: endTime.toISOString(),
  }
}

export function getPlaybackStateAtTime(
  timeline: PlaybackTimeline,
  currentTimeMs: number
): PlaybackState {
  const currentTimeSec = currentTimeMs / 1000

  const relevantEvents = timeline.events.filter((e) => e.timestamp <= currentTimeSec)

  const vehicleStates = new Map<string, PlaybackVehicleState>()
  const firefighterStates = new Map<string, PlaybackFirefighterState>()
  const alertStates = new Map<string, PlaybackAlertState>()
  const vehicleRoutes = new Map<string, GeoLocation[]>()
  const vehicleProgress = new Map<string, number>()
  let currentFireLevel: FireLevel = 'small'
  let currentStatus: IncidentStatus = 'pending'

  for (const event of relevantEvents) {
    const payload = event.payload

    switch (event.type) {
      case 'vehicle_move': {
        const p = payload as VehicleMovePayload
        if (!vehicleRoutes.has(p.vehicleId)) {
          const route = generateRoutePoints(p.from, p.to)
          vehicleRoutes.set(p.vehicleId, route)
        }
        vehicleProgress.set(p.vehicleId, p.progress)

        let status = 'en_route'
        if (p.progress >= 1) status = 'on_scene'
        if (p.progress < 0.01) status = 'dispatched'

        vehicleStates.set(p.vehicleId, {
          id: p.vehicleId,
          name: p.name,
          type: p.type,
          location: interpolateLocation(p.from, p.to, p.progress),
          status,
          progress: p.progress,
        })
        break
      }
      case 'firefighter_move': {
        const p = payload as FirefighterMovePayload
        firefighterStates.set(p.firefighterId, {
          id: p.firefighterId,
          name: p.name,
          location: interpolateLocation(p.from, p.to, p.progress),
          temperature: p.temperature,
          heartRate: p.heartRate,
          gasConcentrations: p.gasConcentrations,
        })
        break
      }
      case 'fire_level_change': {
        const p = payload as FireLevelChangePayload
        currentFireLevel = p.fireLevel
        break
      }
      case 'status_change': {
        const p = payload as StatusChangePayload
        currentStatus = p.status
        break
      }
      case 'alert_trigger': {
        const p = payload as AlertTriggerPayload
        alertStates.set(p.alertId, {
          alertId: p.alertId,
          type: p.type,
          severity: p.severity,
          message: p.message,
          value: p.value,
          threshold: p.threshold,
          triggeredAt: event.timestamp,
          firefighterId: p.firefighterId,
          vehicleId: p.vehicleId,
        })
        break
      }
      case 'alert_clear': {
        const p = payload as AlertClearPayload
        alertStates.delete(p.alertId)
        break
      }
    }
  }

  const routeLines: RouteLine[] = []
  for (const [vehicleId, points] of vehicleRoutes.entries()) {
    const progress = vehicleProgress.get(vehicleId) || 0
    routeLines.push({ vehicleId, points, progress })
  }

  return {
    vehicles: Array.from(vehicleStates.values()),
    firefighters: Array.from(firefighterStates.values()),
    fireLevel: currentFireLevel,
    incidentStatus: currentStatus,
    activeAlerts: Array.from(alertStates.values()),
    routeLines,
    currentTime: currentTimeSec,
  }
}

export const sampleTimeline: PlaybackTimeline = generatePlaybackTimeline(
  incidents[0],
  fireStations,
  mockVehicles.filter((v) => ['v-002', 'v-004', 'v-006', 'v-009'].includes(v.id))
)
