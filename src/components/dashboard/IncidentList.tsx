'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { useFireCommandStore } from '@/store'
import { getFireLevelColor, getFireLevelLabel, getBuildingTypeLabel, formatDate } from '@/lib/utils'
import StatusBadge from '@/components/ui/StatusBadge'

export default function IncidentList() {
  const incidents = useFireCommandStore((s) => s.incidents)

  const recentIncidents = [...incidents]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  const isNew = (createdAt: string) => {
    const diff = Date.now() - new Date(createdAt).getTime()
    return diff < 30 * 60 * 1000
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="rounded-lg border border-border bg-bg-tertiary"
    >
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="text-base font-semibold text-text-primary">近期警情</h2>
        <Link
          href="/incidents"
          className="text-sm text-accent-blue hover:underline"
        >
          查看全部
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-text-muted">
              <th className="px-4 py-2.5 text-left font-medium">地址</th>
              <th className="px-4 py-2.5 text-left font-medium">建筑类型</th>
              <th className="px-4 py-2.5 text-left font-medium">火势等级</th>
              <th className="px-4 py-2.5 text-left font-medium">状态</th>
              <th className="px-4 py-2.5 text-left font-medium">时间</th>
            </tr>
          </thead>
          <tbody>
            {recentIncidents.map((incident) => (
              <tr
                key={incident.id}
                className="group border-b border-border/50 transition-colors hover:bg-bg-hover"
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/incidents/${incident.id}`}
                    className="flex items-center gap-2 text-text-primary group-hover:text-accent-blue"
                  >
                    {isNew(incident.createdAt) && (
                      <span className="animate-pulse-red h-2 w-2 rounded-full bg-accent-red" />
                    )}
                    <span className="max-w-[200px] truncate">{incident.location.address}</span>
                  </Link>
                </td>
                <td className="px-4 py-3 text-text-secondary">
                  {getBuildingTypeLabel(incident.buildingType)}
                </td>
                <td className="px-4 py-3">
                  <span className="flex items-center gap-1.5">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: getFireLevelColor(incident.fireLevel) }}
                    />
                    <span className="text-text-secondary">
                      {getFireLevelLabel(incident.fireLevel)}
                    </span>
                  </span>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={incident.status} type="incident" />
                </td>
                <td className="px-4 py-3 text-text-muted">
                  {formatDate(incident.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  )
}
