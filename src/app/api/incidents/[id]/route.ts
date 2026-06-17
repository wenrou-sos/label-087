import { NextRequest, NextResponse } from 'next/server'
import { incidents } from '@/lib/mock-data'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const incident = incidents.find((i) => i.id === id)

  if (!incident) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json(incident)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const incident = incidents.find((i) => i.id === id)

  if (!incident) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const body = await request.json()
  const updated = {
    ...incident,
    ...body,
    id: incident.id,
    createdAt: incident.createdAt,
    updatedAt: new Date().toISOString(),
  }

  return NextResponse.json(updated)
}
