'use client'

import { Suspense, useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import AppLayout from '@/components/layout/AppLayout'
import AlertPanel from '@/components/monitor/AlertPanel'
import TemperatureMap from '@/components/monitor/TemperatureMap'
import GasChart from '@/components/monitor/GasChart'
import GasGauge from '@/components/monitor/GasGauge'
import FirefighterTracker from '@/components/monitor/FirefighterTracker'
import { useFireCommandStore } from '@/store'
import type { GasConcentrations } from '@/lib/types'

interface GasDataPoint {
  time: string
  co: number
  co2: number
  h2s: number
  ch4: number
}

function generateInitialGasHistory(): GasDataPoint[] {
  const data: GasDataPoint[] = []
  const now = Date.now()
  for (let i = 19; i >= 0; i--) {
    const t = new Date(now - i * 3000)
    data.push({
      time: t.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      co: 20 + Math.random() * 30,
      co2: 400 + Math.random() * 300,
      h2s: 2 + Math.random() * 4,
      ch4: 8 + Math.random() * 15,
    })
  }
  return data
}

function varyValue(current: number, min: number, max: number, maxDelta: number): number {
  const delta = (Math.random() - 0.5) * 2 * maxDelta
  return Math.min(Math.max(current + delta, min), max)
}

export default function MonitorPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen bg-bg-primary text-text-secondary">加载中...</div>}>
      <MonitorPageContent />
    </Suspense>
  )
}

