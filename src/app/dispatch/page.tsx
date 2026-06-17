'use client'

import { Suspense, useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { Zap, Truck } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import AppLayout from '@/components/layout/AppLayout'
import { useFireCommandStore } from '@/store'
import { getVehicleTypeLabel } from '@/lib/utils'
import type { DispatchPlan, VehicleType } from '@/lib/types'
import DispatchPlanCard from '@/components/dispatch/DispatchPlanCard'
import VehicleCard from '@/components/dispatch/VehicleCard'

type RecommendResponse = {
  id: string
  incidentId: string
  fireLevel: string
  stations: (DispatchPlan['stations'][number] & { distance: number; estimatedArrival: number })[]
  vehicles: { type: VehicleType; count: number; vehicles: { vehicleId: string; name: string; stationId: string }[] }[]
  createdAt: string
  status: 'draft' | 'confirmed' | 'executing' | 'completed'
}

export default function DispatchPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen bg-bg-primary text-text-secondary">加载中...</div>}>
      <DispatchPageContent />
    </Suspense>
  )
}

function DispatchPageContent() {
  const searchParams = useSearchParams()
  const incidentIdParam = searchParams.get('incidentId')

  const incidents = useFireCommandStore((s) => s.incidents)
  const vehicles = useFireCommandStore((s) => s.vehicles)
  const stations = useFireCommandStore((s) => s.stations)
  const addDispatchPlan = useFireCommandStore((s) => s.addDispatchPlan)
  const updateDispatchPlanStatus = useFireCommandStore((s) => s.updateDispatchPlanStatus)

  const activeIncidents = incidents.filter((i) => i.status !== 'resolved')

  const [selectedIncidentId, setSelectedIncidentId] = useState(incidentIdParam ?? '')
  const [recommendedPlan, setRecommendedPlan] = useState<RecommendResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [stationFilter, setStationFilter] = useState('all')
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    if (incidentIdParam) {
      setSelectedIncidentId(incidentIdParam)
    }
  }, [incidentIdParam])

  const handleRecommend = useCallback(async () => {
    if (!selectedIncidentId) return
    setLoading(true)
    setRecommendedPlan(null)
    try {
      const res = await fetch(`/api/dispatch/recommend?incidentId=${selectedIncidentId}`)
      const data = await res.json()
      setRecommendedPlan(data)
    } catch {
      setRecommendedPlan(null)
    } finally {
      setLoading(false)
    }
  }, [selectedIncidentId])

  const handleConfirm = useCallback(
    (planId: string) => {
      updateDispatchPlanStatus(planId, 'confirmed')
      if (recommendedPlan) {
        setRecommendedPlan({ ...recommendedPlan, status: 'confirmed' })
      }
      setSuccessMsg('方案已确认')
      setTimeout(() => setSuccessMsg(''), 3000)
    },
    [recommendedPlan, updateDispatchPlanStatus]
  )

  const handleExecute = useCallback(
    (planId: string) => {
      updateDispatchPlanStatus(planId, 'executing')
      if (recommendedPlan) {
        const plan: DispatchPlan = {
          id: recommendedPlan.id,
          incidentId: recommendedPlan.incidentId,
          stations: recommendedPlan.stations,
          vehicles: recommendedPlan.vehicles.map((v) => ({
            vehicleId: v.vehicles[0]?.vehicleId ?? '',
            type: v.type,
            count: v.count,
          })),
          createdAt: recommendedPlan.createdAt,
          status: 'executing',
        }
        addDispatchPlan(plan)
        setRecommendedPlan({ ...recommendedPlan, status: 'executing' })
      }
      setSuccessMsg('方案正在执行')
      setTimeout(() => setSuccessMsg(''), 3000)
    },
    [recommendedPlan, addDispatchPlan, updateDispatchPlanStatus]
  )

  const filteredVehicles = stationFilter === 'all'
    ? vehicles
    : vehicles.filter((v) => v.stationId === stationFilter)

  return (
    <AppLayout title="智能调度">
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-4 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-400"
          >
            {successMsg}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex gap-6">
        <div className="flex-[2] min-w-0">
          <div className="mb-4 flex items-center gap-3">
            <select
              value={selectedIncidentId}
              onChange={(e) => setSelectedIncidentId(e.target.value)}
              className="rounded-lg border border-border bg-bg-tertiary px-3 py-2 text-sm text-text-primary outline-none focus:border-accent-blue"
            >
              <option value="">选择警情...</option>
              {activeIncidents.map((inc) => (
                <option key={inc.id} value={inc.id}>
                  {inc.location.address} - {inc.fireLevel}
                </option>
              ))}
            </select>

            <button
              onClick={handleRecommend}
              disabled={!selectedIncidentId || loading}
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Zap className="h-4 w-4" />
              {loading ? '生成中...' : '生成推荐方案'}
            </button>
          </div>

          {recommendedPlan && (
            <div className="mb-6">
              <DispatchPlanCard
                plan={{
                  ...recommendedPlan,
                  stations: recommendedPlan.stations,
                  vehicles: recommendedPlan.vehicles.map((v) => ({
                    vehicleId: v.vehicles[0]?.vehicleId ?? '',
                    type: v.type,
                    count: v.count,
                  })),
                }}
                onConfirm={handleConfirm}
                onExecute={handleExecute}
              />
            </div>
          )}

          {recommendedPlan && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="rounded-lg border border-border bg-bg-tertiary p-4"
            >
              <h3 className="mb-3 text-sm font-semibold text-text-primary">推荐车辆明细</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-text-muted">
                      <th className="px-3 py-2 text-left font-medium">车辆类型</th>
                      <th className="px-3 py-2 text-left font-medium">需求数量</th>
                      <th className="px-3 py-2 text-left font-medium">分配车辆</th>
                      <th className="px-3 py-2 text-left font-medium">所属站点</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recommendedPlan.vehicles.map((v) =>
                      v.vehicles.map((vv, vi) => (
                        <tr key={`${v.type}-${vi}`} className="border-b border-border/50">
                          {vi === 0 && (
                            <td className="px-3 py-2 text-text-secondary" rowSpan={v.vehicles.length}>
                              <span className="flex items-center gap-1.5">
                                <Truck className="h-3.5 w-3.5 text-accent-blue" />
                                {getVehicleTypeLabel(v.type)}
                              </span>
                            </td>
                          )}
                          {vi === 0 && (
                            <td className="px-3 py-2 font-semibold text-text-primary" rowSpan={v.vehicles.length}>
                              ×{v.count}
                            </td>
                          )}
                          <td className="px-3 py-2 text-text-secondary">{vv.name}</td>
                          <td className="px-3 py-2 text-text-muted">
                            {stations.find((s) => s.id === vv.stationId)?.name ?? vv.stationId}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </div>

        <div className="flex-[1] min-w-0">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-text-primary">车辆状态</h2>
            <select
              value={stationFilter}
              onChange={(e) => setStationFilter(e.target.value)}
              className="rounded-md border border-border bg-bg-tertiary px-2 py-1 text-xs text-text-primary outline-none focus:border-accent-blue"
            >
              <option value="all">全部站点</option>
              {stations.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            {filteredVehicles.map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} />
            ))}
            {filteredVehicles.length === 0 && (
              <p className="py-8 text-center text-sm text-text-muted">暂无车辆</p>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
