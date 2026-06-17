import { NextRequest, NextResponse } from 'next/server'
import { fireStations } from '@/lib/mock-data'

const dispatchPlans = [
  {
    id: 'dp-001',
    incidentId: 'inc-001',
    stations: fireStations.filter((s) => s.id === 'fs-002' || s.id === 'fs-001'),
    vehicles: [
      { vehicleId: 'v-004', type: 'water_tanker' as const, count: 1 },
      { vehicleId: 'v-002', type: 'ladder' as const, count: 1 },
      { vehicleId: 'v-001', type: 'water_tanker' as const, count: 1 },
      { vehicleId: 'v-003', type: 'rescue' as const, count: 1 },
    ],
    createdAt: '2026-06-17T08:20:00Z',
    status: 'executing' as const,
  },
  {
    id: 'dp-002',
    incidentId: 'inc-002',
    stations: fireStations.filter((s) => s.id === 'fs-001'),
    vehicles: [
      { vehicleId: 'v-001', type: 'water_tanker' as const, count: 1 },
      { vehicleId: 'v-003', type: 'rescue' as const, count: 1 },
    ],
    createdAt: '2026-06-17T07:50:00Z',
    status: 'completed' as const,
  },
]

export async function GET() {
  return NextResponse.json(dispatchPlans)
}

export async function POST(request: NextRequest) {
  const body = await request.json()

  const newPlan = {
    id: crypto.randomUUID(),
    ...body,
    createdAt: new Date().toISOString(),
    status: body.status ?? 'draft',
  }

  return NextResponse.json(newPlan, { status: 201 })
}
