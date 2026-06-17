'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import AppLayout from '@/components/layout/AppLayout'
import IncidentForm from '@/components/incidents/IncidentForm'
import { useFireCommandStore } from '@/store'
import type { Incident } from '@/lib/types'

export default function NewIncidentPage() {
  const router = useRouter()
  const addIncident = useFireCommandStore((s) => s.addIncident)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const handleSubmit = async (data: Omit<Incident, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => {
    try {
      const res = await fetch('/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) throw new Error('创建失败')

      const created = await res.json()
      addIncident(created)
      setToast({ type: 'success', message: '警情创建成功！' })
      setTimeout(() => router.push('/incidents'), 1000)
    } catch {
      setToast({ type: 'error', message: '创建失败，请重试' })
      setTimeout(() => setToast(null), 3000)
    }
  }

  return (
    <AppLayout title="新建警情">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mx-auto max-w-2xl"
      >
        <div className="rounded-lg border border-border bg-bg-tertiary p-6">
          <IncidentForm onSubmit={handleSubmit} />
        </div>
      </motion.div>

      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={`fixed left-1/2 top-6 -translate-x-1/2 rounded-lg px-6 py-3 text-sm font-medium text-white shadow-lg ${
            toast.type === 'success' ? 'bg-accent-green' : 'bg-accent-red'
          }`}
        >
          {toast.message}
        </motion.div>
      )}
    </AppLayout>
  )
}
