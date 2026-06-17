'use client'

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
import type {
  PlaybackTimeline,
  PlaybackState,
} from '@/lib/types/playback'
import {
  incidents as mockIncidents,
  fireStations as mockStations,
  vehicles as mockVehicles,
  waterSources as mockWaterSources,
  sensorData as mockSensorData,
  alerts as mockAlerts,
  postIncidentReports as mockReports,
} from '@/lib/mock-data'
import {
  loadPersistedData,
  persistIncidents,
  persistPostIncidentReports,
  persistDispatchPlans,
  persistMapAnnotations,
  persistAlerts,
  persistSensorData,
  persistVehicles,
} from '@/lib/persist'

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

  playback: {
    isEnabled: boolean
    isPlaying: boolean
    currentTime: number
    playbackSpeed: number
    selectedIncidentId: string | null
    timeline: PlaybackTimeline | null
    currentState: PlaybackState | null
  }

  enablePlayback: (incidentId: string, timeline: PlaybackTimeline) => void
  disablePlayback: () => void
  setPlaybackPlaying: (isPlaying: boolean) => void
  setPlaybackTime: (time: number) => void
  setPlaybackSpeed: (speed: number) => void
  setPlaybackState: (state: PlaybackState | null) => void

  _hydrated: boolean
  hydrate: () => void
}

let initialIncidents = mockIncidents
let initialReports = mockReports
let initialPlans: DispatchPlan[] = []
let initialAnnotations: MapAnnotation[] = []
let initialAlerts = mockAlerts
let initialSensor = mockSensorData
let initialVehicles = mockVehicles

if (typeof window !== 'undefined') {
  const persisted = loadPersistedData()
  if (persisted.incidents?.length) {
    const mockIds = new Set(mockIncidents.map((i) => i.id))
    const persistentIncidents = persisted.incidents.filter(
      (i) => !mockIds.has(i.id) || true
    )
    const mergedIncidents = [...mockIncidents]
    persistentIncidents.forEach((pi) => {
      const idx = mergedIncidents.findIndex((i) => i.id === pi.id)
      if (idx >= 0) {
        mergedIncidents[idx] = pi
      } else {
        mergedIncidents.push(pi)
      }
    })
    initialIncidents = mergedIncidents
  }
  if (persisted.postIncidentReports?.length) {
    const mockIds = new Set(mockReports.map((r) => r.id))
    const persistentReports = persisted.postIncidentReports.filter(
      (r) => !mockIds.has(r.id) || true
    )
    const mergedReports = [...mockReports]
    persistentReports.forEach((pr) => {
      const idx = mergedReports.findIndex((r) => r.id === pr.id)
      if (idx >= 0) {
        mergedReports[idx] = pr
      } else {
        mergedReports.push(pr)
      }
    })
    initialReports = mergedReports
  }
  if (persisted.dispatchPlans?.length) initialPlans = persisted.dispatchPlans
  if (persisted.mapAnnotations?.length) initialAnnotations = persisted.mapAnnotations
  if (persisted.alerts?.length) initialAlerts = persisted.alerts
  if (persisted.sensorData?.length) initialSensor = persisted.sensorData
  if (persisted.vehicles?.length) initialVehicles = persisted.vehicles
}

