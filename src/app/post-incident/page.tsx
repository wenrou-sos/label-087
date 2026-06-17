'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Search, Plus, Eye, Pencil } from 'lucide-react'
import AppLayout from '@/components/layout/AppLayout'
import { useFireCommandStore } from '@/store'
import { formatDate } from '@/lib/utils'
import { fireCauseCategoryLabels } from '@/lib/mock-data'

export default function PostIncidentPage() {
  const reports = useFireCommandStore((s) => s.postIncidentReports)
  const incidents = useFireCommandStore((s) => s.incidents)
  const [search, setSearch] = useState('')

  const getIncidentAddress = (incidentId: string) => {
    const incident = incidents.find((i) => i.id === incidentId)
    return incident?.location.address ?? '未知地址'
  }

  const filtered = reports.filter((r) => {
    if (!search) return true
    return getIncidentAddress(r.incidentId).toLowerCase().includes(search.toLowerCase())
  })

  return (
    <AppLayout title="事后管理">
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索警情地址..."
              className="w-full rounded-lg border border-border bg-bg-tertiary py-2.5 pl-10 pr-4 text-sm text-text-primary placeholder-text-muted outline-none transition-colors focus:border-accent-blue"
            />
          </div>
          <Link
            href="/post-incident/new"
            className="inline-flex items-center gap-2 rounded-lg bg-accent-blue px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-blue/90"
          >
            <Plus className="h-4 w-4" />
            新建报告
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
                <th className="px-4 py-3 text-left font-medium">警情地址</th>
                <th className="px-4 py-3 text-left font-medium">火灾原因</th>
                <th className="px-4 py-3 text-left font-medium">财产损失(万元)</th>
                <th className="px-4 py-3 text-left font-medium">伤亡情况</th>
                <th className="px-4 py-3 text-left font-medium">报告时间</th>
                <th className="px-4 py-3 text-left font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((report) => (
                <tr
                  key={report.id}
                  className="border-b border-border/50 transition-colors hover:bg-bg-hover"
                >
                  <td className="max-w-[200px] truncate px-4 py-3 text-text-primary">
                    {getIncidentAddress(report.incidentId)}
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    {fireCauseCategoryLabels[report.fireCause.category]}
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    {(report.propertyLoss / 10000).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    死亡{report.casualtyInfo.deaths}人/受伤{report.casualtyInfo.injuries}人/被救{report.casualtyInfo.rescued}人
                  </td>
                  <td className="px-4 py-3 text-text-muted">
                    {formatDate(report.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/post-incident/${report.id}`}
                        className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs text-accent-blue transition-colors hover:bg-accent-blue/10"
                      >
                        <Eye className="h-3 w-3" />
                        查看
                      </Link>
                      <Link
                        href={`/post-incident/${report.id}?edit=true`}
                        className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs text-accent-amber transition-colors hover:bg-accent-amber/10"
                      >
                        <Pencil className="h-3 w-3" />
                        编辑
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-text-muted">
                    暂无事后报告数据
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </motion.div>
      </div>
    </AppLayout>
  )
}
