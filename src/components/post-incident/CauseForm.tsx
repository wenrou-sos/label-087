'use client'

import { Zap, Flame, FlaskConical, CloudRain, CookingPot, Cigarette, HelpCircle } from 'lucide-react'
import type { FireCauseCategory } from '@/lib/types'

interface CauseFormValue {
  category: FireCauseCategory
  description: string
}

interface CauseFormProps {
  value: CauseFormValue
  onChange: (value: CauseFormValue) => void
}

const causeOptions: { value: FireCauseCategory; label: string; icon: typeof Zap }[] = [
  { value: 'electrical', label: '电气火灾', icon: Zap },
  { value: 'arson', label: '人为纵火', icon: Flame },
  { value: 'chemical', label: '化学品火灾', icon: FlaskConical },
  { value: 'natural', label: '自然灾害', icon: CloudRain },
  { value: 'cooking', label: '厨房火灾', icon: CookingPot },
  { value: 'smoking', label: '吸烟引发', icon: Cigarette },
  { value: 'other', label: '其他', icon: HelpCircle },
]

export default function CauseForm({ value, onChange }: CauseFormProps) {
  return (
    <div className="space-y-6">
      <div>
        <label className="mb-3 block text-sm font-medium text-text-secondary">火灾原因分类</label>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {causeOptions.map((opt) => {
            const Icon = opt.icon
            const selected = value.category === opt.value
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onChange({ ...value, category: opt.value })}
                className={`flex items-center gap-2 rounded-lg border p-3 text-left text-sm transition-colors ${
                  selected
                    ? 'border-accent-blue bg-accent-blue/10 text-accent-blue'
                    : 'border-border bg-bg-tertiary text-text-secondary hover:border-accent-blue/50'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{opt.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-text-secondary">原因详细描述</label>
        <textarea
          value={value.description}
          onChange={(e) => onChange({ ...value, description: e.target.value })}
          placeholder="请详细描述火灾发生的原因..."
          rows={4}
          className="w-full resize-none rounded-lg border border-border bg-bg-tertiary px-3 py-2.5 text-sm text-text-primary placeholder-text-muted outline-none transition-colors focus:border-accent-blue"
        />
      </div>
    </div>
  )
}
