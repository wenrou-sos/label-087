'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Search, Plus, Eye, Radio } from 'lucide-react'
import AppLayout from '@/components/layout/AppLayout'
import StatusBadge from '@/components/ui/StatusBadge'
import { useFireCommandStore } from '@/store'
import { getFireLevelLabel, getFireLevelColor, getBuildingTypeLabel, formatDate } from '@/lib/utils'
import type { IncidentStatus } from '@/lib/types'

const statusFilters: { value: IncidentStatus | 'all'; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'pending', label: '待派遣' },
  { value: 'dispatched', label: '已派遣' },
  { value: 'responding', label: '出警中' },
  { value: 'on_scene', label: '到场' },
  { value: 'under_control', label: '已控制' },
  { value: 'resolved', label: '已结案' },
]

const PAGE_SIZE = 10

export default function IncidentsPage() {
  const incidents = useFireCommandStore((s) => s.incidents)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<IncidentStatus | 'all'>('all')
  const [page, setPage] = useState(1)

  const filtered = incidents
    .filter((inc) => {
      if (statusFilter !== 'all' && inc.status !== statusFilter) return false
      if (search && !inc.location.address.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <AppLayout title="警情管理">
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                placeholder="搜索地址..."
                className="w-full rounded-lg border border-border bg-bg-tertiary py-2.5 pl-10 pr-4 text-sm text-text-primary placeholder-text-muted outline-none transition-colors focus:border-accent-blue"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value as IncidentStatus | 'all'); setPage(1) }}
              className="rounded-lg border border-border bg-bg-tertiary px-3 py-2.5 text-sm text-text-primary outline-none transition-colors focus:border-accent-blue"
            >
              {statusFilters.map((f) => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
          </div>
          <Link
            href="/incidents/new"
            className="inline-flex items-center gap-2 rounded-lg bg-accent-blue px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-blue/90"
          >
            <Plus className="h-4 w-4" />
            新建警情
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="overflow-x-auto rounded-lg border border-border bg-bg-tertiary"
        >
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-text-muted">
                <th className="px-4 py-3 text-left font-medium">序号</th>
                <th className="px-4 py-3 text-left font-medium">地址</th>
                <th className="px-4 py-3 text-left font-medium">建筑类型</th>
                <th className="px-4 py-3 text-left font-medium">楼层</th>
                <th className="px-4 py-3 text-left font-medium">被困人数</th>
                <th className="px-4 py-3 text-left font-medium">火势等级</th>
                <th className="px-4 py-3 text-left font-medium">状态</th>
                <th className="px-4 py-3 text-left font-medium">时间</th>
                <th className="px-4 py-3 text-left font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((incident, idx) => (
                <tr
                  key={incident.id}
                  className="group border-b border-border/50 transition-colors hover:bg-bg-hover"
                >
                  <td className="px-4 py-3 text-text-muted">
                    {(page - 1) * PAGE_SIZE + idx + 1}
                  </td>
                  <td className="max-w-[200px] truncate px-4 py-3 text-text-primary">
                    <Link href={`/incidents/${incident.id}`} className="hover:text-accent-blue">
                      {incident.location.address}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    {incident.customBuildingType || getBuildingTypeLabel(incident.buildingType)}
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    {incident.isBasement ? '地下' : ''}{incident.floor}层
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    {incident.trappedCount}
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1.5">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: getFireLevelColor(incident.fireLevel) }}
                      />
                      <span className="text-text-secondary">{getFireLevelLabel(incident.fireLevel)}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={incident.status} type="incident" />
                  </td>
                  <td className="px-4 py-3 text-text-muted">
                    {formatDate(incident.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/incidents/${incident.id}`}
                        className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs text-accent-blue transition-colors hover:bg-accent-blue/10"
                      >
                        <Eye className="h-3 w-3" />
                        查看
                      </Link>
                      <Link
                        href={`/dispatch?incidentId=${incident.id}`}
                        className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs text-accent-amber transition-colors hover:bg-accent-amber/10"
                      >
                        <Radio className="h-3 w-3" />
                        调度
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-text-muted">
                    暂无警情数据
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </motion.div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-muted">
              共 {filtered.length} 条记录，第 {page}/{totalPages} 页
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="rounded-lg border border-border bg-bg-tertiary px-4 py-2 text-text-secondary transition-colors hover:bg-bg-hover disabled:cursor-not-allowed disabled:opacity-50"
              >
                上一页
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="rounded-lg border border-border bg-bg-tertiary px-4 py-2 text-text-secondary transition-colors hover:bg-bg-hover disabled:cursor-not-allowed disabled:opacity-50"
              >
                下一页
              </button>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