export const useFireCommandStore = create<FireCommandStore>()((set, get) => ({
  incidents: initialIncidents,
  addIncident: (incident) =>
    set((state) => {
      const next = [...state.incidents, incident]
      if (typeof window !== 'undefined') persistIncidents(next)
      return { incidents: next }
    }),
  updateIncident: (id, updates) =>
    set((state) => {
      const next = state.incidents.map((i) =>
        i.id === id ? { ...i, ...updates } : i
      )
      if (typeof window !== 'undefined') persistIncidents(next)
      return { incidents: next }
    }),
  deleteIncident: (id) =>
    set((state) => {
      const next = state.incidents.filter((i) => i.id !== id)
      if (typeof window !== 'undefined') persistIncidents(next)
      return { incidents: next }
    }),

  stations: mockStations,

  vehicles: initialVehicles,
  updateVehicleStatus: (id, status) =>
    set((state) => {
      const next = state.vehicles.map((v) =>
        v.id === id ? { ...v, status } : v
      )
      if (typeof window !== 'undefined') persistVehicles(next)
      return { vehicles: next }
    }),
  updateVehicleLocation: (id, lat, lng) =>
    set((state) => {
      const next = state.vehicles.map((v) =>
        v.id === id ? { ...v, currentLocation: { lat, lng } } : v
      )
      if (typeof window !== 'undefined') persistVehicles(next)
      return { vehicles: next }
    }),

  dispatchPlans: initialPlans,
  addDispatchPlan: (plan) =>
    set((state) => {
      const next = [...state.dispatchPlans, plan]
      if (typeof window !== 'undefined') persistDispatchPlans(next)
      return { dispatchPlans: next }
    }),
  updateDispatchPlanStatus: (id, status) =>
    set((state) => {
      const next = state.dispatchPlans.map((p) =>
        p.id === id ? { ...p, status } : p
      )
      if (typeof window !== 'undefined') persistDispatchPlans(next)
      return { dispatchPlans: next }
    }),

  waterSources: mockWaterSources,

  sensorData: initialSensor,
  updateSensorData: (data) =>
    set((state) => {
      const next = state.sensorData.map((s) =>
        s.firefighterId === data.firefighterId ? data : s
      )
      if (typeof window !== 'undefined') persistSensorData(next)
      return { sensorData: next }
    }),

  alerts: initialAlerts,
  addAlert: (alert) =>
    set((state) => {
      const next = [...state.alerts, alert]
      if (typeof window !== 'undefined') persistAlerts(next)
      return { alerts: next }
    }),
  acknowledgeAlert: (id) =>
    set((state) => {
      const next = state.alerts.map((a) =>
        a.id === id ? { ...a, acknowledged: true } : a
      )
      if (typeof window !== 'undefined') persistAlerts(next)
      return { alerts: next }
    }),

  postIncidentReports: initialReports,
  addReport: (report) =>
    set((state) => {
      const next = [...state.postIncidentReports, report]
      if (typeof window !== 'undefined') persistPostIncidentReports(next)
      return { postIncidentReports: next }
    }),
  updateReport: (id, updates) =>
    set((state) => {
      const next = state.postIncidentReports.map((r) =>
        r.id === id ? { ...r, ...updates } : r
      )
      if (typeof window !== 'undefined') persistPostIncidentReports(next)
      return { postIncidentReports: next }
    }),

  mapAnnotations: initialAnnotations,
  addAnnotation: (annotation) =>
    set((state) => {
      const next = [...state.mapAnnotations, annotation]
      if (typeof window !== 'undefined') persistMapAnnotations(next)
      return { mapAnnotations: next }
    }),
  removeAnnotation: (id) =>
    set((state) => {
      const next = state.mapAnnotations.filter((a) => a.id !== id)
      if (typeof window !== 'undefined') persistMapAnnotations(next)
      return { mapAnnotations: next }
    }),

  playback: {
    isEnabled: false,
    isPlaying: false,
    currentTime: 0,
    playbackSpeed: 1,
    selectedIncidentId: null,
    timeline: null,
    currentState: null,
  },

  enablePlayback: (incidentId, timeline) =>
    set(() => ({
      playback: {
        isEnabled: true,
        isPlaying: false,
        currentTime: 0,
        playbackSpeed: 1,
        selectedIncidentId: incidentId,
        timeline,
        currentState: null,
      },
    })),

  disablePlayback: () =>
    set(() => ({
      playback: {
        isEnabled: false,
        isPlaying: false,
        currentTime: 0,
        playbackSpeed: 1,
        selectedIncidentId: null,
        timeline: null,
        currentState: null,
      },
    })),

  setPlaybackPlaying: (isPlaying) =>
    set((state) => ({
      playback: { ...state.playback, isPlaying },
    })),

  setPlaybackTime: (time) =>
    set((state) => ({
      playback: { ...state.playback, currentTime: time },
    })),

  setPlaybackSpeed: (speed) =>
    set((state) => ({
      playback: { ...state.playback, playbackSpeed: speed },
    })),

  setPlaybackState: (state) =>
    set((s) => ({
      playback: { ...s.playback, currentState: state },
    })),

  _hydrated: false,
  hydrate: () => {
    if (get()._hydrated) return
    if (typeof window === 'undefined') return

    const persisted = loadPersistedData()
    const updates: Partial<FireCommandStore> = { _hydrated: true }

    if (persisted.incidents?.length) {
      const mockIds = new Set(mockIncidents.map((i) => i.id))
      const persistentIncidents = persisted.incidents
      const mergedIncidents = [...mockIncidents]
      persistentIncidents.forEach((pi) => {
        const idx = mergedIncidents.findIndex((i) => i.id === pi.id)
        if (idx >= 0) {
          mergedIncidents[idx] = pi
        } else {
          mergedIncidents.push(pi)
        }
      })
      updates.incidents = mergedIncidents
    }

    if (persisted.postIncidentReports?.length) {
      const mockIds = new Set(mockReports.map((r) => r.id))
      const persistentReports = persisted.postIncidentReports
      const mergedReports = [...mockReports]
      persistentReports.forEach((pr) => {
        const idx = mergedReports.findIndex((r) => r.id === pr.id)
        if (idx >= 0) {
          mergedReports[idx] = pr
        } else {
          mergedReports.push(pr)
        }
      })
      updates.postIncidentReports = mergedReports
    }

    if (persisted.dispatchPlans?.length) updates.dispatchPlans = persisted.dispatchPlans
    if (persisted.mapAnnotations?.length) updates.mapAnnotations = persisted.mapAnnotations
    if (persisted.alerts?.length) updates.alerts = persisted.alerts
    if (persisted.sensorData?.length) updates.sensorData = persisted.sensorData
    if (persisted.vehicles?.length) updates.vehicles = persisted.vehicles

    set(updates)
  },
}))

if (typeof window !== 'undefined') {
  ;(window as any).useFireCommandStore = useFireCommandStore
}
