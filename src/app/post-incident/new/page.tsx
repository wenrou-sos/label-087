'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Check, ClipboardList } from 'lucide-react'
import AppLayout from '@/components/layout/AppLayout'
import LossForm from '@/components/post-incident/LossForm'
import CauseForm from '@/components/post-incident/CauseForm'
import SummaryForm from '@/components/post-incident/SummaryForm'
import { useFireCommandStore } from '@/store'
import { fireCauseCategoryLabels } from '@/lib/mock-data'
import type { FireCauseCategory, PostIncidentReport } from '@/lib/types'

const STEPS = ['选择警情', '损失记录', '原因调查', '处置总结', '预览提交']

export default function NewPostIncidentPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen bg-bg-primary text-text-secondary">加载中...</div>}>
      <NewPostIncidentPageContent />
    </Suspense>
  )
}

function NewPostIncidentPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const incidents = useFireCommandStore((s) => s.incidents)
  const addReport = useFireCommandStore((s) => s.addReport)

  const resolvedIncidents = incidents.filter((i) => i.status === 'resolved')

  const [step, setStep] = useState(0)
  const [selectedIncidentId, setSelectedIncidentId] = useState('')
  const [loss, setLoss] = useState({ propertyLoss: 0, deaths: 0, injuries: 0, rescued: 0 })
  const [cause, setCause] = useState<{ category: FireCauseCategory; description: string }>({
    category: 'electrical',
    description: '',
  })
  const [summary, setSummary] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const incidentId = searchParams.get('incidentId')
    if (incidentId) {
      setSelectedIncidentId(incidentId)
    }
  }, [searchParams])

  const selectedIncident = incidents.find((i) => i.id === selectedIncidentId)

  const canNext = () => {
    switch (step) {
      case 0:
        return !!selectedIncidentId
      case 1:
        return true
      case 2:
        return cause.description.trim().length > 0
      case 3:
        return summary.length >= 20
      default:
        return true
    }
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const res = await fetch('/api/post-incident', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incidentId: selectedIncidentId,
          propertyLoss: Math.round(loss.propertyLoss * 10000),
          casualtyInfo: {
            deaths: loss.deaths,
            injuries: loss.injuries,
            rescued: loss.rescued,
          },
          fireCause: cause,
          summary,
        }),
      })

      if (!res.ok) throw new Error('提交失败')

      const created = await res.json()
      addReport(created)
      router.push('/post-incident')
    } catch {
      const now = new Date().toISOString()
      const report: PostIncidentReport = {
        id: `rpt-${Date.now()}`,
        incidentId: selectedIncidentId,
        propertyLoss: Math.round(loss.propertyLoss * 10000),
        casualtyInfo: {
          deaths: loss.deaths,
          injuries: loss.injuries,
          rescued: loss.rescued,
        },
        fireCause: cause,
        summary,
        createdAt: now,
        updatedAt: now,
      }
      addReport(report)
      router.push('/post-incident')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AppLayout title="新建事后报告">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center justify-between rounded-lg border border-border bg-bg-tertiary p-4">
          {STEPS.map((label, idx) => (
            <div key={label} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                    idx < step
                      ? 'bg-accent-green/20 text-accent-green'
                      : idx === step
                        ? 'bg-accent-blue text-white shadow-[0_0_12px_rgba(59,130,246,0.4)]'
                        : 'bg-bg-hover text-text-muted'
                  }`}
                >
                  {idx < step ? <Check className="h-4 w-4" /> : idx + 1}
                </div>
                <span
                  className={`mt-1 text-xs ${
                    idx <= step ? 'text-accent-blue font-medium' : 'text-text-muted'
                  }`}
                >
                  {label}
                </span>
              </div>
              {idx < STEPS.length - 1 && (
                <div
                  className={`mx-1 h-0.5 w-6 sm:w-10 ${
                    idx < step ? 'bg-accent-green' : 'bg-border'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="rounded-lg border border-border bg-bg-tertiary p-6"
          >
            {step === 0 && (
              <div className="space-y-4">
                <label className="block text-sm font-medium text-text-secondary">选择已结案警情</label>
                <select
                  value={selectedIncidentId}
                  onChange={(e) => setSelectedIncidentId(e.target.value)}
                  className="w-full rounded-lg border border-border bg-bg-primary px-3 py-2.5 text-sm text-text-primary outline-none focus:border-accent-blue"
                >
                  <option value="">请选择警情</option>
                  {resolvedIncidents.map((inc) => (
                    <option key={inc.id} value={inc.id}>
                      {inc.location.address} - {inc.fireLevel}级
                    </option>
                  ))}
                </select>
                {resolvedIncidents.length === 0 && (
                  <p className="text-sm text-text-muted">暂无已结案的警情</p>
                )}
                {selectedIncident && (
                  <div className="rounded-lg border border-border bg-bg-primary p-4 text-sm">
                    <p className="text-text-primary">{selectedIncident.location.address}</p>
                    <p className="mt-1 text-text-muted">被困 {selectedIncident.trappedCount} 人</p>
                  </div>
                )}
              </div>
            )}

            {step === 1 && <LossForm value={loss} onChange={setLoss} />}

            {step === 2 && <CauseForm value={cause} onChange={setCause} />}

            {step === 3 && <SummaryForm value={summary} onChange={setSummary} />}

            {step === 4 && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-text-primary">
                  <ClipboardList className="h-5 w-5" />
                  <h3 className="text-lg font-semibold">报告预览</h3>
                </div>

                <div className="space-y-4 rounded-lg border border-border bg-bg-primary p-4">
                  <div>
                    <p className="text-xs text-text-muted">关联警情</p>
                    <p className="text-sm text-text-primary">{selectedIncident?.location.address ?? '-'}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <div>
                      <p className="text-xs text-text-muted">财产损失(万元)</p>
                      <p className="text-sm text-text-primary">{loss.propertyLoss.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-text-muted">死亡人数</p>
                      <p className="text-sm text-text-primary">{loss.deaths}</p>
                    </div>
                    <div>
                      <p className="text-xs text-text-muted">受伤人数</p>
                      <p className="text-sm text-text-primary">{loss.injuries}</p>
                    </div>
                    <div>
                      <p className="text-xs text-text-muted">被救人数</p>
                      <p className="text-sm text-text-primary">{loss.rescued}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-text-muted">火灾原因</p>
                    <p className="text-sm text-text-primary">
                      {fireCauseCategoryLabels[cause.category]}
                      {cause.description && ` - ${cause.description}`}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-text-muted">处置总结</p>
                    <p className="text-sm text-text-primary">{summary}</p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center justify-between">
          <button
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="inline-flex items-center gap-1 rounded-lg border border-border bg-bg-tertiary px-4 py-2.5 text-sm text-text-secondary transition-colors hover:bg-bg-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ChevronLeft className="h-4 w-4" />
            上一步
          </button>

          {step < STEPS.length - 1 ? (
            <button
              onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
              disabled={!canNext()}
              className="inline-flex items-center gap-1 rounded-lg bg-accent-blue px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-blue/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              下一步
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="inline-flex items-center gap-1 rounded-lg bg-accent-green px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-green/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Check className="h-4 w-4" />
              {submitting ? '提交中...' : '提交报告'}
            </button>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
