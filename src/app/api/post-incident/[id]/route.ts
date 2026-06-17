import { NextRequest, NextResponse } from 'next/server'
import { postIncidentReports } from '@/lib/mock-data'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const report = postIncidentReports.find((r) => r.id === id)

  if (!report) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json(report)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const report = postIncidentReports.find((r) => r.id === id)

  if (!report) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const body = await request.json()
  const updated = {
    ...report,
    ...body,
    id: report.id,
    createdAt: report.createdAt,
    updatedAt: new Date().toISOString(),
  }

  return NextResponse.json(updated)
}
