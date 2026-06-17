import { NextRequest, NextResponse } from 'next/server'
import { incidents } from '@/lib/mock-data'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')

  let result = incidents
  if (status) {
    result = result.filter((incident) => incident.status === status)
  }

  return NextResponse.json(result)
}

export async function POST(request: NextRequest) {
  const body = await request.json()

  const newIncident = {
    id: crypto.randomUUID(),
    ...body,
    status: body.status ?? 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  return NextResponse.json(newIncident, { status: 201 })
}
