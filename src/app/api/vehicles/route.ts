import { NextRequest, NextResponse } from 'next/server'
import { vehicles } from '@/lib/mock-data'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const stationId = searchParams.get('stationId')

  let result = vehicles

  if (status) {
    result = result.filter((v) => v.status === status)
  }

  if (stationId) {
    result = result.filter((v) => v.stationId === stationId)
  }

  return NextResponse.json(result)
}
