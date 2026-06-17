import { NextResponse } from 'next/server'
import { sensorData, alerts } from '@/lib/mock-data'

export async function GET() {
  return NextResponse.json({
    sensorData,
    alerts,
  })
}
