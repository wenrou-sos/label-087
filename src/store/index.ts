import { create } from 'zustand'
import type {
  Incident,
  FireStation,
  Vehicle,
  VehicleStatus,
  DispatchPlan,
  DispatchPlanStatus,
  WaterSource,
  SensorData,
  Alert,
  PostIncidentReport,
  MapAnnotation,
} from '@/lib/types'
import {
  incidents as mockIncidents,
  fireStations as mockStations,
  vehicles as mockVehicles,
  waterSources as mockWaterSources,
  sensorData as mockSensorData,
  alerts as mockAlerts,
  postIncidentReports as mockReports,
} from '@/lib/mock-data'

interface FireCommandStore {
  incidents: Incident[]
  addIncident: (incident: Incident) => void
  updateIncident: (id: string, updates: Partial<Incident>) => void
  deleteIncident: (id: string) => void

  stations: FireStation[]

  vehicles: Vehicle[]
  updateVehicleStatus: (id: string, status: VehicleStatus) => void
  updateVehicleLocation: (id: string, lat: number, lng: number) => void

  dispatchPlans: DispatchPlan[]
  addDispatchPlan: (plan: DispatchPlan) => void
  updateDispatchPlanStatus: (id: string, status: DispatchPlanStatus) => void

  waterSources: WaterSource[]

  sensorData: SensorData[]
  updateSensorData: (data: SensorData) => void

  alerts: Alert[]
  addAlert: (alert: Alert) => void
  acknowledgeAlert: (id: string) => void

  postIncidentReports: PostIncidentReport[]
  addReport: (report: PostIncidentReport) => void
  updateReport: (id: string, updates: Partial<PostIncidentReport>) => void

  mapAnnotations: MapAnnotation[]
  addAnnotation: (annotation: MapAnnotation) => void
  removeAnnotation: (id: string) => void
}

export const useFireCommandStore = create<FireCommandStore>()((set) => ({
  incidents: mockIncidents,
  addIncident: (incident) =>
    set((state) => ({ incidents: [...state.incidents, incident] })),
  updateIncident: (id, updates) =>
    set((state) => ({
      incidents: state.incidents.map((i) =>
        i.id === id ? { ...i, ...updates } : i
      ),
    })),
  deleteIncident: (id) =>
    set((state) => ({
      incidents: state.incidents.filter((i) => i.id !== id),
    })),

  stations: mockStations,

  vehicles: mockVehicles,
  updateVehicleStatus: (id, status) =>
    set((state) => ({
      vehicles: state.vehicles.map((v) =>
        v.id === id ? { ...v, status } : v
      ),
    })),
  updateVehicleLocation: (id, lat, lng) =>
    set((state) => ({
      vehicles: state.vehicles.map((v) =>
        v.id === id ? { ...v, currentLocation: { lat, lng } } : v
      ),
    })),

  dispatchPlans: [],
  addDispatchPlan: (plan) =>
    set((state) => ({ dispatchPlans: [...state.dispatchPlans, plan] })),
  updateDispatchPlanStatus: (id, status) =>
    set((state) => ({
      dispatchPlans: state.dispatchPlans.map((p) =>
        p.id === id ? { ...p, status } : p
      ),
    })),

  waterSources: mockWaterSources,

  sensorData: mockSensorData,
  updateSensorData: (data) =>
    set((state) => ({
      sensorData: state.sensorData.map((s) =>
        s.firefighterId === data.firefighterId ? data : s
      ),
    })),

  alerts: mockAlerts,
  addAlert: (alert) =>
    set((state) => ({ alerts: [...state.alerts, alert] })),
  acknowledgeAlert: (id) =>
    set((state) => ({
      alerts: state.alerts.map((a) =>
        a.id === id ? { ...a, acknowledged: true } : a
      ),
    })),

  postIncidentReports: mockReports,
  addReport: (report) =>
    set((state) => ({
      postIncidentReports: [...state.postIncidentReports, report],
    })),
  updateReport: (id, updates) =>
    set((state) => ({
      postIncidentReports: state.postIncidentReports.map((r) =>
        r.id === id ? { ...r, ...updates } : r
      ),
    })),

  mapAnnotations: [],
  addAnnotation: (annotation) =>
    set((state) => ({
      mapAnnotations: [...state.mapAnnotations, annotation],
    })),
  removeAnnotation: (id) =>
    set((state) => ({
      mapAnnotations: state.mapAnnotations.filter((a) => a.id !== id),
    })),
}))
