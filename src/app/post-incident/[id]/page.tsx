'use client'

import { Suspense, use, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Pencil, Save, X } from 'lucide-react'
import AppLayout from '@/components/layout/AppLayout'
import LossForm from '@/components/post-incident/LossForm'
import CauseForm from '@/components/post-incident/CauseForm'
import SummaryForm from '@/components/post-incident/SummaryForm'
import { useFireCommandStore } from '@/store'
import { fireCauseCategoryLabels } from '@/lib/mock-data'
import type { FireCauseCategory } from '@/lib/types'

const TABS = ['损失信息', '原因调查', '处置总结'] as const

export default function PostIncidentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen bg-bg-primary text-text-secondary">加载中...</div>}>
      <PostIncidentDetailPageContent params={params} />
    </Suspense>
  )
}

function PostIncidentDetailPageContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const searchParams = useSearchParams()
  const reports = useFireCommandStore((s) => s.postIncidentReports)
  const updateReport = useFireCommandStore((s) => s.updateReport)
  const report = reports.find((r) => r.id === id)

  const [activeTab, setActiveTab] = useState<number>(0)
  const [editing, setEditing] = useState(searchParams.get('edit') === 'true')
  const [loss, setLoss] = useState({ propertyLoss: 0, deaths: 0, injuries: 0, rescued: 0 })
  const [cause, setCause] = useState<{ category: FireCauseCategory; description: string }>({
    category: 'electrical',
    description: '',
  })
  const [summary, setSummary] = useState('')

  useEffect(() => {
    if (report) {
      setLoss({
        propertyLoss: report.propertyLoss / 10000,
        deaths: report.casualtyInfo.deaths,
        injuries: report.casualtyInfo.injuries,
        rescued: report.casualtyInfo.rescued,
      })
      setCause({ ...report.fireCause })
      setSummary(report.summary)
    }
  }, [report])

  if (!report) {
    return (
      <AppLayout title="事后报告详情">
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-lg text-text-muted">未找到该报告</p>
          <Link href="/post-incident" className="mt-4 text-sm text-accent-blue hover:underline">
            返回报告列表
          </Link>
        </div>
      </AppLayout>
    )
  }

  const handleSave = () => {
    updateReport(report.id, {
      propertyLoss: Math.round(loss.propertyLoss * 10000),
      casualtyInfo: {
        deaths: loss.deaths,
        injuries: loss.injuries,
        rescued: loss.rescued,
      },
      fireCause: cause,
      summary,
      updatedAt: new Date().toISOString(),
    })
    setEditing(false)
  }

  const handleCancel = () => {
    setLoss({
      propertyLoss: report.propertyLoss / 10000,
      deaths: report.casualtyInfo.deaths,
      injuries: report.casualtyInfo.injuries,
      rescued: report.casualtyInfo.rescued,
    })
    setCause({ ...report.fireCause })
    setSummary(report.summary)
    setEditing(false)
  }

  return (
    <AppLayout title="事后报告详情">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {TABS.map((tab, idx) => (
              <button
                key={tab}
                onClick={() => setActiveTab(idx)}
                className={`border-b-2 pb-2 text-sm font-medium transition-colors ${
                  activeTab === idx
                    ? 'border-accent-blue text-accent-blue'
                    : 'border-transparent text-text-muted hover:text-text-secondary'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            {editing ? (
              <>
                <button
                  onClick={handleCancel}
                  className="inline-flex items-center gap-1 rounded-lg border border-border bg-bg-tertiary px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-bg-hover"
                >
                  <X className="h-4 w-4" />
                  取消
                </button>
                <button
                  onClick={handleSave}
                  className="inline-flex items-center gap-1 rounded-lg bg-accent-green px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-green/90"
                >
                  <Save className="h-4 w-4" />
                  保存
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="inline-flex items-center gap-1 rounded-lg bg-accent-blue px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-blue/90"
              >
                <Pencil className="h-4 w-4" />
                编辑
              </button>
            )}
          </div>
        </div>

        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="rounded-lg border border-border bg-bg-tertiary p-6"
        >
          {activeTab === 0 && (
            editing ? (
              <LossForm value={loss} onChange={setLoss} />
            ) : (
              <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
                <div>
                  <p className="text-xs text-text-muted">财产损失(万元)</p>
                  <p className="text-sm text-text-primary">{(report.propertyLoss / 10000).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-text-muted">死亡人数</p>
                  <p className="text-sm text-text-primary">{report.casualtyInfo.deaths}</p>
                </div>
                <div>
                  <p className="text-xs text-text-muted">受伤人数</p>
                  <p className="text-sm text-text-primary">{report.casualtyInfo.injuries}</p>
                </div>
                <div>
                  <p className="text-xs text-text-muted">被救人数</p>
                  <p className="text-sm text-text-primary">{report.casualtyInfo.rescued}</p>
                </div>
              </div>
            )
          )}

          {activeTab === 1 && (
            editing ? (
              <CauseForm value={cause} onChange={setCause} />
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-text-muted">火灾原因分类</p>
                  <p className="text-sm text-text-primary">{fireCauseCategoryLabels[report.fireCause.category]}</p>
                </div>
                <div>
                  <p className="text-xs text-text-muted">原因详细描述</p>
                  <p className="text-sm text-text-primary">{report.fireCause.description || '无'}</p>
                </div>
              </div>
            )
          )}

          {activeTab === 2 && (
            editing ? (
              <SummaryForm value={summary} onChange={setSummary} />
            ) : (
              <div>
                <p className="text-xs text-text-muted">处置总结</p>
                <p className="whitespace-pre-wrap text-sm text-text-primary">{report.summary}</p>
              </div>
            )
          )}
        </motion.div>

        <Link
          href="/post-incident"
          className="inline-block text-sm text-accent-blue hover:underline"
        >
          返回报告列表
        </Link>
      </div>
    </AppLayout>
  )
}
