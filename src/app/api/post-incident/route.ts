import { NextRequest, NextResponse } from 'next/server'
import { postIncidentReports } from '@/lib/mock-data'

export async function GET() {
  return NextResponse.json(postIncidentReports)
}

export async function POST(request: NextRequest) {
  const body = await request.json()

  const newReport = {
    id: crypto.randomUUID(),
    ...body,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  return NextResponse.json(newReport, { status: 201 })
}
