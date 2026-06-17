const STORAGE_KEY = 'fire-command-persist-v1'

type PersistedData = {
  incidents: any[]
  postIncidentReports: any[]
  dispatchPlans: any[]
  mapAnnotations: any[]
  alerts: any[]
  sensorData: any[]
  vehicles: any[]
  _timestamp: number
}

const DEFAULT_DATA: PersistedData = {
  incidents: [],
  postIncidentReports: [],
  dispatchPlans: [],
  mapAnnotations: [],
  alerts: [],
  sensorData: [],
  vehicles: [],
  _timestamp: 0,
}

export function isBrowser(): boolean {
  return typeof window !== 'undefined'
}

export function loadPersistedData(): Partial<PersistedData> {
  if (!isBrowser()) return {}
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const data = JSON.parse(raw) as PersistedData
    return data
  } catch (err) {
    console.error('Failed to load persisted data:', err)
    return {}
  }
}

export function savePersistedData(data: Partial<PersistedData>): void {
  if (!isBrowser()) return
  try {
    const existing = loadPersistedData()
    const merged: PersistedData = {
      ...DEFAULT_DATA,
      ...existing,
      ...data,
      _timestamp: Date.now(),
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged))
  } catch (err) {
    console.error('Failed to save persisted data:', err)
  }
}

export function clearPersistedData(): void {
  if (!isBrowser()) return
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (err) {
    console.error('Failed to clear persisted data:', err)
  }
}

export function persistIncidents(incidents: any[]): void {
  savePersistedData({ incidents })
}

export function persistPostIncidentReports(reports: any[]): void {
  savePersistedData({ postIncidentReports: reports })
}

export function persistDispatchPlans(plans: any[]): void {
  savePersistedData({ dispatchPlans: plans })
}

export function persistMapAnnotations(annotations: any[]): void {
  savePersistedData({ mapAnnotations: annotations })
}

export function persistAlerts(alerts: any[]): void {
  savePersistedData({ alerts })
}

export function persistSensorData(data: any[]): void {
  savePersistedData({ sensorData: data })
}

export function persistVehicles(vehicles: any[]): void {
  savePersistedData({ vehicles })
}