function MonitorPageContent() {
  const searchParams = useSearchParams()
  const incidentId = searchParams.get('incidentId')

  const sensorData = useFireCommandStore((s) => s.sensorData)
  const alerts = useFireCommandStore((s) => s.alerts)
  const incidents = useFireCommandStore((s) => s.incidents)
  const updateSensorData = useFireCommandStore((s) => s.updateSensorData)
  const addAlert = useFireCommandStore((s) => s.addAlert)

  const [gasHistory, setGasHistory] = useState<GasDataPoint[]>(generateInitialGasHistory)

  const activeIncident = incidentId
    ? incidents.find((i) => i.id === incidentId)
    : incidents.find((i) => i.status !== 'resolved')

  const mapCenter = activeIncident
    ? { lat: activeIncident.location.lat, lng: activeIncident.location.lng }
    : { lat: 31.2397, lng: 121.4998 }

  const avgGas: GasConcentrations = sensorData.reduce(
    (acc, s) => ({
      co: acc.co + s.gasConcentrations.co / sensorData.length,
      co2: acc.co2 + s.gasConcentrations.co2 / sensorData.length,
      h2s: acc.h2s + s.gasConcentrations.h2s / sensorData.length,
      ch4: acc.ch4 + s.gasConcentrations.ch4 / sensorData.length,
    }),
    { co: 0, co2: 0, h2s: 0, ch4: 0 }
  )

  const tick = useCallback(() => {
    const now = new Date()
    const timeStr = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })

    const latestGas = { co: 0, co2: 0, h2s: 0, ch4: 0 }

    for (const s of sensorData) {
      const updated = {
        ...s,
        temperature: varyValue(s.temperature, 35, 44, 0.3),
        heartRate: Math.round(varyValue(s.heartRate, 70, 170, 3)),
        gasConcentrations: {
          co: varyValue(s.gasConcentrations.co, 5, 100, 3),
          co2: varyValue(s.gasConcentrations.co2, 300, 2000, 30),
          h2s: varyValue(s.gasConcentrations.h2s, 0.5, 20, 0.8),
          ch4: varyValue(s.gasConcentrations.ch4, 2, 60, 2),
        },
        timestamp: now.toISOString(),
        location: {
          lat: varyValue(s.location.lat, s.location.lat - 0.001, s.location.lat + 0.001, 0.0002),
          lng: varyValue(s.location.lng, s.location.lng - 0.001, s.location.lng + 0.001, 0.0002),
        },
      }
      updateSensorData(updated)
      latestGas.co += updated.gasConcentrations.co / sensorData.length
      latestGas.co2 += updated.gasConcentrations.co2 / sensorData.length
      latestGas.h2s += updated.gasConcentrations.h2s / sensorData.length
      latestGas.ch4 += updated.gasConcentrations.ch4 / sensorData.length
    }

    setGasHistory((prev) => {
      const next = [...prev.slice(-19), { time: timeStr, ...latestGas }]
      return next
    })

    if (Math.random() < 0.15) {
      const randomFf = sensorData[Math.floor(Math.random() * sensorData.length)]
      const alertTypes = [
        { type: 'gas' as const, field: 'co' as const, threshold: 50, unit: 'ppm' },
        { type: 'gas' as const, field: 'h2s' as const, threshold: 10, unit: 'ppm' },
        { type: 'temperature' as const, field: null, threshold: 40, unit: '°C' },
        { type: 'heartRate' as const, field: null, threshold: 140, unit: 'bpm' },
      ]
      const chosen = alertTypes[Math.floor(Math.random() * alertTypes.length)]
      const value = chosen.field
        ? randomFf.gasConcentrations[chosen.field]
        : chosen.type === 'temperature'
          ? randomFf.temperature
          : randomFf.heartRate

      if (value > chosen.threshold * 0.9) {
        const gasLabels: Record<string, string> = { co: 'CO', h2s: 'H₂S' }
        const typeLabels: Record<string, string> = { gas: '气体浓度', temperature: '体温', heartRate: '心率' }
        const label = chosen.field ? gasLabels[chosen.field] : ''
        addAlert({
          id: `alert-${Date.now()}`,
          type: chosen.type,
          severity: value > chosen.threshold ? 'critical' : 'warning',
          message: `消防员${randomFf.name}${label ? label : typeLabels[chosen.type]}${value > chosen.threshold ? '严重超标' : '接近警戒值'}，当前${value.toFixed(1)}${chosen.unit}`,
          firefighterId: randomFf.firefighterId,
          value,
          threshold: chosen.threshold,
          timestamp: now.toISOString(),
          acknowledged: false,
        })
      }
    }
  }, [sensorData, updateSensorData, addAlert])

  useEffect(() => {
    const interval = setInterval(tick, 3000)
    return () => clearInterval(interval)
  }, [tick])

  return (
    <AppLayout title="实时监测">
      <div className="flex flex-col gap-4 h-full">
        <div className="rounded-lg border border-border bg-bg-tertiary p-3">
          <h3 className="mb-2 text-xs font-semibold text-text-secondary">活跃告警</h3>
          <AlertPanel />
        </div>

        <div className="grid flex-1 grid-cols-1 gap-4 lg:grid-cols-2 min-h-0">
          <div className="flex flex-col gap-4 min-h-0">
            <div className="relative h-[45%] min-h-[200px] rounded-lg border border-border bg-bg-tertiary overflow-hidden">
              <TemperatureMap centerLocation={mapCenter} radius={200} />
            </div>
            <div className="flex-1 min-h-[200px] rounded-lg border border-border bg-bg-tertiary p-3">
              <h3 className="mb-1 text-xs font-semibold text-text-secondary">气体浓度趋势</h3>
              <div className="h-[calc(100%-20px)]">
                <GasChart data={gasHistory} />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 min-h-0">
            <div className="rounded-lg border border-border bg-bg-tertiary p-4">
              <h3 className="mb-3 text-xs font-semibold text-text-secondary">气体浓度仪表</h3>
              <div className="flex items-center justify-around">
                <GasGauge label="CO" value={avgGas.co} unit="ppm" maxRange={100} threshold={50} />
                <GasGauge label="CO₂" value={avgGas.co2} unit="ppm" maxRange={2000} threshold={1000} />
                <GasGauge label="H₂S" value={avgGas.h2s} unit="ppm" maxRange={20} threshold={10} />
                <GasGauge label="CH₄" value={avgGas.ch4} unit="ppm" maxRange={60} threshold={25} />
              </div>
            </div>
            <div className="flex-1 min-h-[200px] rounded-lg border border-border bg-bg-tertiary p-3 overflow-hidden">
              <FirefighterTracker />
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
