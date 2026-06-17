import { NextRequest, NextResponse } from 'next/server'
import { waterSources } from '@/lib/mock-data'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type')

  let result = waterSources

  if (type) {
    result = result.filter((ws) => ws.type === type)
  }

  return NextResponse.json(result)
}
