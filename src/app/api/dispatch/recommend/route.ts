import { NextRequest, NextResponse } from 'next/server'
import { incidents, fireStations, vehicles } from '@/lib/mock-data'
import { findNearestStations, estimateArrivalTime } from '@/lib/geo'
import type { Incident, VehicleType } from '@/lib/types'

const vehicleAssignments: Record<Incident['fireLevel'], { type: VehicleType; count: number }[]> = {
  small: [
    { type: 'water_tanker', count: 1 },
    { type: 'rescue', count: 1 },
  ],
  medium: [
    { type: 'water_tanker', count: 2 },
    { type: 'ladder', count: 1 },
    { type: 'rescue', count: 1 },
  ],
  large: [
    { type: 'water_tanker', count: 3 },
    { type: 'ladder', count: 2 },
    { type: 'rescue', count: 2 },
    { type: 'command', count: 1 },
    { type: 'foam', count: 1 },
  ],
  fierce: [
    { type: 'water_tanker', count: 4 },
    { type: 'ladder', count: 2 },
    { type: 'rescue', count: 3 },
    { type: 'command', count: 1 },
    { type: 'foam', count: 2 },
  ],
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const incidentId = searchParams.get('incidentId')

  if (!incidentId) {
    return NextResponse.json({ error: 'incidentId query parameter is required' }, { status: 400 })
  }

  const incident = incidents.find((i) => i.id === incidentId)

  if (!incident) {
    return NextResponse.json({ error: 'Incident not found' }, { status: 404 })
  }

  const nearestStations = findNearestStations(
    { lat: incident.location.lat, lng: incident.location.lng },
    fireStations,
    3
  )

  const assignments = vehicleAssignments[incident.fireLevel]

  const vehicleDetails = assignments.map((assignment) => {
    const matchingVehicles = vehicles.filter(
      (v) => v.type === assignment.type && v.status === 'available'
    )
    const assigned = matchingVehicles.slice(0, assignment.count)

    return {
      type: assignment.type,
      count: assignment.count,
      vehicles: assigned.map((v) => ({
        vehicleId: v.id,
        name: v.name,
        stationId: v.stationId,
      })),
    }
  })

  const stationDetails = nearestStations.map((station) => ({
    ...station,
    estimatedArrival: estimateArrivalTime(station.distance),
  }))

  const recommendedPlan = {
    id: crypto.randomUUID(),
    incidentId: incident.id,
    fireLevel: incident.fireLevel,
    stations: stationDetails,
    vehicles: vehicleDetails,
    createdAt: new Date().toISOString(),
    status: 'draft',
  }

  return NextResponse.json(recommendedPlan)
}
