'use client'

import { use } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { MapPin, Building2, Layers, Users, Flame, Clock, ChevronRight, Radio, Map, Activity, FileText } from 'lucide-react'
import AppLayout from '@/components/layout/AppLayout'
import StatusBadge from '@/components/ui/StatusBadge'
import { useFireCommandStore } from '@/store'
import { getFireLevelLabel, getFireLevelColor, getBuildingTypeLabel, formatDate, getStatusLabel } from '@/lib/utils'
import type { IncidentStatus } from '@/lib/types'

const statusTimeline: IncidentStatus[] = ['pending', 'dispatched', 'responding', 'on_scene', 'under_control', 'resolved']

function getActionConfig(status: IncidentStatus, incidentId: string) {
  switch (status) {
    case 'pending':
      return { label: '启动调度', href: `/dispatch?incidentId=${incidentId}`, icon: Radio, color: 'bg-accent-amber' }
    case 'dispatched':
    case 'responding':
      return { label: '查看地图', href: `/map?incidentId=${incidentId}`, icon: Map, color: 'bg-accent-blue' }
    case 'on_scene':
    case 'under_control':
      return { label: '实时监测', href: `/monitor?incidentId=${incidentId}`, icon: Activity, color: 'bg-accent-green' }
    case 'resolved':
      return { label: '事后报告', href: `/post-incident/new?incidentId=${incidentId}`, icon: FileText, color: 'bg-text-muted' }
  }
}

export default function IncidentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const incidents = useFireCommandStore((s) => s.incidents)
  const incident = incidents.find((i) => i.id === id)

  if (!incident) {
    return (
      <AppLayout title="警情详情">
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-lg text-text-muted">未找到该警情</p>
          <Link href="/incidents" className="mt-4 text-sm text-accent-blue hover:underline">
            返回警情列表
          </Link>
        </div>
      </AppLayout>
    )
  }

  const currentStep = statusTimeline.indexOf(incident.status)
  const action = getActionConfig(incident.status, incident.id)
  const ActionIcon = action.icon

  const detailItems = [
    { icon: MapPin, label: '火灾地点', value: incident.location.address },
    { icon: Building2, label: '建筑类型', value: incident.customBuildingType || getBuildingTypeLabel(incident.buildingType) },
    { icon: Layers, label: '起火楼层', value: `${incident.isBasement ? '地下' : ''}${incident.floor}层` },
    { icon: Users, label: '被困人数', value: `${incident.trappedCount}人` },
    { icon: MapPin, label: '被困位置', value: incident.trappedLocation || '无' },
    { icon: Flame, label: '火势等级', value: getFireLevelLabel(incident.fireLevel), color: getFireLevelColor(incident.fireLevel) },
    { icon: Clock, label: '创建时间', value: formatDate(incident.createdAt) },
    { icon: Clock, label: '更新时间', value: formatDate(incident.updatedAt) },
  ]

  return (
    <AppLayout title="警情详情">
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="rounded-lg border border-border bg-bg-tertiary"
        >
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-text-primary">警情信息</h2>
              <StatusBadge status={incident.status} type="incident" />
            </div>
            <Link
              href="/incidents"
              className="text-sm text-accent-blue hover:underline"
            >
              返回列表
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2">
            {detailItems.map((item) => (
              <div key={item.label} className="flex items-start gap-3">
                <item.icon className="mt-0.5 h-4 w-4 shrink-0 text-text-muted" />
                <div>
                  <p className="text-xs text-text-muted">{item.label}</p>
                  <p className="text-sm text-text-primary" style={item.color ? { color: item.color } : undefined}>
                    {item.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="rounded-lg border border-border bg-bg-tertiary"
        >
          <div className="border-b border-border px-6 py-4">
            <h2 className="text-lg font-semibold text-text-primary">状态时间线</h2>
          </div>
          <div className="p-6">
            <div className="flex items-center">
              {statusTimeline.map((status, idx) => {
                const isCompleted = idx <= currentStep
                const isCurrent = idx === currentStep
                return (
                  <div key={status} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                          isCurrent
                            ? 'bg-accent-blue text-white shadow-[0_0_12px_rgba(59,130,246,0.4)]'
                            : isCompleted
                              ? 'bg-accent-green/20 text-accent-green'
                              : 'bg-bg-hover text-text-muted'
                        }`}
                      >
                        {idx + 1}
                      </div>
                      <span className={`mt-1.5 text-xs ${isCurrent ? 'text-accent-blue font-medium' : isCompleted ? 'text-accent-green' : 'text-text-muted'}`}>
                        {getStatusLabel(status)}
                      </span>
                    </div>
                    {idx < statusTimeline.length - 1 && (
                      <ChevronRight className={`mx-1 h-4 w-4 ${idx < currentStep ? 'text-accent-green' : 'text-text-muted'}`} />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Link
            href={action.href}
            className={`inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-medium text-white transition-colors hover:opacity-90 ${action.color}`}
          >
            <ActionIcon className="h-4 w-4" />
            {action.label}
          </Link>
        </motion.div>
      </div>
    </AppLayout>
  )
}
